#!/usr/bin/env node

const { MCPClient } = require('./mcp-client');

const MCP_SERVER_URL = 'https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/';

// Example 1: Basic product lookup
async function example1() {
  console.log('\n📦 EXAMPLE 1: Basic Product Lookup\n');
  const client = new MCPClient(MCP_SERVER_URL);
  await client.initialize();
  await client.getProductById('PROD-001');
}

// Example 2: Product lookup with warehouse filter
async function example2() {
  console.log('\n📦 EXAMPLE 2: Product Lookup with Warehouse Filter\n');
  const client = new MCPClient(MCP_SERVER_URL);
  await client.initialize();
  await client.getProductById('PROD-001', {
    warehouseId: '18',
    includeReserved: true
  });
}

// Example 3: Warehouse inventory lookup
async function example3() {
  console.log('\n🏭 EXAMPLE 3: Warehouse Inventory Lookup\n');
  const client = new MCPClient(MCP_SERVER_URL);
  await client.initialize();
  await client.getWarehouseById('18');
}

// Example 4: Search warehouse inventory
async function example4() {
  console.log('\n🔍 EXAMPLE 4: Search Warehouse Inventory\n');
  const client = new MCPClient(MCP_SERVER_URL);
  await client.initialize();
  await client.getWarehouseById('WH-001', {
    search: 'desk',
    category: 'furniture'
  });
}

// Example 5: Direct tool call with custom parameters
async function example5() {
  console.log('\n🛠️  EXAMPLE 5: Direct Tool Call with Request ID\n');
  const client = new MCPClient(MCP_SERVER_URL);
  await client.initialize();
  await client.callTool('get_inventory_products_productid', {
    productId: 'PROD-001',
    'X-Request-ID': '550e8400-e29b-41d4-a716-446655440000'
  });
}

// Example 6: Error handling
async function example6() {
  console.log('\n⚠️  EXAMPLE 6: Error Handling\n');
  const client = new MCPClient(MCP_SERVER_URL);
  await client.initialize();

  try {
    // This will likely fail with an invalid product ID
    await client.getProductById('');
  } catch (error) {
    console.log('✅ Caught expected error:', error.message);
  }
}

// Run specific example or all examples
async function main() {
  const exampleNum = process.argv[2];

  try {
    if (exampleNum) {
      const exampleFn = eval(`example${exampleNum}`);
      if (exampleFn) {
        await exampleFn();
      } else {
        console.log(`Example ${exampleNum} not found. Available: 1-6`);
      }
    } else {
      // Run all examples
      await example1();
      await example2();
      await example3();
      await example4();
      await example5();
      await example6();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
