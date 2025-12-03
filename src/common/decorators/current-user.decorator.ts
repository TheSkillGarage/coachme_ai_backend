import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Define a type for your user object based on your Prisma schema
interface RequestUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  // Add other fields you include in JWT payload
}

export const CurrentUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): RequestUser | RequestUser[keyof RequestUser] | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) return null;

    if (data) {
      return user[data as keyof RequestUser];
    }

    return user;
  },
);
