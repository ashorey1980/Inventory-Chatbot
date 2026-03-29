# LLM Proxy Configuration

The chatbot now connects to an LLM through a proxy endpoint instead of using Gemini directly. This allows for centralized LLM management, cost control, and custom authentication.

## Configuration Parameters

The chatbot requires three parameters:

### 1. LLM Proxy Endpoint
**Description**: The URL of your LLM Proxy API endpoint
**Example**: `https://your-proxy.example.com/api/chat`
**Format**: Must be a valid HTTP or HTTPS URL

### 2. Client ID
**Description**: Your application's client identifier
**Example**: `my-inventory-app`
**Format**: Alphanumeric string

### 3. Client Secret
**Description**: Your application's secret key
**Example**: `abc123def456`
**Format**: String (kept secure)

## How It Works

```
User Question
     ↓
Web Browser
     ↓
Web Server (Express)
     ↓
LLM Proxy (with Client ID/Secret auth)
     ↓
LLM Provider (Gemini, Claude, etc.)
     ↓
Response flows back through proxy
     ↓
MCP Tools called if needed
     ↓
Final response to user
```

## LLM Proxy Request Format

The chatbot sends requests to your proxy in this format:

```json
POST {proxyEndpoint}
Headers:
  Content-Type: application/json
  client_id: {your-client-id}
  client_secret: {your-client-secret}

Body:
{
  "prompt": "System instructions + user message + conversation history",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

## Expected LLM Proxy Response

Your proxy should return a response in one of these formats:

```json
{
  "text": "LLM response text here"
}
```

Or:

```json
{
  "response": "LLM response text here"
}
```

Or:

```json
{
  "message": "LLM response text here"
}
```

The chatbot will try to extract the response from any of these fields.

## Setting Up Your LLM Proxy

### Option 1: Use the Included LLM Proxy App

If you're using the `/Users/ashorey/llm-proxy-app/`, configure it to:

1. Accept requests at the configured endpoint
2. Validate `client_id` and `client_secret` headers
3. Forward requests to your LLM provider
4. Return responses in the expected format

### Option 2: Create a Custom Proxy

Your proxy needs to:

1. **Authenticate** - Verify client_id and client_secret
2. **Transform** - Convert the request format to your LLM's API
3. **Forward** - Send to the LLM (Gemini, Claude, GPT, etc.)
4. **Transform Back** - Convert the LLM response to expected format
5. **Return** - Send response back to the chatbot

Example Node.js proxy endpoint:

```javascript
app.post('/api/chat', async (req, res) => {
  const clientId = req.headers['client_id'];
  const clientSecret = req.headers['client_secret'];
  const { prompt, max_tokens, temperature } = req.body;

  // Authenticate
  if (!validateCredentials(clientId, clientSecret)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Forward to LLM
  const llmResponse = await callLLM(prompt, max_tokens, temperature);

  // Return formatted response
  res.json({ text: llmResponse });
});
```

## Security Considerations

### Client Credentials
- **Never expose** client_secret in client-side code
- Store credentials securely on the server
- Rotate credentials periodically
- Use HTTPS for all communications

### Proxy Security
- Implement rate limiting
- Add request logging for auditing
- Validate all inputs
- Use authentication middleware
- Monitor for unusual patterns

### Network Security
- Use HTTPS/TLS for all connections
- Implement IP whitelisting if needed
- Consider VPN for sensitive deployments
- Use network security groups/firewall rules

## Testing Your Proxy

### 1. Test with curl

```bash
curl -X POST https://your-proxy.example.com/api/chat \
  -H "Content-Type: application/json" \
  -H "client_id: your-client-id" \
  -H "client_secret: your-client-secret" \
  -d '{
    "prompt": "Hello, how are you?",
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

Expected response:
```json
{
  "text": "I'm doing well, thank you! How can I help you today?"
}
```

### 2. Test with the Chatbot

1. Start the web server: `npm run web`
2. Open http://localhost:3001
3. Enter your proxy endpoint and credentials
4. Click "Start Chatting"
5. Ask a test question

### 3. Verify MCP Integration

Ask inventory-specific questions to ensure MCP tools work:
- "What is product 912?"
- "Show me warehouse 18"

The chatbot should call the appropriate MCP tools and explain the results.

## Troubleshooting

### "Invalid credentials" Error
- Verify client_id and client_secret are correct
- Check that the proxy is validating credentials properly
- Ensure there are no extra spaces or special characters

### "Connection refused" Error
- Verify the proxy endpoint URL is correct
- Check that the proxy server is running
- Confirm network connectivity
- Verify firewall rules allow the connection

### "Failed to parse LLM response" Error
- Check that the proxy returns JSON
- Verify the response includes `text`, `response`, or `message` field
- Ensure the response is properly formatted

### No Response from LLM
- Check proxy logs for errors
- Verify the LLM provider is accessible from the proxy
- Check LLM provider API keys/credentials
- Verify rate limits haven't been exceeded

### MCP Tools Not Working
- The LLM must include "FUNCTION_CALL:" prefix in responses
- Check that the LLM understands the system prompt
- Verify the MCP server is accessible
- Check MCP server logs

## Configuration Examples

### Development Setup
```
Endpoint: http://localhost:3000/api/chat
Client ID: dev-client
Client Secret: dev-secret-123
```

### Production Setup
```
Endpoint: https://llm-proxy.yourcompany.com/api/chat
Client ID: prod-inventory-chatbot
Client Secret: [secure-random-string]
```

### Using Environment Variables

Create a `.env` file:
```bash
LLM_PROXY_ENDPOINT=https://your-proxy.example.com/api/chat
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

## Benefits of Using an LLM Proxy

### Cost Management
- Track usage across applications
- Set spending limits
- Monitor token consumption
- Implement budget controls

### Security
- Centralized credential management
- Hide LLM provider keys from client apps
- Implement consistent access control
- Audit all LLM requests

### Flexibility
- Switch LLM providers without changing client code
- A/B test different models
- Implement custom routing logic
- Add caching for cost savings

### Monitoring
- Log all requests and responses
- Track performance metrics
- Monitor error rates
- Generate usage reports

## Next Steps

1. Set up your LLM Proxy endpoint
2. Configure authentication
3. Test with curl
4. Update the chatbot configuration
5. Monitor usage and performance

For more information, see:
- [README.md](README.md) - Main documentation
- [WEB-INTERFACE.md](WEB-INTERFACE.md) - Web interface guide
- [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Complete project overview
