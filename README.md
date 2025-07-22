# Kunal Singh Voice Bot Backend

A conversational AI backend that embodies Kunal Singh's persona using OpenAI's GPT-4 and Whisper APIs. This voice bot can engage in natural conversations about Kunal's background, expertise in GenAI, prompt engineering, and his various projects.

## Features

- 🤖 **Personalized AI Responses**: Embodies Kunal Singh's personality and expertise
- 🎤 **Speech-to-Text**: Convert voice input to text using OpenAI Whisper
- 🔊 **Text-to-Speech**: Convert AI responses back to speech with multiple voice options
- 💬 **Conversation Memory**: Maintains context throughout the conversation
- 🚀 **Smart Processing Pipeline**: Automatic parallel processing (3-6s) with traditional fallback (8-15s)
- 🎯 **Zero-Latency Optimizations**: Enhanced voice quality with text optimization and professional Nova voice
- 💡 **Intelligent Fallback**: Automatic reliability with seamless pipeline switching
- 🌊 **Dual Processing Modes**: Optimized parallel processing with reliable traditional backup
- 🛡️ **Production Ready**: Rate limiting, CORS protection, comprehensive error handling
- 📝 **REST API**: Clean, simplified endpoints with smart processing selection

## Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3000`
- `src/types/index.ts`: Defines types used throughout the application.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd 100x-voicebot
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory based on the `.env.example` file, and fill in the required API keys and configuration settings.

4. **Run the Application**:
   ```bash
   npm start
   ```

5. **Access the API**:
   The API will be available at `http://localhost:3000`. You can test the chat and voice routes as defined in the routes.

## Usage Guidelines

### Smart Voice Processing (Recommended):
- Send a POST request to `/voice` with audio data for **automatic optimization**
- **Default behavior**: Attempts parallel processing (3-6s), falls back to traditional (8-15s) if needed
- **Force traditional**: Include `"mode": "traditional"` in request body for guaranteed traditional processing

### Text Chat:
- Send a POST request to `/chat` with a JSON body containing the user's message
- Use `POST /chat/stream` for real-time streaming chat responses with Server-Sent Events

### Explicit Traditional Processing:
- Use `POST /voice/traditional` for guaranteed traditional processing (8-15s)
- **Use case**: When you need maximum reliability over speed

### Voice Configuration:
- Get available options with `GET /voice/options`
- Enhanced configuration includes processing modes, voice options, and optimizations

### Performance Modes:
- **Parallel Processing** (Default): Real-time streaming pipeline (~3-6s)
  - Chunked audio processing, streaming STT, incremental chat, parallel TTS
  - Automatic fallback to traditional on any error
- **Traditional Processing** (Fallback/Explicit): Sequential pipeline (~8-15s)  
  - STT → Chat → TTS in sequence, guaranteed reliability

See `STREAMLINED_ARCHITECTURE.md` for detailed implementation guide and `VOICE_QUALITY_IMPROVEMENTS.md` for optimization details.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.