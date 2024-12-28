#!/bin/bash

# Define o conteúdo do arquivo .env
env_content="
POSTGRES_DB=postgres
POSTGRES_USER=admin
POSTGRES_PASSWORD=123456
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
PGADMIN_EMAIL=admin@42porto.com
PGADMIN_PASSWORD=admin
"

# Cria o arquivo .env e escreve o conteúdo nele
echo "$env_content" > .env

echo ".env file created successfully."