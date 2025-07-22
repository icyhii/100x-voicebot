import OpenAI from 'openai';
import fs from 'fs';

export class SpeechService {
    private openai: OpenAI;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async convertSpeechToText(audioBuffer: Buffer): Promise<string> {
        try {
            console.log('🎤 Converting speech to text using enhanced Whisper API...');
            
            // Create a temporary file for the audio buffer
            const tempFilePath = `/tmp/audio_${Date.now()}.wav`;
            fs.writeFileSync(tempFilePath, audioBuffer);
            
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: 'whisper-1',
                language: 'en', // Specify language for better accuracy
                response_format: 'text',
                prompt: 'Technical discussion about AI, GenAI, prompt engineering, LLMs, and software development with Kunal Singh', // Context helps accuracy
                temperature: 0.2 // Lower temperature for more consistent transcription
            });

            // Clean up temporary file
            fs.unlinkSync(tempFilePath);

            console.log('✅ Enhanced speech-to-text conversion completed');
            return transcription;
        } catch (error) {
            console.error('❌ Error converting speech to text:', error);
            if (error instanceof Error) {
                throw new Error(`Speech-to-text conversion failed: ${error.message}`);
            }
            throw new Error('Failed to convert speech to text');
        }
    }

    async *convertSpeechToTextStreaming(audioChunks: AsyncGenerator<Buffer>): AsyncGenerator<string, void, unknown> {
        try {
            console.log('🎤 Starting streaming speech-to-text conversion...');
            
            let audioBuffer = Buffer.alloc(0);
            let chunkCount = 0;
            const minChunkSize = 1024 * 64; // 64KB minimum chunk size for processing
            
            for await (const chunk of audioChunks) {
                audioBuffer = Buffer.concat([audioBuffer, chunk]);
                chunkCount++;
                
                // Process audio in segments for streaming transcription
                if (audioBuffer.length >= minChunkSize || chunkCount % 10 === 0) {
                    try {
                        console.log(`🎵 Processing audio chunk ${chunkCount} (${audioBuffer.length} bytes)...`);
                        
                        const tempFilePath = `/tmp/audio_chunk_${Date.now()}_${chunkCount}.wav`;
                        fs.writeFileSync(tempFilePath, audioBuffer);
                        
                        const transcription = await this.openai.audio.transcriptions.create({
                            file: fs.createReadStream(tempFilePath),
                            model: 'whisper-1',
                            language: 'en',
                            response_format: 'text'
                        });

                        // Clean up temporary file
                        fs.unlinkSync(tempFilePath);

                        if (transcription && transcription.trim()) {
                            console.log(`✅ Partial transcription: "${transcription.substring(0, 50)}..."`);
                            yield transcription;
                        }
                        
                        // Keep some overlap for context
                        const overlapSize = Math.min(audioBuffer.length * 0.2, 1024 * 16);
                        audioBuffer = audioBuffer.slice(-overlapSize);
                        
                    } catch (chunkError) {
                        console.warn('⚠️ Error processing audio chunk, continuing...', chunkError);
                        // Continue processing other chunks
                    }
                }
            }
            
            // Process any remaining audio
            if (audioBuffer.length > 0) {
                try {
                    console.log('🎵 Processing final audio chunk...');
                    
                    const tempFilePath = `/tmp/audio_final_${Date.now()}.wav`;
                    fs.writeFileSync(tempFilePath, audioBuffer);
                    
                    const transcription = await this.openai.audio.transcriptions.create({
                        file: fs.createReadStream(tempFilePath),
                        model: 'whisper-1',
                        language: 'en',
                        response_format: 'text'
                    });

                    fs.unlinkSync(tempFilePath);

                    if (transcription && transcription.trim()) {
                        yield transcription;
                    }
                } catch (finalError) {
                    console.warn('⚠️ Error processing final audio chunk:', finalError);
                }
            }
            
            console.log('✅ Streaming speech-to-text conversion completed');
        } catch (error) {
            console.error('❌ Error in streaming speech-to-text:', error);
            if (error instanceof Error) {
                throw new Error(`Streaming speech-to-text failed: ${error.message}`);
            }
            throw new Error('Failed to convert streaming speech to text');
        }
    }

    // Text optimization for better speech synthesis
    private optimizeTextForSpeech(text: string): string {
        return text
            // Fix common pronunciation issues
            .replace(/\bAPI\b/g, 'A P I')
            .replace(/\bUI\b/g, 'U I')
            .replace(/\bURL\b/g, 'U R L')
            .replace(/\bHTTP\b/g, 'H T T P')
            .replace(/\bGPT\b/g, 'G P T')
            .replace(/\bLLM\b/g, 'L L M')
            .replace(/\bAI\b/g, 'A I')
            .replace(/\bML\b/g, 'M L')
            .replace(/\bNLP\b/g, 'N L P')
            .replace(/\bRAG\b/g, 'R A G')
            .replace(/\bCI\/CD\b/g, 'C I C D')
            .replace(/\bJSON\b/g, 'J SON')
            .replace(/\bCSS\b/g, 'C S S')
            .replace(/\bHTML\b/g, 'H T M L')
            .replace(/\bSQL\b/g, 'S Q L')
            .replace(/\bJWT\b/g, 'J W T')
            .replace(/\bREST\b/g, 'REST')
            
            // Handle technical terms and numbers
            .replace(/(\d+)\.(\d+)/g, '$1 point $2') // Version numbers
            .replace(/vs\.?/g, 'versus')
            .replace(/\betc\.?/g, 'etcetera')
            .replace(/\bi\.e\.?/g, 'that is')
            .replace(/\be\.g\.?/g, 'for example')
            
            // Add natural pauses
            .replace(/(\. )/g, '$1... ')
            .replace(/(: )/g, '$1... ')
            .replace(/(; )/g, '$1... ')
            
            // Fix common speech issues
            .replace(/([a-z])([A-Z])/g, '$1 $2') // CamelCase to spaced
            .replace(/_/g, ' underscore ')
            .replace(/-/g, ' dash ')
            .replace(/\*/g, ' star ')
            .replace(/@/g, ' at ')
            .replace(/#/g, ' hash ')
            .replace(/&/g, ' and ')
            
            // Clean up multiple spaces and normalize
            .replace(/\s+/g, ' ')
            .trim();
    }

    async convertTextToSpeech(text: string): Promise<Buffer> {
        try {
            console.log('🔊 Converting text to speech with enhanced parameters...');
            
            // Optimize text for better speech synthesis
            const optimizedText = this.optimizeTextForSpeech(text);
            
            console.log('📝 Text optimization completed');
            
            const response = await this.openai.audio.speech.create({
                model: 'tts-1', // Using tts-1 for lower latency
                voice: 'nova', // Nova voice for technical discussions - clear and professional
                input: optimizedText,
                speed: 1.0, // Optimal speed for comprehension
                response_format: 'mp3' // MP3 for good quality with smaller size
            });

            console.log('✅ Enhanced text-to-speech conversion completed');
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            console.error('❌ Error converting text to speech:', error);
            if (error instanceof Error) {
                throw new Error(`Text-to-speech conversion failed: ${error.message}`);
            }
            throw new Error('Failed to convert text to speech');
        }
    }

    async *synthesizeStreamingSpeech(textChunks: AsyncGenerator<string>, voice: string = 'alloy'): AsyncGenerator<Buffer, void, unknown> {
        try {
            console.log('🔊 Starting streaming TTS synthesis...');
            
            let buffer = '';
            const chunkSize = 100; // Process text in chunks of ~100 characters
            
            for await (const chunk of textChunks) {
                buffer += chunk;
                
                // When we have enough text or reach sentence boundaries, synthesize
                if (buffer.length >= chunkSize || /[.!?]/.test(chunk)) {
                    const textToSynthesize = buffer.trim();
                    if (textToSynthesize) {
                        console.log('🎵 Synthesizing chunk:', textToSynthesize.substring(0, 50) + '...');
                        
                        const response = await this.openai.audio.speech.create({
                            model: 'tts-1',
                            voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
                            input: textToSynthesize,
                            response_format: 'mp3'
                        });

                        const audioBuffer = Buffer.from(await response.arrayBuffer());
                        yield audioBuffer;
                        buffer = '';
                    }
                }
            }
            
            // Process any remaining text
            if (buffer.trim()) {
                console.log('🎵 Synthesizing final chunk:', buffer.substring(0, 50) + '...');
                
                const response = await this.openai.audio.speech.create({
                    model: 'tts-1',
                    voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
                    input: buffer.trim(),
                    response_format: 'mp3'
                });

                const audioBuffer = Buffer.from(await response.arrayBuffer());
                yield audioBuffer;
            }
            
            console.log('✅ Streaming TTS synthesis completed');
        } catch (error) {
            console.error('❌ Error in streaming TTS synthesis:', error);
            if (error instanceof Error) {
                throw new Error(`Streaming TTS synthesis failed: ${error.message}`);
            }
            throw new Error('Failed to synthesize streaming speech');
        }
    }

    // Helper method to validate audio format
    isValidAudioFormat(mimeType: string): boolean {
        const validFormats = [
            'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga',
            'audio/wav', 'audio/webm', 'audio/ogg', 'audio/flac'
        ];
        return validFormats.includes(mimeType);
    }
}