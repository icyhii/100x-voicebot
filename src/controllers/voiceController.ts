import { Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';
import { SpeechService } from '../services/speechService';
import multer from 'multer';

// Configure multer for handling file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid audio format'));
        }
    }
});

export class VoiceController {
    private openAIService: OpenAIService;
    private speechService: SpeechService;
    public uploadMiddleware = upload.single('audio');

    constructor() {
        this.openAIService = new OpenAIService();
        this.speechService = new SpeechService();
    }

    public async handleVoiceInput(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file provided' });
                return;
            }

            const audioBuffer = req.file.buffer;
            const { returnAudio = false, voice = 'alloy' } = req.body;

            // Convert speech to text
            const textInput = await this.speechService.convertSpeechToText(audioBuffer);
            
            // Get AI response
            const textResponse = await this.openAIService.fetchResponse(textInput);

            const response: any = {
                transcript: textInput,
                response: textResponse,
                timestamp: new Date().toISOString()
            };

            // Optionally convert response back to speech
            if (returnAudio === 'true' || returnAudio === true) {
                const audioResponse = await this.speechService.synthesizeSpeech(textResponse, voice);
                response.audioResponse = audioResponse.toString('base64');
                response.audioFormat = 'mp3';
            }

            res.json(response);
        } catch (error) {
            console.error('Voice controller error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ 
                error: 'An error occurred while processing the voice input.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    public async handleTextToSpeech(req: Request, res: Response): Promise<void> {
        try {
            const { text, voice = 'alloy' } = req.body;

            if (!text || typeof text !== 'string') {
                res.status(400).json({ error: 'Text is required and must be a string' });
                return;
            }

            const audioBuffer = await this.speechService.synthesizeSpeech(text, voice);
            
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString(),
                'Content-Disposition': 'attachment; filename="speech.mp3"'
            });
            
            res.send(audioBuffer);
        } catch (error) {
            console.error('Text-to-speech error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ 
                error: 'An error occurred while converting text to speech.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    public async getVoiceOptions(req: Request, res: Response): Promise<void> {
        try {
            res.json({
                availableVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
                supportedFormats: ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'],
                maxFileSize: '25MB',
                features: ['speech-to-text', 'text-to-speech', 'conversation-memory']
            });
        } catch (error) {
            res.status(500).json({ error: 'Unable to get voice options' });
        }
    }
}