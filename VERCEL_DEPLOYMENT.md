# 🚀 Vercel Deployment Guide

This guide will help you deploy your Kunal Singh Voice Bot Backend to Vercel.

## 📋 Pre-deployment Checklist

- ✅ Vercel account created
- ✅ GitHub repository ready
- ✅ OpenAI API key with sufficient quota
- ✅ Domain name (optional)

## 🔧 Quick Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `100x-voicebot`

2. **Configure Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### 3. Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add NODE_ENV
vercel env add CORS_ORIGIN

# Deploy production version
vercel --prod
```

## 📁 Project Structure for Vercel

```
100x-voicebot/
├── api/
│   └── index.ts          # Vercel serverless entry point
├── src/
│   ├── app.ts           # Express app (modified for serverless)
│   ├── controllers/     # API controllers
│   ├── services/        # OpenAI services
│   └── routes/          # API routes
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🌐 API Endpoints (After Deployment)

Replace `your-app-name.vercel.app` with your actual Vercel domain:

- **Chat**: `POST https://your-app-name.vercel.app/chat`
- **Voice**: `POST https://your-app-name.vercel.app/voice`
- **TTS**: `POST https://your-app-name.vercel.app/tts`
- **Status**: `GET https://your-app-name.vercel.app/status`
- **Health**: `GET https://your-app-name.vercel.app/health`
- **Voice Options**: `GET https://your-app-name.vercel.app/voice/options`

## 🔑 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-xxx...` |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGIN` | Allowed origins | `https://yourfrontend.vercel.app` |

## 🛠️ Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### api/index.ts
```typescript
// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app';

export default app;
```

## 🧪 Testing Deployment

After deployment, test your endpoints:

```bash
# Test health endpoint
curl https://your-app-name.vercel.app/health

# Test chat endpoint
curl -X POST https://your-app-name.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"action": "getFirstMessage"}'

# Test voice options
curl https://your-app-name.vercel.app/voice/options
```

## 🚨 Common Issues & Solutions

### 1. **Function Timeout**
- **Issue**: Functions timing out after 10s
- **Solution**: Upgrade to Pro plan for 60s timeout, or optimize API calls

### 2. **Cold Start Delays**
- **Issue**: First request takes longer
- **Solution**: Implement keep-alive pings or upgrade to Pro

### 3. **Environment Variables Not Loading**
- **Issue**: OpenAI API key not found
- **Solution**: Double-check environment variables in Vercel dashboard

### 4. **CORS Issues**
- **Issue**: Frontend can't access API
- **Solution**: Update `CORS_ORIGIN` environment variable

### 5. **Large Audio Files**
- **Issue**: Audio upload fails
- **Solution**: Vercel has 4.5MB limit for hobby plan

## 📊 Performance Optimization

1. **Enable Edge Functions** (Pro plan)
2. **Use Vercel Analytics** for monitoring
3. **Implement caching** for repeated requests
4. **Optimize OpenAI API calls** (streaming, shorter prompts)

## 🔒 Security Best Practices

- Never commit API keys to repository
- Use environment variables for all secrets
- Enable CORS only for your frontend domains
- Monitor API usage in OpenAI dashboard
- Set up rate limiting in Vercel

## 📈 Monitoring & Logging

- **Vercel Dashboard**: View function logs and metrics
- **OpenAI Dashboard**: Monitor API usage and costs
- **Custom Logging**: Add console.log statements for debugging

## 🎯 Next Steps After Deployment

1. **Custom Domain**: Add your own domain in Vercel dashboard
2. **Frontend Integration**: Update frontend to use Vercel API URL
3. **Monitoring**: Set up alerts for errors and performance
4. **Scaling**: Monitor usage and upgrade plan if needed

## 💡 Tips for Success

- Test locally before deploying: `npm run dev`
- Use Vercel preview deployments for testing changes
- Keep functions under timeout limits (10s hobby, 60s pro)
- Monitor OpenAI API quota and billing
- Use Vercel's built-in analytics for insights

---

🎉 **Your Kunal Singh Voice Bot is now ready for production on Vercel!**

For support, check:
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Project README](./README.md)
