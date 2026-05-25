import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Public()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Auth()
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @Auth()
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Auth()
  updateById(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.updateById(id, data);
  }
}
