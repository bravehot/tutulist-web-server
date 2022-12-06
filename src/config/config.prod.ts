import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  // 测试环境是使用 docker 部署的，工作目录为 app
  // 如果工作目录非 app，那么代表为 serverless 环境
  if (appInfo.appDir !== '/app') {
    return {
      typeorm: {
        dataSource: {
          default: {
            type: 'mysql',
            host: '',
            port: 3306,
            username: '',
            password: '',
            database: '',
            entities: ['/entity'],
          },
        },
      },
      redis: {
        client: {
          port: 6379,
          host: '', // Redis host
          db: 0,
          name: '',
          password: '',
        },
      },
      cos: {
        client: {
          SecretId: 'SecretId',
          SecretKey: 'SecretKey',
          Bucket: 'cos bucket 名称',
        },
      },
    } as MidwayConfig;
  } else {
    // 测试环境开发配置
    return {
      keys: '1639994056460_8009',
      typeorm: {
        dataSource: {
          default: {
            type: 'mysql',
            host: 'mysql',
            port: 3306,
            synchronize: true,
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            entities: ['/entity'],
          },
        },
      },
      redis: {
        client: {
          port: 6379,
          host: 'redis', // Redis host
          db: 0,
        },
      },
    };
  }
};
