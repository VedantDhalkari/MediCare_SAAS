# Production Dockerfile for MediCare Backend
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Default environment
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
