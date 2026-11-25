# Deployment

TRCustoms runs on tomb twice, as two separate deployments:

| name                | user                    | branch    | site                          |
| ------------------- | ----------------------- | --------- | ----------------------------- |
| `trcustoms`         | `svc-trcustoms`         | `main`    | https://trcustoms.org         |
| `trcustoms-staging` | `svc-trcustoms-staging` | `develop` | https://staging.trcustoms.org |

Each one lives in `/srv/<name>`, which belongs to its user:

    app/          a checkout of this repository, with app/.env -> ../env
    data/         uploads, django_static, the beat schedule, backups
    run/          the sockets of the app and of redis, the uwsgi pid
    www/          the built frontends, one per commit; current is live
    env           the settings, read by dotenv-rust (see below)
    update        root's copy of deploy/update, the deploy key's command
    uwsgi.ini     root's copy of deploy/uwsgi.ini.in
    redis.conf    root's copy of deploy/redis.conf.in

Supervisor runs the group `<name>` (`deploy/supervisor.conf.in`): its own
redis, uwsgi on `run/web.sock`, the celery worker and beat. Postgres is the
system's, which the user reaches over its socket with peer auth. nginx serves
`www/current` and the files in `data/` and sends `/api` and the admin to the
socket (`deploy/nginx/`). Staging also runs Mailpit, which catches the mail
staging sends and shows it at mailhog.trcustoms.org (`deploy/mailpit.conf`).

## Deploying

A push to `main` or `develop` runs `.github/workflows/deploy.yaml` in the
GitHub environment `production` or `staging`. It builds the frontend and runs

    ssh svc-<name>@tomb <commit> < frontend.tar.gz

The deploy key of the environment may only run `/srv/<name>/update`, which
checks out that commit, unpacks the frontend into `www/<commit>`, syncs the
Python packages, collects the static files, migrates, loads the initial data,
points `www/current` at the new frontend and reloads the app. It keeps the
last three frontends.

Each environment has the variables `DEPLOY_HOST`, `DEPLOY_USER` and
`HOST_SITE` and the secrets `DEPLOY_SSH_KEY` and `DEPLOY_KNOWN_HOSTS`.

## The env file

    SECRET_KEY, DEBUG, DEBUG_SQL, ADMIN_DIR, HOST_SITE
    DATA_DIR=/srv/<name>/data
    POSTGRES_HOST=/var/run/postgresql
    POSTGRES_DB, POSTGRES_USER (no password: peer auth)
    REDIS_URL=unix:///srv/<name>/run/redis.sock
    CELERY_BROKER_URL=redis+socket:///srv/<name>/run/redis.sock
    EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD,
    EMAIL_USE_TLS, EMAIL_USE_SSL
    USE_AWS_STORAGE and the AWS_* settings (prod keeps its media on R2)
    DISCORD_WEBHOOK_MOD_URL, DISCORD_WEBHOOK_LEVEL_URL

## Setting up a deployment

As root on the server, with `name` the name of the deployment, `db` its
database (`trcustoms`, `trcustoms_staging`) and the repository at `$repo`:

    useradd -r -m -d /srv/$name -s /bin/bash svc-$name
    usermod -aG svc-$name www-data
    install -d -o svc-$name -g svc-$name -m 750 \
        /srv/$name/data /srv/$name/run /srv/$name/www /var/log/$name
    sudo -u svc-$name git clone https://github.com/rr-/trcustoms /srv/$name/app
    sudo -u svc-$name ln -s ../env /srv/$name/app/.env
    for f in uwsgi.ini redis.conf; do
        sed "s/@NAME@/$name/g" $repo/deploy/$f.in > /srv/$name/$f
        chown root:svc-$name /srv/$name/$f; chmod 640 /srv/$name/$f
    done
    install -o root -g root -m 755 $repo/deploy/update /srv/$name/update
    sed "s/@NAME@/$name/g" $repo/deploy/supervisor.conf.in \
        > /etc/supervisor/conf.d/$name.conf

    sudo -u postgres createuser $db
    sudo -u postgres createdb -O $db -l en_US.UTF-8 -T template0 $db
    sudo -u postgres psql -c "REVOKE CONNECT ON DATABASE $db FROM PUBLIC"
    echo "local $db $db peer map=services" >> /etc/postgresql/18/main/pg_hba.conf
    echo "services svc-$name $db" >> /etc/postgresql/18/main/pg_ident.conf

and the deploy key in `/srv/$name/.ssh/authorized_keys` as

    restrict,command="/srv/<name>/update" ssh-ed25519 ... <name>-deploy

For nginx, copy `deploy/nginx/proxy.conf` to
`/etc/nginx/snippets/trcustoms-proxy.conf` and
`services/nginx/nginx_social_preview_map.conf` to
`/etc/nginx/conf.d/trcustoms-social-preview.conf`, and fill in `@ADMIN_DIR@`
in the site of the deployment. Prod's nightly jobs are `deploy/cron`.
