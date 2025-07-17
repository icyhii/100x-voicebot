import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setChatRoutes } from './routes/chat';
import { setVoiceRoutes } from './routes/voice';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 'Please wait 15 minutes before making more requests.'
    }
});

app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
setChatRoutes(app);
setVoiceRoutes(app);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Kunal Singh Voice Bot Backend API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            chat: '/chat',
            voice: '/voice',
            tts: '/tts',
            status: '/status',
            health: '/health',
            voiceOptions: '/voice/options'
        },
        documentation: 'See README.md for API documentation'
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        availableEndpoints: ['/chat', '/voice', '/tts', '/status', '/health', '/voice/options']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 Kunal Singh Voice Bot Backend is running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation available at http://localhost:${PORT}`);
    console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
});

export default app;