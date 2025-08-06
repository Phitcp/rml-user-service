import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from '@shared/logger';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
 
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLogger);

  // RBAC microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'character',
      protoPath: 'src/proto/character.proto',
      url: '0.0.0.0:4003',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'exp',
      protoPath: 'src/proto/exp.proto',
      url: '0.0.0.0:4004',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });
  await app.startAllMicroservices();

  logger.log(`Character gRPC microservice is running on port: 4003`);
  logger.log(`Exp gRPC microservice is running on port: 4004`);
}
bootstrap();
