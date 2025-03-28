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
UID=u-s4t2ud-d44e7f9b830ed325664bf76e8891da7a84775f2f90bed03070b9d3666a0742dc
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