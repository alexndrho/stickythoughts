-- Rename tables
ALTER TABLE "Thread" RENAME TO "Letter";
ALTER TABLE "ThreadLike" RENAME TO "LetterLike";
ALTER TABLE "ThreadComment" RENAME TO "LetterReply";
ALTER TABLE "ThreadCommentLike" RENAME TO "LetterReplyLike";

-- Rename columns
ALTER TABLE "LetterLike" RENAME COLUMN "threadId" TO "letterId";
ALTER TABLE "LetterReply" RENAME COLUMN "threadId" TO "letterId";
ALTER TABLE "Notification" RENAME COLUMN "threadId" TO "letterId";
ALTER TABLE "LetterReplyLike" RENAME COLUMN "commentId" TO "replyId";
ALTER TABLE "Notification" RENAME COLUMN "commentId" TO "replyId";

-- Rename primary key constraints
ALTER TABLE "Letter" RENAME CONSTRAINT "Thread_pkey" TO "Letter_pkey";
ALTER TABLE "LetterLike" RENAME CONSTRAINT "ThreadLike_pkey" TO "LetterLike_pkey";
ALTER TABLE "LetterReply" RENAME CONSTRAINT "ThreadComment_pkey" TO "LetterReply_pkey";
ALTER TABLE "LetterReplyLike" RENAME CONSTRAINT "ThreadCommentLike_pkey" TO "LetterReplyLike_pkey";

-- Rename foreign key constraints
ALTER TABLE "Letter" RENAME CONSTRAINT "Thread_authorId_fkey" TO "Letter_authorId_fkey";
ALTER TABLE "Letter" RENAME CONSTRAINT "Thread_deletedById_fkey" TO "Letter_deletedById_fkey";
ALTER TABLE "LetterLike" RENAME CONSTRAINT "ThreadLike_userId_fkey" TO "LetterLike_userId_fkey";
ALTER TABLE "LetterLike" RENAME CONSTRAINT "ThreadLike_threadId_fkey" TO "LetterLike_letterId_fkey";
ALTER TABLE "LetterReply" RENAME CONSTRAINT "ThreadComment_authorId_fkey" TO "LetterReply_authorId_fkey";
ALTER TABLE "LetterReply" RENAME CONSTRAINT "ThreadComment_threadId_fkey" TO "LetterReply_letterId_fkey";
ALTER TABLE "LetterReply" RENAME CONSTRAINT "ThreadComment_deletedById_fkey" TO "LetterReply_deletedById_fkey";
ALTER TABLE "LetterReplyLike" RENAME CONSTRAINT "ThreadCommentLike_userId_fkey" TO "LetterReplyLike_userId_fkey";
ALTER TABLE "LetterReplyLike" RENAME CONSTRAINT "ThreadCommentLike_commentId_fkey" TO "LetterReplyLike_replyId_fkey";
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_threadId_fkey" TO "Notification_letterId_fkey";
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_commentId_fkey" TO "Notification_replyId_fkey";

-- Rename indexes
ALTER INDEX "Thread_deletedAt_createdAt_idx" RENAME TO "Letter_deletedAt_createdAt_idx";
ALTER INDEX "Thread_authorId_deletedAt_createdAt_idx" RENAME TO "Letter_authorId_deletedAt_createdAt_idx";
ALTER INDEX "ThreadLike_userId_threadId_key" RENAME TO "LetterLike_userId_letterId_key";
ALTER INDEX "ThreadComment_deletedAt_createdAt_idx" RENAME TO "LetterReply_deletedAt_createdAt_idx";
ALTER INDEX "ThreadComment_threadId_deletedAt_createdAt_idx" RENAME TO "LetterReply_letterId_deletedAt_createdAt_idx";
ALTER INDEX "ThreadCommentLike_userId_commentId_key" RENAME TO "LetterReplyLike_userId_replyId_key";

-- Rename enum values
ALTER TYPE "NotificationType" RENAME VALUE 'THREAD_LIKE' TO 'LETTER_LIKE';
ALTER TYPE "NotificationType" RENAME VALUE 'THREAD_COMMENT' TO 'LETTER_REPLY';
ALTER TYPE "NotificationType" RENAME VALUE 'THREAD_COMMENT_LIKE' TO 'LETTER_REPLY_LIKE';
