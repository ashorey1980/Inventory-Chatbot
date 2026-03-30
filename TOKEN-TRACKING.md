# Token Usage Tracking

The chatbot now tracks and displays token usage for both LLM and MCP calls, plus shows the LLM model being used.

## Features

### 🔢 Token Tracking

**LLM Tokens:**
- Tracks prompt tokens (input to the LLM)
- Tracks completion tokens (output from the LLM)
- Uses actual token counts from API when available
- Falls back to estimation: 1 token ≈ 4 characters

**MCP Tokens:**
- Tracks MCP request size (tool call parameters)
- Tracks MCP response size (tool result data)
- Estimates tokens based on JSON payload size

### 📊 Real-Time Display

**Chat Header Stats:**
- **Model:** Shows the LLM model name (e.g., "gemini-3-pro-preview")
- **LLM:** Cumulative LLM tokens used in the session
- **MCP:** Cumulative MCP tokens used in the session

**Per-Message Stats:**
Each assistant response shows a breakdown:
- 💬 LLM tokens for that specific response
- 🔧 MCP tokens for any tool calls made

### 🎯 Model Detection

The application automatically detects the model name from:
1. Response headers: `x-llm-proxy-llm-model`
2. Response headers: `x-llm-proxy-llm-provider` (fallback)
3. Response body: `model` field (if present)

## Visual Example

```
┌─────────────────────────────────────────────┐
│ 🤖 Inventory Chatbot                       │
│ Powered by MuleSoft AI Gateway              │
├─────────────────────────────────────────────┤
│ ● Connected                                 │
│ Model: gemini-3-pro-preview                 │
│ LLM: 1,234 tokens | MCP: 567 tokens        │
│                                    [Reset]  │
├─────────────────────────────────────────────┤
│                                             │
│ User: What is product 912?                 │
│                                             │
│ Assistant: Product 912 is a Standing Desk  │
│            🔧 get_inventory_products_...   │
│            💬 LLM: 245 | 🔧 MCP: 89       │
│                                             │
└─────────────────────────────────────────────┘
```

## How It Works

### Backend (web-server.js)

1. **Token Estimation:**
   ```javascript
   estimateTokens(text) {
     return Math.ceil(text.length / 4);
   }
   ```

2. **LLM Token Tracking:**
   - Extracts `usage` object from API response if available
   - Falls back to character-based estimation
   - Accumulates to `totalLLMTokens`

3. **MCP Token Tracking:**
   - Estimates request size (tool call JSON)
   - Estimates response size (tool result JSON)
   - Accumulates to `totalMCPTokens`

4. **Model Detection:**
   - Checks response headers for model info
   - Checks response body for model field
   - Stores in `modelName` property

### API Response Format

The `/api/chat` endpoint now returns:

```json
{
  "message": "Response text...",
  "toolCalled": "get_inventory_products_productid",
  "toolData": {...},
  "tokens": {
    "llm": 245,        // Tokens for this request
    "mcp": 89,         // MCP tokens for this request
    "totalLLM": 1234,  // Cumulative LLM tokens
    "totalMCP": 567    // Cumulative MCP tokens
  },
  "model": "gemini-3-pro-preview"
}
```

### Frontend (public/index.html)

**Stats Display:**
```html
<div class="stats-info">
  <span class="model-badge" id="modelName">gemini-3-pro-preview</span>
  <span id="llmTokens">1,234</span> tokens (LLM)
  <span id="mcpTokens">567</span> tokens (MCP)
</div>
```

**Update Function:**
```javascript
function updateStats(totalLLM, totalMCP, model) {
  document.getElementById('llmTokens').textContent =
    totalLLM.toLocaleString();
  document.getElementById('mcpTokens').textContent =
    totalMCP.toLocaleString();
  document.getElementById('modelName').textContent = model;
}
```

## Token Estimation Accuracy

### Actual Token Counts

