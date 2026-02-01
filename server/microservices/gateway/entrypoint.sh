#!/bin/sh
set -e

export CERTIFICATE_DIR=/etc/nginx/certs

if [ "$ENV" = "development" ]; then
  (
    # genera il certificato se non esiste
    cd "$CERTIFICATE_DIR" && sh ./generate_dev_cert.sh
  )

  export SSL_KEY_PATH=$CERTIFICATE_DIR/$CERTIFICATE_KEY_NAME
  export SSL_CERTIFICATE_PATH=$CERTIFICATE_DIR/$CERTIFICATE_NAME
else
  export SSL_CERTIFICATE_PATH="???"
  export SSL_KEY_PATH="???"
fi

envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo Starting nginx
exec "$@"