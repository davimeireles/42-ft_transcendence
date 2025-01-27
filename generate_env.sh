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
UID=u-s4t2ud-74d8db07ab23dbb9f83dacd063f1e8b2fb38bd85da84522873b98d6342dd18ec
SECRET=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
URI=http://127.0.0.1:8000/new/
SENDGRID_API_KEY=\$SENDGRID_API_KEY
DEFAULT_EMAIL_SENDER=davimeirelespn@gmail.com
"

# Cria o arquivo .env e escreve o conteúdo nele
echo "$env_content" > .env

echo ".env file created successfully."