FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

# On expose le port 3000 pour NestJS
EXPOSE 3000

# Commande pour lancer le mode développement avec auto-reload
CMD ["npm", "run", "start:dev"]
