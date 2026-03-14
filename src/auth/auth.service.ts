import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

const users = [
  {
    userId: 1,
    email: 'admin@email.com',
    password: '123456',
  },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signUp(email: string, password: string) {
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return new BadRequestException('User already exists');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const saltAndHash = `${salt}.${hash.toString('hex')}`;

    const newUser = {
      userId: users.length + 1,
      email,
      password: saltAndHash,
    };

    users.push(newUser);
    console.log('Signed up:', newUser);
    const { password: _, ...newUserWithoutPassword } = newUser;

    return newUserWithoutPassword;
  }

  async signIn(email: string, password: string) {
    const user = users.find((user) => user.email === email);
    if (!user) {
      return new BadRequestException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      return new BadRequestException('Invalid password');
    }
    console.log('Signed in:', user);
    const payload = { username: user.email, sub: user.userId };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
