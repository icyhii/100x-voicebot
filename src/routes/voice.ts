import { Router } from 'express';
import { VoiceController } from '../controllers/voiceController';

const voiceController = new VoiceController();

export function setVoiceRoutes(app: Router) {
    // Smart voice input endpoint (parallel with traditional fallback)
    app.post('/voice', voiceController.uploadMiddleware, voiceController.handleVoiceInput.bind(voiceController));
    
    // Explicit traditional voice processing endpoint
    app.post('/voice/traditional', voiceController.uploadMiddleware, voiceController.handleTraditionalVoiceProcessing.bind(voiceController));
    
    // Text-to-speech endpoint
    app.post('/tts', voiceController.handleTextToSpeech.bind(voiceController));
    
    // Enhanced voice capabilities endpoint
    app.get('/voice/options', voiceController.getVoiceOptions.bind(voiceController));
}