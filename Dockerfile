# Node.js: 14.4.0
FROM node:18

# Create app directory
WORKDIR /src

# Install app dependencies (package.json and package-lock.json)
COPY package*.json ./
RUN npm install

# Bundle app source (server.js)
# COPY . .

# Listen port
# EXPOSE 8080

# Run Node.js
# CMD [ "node", "server.js" ]