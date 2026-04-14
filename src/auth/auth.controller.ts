import { Body, Controller, Post, Headers, Request, Get } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestCodeDTO, VerifyCodeDTO } from './dto/request-code.dto';

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
  async signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @Public()
  @Post('signup-with-code')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 401, description: 'E-mail já cadastrado' })
  @ApiBearerAuth('access-token')
  async signupWithCode(
    @Body() body: CreateUserDto,
    @Headers('authorization') token: string,
  ) {
    return this.authService.signupWithCode(body, token);
  }

  @Public()
  @Post('request-code')
  @ApiBody({ type: RequestCodeDTO })
  requestCode(@Body('email') email: string) {
    return this.authService.requestEmailCode(email);
  }

  @Public()
  @Post('verify-code')
  @ApiBody({ type: VerifyCodeDTO })
  verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmailCode(body.email, body.code);
  }

  @Get('me')
  @ApiResponse({ status: 200, description: 'Usuário autenticado' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiBearerAuth('access-token')
  validateToken(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }

  @Public()
  @Post('oauth/github')
  @ApiOperation({ summary: 'Autenticar usuário' })
  signInWithGithub() {
    return this.authService.signInWithGithub();
  }
}
// https://github.com/login/oauth/authorize
