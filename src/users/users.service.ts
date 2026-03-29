import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: CreateUserDto) {
    data.password = await bcryptjs.hash(data.password, 10);
    try {
      const user = await this.userModel.create(data);
      this.logger.log(`User created: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error('Error creating user', error);
      console.error(error);
      throw error;
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

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
