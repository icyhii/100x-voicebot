# Streaming API Usage Examples

## Chat Streaming with Server-Sent Events

### JavaScript Client Example:
```javascript
async function streamChat(message) {
    const response = await fetch('/chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: message })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.chunk) {
                        console.log('Received chunk:', data.chunk);
                        // Display the chunk in your UI
                        displayText(data.chunk);
                    } else if (data.done) {
                        console.log('Stream completed');
                        break;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Streaming error:', error);
    }
}

// Usage
streamChat("Tell me about your GenAI projects");
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"input": "What is prompt engineering?"}' \
  --no-buffer
```

## Voice Streaming

### Standard Streaming Voice (`/voice/stream`)
```javascript
async function streamVoice(audioFile) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('voice', 'alloy');

    const response = await fetch('/voice/stream', {
        method: 'POST',
        body: formData
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let transcript = '';
    const audioChunks = [];

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('TRANSCRIPT:')) {
                    const data = JSON.parse(line.slice(11));
                    transcript = data.transcript;
                    console.log('Transcript:', transcript);
                } else if (line.startsWith('AUDIO:')) {
                    const audioData = line.slice(6);
                    const audioBuffer = base64ToBuffer(audioData);
                    audioChunks.push(audioBuffer);
                    
                    // Play audio chunk immediately
                    playAudioChunk(audioBuffer);
                } else if (line.startsWith('DONE:')) {
                    console.log('Voice streaming completed');
                    break;
                } else if (line.startsWith('ERROR:')) {
                    const error = JSON.parse(line.slice(6));
                    console.error('Voice streaming error:', error);
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Voice streaming error:', error);
    }
}
```

### Parallel Streaming Voice (`/voice/parallel`) - **NEW!**
```javascript
async function parallelStreamVoice(audioFile) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('voice', 'alloy');

    const response = await fetch('/voice/parallel', {
        method: 'POST',
        body: formData
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let transcript = '';
    const audioChunks = [];
    let partialChat = '';
    let completeChat = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('TRANSCRIPT:')) {
                    const data = JSON.parse(line.slice(11));
                    transcript = data.transcript;
                    console.log('📝 Transcript:', transcript);
                    displayTranscript(transcript);
                    
                } else if (line.startsWith('CHAT_PARTIAL:')) {
                    const data = JSON.parse(line.slice(13));
                    partialChat += data.content;
                    console.log('💭 Partial response:', data.content);
                    displayPartialChat(data.content);
                    
                } else if (line.startsWith('CHAT_COMPLETE:')) {
                    const data = JSON.parse(line.slice(14));
                    completeChat += data.content;
                    console.log('✅ Complete response:', data.content);
                    displayCompleteChat(data.content);
                    
                } else if (line.startsWith('AUDIO:')) {
                    const audioData = line.slice(6);
                    const audioBuffer = base64ToBuffer(audioData);
                    audioChunks.push(audioBuffer);
                    
                    // Play audio chunk immediately
                    console.log('🔊 Playing audio chunk...');
                    playAudioChunk(audioBuffer);
                    
                } else if (line.startsWith('DONE:')) {
                    console.log('🎉 Parallel streaming completed');
                    break;
                } else if (line.startsWith('ERROR:')) {
                    const error = JSON.parse(line.slice(6));
                    console.error('❌ Parallel streaming error:', error);
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Parallel streaming error:', error);
    }
}

function displayTranscript(transcript) {
    document.getElementById('transcript').textContent = transcript;
}

function displayPartialChat(content) {
    const partialDiv = document.getElementById('partial-chat');
    partialDiv.textContent += content;
    partialDiv.style.opacity = '0.7'; // Show it's partial
}

function displayCompleteChat(content) {
    const completeDiv = document.getElementById('complete-chat');
    completeDiv.textContent += content;
    completeDiv.style.opacity = '1.0'; // Show it's complete
    
    // Hide partial chat
    document.getElementById('partial-chat').style.display = 'none';
}

function base64ToBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function playAudioChunk(audioBuffer) {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().then(() => {
        URL.revokeObjectURL(url);
    });
}
```

### cURL Examples:
```bash
# Standard streaming
curl -X POST http://localhost:3000/voice/stream \
  -F "audio=@voice_input.wav" \
  -F "voice=alloy" \
  --no-buffer

# Parallel streaming (Advanced)
curl -X POST http://localhost:3000/voice/parallel \
  -F "audio=@voice_input.wav" \
  -F "voice=alloy" \
  --no-buffer
```

## API Endpoints

### Regular Endpoints (Non-streaming):
- `POST /chat` - Regular chat completion
- `POST /voice` - Voice input with optional audio response
- `POST /tts` - Text-to-speech conversion
- `GET /voice/options` - Available voice options

### Streaming Endpoints:
- `POST /chat/stream` - Streaming chat with Server-Sent Events
- `POST /voice/stream` - Streaming voice with chunked audio response
- `POST /voice/parallel` - **NEW!** Parallel streaming with STT + Chat + TTS

## Performance Comparison

### Traditional Pipeline (Sequential):
1. **Audio Upload** → 2. **Complete STT** → 3. **Complete Chat** → 4. **Complete TTS** → 5. **Audio Response**
- **Total Time**: ~8-15 seconds
- **User Experience**: Long wait, no feedback

### Standard Streaming (`/voice/stream`):
1. **Audio Upload** → 2. **Complete STT** → 3. **Streaming Chat + TTS** → 4. **Chunked Audio**
- **Total Time**: ~6-10 seconds  
- **User Experience**: Faster audio delivery

### Parallel Streaming (`/voice/parallel`) - **FASTEST**:
1. **Audio Chunks** → 2. **Streaming STT** → 3. **Incremental Chat** → 4. **Parallel TTS** → 5. **Real-time Audio**
- **Total Time**: ~3-6 seconds
- **User Experience**: Near real-time interaction

## Performance Benefits

### Chat Streaming:
- **Reduced perceived latency**: Users see responses as they're generated
- **Better user experience**: Progressive text display feels more interactive
- **Faster feedback**: No waiting for complete response before showing anything

### Standard Voice Streaming:
- **Lower latency**: Audio playback starts as soon as first chunk is ready
- **Parallel processing**: TTS occurs in parallel with text generation
- **Smoother experience**: Audio chunks play continuously without gaps

### Parallel Voice Streaming (Advanced):
- **Ultra-low latency**: Processing starts before audio upload completes
- **Incremental responses**: Users get partial feedback during transcription
- **Maximum parallelism**: STT, Chat, and TTS all run concurrently
- **Real-time feel**: Near-conversational response times

## Integration Notes

1. **Client-side buffering**: Implement proper buffering for smooth audio playback
2. **Error handling**: Handle network interruptions and streaming errors gracefully
3. **Connection management**: Properly close streaming connections when done
4. **Progress indicators**: Show streaming progress to users
5. **Fallback support**: Provide non-streaming fallbacks for unsupported clients
6. **Parallel processing**: Use Web Workers for handling multiple streams simultaneously
