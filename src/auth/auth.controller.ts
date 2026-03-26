import { Body, Controller, Post, Headers } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: LoginUserDto) {
    const user = await this.authService.validateUser(body.email, body.password);

    return this.authService.login(user);
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 401, description: 'E-mail já cadastrado' })
  async signup(
    @Body() body: CreateUserDto,
    @Headers('authorization') token: string,
  ) {
    return this.authService.signup(body, token);
  }

  @Public()
  @Post('request-code')
  requestCode(@Body('email') email: string) {
    return this.authService.requestEmailCode(email);
  }

  @Public()
  @Post('verify-code')
  verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmailCode(body.email, body.code);
  }
}
