#!/usr/bin/env node

const { MCPClient } = require('./mcp-client');
const readline = require('readline');

const MCP_SERVER_URL = 'https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const client = new MCPClient(MCP_SERVER_URL);

  console.log('\n🚀 MCP Test Client - Interactive Mode\n');
  console.log('='.repeat(80));

  try {
    await client.initialize();
    const tools = await client.listTools();

    while (true) {
      console.log('\nAvailable Commands:');
      console.log('  1. Get product by ID');
      console.log('  2. Get warehouse by ID');
      console.log('  3. List all tools');
      console.log('  4. Exit\n');

      const choice = await ask('Enter your choice (1-4): ');

      switch (choice.trim()) {
        case '1': {
          const productId = await ask('Enter product ID: ');
          const includeReserved = await ask('Include reserved stock? (y/n, default=y): ');
          const warehouseId = await ask('Filter by warehouse ID (optional, press Enter to skip): ');

          const options = {};
          if (includeReserved.toLowerCase() === 'n') {
            options.includeReserved = false;
          }
          if (warehouseId.trim()) {
            options.warehouseId = warehouseId.trim();
          }

          await client.getProductById(productId.trim(), options);
          break;
        }

        case '2': {
          const warehouseId = await ask('Enter warehouse ID: ');
          const search = await ask('Search term (optional, press Enter to skip): ');
          const category = await ask('Filter by category (optional, press Enter to skip): ');

          const options = {};
          if (search.trim()) {
            options.search = search.trim();
          }
          if (category.trim()) {
            options.category = category.trim();
          }

          await client.getWarehouseById(warehouseId.trim(), options);
          break;
        }

        case '3': {
          await client.listTools();
          break;
        }

        case '4': {
          console.log('\n👋 Goodbye!\n');
          rl.close();
          process.exit(0);
        }

        default: {
          console.log('\n❌ Invalid choice. Please enter 1-4.\n');
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
