## Description

A toy project to explore:

- JWT vs. Session
- Kafka
- Change Data Capture (CDC) architecture
- Distributed Lock with Redis 

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run docker for DB

Create Postgres container and run

```
docker run --name postgres -p 5432:5432/tcp -e POSTGRES_PASSWORD=aleum -d postgres
```

Check the conteiner is running

```
docker ps
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


