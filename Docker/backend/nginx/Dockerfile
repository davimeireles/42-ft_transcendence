# Load the latest nginx image
FROM nginx:latest

# Set the working directory to /usr/src/app/backend/nginx
WORKDIR /usr/src/app/backend/nginx

# Copy the index.html file to the default nginx html directory
COPY index.html /usr/share/nginx/html/index.html

# Copy the foto.jpeg file to the default nginx html directory
COPY foto.jpeg /usr/share/nginx/html/foto.jpeg

# Copy the nginx configuration file to the default location
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the default configuration file to the default location
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy the nginx configuration file to the default location
COPY nginx.conf /etc/nginx/sites-available/default

# Install openssl
RUN apt update && apt install openssl -y

# Create a directory to store the certificates
RUN mkdir -p /etc/nginx/certs

# Generate a self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/nginx.key -out /etc/nginx/certs/nginx.crt -subj "/C=PT/ST=Porto/L=Porto/O=42-Porto/OU=Porto/CN=transcendence.pt"

# This is the default port for nginx
EXPOSE 80
EXPOSE 443