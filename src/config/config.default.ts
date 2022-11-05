import { MidwayConfig } from '@midwayjs/core';

// 本地环境配置
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1659760140542_6750',
  koa: {
    globalPrefix: '/api',
    port: 7001,
  },
  jwt: {
    secret: 'your secret', // fs.readFileSync('xxxxx.key')
    expiresIn: '2d', // https://github.com/vercel/ms
    refreshExpiresIn: '4d',
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        database: process.env.DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        synchronize: true,
        // 根据路径，装配实体类，注意，这里和常见的 typeorm 等扫描路径不同，entities 的路径不需要写 .ts 后缀
        entities: ['/entity'],
      },
    },
  },
  cos: {
    client: {
      SecretId: 'SecretId',
      SecretKey: 'SecretKey',
      Bucket: 'cos bucket 名称',
    },
  },
  redis: {
    // 单客户端配置
    client: {
      port: 6379,
      host: '127.0.0.1', // Redis host
      db: 0,
    },
  },
  // 默认会将登录的 user 信息写入 session，将其关闭
  passport: {
    session: false,
  },
  i18n: {
    defaultLocale: 'zh_CN',
  },
} as MidwayConfig;
