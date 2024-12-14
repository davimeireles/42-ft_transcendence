# Load the latest Python image from the Docker Hub
FROM python:3

# Copy the current directory contents into the container at /usr/src/app/backend
COPY . .

# Install any needed packages specified in requirements.txt

RUN apt update -y && \
    apt upgrade -y && \
    apt install -y python3 python3-pip && \
    pip3 install --no-cache-dir -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000

ENTRYPOINT ["python3", "manage.py", "runserver"]