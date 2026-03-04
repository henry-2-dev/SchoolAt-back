import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors(); // Autorise les requêtes Cross-Origin (Frontend -> Backend)
  await app.listen(process.env.PORT ?? 3000);
}
export default bootstrap();
