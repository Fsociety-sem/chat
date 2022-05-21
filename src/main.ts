import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )
  app.useGlobalPipes(new ValidationPipe())
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Chat')
    .setVersion('1.0')
    .build()
  SwaggerModule.setup(
    'swagger',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  )
  const configService = app.get(ConfigService)
  const port = configService.get<string>('app.port')

  await app.listen(port)
}
bootstrap()
