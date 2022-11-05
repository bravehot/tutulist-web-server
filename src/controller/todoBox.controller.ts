import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Post,
  Put,
  Query,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { TodoBoxService } from '@/service/todoBox.service';

import {
  CreateTodoFolderDTO,
  FolderIdDTO,
  AddTodoDTO,
  UpdateTodoDTO,
  TodoIdDTO,
  QueryMonthDTO,
  UpdateFolderDTO,
  SortFolderDTO,
  MoveTodoDTO,
} from '@/dto/todoBox/index';

@Controller('/todoBox')
export class TodoBoxController {
  @Inject()
  todoBoxService: TodoBoxService;

  @Post('/createFolder')
  @Validate()
  async handleCreateFolder(@Body() folderInfo: CreateTodoFolderDTO) {
    return await this.todoBoxService.handleCreateFolder(folderInfo);
  }

  @Put('/updateFolder')
  @Validate()
  async handleUpdateFolder(@Body() folderInfo: UpdateFolderDTO) {
    return await this.todoBoxService.updateFolder(folderInfo);
  }

  @Put('/sortFolder')
  @Validate()
  async handleSortFolder(@Body() sortInfo: SortFolderDTO) {
    return await this.todoBoxService.handleSortFolder(sortInfo);
  }

  @Get('/folderList')
  async getFolderList() {
    return await this.todoBoxService.getFolderList();
  }

  @Get('/todoList')
  @Validate()
  async getTodoListByFolderId(@Query() queryInfo: QueryMonthDTO) {
    return await this.todoBoxService.getTodoList(queryInfo);
  }

  @Del('/removeFolder')
  @Validate()
  async handleRemoveFolder(@Query() queryInfo: FolderIdDTO) {
    return await this.todoBoxService.removeFolder(queryInfo);
  }

  @Post('/addTodo')
  @Validate()
  async handleAddTodo(@Body() todoInfo: AddTodoDTO) {
    return await this.todoBoxService.saveTodo(todoInfo);
  }

  @Put('/updateTodo')
  @Validate()
  async handleUpdateTodo(@Body() todoInfo: UpdateTodoDTO) {
    return await this.todoBoxService.updateTodo(todoInfo);
  }

  @Del('/removeTodo')
  @Validate()
  async handleRemoveTodo(@Query() queryInfo: TodoIdDTO) {
    return await this.todoBoxService.removeTodo(queryInfo);
  }

  @Post('/moveTodo')
  @Validate()
  async handleMoveTodo(@Body() todoInfo: MoveTodoDTO) {
    return await this.todoBoxService.moveTodo(todoInfo);
  }
}
