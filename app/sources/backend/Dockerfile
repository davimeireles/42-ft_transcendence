# Getting image from Docker Hub
FROM python:3.14-rc-bookworm

# Setting the working directory
WORKDIR /app

# Copying the requirements file
COPY requirements.txt .

# Installing the requirements
RUN pip install -r requirements.txt

# Copying the source code
COPY . .