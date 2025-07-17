# Kunal Singh Voice Bot Backend - Complete Implementation

## 🎯 Project Overview

This is a fully functional voice bot backend that embodies **Kunal Singh's persona** using OpenAI's GPT-4 and Whisper APIs. The bot can engage in natural conversations about Kunal's background, expertise in GenAI, prompt engineering, and his various projects.

## ✅ Features Implemented

### Core Functionality
- **🤖 Personalized AI Responses**: Embodies Kunal Singh's personality with detailed system prompt
- **🎤 Speech-to-Text**: Convert voice input using OpenAI Whisper
- **🔊 Text-to-Speech**: Convert responses to speech with 6 voice options
- **💬 Conversation Memory**: Maintains context throughout conversations
- **🛡️ Security**: Rate limiting, CORS protection, input validation
- **📝 REST API**: Clean endpoints for easy frontend integration

### API Endpoints
- `POST /chat` - Text chat with the bot
- `POST /voice` - Voice input processing  
- `POST /tts` - Text-to-speech conversion
- `GET /status` - Bot status and capabilities
- `GET /health` - Health check
- `GET /voice/options` - Available voice options

### Kunal's Persona Implementation

The bot responds authentically to key questions like:

**Life Story**: "I grew up fascinated by how systems—technical and musical—fit together. I studied Computer Science, explored everything from DevOps to full-stack web to AI agents, and along the way, I built things like PromptHub, Agent Doc, DitherDoc, Boyd even produced music under What If Music. Blending structure and creativity has always been a big part of who I am."

**Superpower**: "My #1 superpower is systems thinking—being able to connect dots across technical domains, and turn messy ideas into well-scoped, testable solutions."

**Growth Areas**: "(1) Collaborative product thinking, (2) multilingual model alignment, and (3) contributing more deeply to open-source communities."

**Misconceptions**: "Apparently, I give off 'mad scientist locked in a server room' energy—like I only speak in JSON and deploy Kubernetes clusters for fun. But actually... I thrive on collaboration. I just have a resting debug face."

**Pushing Limits**: "I set challenges that force me to cross skill boundaries—like building music-gen tools or deploying AI workflows with production-grade infra. I believe meaningful growth comes from discomfort and iteration."

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- npm or yarn

### Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Test the API**:
   ```bash
   curl http://localhost:3000/health
   ```

## 📁 Project Structure

```
voice-bot-backend/
├── src/
│   ├── app.ts                 # Main server setup
│   ├── controllers/
│   │   ├── chatController.ts  # Chat logic & conversation handling
│   │   └── voiceController.ts # Voice processing & TTS
│   ├── services/
│   │   ├── openaiService.ts   # OpenAI API integration & persona
│   │   └── speechService.ts   # Speech-to-text & text-to-speech
│   ├── routes/
│   │   ├── chat.ts           # Chat endpoints
│   │   └── voice.ts          # Voice endpoints
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── dist/                     # Compiled JavaScript (after build)
├── package.json             # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── .env.example           # Environment variables template
├── README.md             # Main documentation
├── API_TESTING.md       # API testing examples
├── DEPLOYMENT.md       # Deployment guide
└── demo.html          # Frontend demo page
```

## 🧪 Testing

### Basic Chat Test
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "What is your superpower?"}'
```

### Voice Options
```bash
curl http://localhost:3000/voice/options
```

### Text-to-Speech
```bash
curl -X POST http://localhost:3000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, I am Kunal Singh!", "voice": "alloy"}' \
  --output response.mp3
```

See `API_TESTING.md` for comprehensive testing examples.

## 🌐 Deployment

### Quick Deploy to Railway (Recommended)
1. Push code to GitHub
2. Connect to Railway.app
3. Set `OPENAI_API_KEY` environment variable
4. Deploy automatically

### Other Platforms
- **Vercel**: Serverless deployment
- **Heroku**: Traditional PaaS
- **Render**: Modern hosting platform
- **DigitalOcean**: App platform
- **Docker**: Containerized deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🎮 Demo

A complete frontend demo is available in `demo.html`. Features:
- Real-time chat interface
- Voice recording and playback
- Example questions for testing
- Text-to-speech responses
- Modern, responsive design

## 🔧 Configuration

### Environment Variables

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key

**Optional:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed origins (comma-separated)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

### Voice Options
- `alloy` - Neutral, balanced
- `echo` - Clear, expressive  
- `fable` - Warm, engaging
- `onyx` - Deep, authoritative
- `nova` - Bright, upbeat
- `shimmer` - Soft, whispery

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Controls cross-origin requests
- **Input Validation**: Validates all inputs
- **Error Handling**: Secure error responses
- **Helmet**: Security headers
- **File Upload Limits**: 25MB max audio files

## 💰 Cost Considerations

- **GPT-4**: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
- **Whisper**: ~$0.006 per minute of audio
- **TTS**: ~$0.015 per 1K characters
- Monitor usage through OpenAI dashboard

## 🔧 Maintenance

### Monitoring
- Health check: `GET /health`
- Status check: `GET /status`
- Monitor OpenAI API usage
- Track error rates and response times

### Updates
- Keep dependencies updated
- Monitor OpenAI API changes
- Update persona content as needed
- Scale based on usage patterns

## 🎯 Integration Examples

### JavaScript Frontend
```javascript
// Send chat message
const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'Tell me about your projects' })
});
const data = await response.json();
console.log(data.response);
```

### Voice Upload
```javascript
// Upload audio file
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('returnAudio', 'true');

const response = await fetch('/voice', {
  method: 'POST',
  body: formData
});
```

## 📞 Support

- **API Documentation**: Available at `http://localhost:3000`
- **Testing Guide**: See `API_TESTING.md`
- **Deployment Help**: See `DEPLOYMENT.md`
- **Demo Interface**: Open `demo.html` in browser

## 📈 Next Steps

1. **Deploy to your preferred platform**
2. **Integrate with your frontend application**
3. **Monitor usage and performance**
4. **Customize persona further if needed**
5. **Scale based on traffic**

## 🏆 Success Criteria

✅ **Functional voice bot backend**  
✅ **Embodies Kunal Singh's persona accurately**  
✅ **Handles the example questions correctly**  
✅ **Production-ready with security measures**  
✅ **Easy deployment and integration**  
✅ **Comprehensive documentation**  
✅ **Demo interface for testing**  

This implementation provides a complete, production-ready voice bot backend that successfully embodies Kunal Singh's persona and can be easily deployed and integrated with any frontend application.
