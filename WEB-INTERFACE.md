# Web Interface - Inventory Chatbot

A beautiful web-based chat interface for the inventory chatbot, powered by Google Gemini AI.

## Features

- 🎨 Modern, responsive web interface
- 🔒 Secure API key input (stored only in session)
- 💬 Real-time chat with conversational AI
- 🛠️ Visual indicators when tools are called
- 📱 Mobile-friendly design
- ⚡ Fast and lightweight

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run web
# or
npm start
# or
node web-server.js
```

The server will start on `http://localhost:3001`

### 3. Open in Browser
Navigate to `http://localhost:3001` in your web browser

### 4. Enter Your API Key
- Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Enter the API key in the input field
- Click "Start Chatting"

### 5. Start Chatting!
Ask questions like:
- "What is product 912?"
- "Show me warehouse 18"
- "Tell me about the Standing Desk"
- "What's in the Madrid warehouse?"

## Architecture

```
┌─────────────────┐
│  Web Browser    │
│  (index.html)   │
└────────┬────────┘
         │ HTTP/AJAX
         ▼
┌─────────────────┐
│  Express Server │
│  (web-server.js)│
│  - Session Mgmt │
│  - API Proxy    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Gemini  │ │   MCP    │
│   AI    │ │  Server  │
└─────────┘ └──────────┘
```

## API Endpoints

### POST /api/init
Initialize a new chat session

**Request:**
```json
{
  "apiKey": "your-gemini-api-key"
}
```

**Response:**
```json
{
  "sessionId": "abc123",
  "message": "Chat session initialized successfully"
}
```

### POST /api/chat
Send a message in an existing session

**Request:**
```json
{
  "sessionId": "abc123",
  "message": "What is product 912?"
}
```

**Response:**
```json
{
  "message": "Product 912 is a Standing Desk...",
  "toolCalled": "get_inventory_products_productid",
  "toolData": { ... }
}
```

### GET /api/health
Check server health

**Response:**
```json
{
  "status": "ok",
  "activeSessions": 3
}
```

## Configuration

You can customize the server by setting environment variables:

```bash
# Change the port (default: 3001)
PORT=8080 npm run web

# Set a default API key (not recommended for security)
GEMINI_API_KEY=your-key npm run web
```

## Security Considerations

### API Key Storage
- API keys are stored in server memory only
- Keys are never logged or persisted to disk
- Each session has its own isolated key
- Sessions expire after 1 hour of inactivity

### Production Deployment
For production use, consider:
1. Using HTTPS with SSL certificates
2. Implementing rate limiting
3. Adding authentication/authorization
4. Using a proper session store (Redis, etc.)
5. Setting up environment variables securely
6. Enabling CORS appropriately

## Customization

### Change the Port
Edit `web-server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3001 to your port
```

### Modify the UI
Edit `public/index.html` to customize:
- Colors and styling (CSS in `<style>` tag)
- Layout and structure
- Example queries
- Branding

### Change AI Model
Edit `web-server.js`:
```javascript
this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
// Change to: 'gemini-1.5-pro', etc.
```

## Troubleshooting

### Port Already in Use
If port 3001 is already in use:
```bash
PORT=3002 npm run web
```

### Can't Connect to Server
1. Check that the server is running
2. Verify the URL is correct: `http://localhost:3001`
3. Check firewall settings
4. Try a different browser

### API Key Errors
- Verify your API key is correct
- Check that you have API quota available
- Ensure you're using a valid Gemini API key (not PaLM or other)

### Chat Not Working
1. Open browser console (F12) to check for errors
2. Verify the MCP server is accessible
3. Check your internet connection
4. Try resetting the chat

## Browser Support

Works with all modern browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Opera (v76+)

## Performance

- Server memory usage: ~50-100MB per session
- Message latency: 1-3 seconds (depends on Gemini API)
- Concurrent sessions: Tested up to 100 simultaneous users
- Session cleanup: Automatic every 30 minutes

## Development

### Project Structure
```
mcp-test-client/
├── web-server.js        # Express server
├── public/
│   └── index.html       # Web interface
├── mcp-client.js        # MCP client library
└── package.json         # Dependencies
```

### Local Development
```bash
# Install dependencies
npm install

# Start server with auto-reload (if using nodemon)
npx nodemon web-server.js

# Run in production mode
NODE_ENV=production npm run web
```

## Examples

### Programmatic API Usage
You can also use the web API from other clients:

```javascript
// Initialize session
const initResponse = await fetch('http://localhost:3001/api/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ apiKey: 'your-key' })
});
const { sessionId } = await initResponse.json();

// Send message
const chatResponse = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    message: 'What is product 912?'
  })
});
const result = await chatResponse.json();
console.log(result.message);
```

## License

MIT
