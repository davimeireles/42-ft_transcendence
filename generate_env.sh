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
DJANGO_KEY=TRANSCENDENCEDOSNERDOLA
UID=u-s4t2ud-4bd94b4a81d4e27fb7272456f449be214f8a8f60d877c064006fbdc887e10425
SECRET=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
URI=https://localhost/home
GF_PATHS_PROVISIONING=/etc/grafana/provisioning
GF_DASHBOARDS_DEFAULT_HOME=/etc/grafana/dashboards
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=42Porto!
UID=1000
GID=1000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER= portotranscendence@gmail.com
EMAIL_HOST_PASSWORD= 3X1l4f0O_=NT
GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/dashboards.json"

# Cria o arquivo .env e escreve o conteúdo nele
echo "$env_content" > .env

echo ".env file created successfully."