# MCP Test Client

A Node.js test client for the MCP Demo Gateway inventory API with an AI-powered chatbot interface.

## Server Information

- **URL**: `https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/`
- **Server**: Flex Gateway v1.12.1
- **Protocol**: MCP 2025-11-25
- **Type**: JSON-RPC 2.0 over HTTP POST

## Available Tools

### 1. get_inventory_products_productid
Retrieves product information by product ID.

**Parameters**:
- `productId` (required) - Unique product identifier
- `includeReserved` (optional) - Include reserved stock (default: true)
- `warehouseId` (optional) - Filter by specific warehouse
- `X-Request-ID` (optional) - UUID for request tracing

**Example Response**:
```json
{
  "productId": "912",
  "productName": "Standing Desk",
  "sku": "string",
  "totalQuantity": 100,
  "totalReserved": 0,
  "totalAvailable": 100,
  "warehouses": [...]
}
```

### 2. get_inventory_warehouses_warehouseid
Get warehouse details and inventory by warehouse ID.

**Parameters**:
- `warehouseId` (required) - Unique warehouse identifier
- `category` (optional) - Filter by product category
- `search` (optional) - Search products by name or SKU
- `X-Request-ID` (optional) - UUID for request tracing

## Features

This project includes four ways to interact with the MCP server:

1. **Web Chatbot** (NEW! Recommended) - Beautiful web interface with Gemini AI
2. **CLI Chatbot** - Terminal-based natural language interface
3. **Automated Tests** - Pre-configured test scenarios
4. **Interactive CLI** - Manual testing with prompts
5. **Programmatic API** - Import and use in your own code

## Usage

### Web Chatbot (Recommended)

Beautiful web interface with real-time chat powered by your LLM Proxy:

```bash
npm run web
# or
npm start
```

Then open your browser to: **http://localhost:3001**

**Configuration:**
1. Enter your LLM Proxy Endpoint URL
2. Enter your Client ID
3. Enter your Client Secret
4. Click "Start Chatting"

**Features:**
- 🎨 Modern, responsive design
- 💬 Real-time conversational AI via LLM Proxy
- 🛠️ Visual tool execution indicators
- 📱 Mobile-friendly
- 🔒 Secure credential handling

See [LLM-PROXY-SETUP.md](LLM-PROXY-SETUP.md) for proxy configuration and [WEB-INTERFACE.md](WEB-INTERFACE.md) for interface documentation.

### CLI Chatbot

Terminal-based chat interface:

```bash
npm run chatbot
# or
node chatbot.js
```

**Setup:**
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set it as an environment variable: `export GEMINI_API_KEY="your-key"`
3. Or enter it when prompted

**Example queries:**
- "What is product 912?"
- "Show me warehouse 18"
- "Tell me about the Standing Desk"
- "What's in the Madrid warehouse?"

See [CHATBOT-README.md](CHATBOT-README.md) for CLI chatbot documentation.

### Automated Tests

Run all predefined tests:

```bash
node mcp-client.js
# or
npm test
```

This will:
1. Initialize the MCP connection
2. List available tools
3. Run 4 test scenarios with different parameters
4. Display results for each test

### Interactive Mode

Run the interactive demo to manually test tools:

```bash
node interactive-demo.js
# or
npm run interactive
```

The interactive mode allows you to:
- Query products by ID with custom parameters
- Search warehouse inventory
- Filter results by category or search terms
- List all available tools

### Programmatic Usage

Import the MCPClient class in your own scripts:

```javascript
const { MCPClient } = require('./mcp-client');

const client = new MCPClient('https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/');

async function example() {
  // Initialize connection
  await client.initialize();

  // Get product information
  await client.getProductById('PROD-001');

  // Get warehouse with filters
  await client.getWarehouseById('WH-001', {
    search: 'desk',
    category: 'furniture'
  });
}

example();
```

## Examples

### Example 1: Get Product with All Options
```javascript
await client.getProductById('PROD-001', {
  includeReserved: false,
  warehouseId: 'WH-123'
});
```

### Example 2: Search Warehouse Inventory
```javascript
await client.getWarehouseById('18', {
  search: 'desk',
  category: 'furniture'
});
```

### Example 3: Custom Tool Call
```javascript
await client.callTool('get_inventory_products_productid', {
  productId: 'PROD-001',
  'X-Request-ID': '550e8400-e29b-41d4-a716-446655440000'
});
```

## Requirements

- Node.js (any recent version)
- For chatbot: LLM Proxy endpoint with Client ID and Client Secret authentication

## Installation

```bash
npm install
```

## Configuration

### Setting Up MuleSoft AI Gateway Credentials

If you're using a MuleSoft AI Gateway for the LLM proxy:

1. **Copy the configuration template:**
   ```bash
   cp MULESOFT-GATEWAY-CONFIG.template.md MULESOFT-GATEWAY-CONFIG.md
   ```

2. **Edit `MULESOFT-GATEWAY-CONFIG.md` with your actual credentials:**
   - Update the endpoint URL
   - Add your Client ID
   - Add your Client Secret
   - Document your backend configuration

3. **Important:** Never commit `MULESOFT-GATEWAY-CONFIG.md` to version control. It's already in `.gitignore` for your protection.

See [MULESOFT-GATEWAY-CONFIG.template.md](MULESOFT-GATEWAY-CONFIG.template.md) for the template and detailed setup instructions.

## Files

- `web-server.js` - Express server for web interface with LLM Proxy support
- `public/index.html` - Web chatbot interface
- `chatbot.js` - CLI chatbot with Gemini integration
- `mcp-client.js` - Main MCP client class and automated tests
- `interactive-demo.js` - Interactive CLI for manual testing
- `examples.js` - Code examples showing different use cases
- `package.json` - Project metadata and scripts
- `README.md` - This file
- `LLM-PROXY-SETUP.md` - LLM Proxy configuration and setup guide
- `WEB-INTERFACE.md` - Web interface documentation
- `CHATBOT-README.md` - CLI chatbot documentation
- `QUICK-REFERENCE.md` - Quick reference for MCP server
- `.env.example` - Example environment configuration
