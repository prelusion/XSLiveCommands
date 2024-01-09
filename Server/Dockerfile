# pull base image
FROM node:20.10-alpine

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app

# Copy package.json files and Install dependencies
COPY package*.json ./
RUN npm install

COPY . .

RUN #npx tsc

# default to port 3000 for node
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT

ENTRYPOINT ["npm", "run"]
CMD ["dev"]