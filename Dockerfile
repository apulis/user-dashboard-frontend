FROM node:14


RUN mkdir -p /home/custom-user-dashboard
WORKDIR /home/custom-user-dashboard
COPY . /home/custom-user-dashboard

RUN yarn cache clean
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn
RUN yarn build


EXPOSE 3083

CMD ["yarn", "run", "static"]