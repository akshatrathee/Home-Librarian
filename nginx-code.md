```nginx
server {
    listen 9090;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_min_length 1000;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;

    # Single Page Application Routing
    # This ensures that deep links (e.g. /library) are handled by React Router via index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Asset Caching
    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Optional: Proxy for local API if extended in future
    # location /api {
    #     proxy_pass http://localhost:3000;
    # }
}
```