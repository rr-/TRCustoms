FROM python:3.11

COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /uvx /bin/

WORKDIR /app

EXPOSE 8000

# uv installs into the system environment so entrypoint commands (python3,
# pytest, celery, uwsgi) resolve without activating a virtualenv.
ENV UV_PROJECT_ENVIRONMENT=/usr/local \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock /app/
RUN uv sync --frozen

COPY services/uwsgi/uwsgi.ini services/uwsgi/mime.types /conf/
COPY services/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY backend ./

CMD ["uwsgi"]
