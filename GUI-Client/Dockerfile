# pull base image
FROM node:20.10-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3001 for node
ARG PORT=3001
ENV PORT $PORT

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache \
    alsa-lib \
    chromium \
    cups-libs \
    gtk+3.0 \
    nss \
    # Add any other necessary packages here
    && rm -rf /var/cache/apk/*

# Copy package.json files and Install dependencies
COPY package*.json ./
RUN npm install

USER appuser

COPY . .

EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["dev"]