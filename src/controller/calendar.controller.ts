import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Del,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';

import { EventInfoDTO, MoveFolderDTO, QueryEventListDTO } from '@/dto/calendar';
import { CalendarService } from '@/service/calendar.service';

@Controller('/calendar')
export class CalendarController {
  @Inject()
  calendarService: CalendarService;

  @Get('/list')
  @Validate()
  async getCalendarList(@Query() queryInfo: QueryEventListDTO) {
    return await this.calendarService.getEventList(queryInfo);
  }

  @Post('/add')
  @Validate()
  async handleAddEvent(@Body() eventInfo: EventInfoDTO) {
    return await this.calendarService.handleAddEventInfo(eventInfo);
  }

  @Put('/update')
  @Validate()
  async handleUpdateEvent(@Body() eventInfo: EventInfoDTO) {
    return await this.calendarService.handleUpdateEventInfo(eventInfo);
  }

  @Del('/delete')
  @Validate()
  async removeById(@Query('id') id: string) {
    return await this.calendarService.removeById(id);
  }

  @Post('/moveFolder')
  @Validate()
  async handleMoveFolder(@Body() moveInfo: MoveFolderDTO) {
    return await this.calendarService.moveFolder(moveInfo);
  }
}
