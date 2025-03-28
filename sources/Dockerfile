FROM python:3.11.4-slim-buster

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN mkdir frontend

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/local/bin/daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
