FROM python:3.9-bullseye

WORKDIR /app

EXPOSE 8000

COPY services/backend/requirements.dev.txt /conf/
RUN pip install -r /conf/requirements.dev.txt

COPY services/backend/requirements.txt /conf/
RUN pip install -r /conf/requirements.txt

COPY services/uwsgi/uwsgi.ini services/uwsgi/mime.types /conf/
COPY services/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY backend ./

CMD ["uwsgi"]