If your LLM proxy returns usage data in this format:

```json
{
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 95,
    "total_tokens": 245
  }
}
```

The application will use these exact values.

### Estimated Token Counts

When actual counts aren't available:
- **Estimation:** 1 token ≈ 4 characters
- **Accuracy:** ~70-80% accurate for English text
- **Purpose:** Provides order-of-magnitude tracking

### Token Count Factors

Different models tokenize text differently:
- GPT models: ~1 token per 0.75 words
- Claude models: Similar to GPT
- Gemini models: May vary slightly
- Special characters and code use more tokens

## Benefits

### 📈 Cost Tracking
- Monitor API usage in real-time
- Estimate costs based on provider pricing
- Identify expensive queries

### ⚡ Performance Insights
- See the impact of MCP tool calls
- Compare token usage across queries
- Optimize prompts to reduce tokens

### 🔍 Debugging
- Verify model being used
- Check if token limits are approached
- Diagnose response issues

## Usage Tips

### Reducing Token Usage

**For LLM calls:**
- Keep conversation history to recent messages only (we use last 6)
- Use concise system prompts
- Avoid repeating context unnecessarily

**For MCP calls:**
- Filter tool results before sending to LLM
- Request only necessary fields from tools
- Use specific warehouse/product filters

### Monitoring Costs

If your provider charges by token:

```
Example pricing (Gemini):
- Input: $0.00025 per 1K tokens
- Output: $0.00050 per 1K tokens

For 10,000 total tokens (5K in, 5K out):
Cost = (5 × $0.00025) + (5 × $0.00050)
     = $0.00125 + $0.00250
     = $0.00375
```

### Session Reset

Click "Reset" to:
- Clear chat history
- Reset token counters to zero
- Start fresh session

## Technical Details

### Token Calculation

```javascript
// Estimate prompt tokens
const promptTokens = this.estimateTokens(postData);

// Estimate completion tokens
const completionTokens = this.estimateTokens(responseText);

// Use actual if available, else estimates
const tokens = {
  prompt: tokenUsage?.prompt_tokens || promptTokens,
  completion: tokenUsage?.completion_tokens || completionTokens,
  total: tokenUsage?.total_tokens || (promptTokens + completionTokens)
};
```

### MCP Token Tracking

```javascript
// Track MCP request
const mcpRequestTokens = this.estimateTokens(
  JSON.stringify(functionCall)
);

// Track MCP response
const mcpResponseTokens = this.estimateTokens(toolData);

// Total MCP tokens for this call
const mcpTotalTokens = mcpRequestTokens + mcpResponseTokens;
```

## Future Enhancements

Possible improvements:
- [ ] Per-session cost calculation
- [ ] Token usage graphs/charts
- [ ] Export usage statistics
- [ ] Token limit warnings
- [ ] Model comparison metrics
- [ ] Breakdown by tool type

## Troubleshooting

### Model Shows "Unknown"

**Cause:** Model info not in response headers or body

**Solutions:**
1. Check if proxy returns `x-llm-proxy-llm-model` header
2. Check if response includes `model` field
3. Manually check MuleSoft API configuration

### Token Counts Seem Wrong

**Cause:** Using estimation instead of actual counts

**Check:**
- Does your LLM proxy return `usage` object?
- Estimation accuracy varies by text type
- MCP tokens are always estimated

### High Token Usage

**Common causes:**
- Long conversation history
- Large tool responses
- Detailed product/warehouse data

**Solutions:**
- History limited to last 6 messages
- Consider filtering tool results
- Use more specific queries

## Summary

The token tracking feature provides transparency into:
- ✅ Real-time token usage monitoring
- ✅ Model identification
- ✅ Cost estimation capabilities
- ✅ Performance optimization insights
- ✅ Separate tracking for LLM vs MCP calls

All stats are visible in the chat header and per-message breakdowns, making it easy to understand and optimize your chatbot's resource usage.
