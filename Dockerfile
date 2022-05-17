FROM node:16-alpine

WORKDIR /var/www/app

COPY package*.json ./

RUN npm install --prod

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 8080

USER node
COPY --chown=node:node . /var/www/app/

CMD ["npm", "run", "start:prod"]


