# Load the latest nginx image
FROM nginx:1.27.3-bookworm

# Install mkcert and dependencies
RUN apt-get update && apt-get install -y libnss3-tools curl && \
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" && \
    chmod +x mkcert-v*-linux-amd64 && \
    mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert && \
    mkcert -install

# Create a directory to store the certificates and generate the certificate
RUN mkdir -p /etc/nginx/certs && \
    mkcert -cert-file /etc/nginx/certs/nginx.crt -key-file /etc/nginx/certs/nginx.key localhost

# Copy the nginx configuration file to the default location
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the default configuration file to the default location
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy the nginx configuration file to the default location
COPY nginx.conf /etc/nginx/sites-available/default

# This is the default port for nginx
EXPOSE 80
EXPOSE 443