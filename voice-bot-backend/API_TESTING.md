# API Testing Examples

Test the Kunal Singh Voice Bot Backend with these example requests.

## Prerequisites

1. Set your OpenAI API key in `.env`:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

## Testing with curl

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Get Bot Status
```bash
curl http://localhost:3000/status
```

### 3. Get First Message
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"action": "getFirstMessage"}'
```

### 4. Send Chat Message
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "What should I know about your life story?"}'
```

### 5. Ask About Superpower
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "What is your #1 superpower?"}'
```

### 6. Ask About Growth Areas
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "What are the top 3 areas you would like to grow in?"}'
```

### 7. Ask About Misconceptions
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "What misconception do your coworkers have about you?"}'
```

### 8. Ask About Pushing Limits
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "How do you push your boundaries and limits?"}'
```

### 9. Text-to-Speech
```bash
curl -X POST http://localhost:3000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello! I am Kunal Singh, a prompt engineer and GenAI builder.", "voice": "alloy"}' \
  --output response.mp3
```

### 10. Get Voice Options
```bash
curl http://localhost:3000/voice/options
```

## Testing with JavaScript (Browser/Node.js)

### Basic Chat Test
```javascript
async function testChat() {
    try {
        // Get first message
        const firstMsg = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getFirstMessage' })
        });
        const firstData = await firstMsg.json();
        console.log('First Message:', firstData.response);

        // Ask about life story
        const lifeStory = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: 'Tell me about your life story in a few sentences' })
        });
        const lifeData = await lifeStory.json();
        console.log('Life Story:', lifeData.response);

        // Ask about superpower
        const superpower = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: 'What is your #1 superpower?' })
        });
        const superpowerData = await superpower.json();
        console.log('Superpower:', superpowerData.response);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testChat();
```

### Text-to-Speech Test
```javascript
async function testTTS() {
    try {
        const response = await fetch('http://localhost:3000/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: 'My superpower is systems thinking—connecting dots across technical domains.',
                voice: 'alloy' 
            })
        });
        
        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    } catch (error) {
        console.error('TTS test failed:', error);
    }
}
```

### Voice Upload Test (with File Input)
```javascript
async function testVoiceUpload(audioFile) {
    try {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('returnAudio', 'true');
        formData.append('voice', 'nova');

        const response = await fetch('http://localhost:3000/voice', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Transcript:', data.transcript);
        console.log('AI Response:', data.response);
        
        if (data.audioResponse) {
            // Play the audio response
            const audioBlob = new Blob([Buffer.from(data.audioResponse, 'base64')], 
                                      { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    } catch (error) {
        console.error('Voice test failed:', error);
    }
}
```

## Expected Responses

Based on Kunal's persona, you should expect responses like:

**Life Story:** "I grew up fascinated by how systems—technical and musical—fit together. I studied Computer Science, explored everything from DevOps to full-stack web to AI agents, and along the way, I built things like PromptHub, Agent Doc, DitherDoc, Boyd even produced music under What If Music. Blending structure and creativity has always been a big part of who I am."

**Superpower:** "My #1 superpower is systems thinking—being able to connect dots across technical domains, and turn messy ideas into well-scoped, testable solutions."

**Growth Areas:** "(1) Collaborative product thinking, (2) multilingual model alignment, and (3) contributing more deeply to open-source communities."

**Misconceptions:** "Apparently, I give off 'mad scientist locked in a server room' energy—like I only speak in JSON and deploy Kubernetes clusters for fun. But actually... I thrive on collaboration. I just have a resting debug face."

**Pushing Limits:** "I set challenges that force me to cross skill boundaries—like building music-gen tools or deploying AI workflows with production-grade infra. I believe meaningful growth comes from discomfort and iteration."

## Troubleshooting

1. **OpenAI API Errors**: Ensure your API key is valid and has sufficient credits
2. **CORS Issues**: Check that your frontend origin is in the CORS_ORIGIN environment variable
3. **File Upload Issues**: Ensure audio files are under 25MB and in supported formats
4. **Rate Limiting**: If you get 429 errors, wait 15 minutes or adjust rate limits in .env
