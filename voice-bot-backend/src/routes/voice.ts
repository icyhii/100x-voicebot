import { Router } from 'express';
import { VoiceController } from '../controllers/voiceController';

const voiceController = new VoiceController();

export function setVoiceRoutes(app: Router) {
    // Voice input endpoint (speech-to-text + AI response)
    app.post('/voice', voiceController.uploadMiddleware, voiceController.handleVoiceInput.bind(voiceController));
    
    // Text-to-speech endpoint
    app.post('/tts', voiceController.handleTextToSpeech.bind(voiceController));
    
    // Voice capabilities endpoint
    app.get('/voice/options', voiceController.getVoiceOptions.bind(voiceController));
}