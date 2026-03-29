import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { EmailVerification } from './schemas/mail-verification.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';

// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmailVerification.name)
    private emailVerificationModel: Model<EmailVerification>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  login(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        aura: user.aura,
      },
    };
  }

  async signup(user: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(user.email);

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const userData = {
      ...user,
      isVerified: true,
      avatarUrl:
        user.avatarUrl ||
        `https://api.dicebear.com/9.x/avataaars-neutral/png?seed=${user.name}`,
    };

    const newUser = await this.usersService.create(userData);

    return this.login(newUser);
  }

  async requestEmailCode(email: string) {
    if (!email) {
      throw new UnauthorizedException('Email is required');
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.emailVerificationModel.findOneAndUpdate(
      { email },
      {
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
      },
      { upsert: true, returnDocument: 'after' },
    );

    await this.mailService.sendVerificationEmail(email, code);

    return { message: 'Verification code sent' };
  }

  async verifyEmailCode(email: string, code: string) {
    const record = await this.emailVerificationModel.findOne({ email, code });

    if (!record) {
      throw new UnauthorizedException('Invalid code');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Code expired');
    }

    record.verified = true;
    await record.save();

    // 🔥 gera token temporário
    const tempToken = this.jwtService.sign(
      { email, verified: true },
      { expiresIn: '15m' },
    );

    return { tempToken };
  }

  async signupWithCode(user: CreateUserDto, token: string) {
    let payload: any;

    try {
      const cleanToken = token.replace('Bearer ', '');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = this.jwtService.verify(cleanToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!payload.verified || payload.email !== user.email) {
      throw new UnauthorizedException('Email not verified');
    }

    const existingUser = await this.usersService.findByEmail(user.email);

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const userData = {
      ...user,
      isVerified: true,
      avatarUrl:
        user.avatarUrl ||
        `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${user.name}`,
    };

    const newUser = await this.usersService.create(userData);

    return this.login(newUser);
  }
}
