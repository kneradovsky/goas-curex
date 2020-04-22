FROM node:12

RUN mkdir /goas
WORKDIR /goas
COPY *.js* ./
COPY utils ./utils/

RUN npm install

CMD ["node","index.js"]