import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: CreateUserDto) {
    try {
      const user = await this.userModel.create(data);
      this.logger.log(`User created: ${user.name}`);
      return { name: user.name };
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw error; // O MongoExceptionFilter vai capturar
    }
  }

  async findAll() {
    try {
      return await this.userModel.find();
    } catch (error) {
      this.logger.error('Error fetching users', error);
      throw error; // O MongoExceptionFilter vai capturar
    }
  }
}
