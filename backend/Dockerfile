FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create data directory for SQLite persistence (Cloud Run Volume Mount)
RUN mkdir -p /data

# Expose port (Cloud Run injects PORT env var)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
