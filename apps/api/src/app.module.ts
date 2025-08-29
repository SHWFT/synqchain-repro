import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PoModule } from './modules/po/po.module';
import { FilesModule } from './modules/files/files.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthController } from './common/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SuppliersModule,
    ProjectsModule,
    PoModule,
    FilesModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
