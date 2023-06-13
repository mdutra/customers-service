import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  async verify(token: string): Promise<void> {
    const url = this.configService.get<string>('SSO_VERIFY_TOKEN_URL');
    const client_id = this.configService.get<string>('SSO_CLIENT_ID');
    const client_secret = this.configService.get<string>('SSO_CLIENT_SECRET');

    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
          token,
          client_id,
          client_secret,
        },
      });

      if (!response.data.active) {
        throw new UnauthorizedException('Token is not valid');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        this.logger.log(err);
        if (!err.response && err.request) {
          throw new BadGatewayException('SSO unavailable');
        }
        throw new UnauthorizedException(
          'Check the $SSO_CLIENT_SECRET and the Authorization token',
        );
      }

      throw err;
    }
  }
}
