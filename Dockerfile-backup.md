```dockerfile
# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json ./
# If you have a lock file, copy it too
# COPY package-lock.json ./ 

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production (Vite)
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

# Entrypoint script to inject runtime environment variables
# This allows passing API_KEY via docker-compose without rebuilding
COPY --from=build /app/index.html /usr/share/nginx/html/index.html.template

# Create entrypoint script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "window.env = {" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh && \
    echo 'echo "  API_KEY: \"$API_KEY\"" >> /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh && \
    echo 'echo "};" >> /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
```