import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          logger.error('MONGODB_URI is not defined in environment variables');
          throw new Error('MONGODB_URI environment variable is required');
        }

        logger.log('Connecting to MongoDB...');

        return {
          uri,
          retryAttempts: 5,
          retryDelay: 3000,
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log('MongoDB connected successfully');
            });

            connection.on('disconnected', () => {
              logger.warn('MongoDB disconnected');
            });

            connection.on('error', (error) => {
              logger.error('MongoDB connection error:', error);
            });

            return connection;
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
