# Load the latest nginx image and copy the nginx configuration files to the container
FROM nginx:latest

# Copy the current directory contents into the container at /usr/src/app/nginx
COPY . .

# Copy the index.html file to the default nginx html directory
COPY index.html /usr/share/nginx/html/index.html

# Copy the foto.jpeg file to the default nginx html directory
COPY foto.jpeg /usr/share/nginx/html/foto.jpeg

# This is the default port for nginx
EXPOSE 80