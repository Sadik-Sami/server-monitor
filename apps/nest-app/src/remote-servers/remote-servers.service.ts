import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RemoteServersService {
  constructor(
    @InjectRepository(RemoteServer)
    private repo: Repository<RemoteServer>,
  ) {}

  create(props: CreateRemoteServerDto, ownerId: string) {
    const remoteServer = this.repo.create({
      ...props,
      ownerId,
      status: RemoteServerStatus.UNKNOW,
    });
    return this.repo.save(remoteServer);
  }

  findAll(ownerId?: string) {
    return this.repo.find({ where: { ownerId } });
  }

  findOne(id: string, ownerId?: string) {
    return this.repo.findOneBy({ id, ownerId });
  }

  async getById(id: string, ownerId?: string) {
    const server = await this.repo.findOneBy({ id, ownerId });
    if (!server) {
      throw new NotFoundException('Remote server not found');
    }
    return server;
  }

  async update(
    id: string,
    updateRemoteServerDto: UpdateRemoteServerDto,
    ownerId?: string,
  ) {
    const remoteServer = await this.getById(id, ownerId);
    return this.repo.save({ ...remoteServer, ...updateRemoteServerDto });
  }

  async remove(id: string, ownerId?: string) {
    await this.getById(id, ownerId);
    return this.repo.delete({ id, ownerId });
  }
}
