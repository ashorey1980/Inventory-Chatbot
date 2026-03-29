#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MCPClient } = require('./mcp-client');
const readline = require('readline');

const MCP_SERVER_URL = 'https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/';

class InventoryChatbot {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.mcpClient = new MCPClient(MCP_SERVER_URL);
    this.chatHistory = [];
  }

  async initialize() {
    console.log('\n🤖 Initializing Inventory Chatbot...\n');
    await this.mcpClient.initialize();
    console.log('✅ Chatbot ready!\n');
  }

  getSystemPrompt() {
    return `You are an inventory management assistant with access to two tools:

TOOL 1: get_inventory_products_productid
- Gets product information by product ID
- Parameters: productId (required), includeReserved (optional, boolean), warehouseId (optional, string)
- Use when user asks about a specific product by ID or name

TOOL 2: get_inventory_warehouses_warehouseid  
- Gets warehouse details and inventory
- Parameters: warehouseId (required), search (optional, string), category (optional, string)
- Use when user asks about a warehouse or wants to search inventory

When a user asks a question:
1. Determine if they need inventory data
2. If yes, respond with ONLY a JSON function call like this:
   FUNCTION_CALL: {"function": "get_inventory_products_productid", "arguments": {"productId": "912"}}
3. If no tool is needed, respond conversationally

IMPORTANT:
- Start function calls with "FUNCTION_CALL: " prefix
- For product queries, extract the product ID from the question
- For warehouse queries, extract the warehouse ID
- Be helpful and conversational when not calling tools`;
  }

  async processMessage(userMessage) {
    try {
      // Build conversation history for Gemini
      let prompt = this.getSystemPrompt() + '\n\n';
      
      // Add recent history
      this.chatHistory.slice(-6).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      
      prompt += `User: ${userMessage}\nAssistant:`;

      // Get response from Gemini
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Check if response contains a function call
      if (response.includes('FUNCTION_CALL:')) {
        const jsonMatch = response.match(/FUNCTION_CALL:\s*(\{.*\})/);
        if (jsonMatch) {
          const functionCall = JSON.parse(jsonMatch[1]);
          console.log(`\n🔧 Calling ${functionCall.function}...\n`);

          // Execute the MCP tool
          const toolResult = await this.mcpClient.callTool(
            functionCall.function,
            functionCall.arguments
          );

          // Extract text content from tool result
          let toolData = '';
          if (toolResult.content && toolResult.content[0]) {
            toolData = toolResult.content[0].text;
          }

          // Store tool result
          this.chatHistory.push({
            role: 'assistant',
            content: `Function called: ${functionCall.function}\nResult: ${toolData}`
          });

          // Ask Gemini to explain the results
          const explainPrompt = `${this.getSystemPrompt()}

Previous conversation:
${this.chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

The tool returned this data:
${toolData}

Please explain these results to the user in a friendly, conversational way.`;

          const explainResult = await this.model.generateContent(explainPrompt);
          const explanation = explainResult.response.text();

          console.log(`🤖 ${explanation}\n`);

          this.chatHistory.push({
            role: 'assistant',
            content: explanation
          });

          return explanation;
        }
      }

      // Regular conversational response
      console.log(`\n🤖 ${response}\n`);
      this.chatHistory.push({
        role: 'assistant',
        content: response
      });

      return response;

    } catch (error) {
      console.error('❌ Error:', error.message);
      return 'Sorry, I encountered an error processing your request.';
    }
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
  }

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     🤖 Inventory Chatbot with Gemini AI             ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Get API key from user
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    apiKey = await ask('Please enter your Gemini API key: ');
    if (!apiKey || apiKey.trim() === '') {
      console.log('\n❌ API key is required. Exiting...\n');
      rl.close();
      process.exit(1);
    }
  }

  try {
    const chatbot = new InventoryChatbot(apiKey.trim());
    await chatbot.initialize();

    console.log('💬 Chat with the inventory assistant! (Type "exit" to quit)\n');
    console.log('Try asking:');
    console.log('  - "What is product 912?"');
    console.log('  - "Show me warehouse 18"');
    console.log('  - "Tell me about the Standing Desk"');
    console.log('  - "What products are in the Madrid warehouse?"\n');
    console.log('═'.repeat(60) + '\n');

    while (true) {
      const userInput = await ask('You: ');

      if (!userInput || userInput.trim() === '') {
        continue;
      }

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      }

      await chatbot.processMessage(userInput);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { InventoryChatbot };
