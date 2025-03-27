FROM nginx:1.25

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key\
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/CN=localhost"

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

WORKDIR /var/www/html

COPY . .

CMD ["nginx", "-g", "daemon off;"]