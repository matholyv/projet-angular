FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# On expose le port 4200 pour Angular
EXPOSE 4200

# Commande pour lancer Angular en mode dev accessible de l'extérieur
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "500"]
