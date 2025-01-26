import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import authConfig from 'src/config/authConfig';
import { ConfigType } from '@nestjs/config';

interface User {
  userId: string;
  email: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  login(user: User) {
    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
    };

    const token = jwt.sign(payload, this.config.jwtSecret, {
      // id: '1d',
      audience: 'example.com',
      issuer: 'example.com',
    });
    console.log({ token });
    return token;
  }

  verify(jwtString: string) {
    try {
      const payload = jwt.verify(
        jwtString,
        this.config.jwtSecret,
      ) as JwtPayload;

      return payload;
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }
}
