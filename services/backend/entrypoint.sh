#!/bin/bash
set -e

show_help() {
    echo """
Usage: docker run --rm backend COMMAND

Commands

dev         : Run a development server
uwsgi       : Run a production server
shell       : Start a bash shell
manage      : Start manage.py
migrate     : Run migrations
python      : Run a Python command
test        : Run tests
celery      : Run celery (task queue)
celery-beat : Run celery beat (periodic tasks)
help        : Show this message
"""
}

write_static_files() {
    python3 manage.py collectstatic --noinput
}

run_migrations() {
    python3 manage.py migrate $@
}

action="$1"
shift
case "$action" in
    dev)
        write_static_files
        run_migrations
        python3 manage.py runserver 0.0.0.0:8000
    ;;
    shell)
        /bin/bash "$@"
    ;;
    manage)
        python3 manage.py "$@"
    ;;
    migrate)
        run_migrations "$@"
    ;;
    python)
        python3 "$@"
    ;;
    celery)
        celery -A trcustoms worker -l INFO
    ;;
    celery-beat)
        celery -A trcustoms beat -l INFO
    ;;
    test)
        pytest --cov=trcustoms --cov-report=term-missing --reuse-db "$@"
    ;;
    uwsgi)
        echo "Running App (uWSGI)..."
        write_static_files
        run_migrations
        uwsgi --ini /conf/uwsgi.ini
    ;;
    *)
        show_help
    ;;
esac
