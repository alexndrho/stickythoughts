import { type Prisma } from "@/generated/prisma/client";

type PrismaBaseThread = Prisma.ThreadGetPayload<{
  include: {
    author: {
      select: {
        name: true;
        username: true;
        image: true;
      };
    };
    likes?: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
      };
    };
  };
}>;

export type BaseThreadType = Omit<PrismaBaseThread, "likes" | "_count"> & {
  likes?: { userId: string }[];
  _count: { likes: number; comments: number };
};

export type ThreadType = Omit<
  BaseThreadType,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: BaseThreadType["author"];
  isOwner: boolean;
  likes: {
    liked: boolean;
    count: number;
  };
  comments: {
    count: number;
  };
};

type PrismaBaseThreadComment = Prisma.ThreadCommentGetPayload<{
  include: {
    thread: {
      select: {
        authorId: true;
      };
    };
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    likes?: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
      };
    };
  };
}>;

export type BaseThreadCommentType = Omit<
  PrismaBaseThreadComment,
  "likes" | "_count"
> & {
  likes?: { userId: string }[];
  _count: { likes: number };
};

export type ThreadCommentType = Omit<
  BaseThreadCommentType,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: BaseThreadCommentType["author"];
  isOP: boolean;
  likes: {
    liked: boolean;
    count: number;
  };
};

type PrismaBaseUserThreadComment = Prisma.ThreadCommentGetPayload<{
  include: {
    thread: {
      select: {
        title: true;
      };
    };
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    likes?: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
      };
    };
  };
}>;

export type BaseUserThreadCommentType = Omit<
  PrismaBaseUserThreadComment,
  "likes" | "_count"
> & {
  likes?: { userId: string }[];
  _count: { likes: number };
};

export type UserThreadCommentType = Omit<
  BaseUserThreadCommentType,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: BaseUserThreadCommentType["author"];
  likes: {
    liked: boolean;
    count: number;
  };
};
