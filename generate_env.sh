#!/bin/bash

# Prompt the user for the SendGrid API key if not set
if [ -z "$SENDGRID_API_KEY" ]; then
  read -sp 'Enter your SendGrid API Key: ' SENDGRID_API_KEY
  echo
fi

# Define o conteúdo do arquivo .env
env_content="
POSTGRES_DB=postgres
POSTGRES_USER=admin
POSTGRES_PASSWORD=123456
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
PGADMIN_EMAIL=admin@42porto.com
PGADMIN_PASSWORD=admin
UID=u-s4t2ud-d44e7f9b830ed325664bf76e8891da7a84775f2f90bed03070b9d3666a0742dc
SECRET=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
URI=https://localhost/home
SENDGRID_API_KEY=$SENDGRID_API_KEY
DEFAULT_EMAIL_SENDER=davimeirelespn@gmail"

# Cria o arquivo .env e escreve o conteúdo nele
echo "$env_content" > .env

echo ".env file created successfully."