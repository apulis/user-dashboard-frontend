FROM node:12


RUN mkdir -p /home/custom-user-dashboard
WORKDIR /home/custom-user-dashboard
ADD package.json .
ADD package-lock.json .
ADD yarn.lock .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn

COPY . /home/custom-user-dashboard

RUN yarn build


EXPOSE 3083

CMD ["yarn", "run", "static"]