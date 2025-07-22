import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();
const chatController = new ChatController();

export function setChatRoutes(app: Router) {
    // Main chat endpoint
    app.post('/chat', chatController.handleChat.bind(chatController));
    
    // Streaming chat endpoint
    app.post('/chat/stream', chatController.handleStreamingChat.bind(chatController));
    
    // Status endpoint to check if the bot is online
    app.get('/status', chatController.getStatus.bind(chatController));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            service: 'Kunal Singh Voice Bot Backend'
        });
    });
}