FROM node:alpine
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build
CMD [ "node", "index.js" ]