#!/bin/sh
set -e

CERTIFICATE_DIR=/etc/nginx/certs

if [ "$ENV" = "development" ]; then
  export SSL_CERTIFICATE_PATH=$CERTIFICATE_DIR/development.crt
  export SSL_KEY_PATH=$CERTIFICATE_DIR/development.key

  if [ ! -f $SSL_CERTIFICATE_PATH ]; then
  echo "Generating self-signed development certificate..."
  mkdir -p "$CERTIFICATE_DIR"
  openssl req -x509 -newkey rsa:2048 \
    -keyout $SSL_KEY_PATH \
    -out $SSL_CERTIFICATE_PATH \
    -days 1 \
    -nodes \
    -subj "/CN=localhost"
fi
else
  export SSL_CERTIFICATE_PATH="???"
  export SSL_KEY_PATH="???"
fi

envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"