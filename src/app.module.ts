/* eslint-disable prettier/prettier */
// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ApplicationsModule } from './modules/applications/applications.module';

// Common
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { GeminiModule } from './modules/gemini/gemini.module';
import { CoverLetterModule } from './modules/cover-letter/cover-letter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    ResumesModule,
    NotificationsModule,
    ApplicationsModule,
    GeminiModule,
    CoverLetterModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule { }
