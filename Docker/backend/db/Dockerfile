# Load the latest PostgreSQL image from the Docker Hub
FROM postgres:latest

# Set the working directory to /usr/src/app/database
WORKDIR /usr/src/app/backend/db

# Copy the current directory contents into the container at /usr/src/app/database
COPY . .

# This is the default port for PostgreSQL
EXPOSE 5432