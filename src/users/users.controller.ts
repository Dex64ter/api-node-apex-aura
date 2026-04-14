import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Public } from 'src/common/decorators/public.decorator';

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
}
