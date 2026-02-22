import type { Prisma } from '@/generated/prisma/client';
import type { SerializeDates } from './serialization';
import type { UserSummary, UserWithAvatarSummary } from './user';

export type DeletedThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
    deletedAt: true;
    deletedBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}> & {
  deletedBy: UserSummary | null;
};

export type DeletedThoughtDTO = SerializeDates<DeletedThought>;

export type DeletedLetter = Prisma.LetterGetPayload<{
  select: {
    id: true;
    recipient: true;
    body: true;
    authorId: true;
    deletedById: true;
    status: true;
    statusSetById: true;
    anonymousFrom: true;
    postedAt: true;
    contentUpdatedAt: true;
    createdAt: true;
    updatedAt: true;
    deletedAt: true;
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    deletedBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}> & {
  author: UserWithAvatarSummary | null;
  deletedBy: UserSummary | null;
};

export type DeletedLetterDTO = SerializeDates<DeletedLetter>;

export type DeletedLetterReply = Prisma.LetterReplyGetPayload<{
  select: {
    id: true;
    body: true;
    authorId: true;
    deletedById: true;
    isAnonymous: true;
    letterId: true;
    createdAt: true;
    updatedAt: true;
    deletedAt: true;
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    deletedBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
    letter: {
      select: {
        id: true;
        recipient: true;
      };
    };
  };
}> & {
  author: UserWithAvatarSummary;
  deletedBy: UserSummary | null;
};

export type DeletedLetterReplyDTO = SerializeDates<DeletedLetterReply>;
