# Kunal Singh Voice Bot Backend

A conversational AI backend that embodies Kunal Singh's persona using OpenAI's GPT-4 and Whisper APIs. This voice bot can engage in natural conversations about Kunal's background, expertise in GenAI, prompt engineering, and his various projects.

## Features

- 🤖 **Personalized AI Responses**: Embodies Kunal Singh's personality and expertise
- 🎤 **Speech-to-Text**: Convert voice input to text using OpenAI Whisper
- 🔊 **Text-to-Speech**: Convert AI responses back to speech with multiple voice options
- 💬 **Conversation Memory**: Maintains context throughout the conversation
- 🛡️ **Security**: Rate limiting, CORS protection, and input validation
- 📝 **REST API**: Clean RESTful endpoints for easy integration

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
   cd voice-bot-backend
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

- Send a POST request to `/chat` with a JSON body containing the user's message to interact via text.
- Send a POST request to `/voice` with audio data to interact via voice.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.