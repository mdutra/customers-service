import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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
        throw new UnauthorizedException();
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        this.logger.log(err);
        throw new BadGatewayException('SSO unavailable');
      }

      throw err;
    }
  }
}
