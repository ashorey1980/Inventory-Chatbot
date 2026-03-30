#!/usr/bin/env node

const express = require('express');
const https = require('https');
const http = require('http');
const { MCPClient } = require('./mcp-client');
const path = require('path');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3001;
const MCP_SERVER_URL = 'https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store chat sessions (in production, use a proper session store)
const sessions = new Map();

class ChatSession {
  constructor(proxyEndpoint, clientId, clientSecret) {
    this.proxyEndpoint = proxyEndpoint;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.mcpClient = new MCPClient(MCP_SERVER_URL);
    this.chatHistory = [];
    this.initialized = false;
    this.accessToken = null;
    // Token tracking - Input (prompt) and Output (completion)
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.lastRequestTokens = { input: 0, output: 0 };
  }

  // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  async initialize() {
    if (!this.initialized) {
      await this.mcpClient.initialize();
      this.initialized = true;
    }
  }

  async callLLMProxy(prompt) {
    // Try multiple request formats until one works
    const formats = [
      // Format 1: Gemini-specific contents format
      {
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      },
      // Format 2: OpenAI-style messages
      {
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      // Format 3: Simple text field
      {
        text: prompt
      },
      // Format 4: Prompt field (common)
      {
        prompt: prompt
      },
      // Format 5: Input field
      {
        input: prompt
      },
      // Format 6: Question/answer format
      {
        question: prompt
      },
      // Format 7: Just the text as string (raw)
      prompt
    ];

    for (let i = 0; i < formats.length; i++) {
      try {
        const result = await this.tryFormat(formats[i]);
        console.log(`✅ Format ${i + 1} succeeded`);
        // Cache the successful format index for future requests
        this.successfulFormatIndex = i;
        return result;
      } catch (error) {
        console.log(`Format ${i + 1} failed: ${error.message}`);
        if (i === formats.length - 1) {
          throw new Error(`All formats failed. Last error: ${error.message}`);
        }
      }
    }
  }

  async tryFormat(requestBody) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(this.proxyEndpoint);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      // Handle both object and string formats
      const postData = typeof requestBody === 'string'
        ? requestBody
        : JSON.stringify(requestBody);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'client_id': this.clientId,
          'client_secret': this.clientSecret
        }
      };

      const req = httpModule.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode >= 400) {
              reject(new Error(`${res.statusCode}: ${data}`));
              return;
            }

            let responseText = '';
            let tokenUsage = null;

            // Try to parse as JSON, fallback to text
            try {
              const response = JSON.parse(data);

              // Extract token usage if provided by the API
              // Support both OpenAI format (prompt_tokens/completion_tokens) and MuleSoft format (input_tokens/output_tokens)
              if (response.usage) {
                tokenUsage = {
                  prompt_tokens: response.usage.input_tokens || response.usage.prompt_tokens || 0,
                  completion_tokens: response.usage.output_tokens || response.usage.completion_tokens || 0,
                  total_tokens: response.usage.total_tokens || 0
                };
              }

              // Handle MuleSoft semantic proxy response format
              if (response.output && response.output[0]) {
                // Find the message output (skip reasoning output)
                const messageOutput = response.output.find(o => o.type === 'message');
                if (messageOutput && messageOutput.content && messageOutput.content[0]) {
                  const content = messageOutput.content[0];
                  if (content.text) {
                    responseText = content.text;
                  }
                }
              } else {
                // Fallback to other common formats
                responseText = response.text || response.response || response.message ||
                            response.content || response.result ||
                            JSON.stringify(response);
              }
            } catch {
              responseText = data; // Return raw text if not JSON
            }

            // Track tokens (use actual if available, else estimate)
            const promptTokens = tokenUsage ? tokenUsage.prompt_tokens : this.estimateTokens(postData);
            const completionTokens = tokenUsage ? tokenUsage.completion_tokens : this.estimateTokens(responseText);
            const totalTokens = tokenUsage ? tokenUsage.total_tokens : (promptTokens + completionTokens);

            resolve({
              text: responseText,
              tokens: {
                input: promptTokens,
                output: completionTokens,
                total: totalTokens
              }
            });
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
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
    // Reset last request tokens
    this.lastRequestTokens = { input: 0, output: 0 };

    // Build conversation history for LLM
    let prompt = this.getSystemPrompt() + '\n\n';

    // Add recent history
    this.chatHistory.slice(-6).forEach(msg => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });

    prompt += `User: ${userMessage}\nAssistant:`;

    // Get response from LLM Proxy
    const llmResponse = await this.callLLMProxy(prompt);
    this.lastRequestTokens.input += llmResponse.tokens.input;
    this.lastRequestTokens.output += llmResponse.tokens.output;
    this.totalInputTokens += llmResponse.tokens.input;
    this.totalOutputTokens += llmResponse.tokens.output;

    // Check if response contains a function call
    if (llmResponse.text && llmResponse.text.includes('FUNCTION_CALL:')) {
      const jsonMatch = llmResponse.text.match(/FUNCTION_CALL:\s*(\{.*\})/);
      if (jsonMatch) {
        const functionCall = JSON.parse(jsonMatch[1]);

        // Track MCP request size as input tokens
        const mcpRequestSize = JSON.stringify({
          name: functionCall.function,
          arguments: functionCall.arguments
        });
        const mcpRequestTokens = this.estimateTokens(mcpRequestSize);

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

        // Track MCP response size as output tokens
        const mcpResponseTokens = this.estimateTokens(toolData);
        this.totalInputTokens += mcpRequestTokens;
        this.totalOutputTokens += mcpResponseTokens;
        this.lastRequestTokens.input += mcpRequestTokens;
        this.lastRequestTokens.output += mcpResponseTokens;

        // Store tool result
        this.chatHistory.push({
          role: 'user',
          content: userMessage
        });

        this.chatHistory.push({
          role: 'assistant',
          content: `Function called: ${functionCall.function}\nResult: ${toolData}`
        });

        // Ask LLM to explain the results
        const explainPrompt = `${this.getSystemPrompt()}

Previous conversation:
${this.chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

The tool returned this data:
${toolData}

Please explain these results to the user in a friendly, conversational way.`;

        const explanation = await this.callLLMProxy(explainPrompt);
        this.lastRequestTokens.input += explanation.tokens.input;
        this.lastRequestTokens.output += explanation.tokens.output;
        this.totalInputTokens += explanation.tokens.input;
        this.totalOutputTokens += explanation.tokens.output;

        this.chatHistory.push({
          role: 'assistant',
          content: explanation.text
        });

        return {
          message: explanation.text,
          toolCalled: functionCall.function,
          toolData: JSON.parse(toolData),
          tokens: {
            input: this.lastRequestTokens.input,
            output: this.lastRequestTokens.output,
            totalInput: this.totalInputTokens,
            totalOutput: this.totalOutputTokens
          }
        };
      }
    }

    // Regular conversational response
    this.chatHistory.push({
      role: 'user',
      content: userMessage
    });

    this.chatHistory.push({
      role: 'assistant',
      content: llmResponse.text
    });

    return {
      message: llmResponse.text,
      toolCalled: null,
      toolData: null,
      tokens: {
        input: this.lastRequestTokens.input,
        output: this.lastRequestTokens.output,
        totalInput: this.totalInputTokens,
        totalOutput: this.totalOutputTokens
      }
    };
  }
}

// API Endpoints

// Initialize chat session
app.post('/api/init', async (req, res) => {
  try {
    const { proxyEndpoint, clientId, clientSecret } = req.body;

    if (!proxyEndpoint || !clientId || !clientSecret) {
      return res.status(400).json({
        error: 'LLM Proxy Endpoint, Client ID, and Client Secret are required'
      });
    }

    const sessionId = Math.random().toString(36).substring(7);
    const session = new ChatSession(proxyEndpoint, clientId, clientSecret);
    await session.initialize();

    sessions.set(sessionId, session);

    res.json({
      sessionId,
      message: 'Chat session initialized successfully'
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found. Please reinitialize.' });
    }

    const response = await session.processMessage(message);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeSessions: sessions.size });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Inventory Chatbot Web Server`);
  console.log(`📡 Server running at http://localhost:${PORT}`);
  console.log(`\n💡 Open your browser and navigate to http://localhost:${PORT}\n`);
});

// Cleanup old sessions periodically (every 30 minutes)
setInterval(() => {
  const now = Date.now();
  sessions.forEach((session, sessionId) => {
    // Remove sessions older than 1 hour
    if (now - session.createdAt > 3600000) {
      sessions.delete(sessionId);
    }
  });
}, 1800000);
