export interface ChatRequest {
    userId: string;
    message: string;
}

export interface ChatResponse {
    response: string;
}

export interface VoiceRequest {
    userId: string;
    audioData: Buffer;
}

export interface VoiceResponse {
    text: string;
}