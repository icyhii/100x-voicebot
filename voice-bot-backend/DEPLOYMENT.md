# Deployment Guide

Guide for deploying the Kunal Singh Voice Bot Backend to various platforms.

## Quick Deploy Options

### 1. Railway (Recommended)

Railway offers simple deployment with automatic HTTPS and environment variable management.

1. **Create Railway Account**: Visit [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   ```bash
   # Connect your GitHub repo to Railway
   # Railway will auto-detect the Node.js project
   ```

3. **Set Environment Variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Custom Start Command** (if needed):
   ```
   npm start
   ```

### 2. Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/app.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/app.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

### 3. Render

1. **Create `render.yaml`**:
   ```yaml
   services:
     - type: web
       name: kunal-voice-bot
       env: node
       buildCommand: npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: OPENAI_API_KEY
           sync: false
   ```

2. **Connect GitHub repo** to Render dashboard

### 4. Heroku

1. **Create `Procfile`**:
   ```
   web: npm start
   ```

2. **Deploy**:
   ```bash
   heroku create kunal-voice-bot
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

### 5. Docker Deployment

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --only=production

   # Copy built application
   COPY dist ./dist

   # Create non-root user
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001

   USER nextjs

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   # Build the project first
   npm run build

   # Build Docker image
   docker build -t kunal-voice-bot .

   # Run container
   docker run -p 3000:3000 \
     -e OPENAI_API_KEY=your_key \
     -e NODE_ENV=production \
     kunal-voice-bot
   ```

### 6. DigitalOcean App Platform

1. **Create `app.yaml`**:
   ```yaml
   name: kunal-voice-bot
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/your-repo
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: "production"
     - key: OPENAI_API_KEY
       value: "your_openai_api_key"
       type: SECRET
     http_port: 3000
   ```

## Production Configuration

### Environment Variables

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Set to "production"

**Optional:**
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed origins (comma-separated)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)

### Example Production `.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-key
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## Performance Optimization

### 1. Enable Compression
The app includes helmet middleware for security headers. For additional compression:

```javascript
// Add to app.ts if needed
import compression from 'compression';
app.use(compression());
```

### 2. PM2 for Process Management
```bash
npm install pm2 -g

# Create ecosystem.config.js
module.exports = {
  apps: [{
    name: 'kunal-voice-bot',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# Start with PM2
pm2 start ecosystem.config.js
```

### 3. Load Balancing
For high traffic, consider placing behind a load balancer like nginx:

```nginx
upstream voice_bot {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://voice_bot;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Health Monitoring

The API includes health check endpoints:

- `GET /health` - Basic health check
- `GET /status` - Detailed bot status

Set up monitoring with these endpoints:

```bash
# Simple health check script
curl -f http://your-domain.com/health || exit 1
```

## Security Considerations

1. **API Key Security**: Store OpenAI API key securely, never in code
2. **Rate Limiting**: Adjust rate limits based on expected traffic
3. **CORS**: Set specific origins, not wildcards in production
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: The API includes input validation, monitor logs for suspicious activity

## Cost Management

Monitor OpenAI API usage:
- GPT-4 calls cost more than GPT-3.5-turbo
- Whisper transcription costs per minute
- TTS synthesis costs per character
- Consider implementing usage tracking and limits

## Troubleshooting

**Common deployment issues:**

1. **Build failures**: Ensure all dependencies are in package.json
2. **Port binding**: Some platforms require binding to process.env.PORT
3. **Memory limits**: Voice processing can be memory-intensive
4. **Cold starts**: First request after idle may be slow
5. **File upload limits**: Check platform limits for audio file uploads

**Logs to monitor:**
- OpenAI API errors
- Rate limit hits
- Memory usage spikes
- File upload failures

## Post-Deployment Testing

Test all endpoints after deployment:

```bash
# Replace with your deployed URL
export API_URL="https://your-deployed-api.com"

# Test health
curl $API_URL/health

# Test chat
curl -X POST $API_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello, what is your superpower?"}'

# Test TTS
curl -X POST $API_URL/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message", "voice": "alloy"}' \
  --output test.mp3
```
