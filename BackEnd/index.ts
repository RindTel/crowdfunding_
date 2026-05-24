import app from './app';
import { config } from './config/env';
import { prisma } from './config/database';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const server = app.listen(config.PORT, () => {
      console.log(`🚀 FundForge API running on http://localhost:${config.PORT}`);
      console.log(`📌 Environment: ${config.NODE_ENV}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Graceful shutdown...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Bye!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
