import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';

// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const user = await this.authService.validateUser(body.email, body.password);

    return this.authService.login(user);
  }
}
