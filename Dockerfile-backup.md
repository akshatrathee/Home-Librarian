```dockerfile
# Stage 1: Build the React Application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files for better caching
COPY package.json ./
# COPY package-lock.json ./ 

# Install dependencies (using npm ci is often safer for builds if lockfile exists, but install works)
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the configured port
EXPOSE 9090

# Runtime configuration script
# Generates env-config.js from environment variables at container startup
# This allows the same Docker image to be used with different API keys
COPY --from=build /app/index.html /usr/share/nginx/html/index.html.template

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "window.env = {" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh && \
    echo 'if [ -n "$API_KEY" ]; then echo "  API_KEY: \"$API_KEY\"," >> /usr/share/nginx/html/env-config.js; fi' >> /docker-entrypoint.sh && \
    echo 'if [ -n "$OLLAMA_HOST" ]; then echo "  OLLAMA_HOST: \"$OLLAMA_HOST\"," >> /usr/share/nginx/html/env-config.js; fi' >> /docker-entrypoint.sh && \
    echo 'echo "};" >> /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
```