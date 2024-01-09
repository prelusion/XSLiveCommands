# pull base image
FROM node:20.10-alpine

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000 for node
ARG PORT=3000
ENV PORT $PORT

WORKDIR /usr/src/app

# Copy package.json files and Install dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["dev"]