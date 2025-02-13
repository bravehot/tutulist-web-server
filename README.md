# tutulist web server
### 体验地址
测试环境：http://dev.tutulist.cn <br/>

### 技术选型
1. midway 框架的使用
2. typeorm + mysql 的增删改查、事务的使用
3. redis 的使用，负责存储短信验证码
4. 接入 腾讯云 sms 短信服务
5. 接入 腾讯云 cos 并下发临时密钥
6. passport 的身份验证库的使用，并接入 localStrategy 本地策略
7. jwt 中间件、全局请求响应中间件、全局异常处理器的编写
8. 多环境部署，测试环境部署至服务器，生产环境部署至 Serverless

### 后端部署
1. 接入 gitlab ci/cd，服务器安装 gitlab runner
2. gitlab webhooks 的使用，负责从镜像仓库中拉取最新镜像
3. Dockerfile、docker-compose、.gitlab-ci.yml 的编写
4. docker 的使用，nginx 的常用配置（前端视角）
5. docker compose 的使用，编排了 app(业务)、redis、mysql 三个容器
6. 创建阿里云私有镜像仓库，并进行私有镜像的 push 和 pull


### 关于
此项目为前后端分离项目，且前后端的代码已全部开源。<br/>
关于该项目的全部信息，都已全部记录在了 [语雀知识库](https://www.yuque.com/aiyouwai/tutulist/gam1z6)，涵盖了前后端的代码到部署的全部知识，欢迎大家查阅。

![大纲](https://public-photo-bed.oss-cn-hangzhou.aliyuncs.com/github/iShot_2022-11-05_23.12.09.png)



