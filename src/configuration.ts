import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as jwt from '@midwayjs/jwt';
import * as passport from '@midwayjs/passport';
import * as orm from '@midwayjs/typeorm';
import * as redis from '@midwayjs/redis';
import * as dotenv from 'dotenv';
import * as cos from '@midwayjs/cos';

import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';

import { ResponseMiddleware } from './middleware/response.middware';
import { JwtMiddleware } from './middleware/jwt.middleware';

dotenv.config();

@Configuration({
  imports: [
    koa,
    validate,
    jwt,
    passport,
    orm,
    redis,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    cos,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ResponseMiddleware, JwtMiddleware]);
    // add filter
    this.app.useFilter([DefaultErrorFilter]);
  }
}
