FROM node:20-bullseye

WORKDIR /app/
COPY ./frontend/package.json ./
COPY ./frontend/package-lock.json ./
RUN npm ci

COPY services/frontend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY ./frontend/ ./

EXPOSE 3000
CMD ["dev"]
