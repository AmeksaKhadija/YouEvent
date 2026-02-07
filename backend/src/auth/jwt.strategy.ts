import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
    });
  }

  async validate(payload: any) {
    // Le payload est ce qui est décodé du token
    // Nous retournons l'objet user qui sera attaché à la Request (req.user)
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
