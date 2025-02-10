FROM node:20 AS build

WORKDIR /app

COPY . .

RUN rm -rf node_modules package-lock.json
RUN npm cache clean --force

RUN npm config set registry https://registry.npmmirror.com
RUN npm install
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/bootstrap.js ./
COPY --from=build /app/package.json ./

# 在docker container 中不能自动识别宿主机的时区，可通过安装tzdata软件包，配置TZ环境变量识别正确时区．
RUN apk add --no-cache tzdata
ENV TZ="Asia/Shanghai"

# 移除开发依赖，构建正式包的时候只安装 dependencies 的依赖
RUN npm install --production --registry=https://registry.npmmirror.com

# 如果端口更换，这边可以更新一下
EXPOSE 7001

CMD ["npm", "run", "start"]