# MCP Server Quick Reference

## Server Details
```
URL: https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/
Protocol: JSON-RPC 2.0 over HTTPS POST
Server: Flex Gateway v1.12.1
MCP Protocol: 2025-11-25
```

## Quick Start Commands

```bash
# Run all tests
node mcp-client.js

# Interactive mode
node interactive-demo.js

# Run specific example
node examples.js 1    # Run example 1
node examples.js      # Run all examples
```

## Available Tools

### Tool 1: get_inventory_products_productid
**Purpose**: Get product details by ID

**Required**:
- `productId` (string)

**Optional**:
- `includeReserved` (boolean, default: true)
- `warehouseId` (string)
- `X-Request-ID` (UUID string)

**Example**:
```javascript
await client.getProductById('PROD-001', {
  includeReserved: false,
  warehouseId: 'WH-123'
});
```

### Tool 2: get_inventory_warehouses_warehouseid
**Purpose**: Get warehouse details and inventory

**Required**:
- `warehouseId` (string)

**Optional**:
- `category` (string)
- `search` (string)
- `X-Request-ID` (UUID string)

**Example**:
```javascript
await client.getWarehouseById('18', {
  search: 'desk',
  category: 'furniture'
});
```

## Raw JSON-RPC Examples

### Initialize Connection
```bash
curl -X POST https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test-client", "version": "1.0.0"}
    }
  }'
```

### List Tools
```bash
curl -X POST https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

### Call Tool
```bash
curl -X POST https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_inventory_products_productid",
      "arguments": {"productId": "PROD-001"}
    }
  }'
```

## Response Format

All tool responses follow this structure:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{...json data...}"
      }
    ],
    "isError": false
  }
}
```

## Error Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Error description"
  }
}
```

## Test Data

Based on test results, the server returns sample data:
- Product ID: `PROD-001` → Returns "Standing Desk" (ID: 912)
- Warehouse ID: `18` → Returns "Madrid Warehouse"
