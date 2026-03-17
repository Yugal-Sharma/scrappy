FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]
