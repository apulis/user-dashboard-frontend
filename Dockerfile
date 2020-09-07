FROM node:12


RUN mkdir -p /home/custom-user-dashboard
WORKDIR /home/custom-user-dashboard
ADD package.json .
ADD package-lock.json .
ADD yarn.lock .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn install

COPY . /home/custom-user-dashboard

RUN yarn build


FROM node:12-alpine
RUN mkdir -p /home/app/dist && mkdir -p /home/app/server
WORKDIR /home/app/server
COPY --from=0 /home/custom-user-dashboard/dist ../dist
COPY --from=0 /home/custom-user-dashboard/server .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn

EXPOSE 3083

CMD ["node", "index"]
