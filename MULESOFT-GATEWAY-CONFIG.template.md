# MuleSoft AI Gateway Configuration Template

## Your Gateway Details

**Endpoint**: `https://your-gateway.cloudhub.io/your-proxy-path/responses`

**Authentication:**
- Client ID: `your-client-id-here`
- Client Secret: `your-client-secret-here`

**Backend Configuration:**
- LLM Provider: (e.g., Gemini, OpenAI, Claude, etc.)
- Model: (e.g., gemini-3-pro-preview)
- Routing Type: (e.g., Semantic with fallback)

## Setup Instructions

1. **Copy this template to create your config file:**
   ```bash
   cp MULESOFT-GATEWAY-CONFIG.template.md MULESOFT-GATEWAY-CONFIG.md
   ```

2. **Edit `MULESOFT-GATEWAY-CONFIG.md` with your actual credentials:**
   - Replace `your-gateway.cloudhub.io/your-proxy-path/responses` with your MuleSoft endpoint
   - Replace `your-client-id-here` with your actual Client ID
   - Replace `your-client-secret-here` with your actual Client Secret
   - Update the backend configuration details

3. **IMPORTANT: Never commit the real credentials file to git**
   - The `.gitignore` file already excludes `MULESOFT-GATEWAY-CONFIG.md`
   - Only this template file should be committed to version control

## Testing Your Configuration

Once you've configured your credentials, test the endpoint with:

```bash
curl --location 'YOUR_ENDPOINT_HERE' \
--header 'Content-Type: application/json' \
--header 'client_id: YOUR_CLIENT_ID' \
--header 'client_secret: YOUR_CLIENT_SECRET' \
--data '{"input": "Hello, this is a test message"}'
```

## Expected Response Format

The MuleSoft Semantic Proxy typically returns responses in this format:

```json
{
  "output": [
    {
      "content": [
        {
          "text": "Response from the LLM"
        }
      ]
    }
  ]
}
```

The chatbot application automatically handles this response format.

## Request Format

The application sends requests in this format:

```json
{
  "input": "Your message here"
}
```

This is the standard format for MuleSoft Semantic Proxy endpoints.

## Troubleshooting

### 400 Bad Request - Invalid request body
- Verify your endpoint URL is correct (should end with `/responses`)
- Check that your MuleSoft API expects the `{"input": "..."}` format

### 401/403 Unauthorized
- Verify your Client ID and Client Secret are correct
- Check that the headers are named `client_id` and `client_secret`

### 404 Not Found
- Verify the full endpoint path
- Common paths: `/responses`, `/chat`, `/completions`

## Integration with Chatbot

When using the web interface at `http://localhost:3001`, enter:
1. **LLM Proxy Endpoint**: Your full MuleSoft endpoint URL
2. **Client ID**: Your client ID
3. **Client Secret**: Your client secret

---

**Remember**: This template is safe to commit to GitHub. Your actual configuration file with real credentials should NEVER be committed.
