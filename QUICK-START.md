# Quick Start Guide

Get the Inventory Chatbot running in 3 simple steps!

## ⚡ Super Quick Start (Web Interface)

```bash
# 1. Install dependencies
npm install

# 2. Start the web server
npm run web

# 3. Open your browser
open http://localhost:3001
```

That's it! Enter your Gemini API key and start chatting.

---

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with "AIza...")

**Important:** Keep your API key private!

---

## 💬 What to Ask

Once the chatbot is running, try these queries:

### Product Queries
- "What is product 912?"
- "Show me details for product 912"
- "Tell me about the Standing Desk"
- "Is product 912 in stock?"

### Warehouse Queries
- "Show me warehouse 18"
- "What's in warehouse 18?"
- "Tell me about the Madrid warehouse"
- "What products are in the Madrid warehouse?"

### General
- "Hello" or "Hi" (say hello!)
- "What can you do?" (learn capabilities)
- "Help" (get assistance)

---

## 🎯 Interface Options

### Web Interface (Easiest)
```bash
npm run web
# Open http://localhost:3001
```
✅ Beautiful UI
✅ Real-time chat
✅ Mobile-friendly
✅ Visual indicators

### CLI Chatbot
```bash
npm run chatbot
```
✅ Terminal-based
✅ Keyboard-friendly
✅ No browser needed

### Interactive Testing
```bash
npm run interactive
```
✅ Manual tool testing
✅ Parameter selection
✅ Direct MCP access

### Automated Tests
```bash
npm test
```
✅ Pre-configured tests
✅ Quick verification
✅ Example outputs

---

## 📁 Project Location

All files are in:
```
/Users/ashorey/claude-projects/mcp-test-client/
```

Navigate there:
```bash
cd /Users/ashorey/claude-projects/mcp-test-client
```

---

## 🔧 Troubleshooting

### "Port 3001 already in use"
```bash
PORT=3002 npm run web
```

### "API key invalid"
- Check you copied the full key (starts with AIza)
- Verify it's from Google AI Studio (not PaLM or other)
- Ensure you have API quota available

### "Cannot connect to MCP server"
- Check your internet connection
- Try running the basic test: `npm test`
- The MCP server URL is: `https://mcp-demo-gateway-sj5q6.h37dvc.usa-e2.cloudhub.io/mcptest/`

### "Module not found"
```bash
npm install
```

---

## 📚 Learn More

- [WEB-INTERFACE.md](WEB-INTERFACE.md) - Web interface docs
- [CHATBOT-README.md](CHATBOT-README.md) - CLI chatbot docs
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - MCP server reference
- [README.md](README.md) - Complete documentation

---

## 🚀 Next Steps

1. ✅ Start the web server: `npm run web`
2. ✅ Open http://localhost:3001
3. ✅ Enter your Gemini API key
4. ✅ Ask about product 912
5. ✅ Explore warehouse 18
6. ✅ Try natural language queries

Have fun chatting with your inventory system! 🎉
