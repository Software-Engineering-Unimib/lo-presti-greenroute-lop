if [ ! -f $CERTIFICATE_KEY_NAME ]; then
    echo "SSL private key not found, generating one"

    #crea la chiave privata
    openssl genrsa -out $CERTIFICATE_KEY_NAME 4096
    #rimuove eventuali certificati vecchi
    rm -f $CERTIFICATE_NAME
fi

if [ ! -f $CERTIFICATE_NAME ]; then
    echo "SSL certificate not found, generating a self-signed development certificate"

    #crea il certificato
    openssl req -x509 -new -nodes \
        -key $CERTIFICATE_KEY_NAME \
        -sha256 \
        -days 3650 \
        -out $CERTIFICATE_NAME \
        -subj "/C=IT/ST=Lombardia/L=Milano/O=Unimib/OU=Development/CN=Development CA/emailAddress=f.lopresti5@campus.unimib.it" \
        -addext "subjectAltName = IP:10.0.2.2"
fi

