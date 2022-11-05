FROM node:16-slim

RUN apt-get update
RUN apt-get install -y openssl make gcc g++ python procps

WORKDIR /app
COPY package.json /app
RUN npm install 

RUN npm rebuild bcrypt -build-from-source && apt-get --purge remove -y make gcc g++ python3

COPY . /app

RUN npm run build

CMD ["npm", "run", "start:prod"]