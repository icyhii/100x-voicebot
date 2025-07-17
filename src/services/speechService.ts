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
            console.log('🎤 Converting speech to text using Whisper API...');
            
            // Create a temporary file for the audio buffer
            const tempFilePath = `/tmp/audio_${Date.now()}.wav`;
            fs.writeFileSync(tempFilePath, audioBuffer);
            
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: 'whisper-1',
                language: 'en',
                response_format: 'text'
            });

            // Clean up temporary file
            fs.unlinkSync(tempFilePath);

            console.log('✅ Speech-to-text conversion completed');
            return transcription;
        } catch (error) {
            console.error('❌ Error converting speech to text:', error);
            if (error instanceof Error) {
                throw new Error(`Speech-to-text conversion failed: ${error.message}`);
            }
            throw new Error('Failed to convert speech to text');
        }
    }

    async synthesizeSpeech(text: string, voice: string = 'alloy'): Promise<Buffer> {
        try {
            console.log('🔊 Synthesizing speech using TTS API...');
            
            const response = await this.openai.audio.speech.create({
                model: 'tts-1',
                voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
                input: text,
                response_format: 'mp3'
            });

            console.log('✅ Text-to-speech synthesis completed');
            
            // Convert the response to a Buffer
            const buffer = Buffer.from(await response.arrayBuffer());
            return buffer;
        } catch (error) {
            console.error('❌ Error synthesizing speech:', error);
            if (error instanceof Error) {
                throw new Error(`Text-to-speech synthesis failed: ${error.message}`);
            }
            throw new Error('Failed to synthesize speech');
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