import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmailVerification } from './schemas/mail-verification.schema';
import { UsersService } from 'src/users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(EmailVerification.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
