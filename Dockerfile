FROM node:14


RUN mkdir -p /home/custom-user-dashboard
WORKDIR /home/custom-user-dashboard
COPY . /home/custom-user-dashboard

RUN npm config set registry 'https://registry.npm.taobao.org'
RUN npm i
RUN npm build


EXPOSE 3083

CMD ["npm", "run", "static"]