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

    /**
     * Smart voice input handler with automatic pipeline selection
     * - Primary: Parallel processing (3-6s) 
     * - Fallback: Traditional processing (8-15s)
     */
    public async handleVoiceInput(req: Request, res: Response): Promise<void> {
        const useParallel = req.body.mode !== 'traditional'; // Default to parallel processing
        
        if (useParallel) {
            try {
                console.log('🚀 Attempting parallel voice processing (3-6s)...');
                // Attempt parallel processing first for best performance
                await this.handleParallelVoiceInput(req, res);
            } catch (error) {
                console.warn('⚠️ Parallel processing failed, falling back to traditional pipeline');
                console.warn('Parallel error:', error instanceof Error ? error.message : 'Unknown error');
                
                // Fallback to traditional pipeline
                await this.handleTraditionalVoiceInput(req, res);
            }
        } else {
            console.log('🎯 Using traditional voice processing (8-15s) as requested...');
            // Explicit traditional pipeline request
            await this.handleTraditionalVoiceInput(req, res);
        }
    }

    /**
     * Primary processing method - Optimized parallel pipeline (3-6s)
     * Real-time streaming with chunked processing for best performance
     */
    private async handleParallelVoiceInput(req: Request, res: Response): Promise<void> {
        if (!req.file) {
            res.status(400).json({ error: 'No audio file provided' });
            return;
        }

        const audioBuffer = req.file.buffer;
        const { voice = 'nova' } = req.body;

        // Set headers for streaming response
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Transfer-Encoding': 'chunked'
        });

        // Create audio chunks generator from the buffer
        const audioChunksGenerator = this.createAudioChunksGenerator(audioBuffer);
        
        // Start streaming STT processing
        const sttStreamGenerator = this.speechService.convertSpeechToTextStreaming(audioChunksGenerator);
        
        // Start incremental chat processing with streaming STT
        const chatStreamGenerator = this.openAIService.fetchIncrementalStreamingResponse(sttStreamGenerator);
        
        let isFirstTranscript = true;
        let chatBuffer = '';
        const ttsQueue: string[] = [];
        let processingTTS = false;

        // Process chat stream and handle TTS in parallel
        for await (const chatResult of chatStreamGenerator) {
            if (chatResult.type === 'partial') {
                // Send partial chat responses as they come
                res.write(`CHAT_PARTIAL:${JSON.stringify({ 
                    content: chatResult.content,
                    inputUsed: chatResult.inputUsed,
                    timestamp: new Date().toISOString() 
                })}\n`);
                
                chatBuffer += chatResult.content;
                
                // Queue for TTS when we have enough content
                if (chatBuffer.length > 50 || /[.!?]/.test(chatResult.content)) {
                    ttsQueue.push(chatBuffer.trim());
                    chatBuffer = '';
                    
                    // Process TTS queue in parallel
                    if (!processingTTS) {
                        processingTTS = true;
                        this.processTTSQueue(ttsQueue, res).finally(() => {
                            processingTTS = false;
                        });
                    }
                }
                
            } else if (chatResult.type === 'complete') {
                // Send transcript if first time
                if (isFirstTranscript) {
                    res.write(`TRANSCRIPT:${JSON.stringify({ 
                        transcript: chatResult.inputUsed, 
                        timestamp: new Date().toISOString() 
                    })}\n`);
                    isFirstTranscript = false;
                }

                // Send complete chat response
                res.write(`CHAT_COMPLETE:${JSON.stringify({ 
                    content: chatResult.content,
                    timestamp: new Date().toISOString() 
                })}\n`);
                
                chatBuffer += chatResult.content;
                
                // Queue final content for TTS
                if (chatBuffer.trim()) {
                    ttsQueue.push(chatBuffer.trim());
                }
            }
        }

        // Process any remaining TTS
        if (ttsQueue.length > 0) {
            await this.processTTSQueue(ttsQueue, res);
        }
        
        res.write(`DONE:${JSON.stringify({ 
            timestamp: new Date().toISOString(),
            processingMode: 'parallel'
        })}\n`);
        res.end();

        console.log('✅ Completed parallel voice processing (3-6s)');
    }

    /**
     * Fallback processing method - Simple traditional pipeline (8-15s)
     * Sequential processing: STT -> Chat -> TTS for maximum reliability
     */
    private async handleTraditionalVoiceInput(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file provided' });
                return;
            }

            const audioBuffer = req.file.buffer;
            const { returnAudio = false } = req.body;

            console.log('🎤 Processing voice input with traditional pipeline...');
            
            // Sequential processing: STT -> Chat -> TTS
            const textInput = await this.speechService.convertSpeechToText(audioBuffer);
            const textResponse = await this.openAIService.fetchResponse(textInput);

            const response: any = {
                transcript: textInput,
                response: textResponse,
                timestamp: new Date().toISOString(),
                processingInfo: {
                    mode: 'traditional',
                    voiceModel: 'nova',
                    textOptimized: true,
                    audioFormat: 'mp3'
                }
            };

            if (returnAudio === 'true' || returnAudio === true) {
                const audioResponse = await this.speechService.convertTextToSpeech(textResponse);
                response.audioResponse = audioResponse.toString('base64');
                response.audioFormat = 'mp3';
            }

            console.log('✅ Traditional voice processing completed (8-15s)');
            res.json(response);
        } catch (error) {
            console.error('❌ Traditional voice processing error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ 
                error: 'An error occurred while processing your voice input.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    /**
     * Explicit traditional voice processing endpoint
     * For clients that want guaranteed traditional processing
     */
    public async handleTraditionalVoiceProcessing(req: Request, res: Response): Promise<void> {
        console.log('🎯 Explicit traditional voice processing requested...');
        await this.handleTraditionalVoiceInput(req, res);
    }

    /**
     * Helper method for creating audio chunks generator
     */
    private async *createAudioChunksGenerator(audioBuffer: Buffer): AsyncGenerator<Buffer, void, unknown> {
        const chunkSize = 1024 * 8; // 8KB chunks
        
        for (let i = 0; i < audioBuffer.length; i += chunkSize) {
            const chunk = audioBuffer.slice(i, i + chunkSize);
            yield chunk;
            
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Helper method for processing TTS queue in parallel
     */
    private async processTTSQueue(ttsQueue: string[], res: Response): Promise<void> {
        while (ttsQueue.length > 0) {
            const text = ttsQueue.shift();
            if (text && text.trim()) {
                try {
                    console.log(`🎵 Processing TTS for: "${text.substring(0, 30)}..."`);
                    
                    const audioBuffer = await this.speechService.convertTextToSpeech(text);
                    res.write(`AUDIO:${audioBuffer.toString('base64')}\n`);
                } catch (ttsError) {
                    console.warn('⚠️ TTS processing error:', ttsError);
                    // Continue processing other items in queue
                }
            }
        }
    }

    /**
     * Text-to-speech endpoint
     */
    public async handleTextToSpeech(req: Request, res: Response): Promise<void> {
        try {
            const { text, voice = 'nova' } = req.body;

            if (!text || typeof text !== 'string') {
                res.status(400).json({ error: 'Text is required and must be a string' });
                return;
            }

            const audioBuffer = await this.speechService.convertTextToSpeech(text);
            
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString(),
                'Content-Disposition': 'attachment; filename="speech.mp3"'
            });

            res.send(audioBuffer);
        } catch (error) {
            console.error('TTS controller error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ 
                error: 'An error occurred while synthesizing speech.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    /**
     * Voice options endpoint with enhanced configuration info
     */
    public async getVoiceOptions(req: Request, res: Response): Promise<void> {
        try {
            const voiceOptions = [
                { value: 'nova', name: 'Nova', description: 'Clear and professional - optimal for technical discussions', recommended: true },
                { value: 'alloy', name: 'Alloy', description: 'Balanced and natural - good general purpose voice' },
                { value: 'echo', name: 'Echo', description: 'Friendly and warm - good for casual conversations' },
                { value: 'fable', name: 'Fable', description: 'Expressive and dynamic - good for storytelling' },
                { value: 'onyx', name: 'Onyx', description: 'Deep and authoritative - good for formal presentations' },
                { value: 'shimmer', name: 'Shimmer', description: 'Soft and gentle - good for calm interactions' }
            ];

            const processingModes = [
                { 
                    mode: 'parallel', 
                    name: 'Parallel Processing', 
                    responseTime: '3-6 seconds', 
                    description: 'Real-time streaming with chunked processing',
                    recommended: true 
                },
                { 
                    mode: 'traditional', 
                    name: 'Traditional Processing', 
                    responseTime: '8-15 seconds', 
                    description: 'Sequential processing for maximum reliability' 
                }
            ];

            res.status(200).json({
                voices: voiceOptions,
                processingModes,
                defaultVoice: 'nova',
                defaultMode: 'parallel',
                optimizations: {
                    textOptimization: true,
                    technicalTerms: true,
                    naturalPauses: true,
                    acronymHandling: true
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Voice options controller error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ 
                error: 'An error occurred while fetching voice options.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }
}
