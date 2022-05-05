# TUGAGRAM

## Conectar ao computador da FCUL

> ssh psi030@appserver.alunos.di.fc.ul.pt

pass: sei-la-qual-a-pass

## Ligar ao mongo no computador da FCUL

> mongo --username psi030 --password --authenticationDatabase psi030 appserver.alunos.di.fc.ul.pt/psi030

pass: psi030

## Antes de transferir para o computador da FCUL

Executar o script [clean.sh](./clean.sh) para limpar os node_modules.

## Transferir um ficheiro por ssh (mais rápido se for tudo zipado)

> scp _FICHEIRO_A_TRANSFERIR_ psi030@appserver.alunos.di.fc.ul.pt:/home/psi030/_FICHEIRO_A_RECEBER_

## Transferir pasta por ssh

> scp -r _PASTA_A_TRANSFERIR_ psi030@appserver.alunos.di.fc.ul.pt:/home/psi030/_PASTA_A_RECEBER_

## Primeira execução no computador da FCUL

Além disso, fazer o seguinte comandos na pasta [backend](/backend) e [frontend](/frontend):

> npm install 

## Executar no [frontend](/frontend)

> npm run start-prod &
> disown

ou

> nohup npm run start-prod &

## Executar no [backend](/backend)

> npm run start-prod &
> disown

ou

> nohup npm run start-prod &

## Como terminar estes processos:

Usar o seguinte comando para listar os processos que iniciaram

> ps ux

Na lista que é apresentada, tomar nota do PID dos processos que querem terminar.
Para cada processo, dar o seguinte comando

> kill -9 PID

## Endereços

Frontend:

http://appserver.alunos.di.fc.ul.pt:3030/

Backend:

http://appserver.alunos.di.fc.ul.pt:3080/
