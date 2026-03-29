#!/usr/bin/env node

const https = require('https');

const MCP_SERVER_URL = 'https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/';

class MCPClient {
  constructor(url) {
    this.url = url;
    this.requestId = 0;
  }

  async makeRequest(method, params = {}) {
    this.requestId++;
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: method,
      params: params
    };

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const urlObj = new URL(this.url);

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
              reject(new Error(`MCP Error: ${response.error.message}`));
            } else {
              resolve(response.result);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async initialize() {
    console.log('🔌 Initializing MCP connection...\n');
    const result = await this.makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'mcp-test-client',
        version: '1.0.0'
      }
    });
    console.log('✅ Connected to MCP Server:');
    console.log(`   Name: ${result.serverInfo.name}`);
    console.log(`   Version: ${result.serverInfo.version}`);
    console.log(`   Protocol: ${result.protocolVersion}\n`);
    return result;
  }

  async listTools() {
    console.log('📋 Fetching available tools...\n');
    const result = await this.makeRequest('tools/list');
    console.log(`✅ Found ${result.tools.length} tools:\n`);
    result.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   Description: ${tool.description}`);
      console.log(`   Required params: ${tool.inputSchema.required.join(', ')}`);
      console.log('');
    });
    return result.tools;
  }

  async callTool(toolName, args) {
    console.log(`🔧 Calling tool: ${toolName}`);
    console.log(`   Arguments: ${JSON.stringify(args, null, 2)}\n`);
    const result = await this.makeRequest('tools/call', {
      name: toolName,
      arguments: args
    });

    if (result.isError) {
      console.log('❌ Tool returned an error\n');
    } else {
      console.log('✅ Tool executed successfully\n');
    }

    console.log('Response:');
    result.content.forEach(content => {
      if (content.type === 'text') {
        try {
          const parsed = JSON.parse(content.text);
          console.log(JSON.stringify(parsed, null, 2));
        } catch {
          console.log(content.text);
        }
      }
    });
    console.log('\n' + '='.repeat(80) + '\n');
    return result;
  }

  async getProductById(productId, options = {}) {
    return this.callTool('get_inventory_products_productid', {
      productId,
      ...options
    });
  }

  async getWarehouseById(warehouseId, options = {}) {
    return this.callTool('get_inventory_warehouses_warehouseid', {
      warehouseId,
      ...options
    });
  }
}

async function runTests() {
  const client = new MCPClient(MCP_SERVER_URL);

  try {
    // Initialize connection
    await client.initialize();

    // List available tools
    await client.listTools();

    // Test 1: Get product by ID
    console.log('TEST 1: Get Product Information');
    console.log('='.repeat(80));
    await client.getProductById('PROD-001');

    // Test 2: Get product with warehouse filter
    console.log('TEST 2: Get Product with Options');
    console.log('='.repeat(80));
    await client.getProductById('PROD-002', {
      includeReserved: false,
      warehouseId: 'WH-001'
    });

    // Test 3: Get warehouse information
    console.log('TEST 3: Get Warehouse Information');
    console.log('='.repeat(80));
    await client.getWarehouseById('18');

    // Test 4: Search warehouse inventory
    console.log('TEST 4: Search Warehouse Inventory');
    console.log('='.repeat(80));
    await client.getWarehouseById('WH-001', {
      search: 'desk',
      category: 'furniture'
    });

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { MCPClient };
