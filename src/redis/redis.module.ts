import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const NODE_ENV = configService.get<string>('NODE_ENV');
        const REDIS_HOST = configService.get<string>('REDIS_HOST');
        const REDIS_PORT = configService.get<number>('REDIS_PORT');

        if (NODE_ENV !== 'test') {
          const client = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
          });

          client.on('connect', () => {
            console.log('Connected to Redis');
          });

          client.on('error', () => {
            console.log(
              `Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}`,
            );
          });

          return client;
        }
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
