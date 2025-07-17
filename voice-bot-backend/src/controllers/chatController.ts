import { Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';

export class ChatController {
    private openAIService: OpenAIService;

    constructor() {
        this.openAIService = new OpenAIService();
    }

    public async handleChat(req: Request, res: Response): Promise<void> {
        try {
            const { input, isFirstMessage = false, action } = req.body;

            // Handle different actions
            if (action === 'getFirstMessage') {
                const firstMessage = this.openAIService.getFirstMessage();
                res.status(200).json({ response: firstMessage, isFirstMessage: true });
                return;
            }

            if (action === 'clearConversation') {
                this.openAIService.clearConversation();
                res.status(200).json({ message: 'Conversation cleared' });
                return;
            }

            // Validate input
            if (!input || typeof input !== 'string') {
                res.status(400).json({ error: 'Input is required and must be a string.' });
                return;
            }

            const response = await this.openAIService.fetchResponse(input, isFirstMessage);
            res.status(200).json({ 
                response,
                timestamp: new Date().toISOString(),
                conversationActive: true
            });
        } catch (error) {
            console.error('Chat controller error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ 
                error: 'An error occurred while processing your request.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    public async getStatus(req: Request, res: Response): Promise<void> {
        try {
            res.status(200).json({
                status: 'online',
                persona: 'Kunal Singh',
                capabilities: ['text-chat', 'conversation-memory', 'personalized-responses'],
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: 'Unable to get status' });
        }
    }
}