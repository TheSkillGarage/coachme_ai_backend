import { Prisma } from '@/generated/client/client';

export type NotificationWithApplication = Prisma.NotificationGetPayload<{
  include: {
    application: {
      include: {
        job: true;
      };
    };
  };
}>;
