import 'server-only';

import { Prisma } from '@/generated/prisma/client';

export function isPrismaKnownRequestError(
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaKnownRequestErrorCode<TCode extends string>(
  err: unknown,
  code: TCode,
): err is Prisma.PrismaClientKnownRequestError & { code: TCode } {
  return isPrismaKnownRequestError(err) && err.code === code;
}

export function isUniqueConstraintError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return isPrismaKnownRequestError(err) && err.code === 'P2002';
}

export function isRecordNotFoundError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return isPrismaKnownRequestError(err) && err.code === 'P2025';
}
