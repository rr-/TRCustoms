# TR Customs

A website dedicated to custom levels for classic Tomb Raider games.

## Technology stack

- Docker
- Python3.10
- Django
- Django Rest Framework
- PostgreSQL
- React
- React Hooks

## Working with the project

This project uses Docker. Before continuing, please make sure you have Docker
installed on your machine and its daemon is up and running.

#### Running the development environment

Run the following commands:

```
cp .env.example .env
docker-compose build
docker-compose up
```

Create a super user:

```
docker-compose run --rm trcustoms manage createsuperuser
```

To go to the website, visit `http://localhost:8000/`.
To log in to Django admin, visit `http://localhost:8000/admin/`.

#### Running tests

```
docker-compose run --rm trcustoms tests
```

#### Running Bash shell

```
docker-compose run --rm trcustoms shell
```

#### Running Django shell

```
docker-compose run --rm trcustoms manage shell
```

#### Running the production environment

```
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up
```

After that, a reverse proxy to localhost:8000 needs to be created in the target
environment. HTTPS certificates need to be handled manually. Currently we are
not using any horizontal scaling.

## Development guidelines

This project also uses [pre-commit](https://pre-commit.com/). Before making
your first pull request, make sure you have it installed on your machine and in
the project repository by running the following commands:

```
python3 -m pip install pre-commit
pre-commit install
```
