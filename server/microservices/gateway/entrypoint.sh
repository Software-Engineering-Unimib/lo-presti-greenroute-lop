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

# ATTENZIONE: specificare sempre quali variabili vanno sostituite
# anche nginx use $... per identificare variabili e envsubst le sostituirà indiscriminatamente con stringhe vuote
envsubst '${API_PORT} ${SSL_CERTIFICATE_PATH} ${SSL_KEY_PATH}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo Starting nginx
exec "$@"