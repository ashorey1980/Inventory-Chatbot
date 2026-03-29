# Inventory Chatbot with Gemini AI

An intelligent chatbot that uses Google's Gemini AI to provide natural language interface to the MCP inventory system.

## Features

- Natural language queries about products and warehouses
- Automatic tool selection and execution based on user intent
- Conversational explanations of inventory data
- Chat history tracking for context-aware responses
- Support for complex queries with multiple parameters

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 3. Configure API Key (Optional)

You can provide the API key in two ways:

**Option A: Environment Variable**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

**Option B: Enter when prompted**
The chatbot will ask for your API key when you run it if the environment variable is not set.

## Usage

### Start the Chatbot

```bash
npm run chatbot
# or
node chatbot.js
```

### Example Conversations

**Query Product by ID:**
```
You: What is product 912?
🤖: Looking up product 912...
🤖: Product 912 is a Standing Desk with 100 units available. It's currently stocked at the Madrid Warehouse.
```

**Query Warehouse:**
```
You: Show me warehouse 18
🤖: Fetching warehouse information...
🤖: Warehouse 18 is the Madrid Warehouse. Let me get the inventory details...
```

**Natural Language Queries:**
```
You: Tell me about the Standing Desk
🤖: Let me look that up for you...
🤖: The Standing Desk (product ID 912) is in stock with 100 units available...
```

**Search Warehouse Inventory:**
```
You: What desks are in the Madrid warehouse?
🤖: Searching the Madrid warehouse for desks...
```

## How It Works

1. **User Input**: You ask a question in natural language
2. **Intent Recognition**: Gemini AI analyzes your question to determine if it needs inventory data
3. **Tool Selection**: If data is needed, Gemini selects the appropriate MCP tool and parameters
4. **Tool Execution**: The chatbot calls the MCP server with the correct parameters
5. **Response Generation**: Gemini explains the results in a friendly, conversational way
6. **Context Tracking**: Chat history is maintained for follow-up questions

## Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Question
       ▼
┌─────────────────────────┐
│   Gemini AI             │
│   - Intent Recognition  │
│   - Tool Selection      │
│   - Response Generation │
└──────────┬──────────────┘
           │ Function Call
           ▼
┌─────────────────────────┐
│   MCP Client            │
│   - Tool Execution      │
│   - JSON-RPC Protocol   │
└──────────┬──────────────┘
           │ HTTP POST
           ▼
┌─────────────────────────┐
│   MCP Server            │
│   (Flex Gateway)        │
│   - Product Lookup      │
│   - Warehouse Queries   │
└─────────────────────────┘
```

## Available Commands

While chatting:
- Ask any inventory-related question
- Type `exit` or `quit` to end the chat session

## Supported Queries

### Product Queries
- "What is product [ID]?"
- "Show me product [ID]"
- "Tell me about product [ID]"
- "Get details for product [ID]"

### Warehouse Queries
- "What's in warehouse [ID]?"
- "Show me warehouse [ID]"
- "List inventory in warehouse [ID]"
- "Search warehouse [ID] for [term]"

### General Queries
- "Hello" / "Hi" (conversational)
- "What can you do?" (capabilities)
- "Help" (assistance)

## Troubleshooting

### API Key Issues
If you get an authentication error:
1. Verify your API key is correct
2. Check that the key has the necessary permissions
3. Ensure you're not exceeding rate limits

### Connection Issues
If the MCP server is unreachable:
1. Check your internet connection
2. Verify the MCP server URL is correct
3. Try running the basic test client first: `npm test`

### Gemini Errors
If Gemini AI returns unexpected responses:
1. The model may not recognize the intent - try rephrasing
2. Check that you're asking about products or warehouses
3. Provide specific IDs when possible (e.g., "product 912" instead of "the desk")

## Technical Details

**Dependencies:**
- `@google/generative-ai`: Google's Gemini AI SDK
- Built-in Node.js modules: `https`, `readline`

**MCP Tools Used:**
1. `get_inventory_products_productid` - Product lookups
2. `get_inventory_warehouses_warehouseid` - Warehouse queries

**Model:** gemini-pro (configurable in code)

## Customization

You can customize the chatbot by editing `chatbot.js`:

- Change the AI model (line 12)
- Modify the system prompt (lines 23-46)
- Adjust chat history length (line 55)
- Customize response formatting

## Examples

See working examples in [examples.js](examples.js) for programmatic usage of the MCP client.

## License

MIT
