import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.error(
        '\n❌  DATABASE_URL is not set.\n' +
        '    Copy apps/api/.env.example → apps/api/.env and fill in your PostgreSQL connection string.\n',
      );
      process.exit(1);
    }
    try {
      await this.$connect();
    } catch (err: any) {
      console.error('\n❌  Could not connect to the database:', err.message, '\n');
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
