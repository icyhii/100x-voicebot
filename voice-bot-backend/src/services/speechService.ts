import axios from 'axios';

export class SpeechService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
    }

    async convertSpeechToText(audioBuffer: Buffer): Promise<string> {
        try {
            const formData = new FormData();
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', 'whisper-1');

            const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.text;
        } catch (error) {
            console.error('Error converting speech to text:', error);
            throw new Error('Failed to convert speech to text');
        }
    }

    async synthesizeSpeech(text: string, voice: string = 'alloy'): Promise<Buffer> {
        try {
            const response = await axios.post('https://api.openai.com/v1/audio/speech', {
                model: 'tts-1',
                input: text,
                voice: voice, // alloy, echo, fable, onyx, nova, shimmer
                response_format: 'mp3'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer'
            });

            return Buffer.from(response.data);
        } catch (error) {
            console.error('Error synthesizing speech:', error);
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