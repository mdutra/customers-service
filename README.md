# Customers Service

## Execução para avaliação do projeto

Para auxíliar na avaliação desse projeto, siga as instruções para executar o servidor, os testes, ou qualquer outro comando com `node` e `npm`. Só precisará do `docker`.

### Dependências:

- Docker
- `client_secret` do SSO (disponível no PDF da avaliação, pág 15)
- Porta 3000 disponível

### Execução dos containers

```bash
# Baixe a imagem Redis
$ docker pull redis

# Entre no diretório raíz deste repositório
$ cd customers-service-murilo

# Copie as variáveis de ambiente (faltará apenas o SSO_CLIENT_SECRET).
$ cp .env-template .env
```

Edite o arquivo `.env` e preencha o `SSO_CLIENT_SECRET` que está disponível no PDF dessa avaliação

Ainda no diretório raíz, inicie os containers (Redis e API):

```bash
# Crie a imagem da API
$ docker build -t dev-image-1686647001746 -f Dockerfile.dev .

# Inicie o container Redis
$ docker run -d --name redis-1686647001746 redis

# Execute o container da API com um prompt para navegação
$ docker run -it --rm --link redis-1686647001746 -v $(pwd):/app -w /app --name dev-api-1686647001746 dev-image-1686647001746 sh
```

Dentro do container, execute comandos `npm` como, por exemplo, os testes:

```bash
# Testes unitários
$ npm run test

# Testes end-to-end
$ npm run test:e2e

# Cobertura de testes unitários
$ npm run test:cov

# Inicia o servidor
$ npm run start
```

A API ficará disponível no endereço `http://localhost:3000` e os endpoints foram implementados conforme os requisitos da avaliação.

## Execução da versão de produção

```bash
# Baixe a imagem Redis
$ docker pull redis

# Entre no diretório raíz deste repositório
$ cd customers-service-murilo

# Copie as variáveis de ambiente (faltará apenas o SSO_CLIENT_SECRET).
$ cp .env-template .env
```

Edite o arquivo `.env` e preencha o `SSO_CLIENT_SECRET` que está disponível no PDF dessa avaliação

```bash
# Crie a imagem da API
$ docker build -t image-1686658208705 .

# Inicie o container Redis
$ docker run -d --name redis-1686658208705 redis

# Execute o container da API e inicie o servidor
$ docker run -it --rm -p 3000:3000 --link redis-1686647001746 --name api-1686658208705 image-1686658208705
```

A API estará disponível em `http://localhost:3000`.
