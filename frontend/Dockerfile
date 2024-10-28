# version of node to use
FROM node:14
# this is the working directory inside the container
WORKDIR /app
# copy package.json and package-lock.json to the working directory (required to install dependencies)
COPY package*.json ./
# command that is run to install dependencies
RUN npm install
# copy all files from the current directory to the working directory
COPY . .
# expose port 3000 to the outside world (required to access the app at port 3000 however, we map this internal 3000 to an external port in the docker-compose file)
EXPOSE 3000
# command that is run to start the app (can be overriden in the docker-compose file)
CMD ["npm", "start"]