FROM node:14-bullseye

ARG BUILD_VERSION
ARG BUILD_DATE
ENV REACT_APP_BUILD_VERSION=${BUILD_VERSION}
ENV REACT_APP_BUILD_DATE=${BUILD_DATE}

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
