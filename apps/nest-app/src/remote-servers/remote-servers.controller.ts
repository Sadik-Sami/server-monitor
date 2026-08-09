import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { ICurrentUser } from '../auth/current-user.interface';

@Controller('remote-servers')
export class RemoteServersController {
  constructor(private readonly remoteServersService: RemoteServersService) {}

  @Post()
  create(
    @Body() createRemoteServerDto: CreateRemoteServerDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    console.log(currentUser);
    return this.remoteServersService.create(
      createRemoteServerDto,
      currentUser.id,
    );
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.findOne(id, currentUser.id);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.getById(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRemoteServerDto: UpdateRemoteServerDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.remoteServersService.update(
      id,
      updateRemoteServerDto,
      currentUser.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.remove(id, currentUser.id);
  }
}
