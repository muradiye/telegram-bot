FROM mhart/alpine-node:4
# FROM mhart/alpine-node:base-0.10
# FROM mhart/alpine-node

ENV NODE_ENV production
WORKDIR /src
ADD . .

RUN npm install

# If you had native dependencies you can now remove build tools
# RUN apk del make gcc g++ python && \
#   rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp

CMD ["node", "."]
