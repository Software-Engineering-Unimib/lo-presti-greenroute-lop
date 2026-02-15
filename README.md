# GreenRoute LOP - Setup Ambiente di Sviluppo

## Tecnologie necessarie
Per eseguire l'applicazione è necessario avere installato:

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/)
- OpenSSL
- Emulatore di Android Studio (oppure un telefono Android)

## Impostazione dell'ambiente di sviluppo

1. Clonare la repository e spostarsi nella cartella del progetto:

```bash
git clone https://github.com/Software-Engineering-Unimib/lo-presti-greenroute-lop.git
cd lo-presti-greenroute-lop
```



Per utilizzare tutte le funzionalità dell'applicazione, il client deve poter comunicare con il server.

**Se si utilizza l'emulatore di Android Studio sullo stesso PC in cui viene eseguito il server, i contenuti di .env.development saranno già corretti.**

Altrimenti, sostituire API_URL=10.0.2.2 con l'IP del server (ad esempio quello restituito dal comando hostname -I sul vostro pc). Sostituire API_PORT=443 con una porta a piacimento e assicurarsi che sia aperta sulla macchina che esegue il server.

Una volta configurato il file .env.development, eseguire i seguenti comandi:

```bash
source .env.development
cp .env.development client/react_native/.env
cp .env.development server/.env

(cd server/$CERTIFICATE_DIR && source ./generate_dev_cert.sh)

mkdir -p client/react_native/android/app/src/debug/res/raw/
openssl x509 -outform der -in server/$CERTIFICATE_DIR/$CERTIFICATE_NAME -out client/react_native/android/app/src/debug/res/raw/certificate.crt

(cd client/react_native/ && npm install)
(cd server/microservices/typescript_services && npm install)
```

Dopo avere impostato l'ambiente, il server può essere eseguito con i l seguente comando:

```bash
(cd server/ && bash build_and_run.sh)
```

Per fare build del client, eseguire:

```bash
(cd client/react_native/android/ && ./gradlew assembleDebug)
```
L'apk si troverà in **client/react_native/app/build/outputs/apk/release/app-release.apk**

ATTENZIONE: La comunicazione avviene tramite HTTPS con un certificato SSL autofirmato, al quale Android applica restrizioni di sicurezza intenzionali. Se la build del client utilizza un certificato diverso da quello usato dal server, la connessione tra client e server non potrà essere stabilita.

## Impostazione dell'ambiente di sviluppo

I test del client sono eseguiti nel seguente modo:
```bash
(cd client/react_native && npm run test -- --coverage)
```

Per il server il comando è invece:
```bash
(cd server/microservices/typescript_services && npm run test -- --coverage)
```