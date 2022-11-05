import { Controller, Get, Inject } from '@midwayjs/decorator';
import { CosService } from '@/service/cos.service';

@Controller('/cos')
export class CosController {
  @Inject()
  cosService: CosService;

  @Get('/sts')
  async getSTSConfig() {
    return await this.cosService.getSTSConfig();
  }
}
