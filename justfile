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
    docker-compose up {{args}}

down *args:
    docker-compose down {{args}}

test *args:
    docker-compose run --rm trcustoms test -n auto {{args}}

bash:
    docker-compose run --rm trcustoms shell
bash-prod:
    ssh -t trcustoms 'cd ~/srv/website; docker-compose -f docker-compose.prod.yml run --rm trcustoms shell'
bash-staging:
    ssh -t trcustoms 'cd ~/srv/website-staging; docker-compose -f docker-compose.yml run --rm trcustoms shell'

shell:
    docker-compose run --rm trcustoms manage shell
shell-prod:
    ssh -t trcustoms 'cd ~/srv/website; docker-compose -f docker-compose.prod.yml run --rm trcustoms manage shell'
shell-staging:
    ssh -t trcustoms 'cd ~/srv/website-staging; docker-compose -f docker-compose.yml run --rm trcustoms manage shell'

snippet:
    docker-compose run -T --rm trcustoms manage shell
snippet-prod:
    ssh trcustoms 'cd ~/srv/website; docker-compose -f docker-compose.prod.yml run --rm trcustoms manage shell'
snippet-staging:
    ssh trcustoms 'cd ~/srv/website-staging; docker-compose -f docker-compose.yml run --rm trcustoms manage shell'

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
    sh -c 'shopt -s globstar; sudo chown rr-:rr- -R backend/**/migrations'

dump-prod-to-local-file:
    #!/bin/sh
    ssh trcustoms "docker-compose -f /home/trcustoms/srv/website/docker-compose.prod.yml run --rm -T trcustoms-db sh -c 'PGPASSWORD="\$POSTGRES_PASSWORD" pg_dump -h trcustoms-db -d "\$POSTGRES_DB" -U "\$POSTGRES_USER" -Fc'" > trcustoms-prod.dmp

[confirm]
load-db-from-prod-dump:
    #!/bin/sh
    docker-compose run -v .:/tmp/ -T --rm trcustoms-db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -h trcustoms-db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' < trcustoms-prod.dmp

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
