FROM python:3.10-bullseye

ARG BUILD_VERSION
ARG BUILD_DATE
ENV BUILD_VERSION=${BUILD_VERSION}
ENV BUILD_DATE=${BUILD_DATE}

WORKDIR /app

EXPOSE 8000

COPY services/backend/requirements.dev.txt /conf/
COPY services/backend/requirements.txt /conf/
RUN pip install -r /conf/requirements.dev.txt

COPY services/uwsgi/uwsgi.ini services/uwsgi/mime.types /conf/
COPY services/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY backend ./

CMD ["uwsgi"]
