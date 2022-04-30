# TUGAGRAM

## Conectar ao computador da FCUL

> ssh psi014@appserver.alunos.di.fc.ul.pt

pass: habibi2021

## Ligar ao mongo no computador da FCUL

> mongo --username psi014 --password --authenticationDatabase psi014 appserver.alunos.di.fc.ul.pt/psi014

## Antes de transferir para o computador da FCUL

Executar o script [clean.sh](./clean.sh) para limpar os node_modules.

## Transferir um ficheiro por ssh

> scp _FICHEIRO_A_TRANSFERIR_ psi014@appserver.alunos.di.fc.ul.pt:/home/psi014/_FICHEIRO_A_RECEBER_

## Transferir pasta por ssh

> scp -r _PASTA_A_TRANSFERIR_ psi014@appserver.alunos.di.fc.ul.pt:/home/psi014/_PASTA_A_RECEBER_

## Primeira execução no computador da FCUL

Alterar as definições do servidor.

Backend: [settings.js](backend/settings.js)
e frontend: [shared.service.ts](frontend/src/app/_services/shared.service.ts)

Além disso, fazer os seguintes comandos na pasta [backend](/backend) e [frontend](/frontend):

> npm install 

> npm install pm2

## Executar no [frontend](/frontend)

> ng serve --port 3014 --host 0.0.0.0 --disableHostCheck true

ou

> npm run start

## Executar no [backend](/backend)

Com nodemon:
> npm run nodemon-serverstart

> npm run serverstart

## PM2

Em cada respectiva pasta do [backend](/backend) e [frontend](/frontend):

> ./node_modules/.bin/pm2 start start.sh --name frontend --watch

> ./node_modules/.bin/pm2 start start.sh --name backend --watch

Guardar processsos:

> ./node_modules/.bin/pm2 save

Parar processo:

> ./node_modules/.bin/pm2 stop _PROCESS-NAME_

Remover processo:

> ./node_modules/.bin/pm2 delete _PROCESS-NAME_

## Endereços

Frontend:

http://appserver.alunos.di.fc.ul.pt:3014/

Backend:

http://appserver.alunos.di.fc.ul.pt:3064/
