export DOCKER_BUILDKIT := "1"

build *args:
    docker-compose build {{args}}

stop:
    docker-compose stop

restart-backend:
    docker-compose kill trcustoms
    docker-compose up -d trcustoms

restart-nginx:
    docker-compose kill trcustoms-nginx
    docker-compose up -d trcustoms-nginx

restart-frontend:
    docker-compose kill trcustoms-frontend
    docker-compose up -d trcustoms-frontend

kill:
    docker-compose kill

up *args:
    docker-compose up --remove-orphans {{args}}

dev *args: (up args)

down *args:
    docker-compose down --remove-orphans {{args}}

lint-frontend *args:
    #!/bin/sh
    set -xeuo pipefail
    docker-compose run --rm trcustoms-frontend lint
    docker-compose run --rm trcustoms-frontend tsc

test-frontend *args:
    docker-compose run --rm trcustoms-frontend test {{args}}

generate-api:
    #!/bin/sh
    set -xeuo pipefail
    docker-compose run --rm -T -v ./frontend/openapi:/out trcustoms manage spectacular --file /out/schema.yaml
    cd frontend && npm run generate-client

test *args:
    docker-compose run --rm trcustoms test -n auto {{args}}
qtest *args:
    docker-compose run --rm trcustoms test -n 0 --no-cov {{args}}

bash:
    docker-compose run --rm trcustoms shell
bash-prod:
    ssh -t tomb sudo -iu svc-trcustoms
bash-staging:
    ssh -t tomb sudo -iu svc-trcustoms-staging

shell:
    docker-compose run --rm trcustoms manage shell
shell-prod:
    just manage-prod shell
shell-staging:
    just manage-staging shell
manage-prod *args:
    ssh -t tomb sudo -iu svc-trcustoms sh -c "'cd app && exec dotenv-rust .venv/bin/python backend/manage.py {{args}}'"
manage-staging *args:
    ssh -t tomb sudo -iu svc-trcustoms-staging sh -c "'cd app && exec dotenv-rust .venv/bin/python backend/manage.py {{args}}'"

snippet:
    docker-compose run -T --rm trcustoms manage shell
snippet-prod:
    ssh tomb sudo -iu svc-trcustoms sh -c "'cd app && exec dotenv-rust .venv/bin/python backend/manage.py shell'"
snippet-staging:
    ssh tomb sudo -iu svc-trcustoms-staging sh -c "'cd app && exec dotenv-rust .venv/bin/python backend/manage.py shell'"

manage *args:
    docker-compose run --rm trcustoms manage {{args}}

makemigrations *args:
    docker-compose run --rm trcustoms manage makemigrations {{args}}
    just chown

migrate *args:
    docker-compose run --rm trcustoms manage migrate {{args}}

createsuperuser:
    docker-compose run --rm trcustoms manage createsuperuser

chown:
    sh -c 'shopt -s globstar; sudo chown $(whoami):$(whoami) -R backend/**/migrations'

dump-prod-to-local-file:
    ssh tomb sudo -u svc-trcustoms pg_dump -Fc -h /var/run/postgresql -U trcustoms trcustoms > trcustoms-prod.dmp

[confirm]
load-db-from-prod-dump:
    #!/bin/sh
    docker-compose run -v .:/tmp/ -T --rm trcustoms-db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -h trcustoms-db -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean -Fc' < trcustoms-prod.dmp

[confirm]
download-files-from-prod:
    aws --profile trcustoms-prod s3 sync s3://trcustoms/media/level_images backend/volumes/uploads/level_images
    aws --profile trcustoms-prod s3 sync s3://trcustoms/media/avatars backend/volumes/uploads/avatars

_snippet-csu:
    #!/bin/sh
    echo '''
    from django.contrib.auth import get_user_model
    user, _created = get_user_model().objects.update_or_create(
        username="super@example.com",
        defaults=dict(
            is_superuser=True,
            is_staff=True,
            is_active=True,
        ),
    )
    user.set_password("super")
    user.save()
    '''

csu:
    just _snippet-csu | just snippet

csu-staging:
    just _snippet-csu | just snippet-staging
