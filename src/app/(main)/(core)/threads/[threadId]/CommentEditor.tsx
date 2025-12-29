"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useMutation } from "@tanstack/react-query";
import { type Editor } from "@tiptap/react";
import { Button, Group } from "@mantine/core";
import { isNotEmptyHTML, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import TextEditor from "@/components/TextEditor";
import { useTiptapEditor } from "@/hooks/use-tiptap";
import { submitThreadComment } from "@/services/thread";
import ServerError from "@/utils/error/ServerError";
import { setCreateThreadCommentQueryData } from "@/app/(main)/(core)/threads/set-query-data";

export interface CommentEditorProps {
  threadId: string;
  onOpenSignInWarningModal: () => void;
}

export interface CommentSectionRef {
  editor: Editor | null;
}

const CommentEditor = forwardRef<CommentSectionRef, CommentEditorProps>(
  ({ threadId }, ref) => {
    const form = useForm({
      initialValues: {
        body: "<p></p>",
      },
      validate: {
        body: isNotEmptyHTML("Comment is required"),
      },
    });

    const editor = useTiptapEditor({
      content: "<p></p>",
      placeholder: "Write a comment...",
      onUpdate: ({ editor }) => {
        form.setFieldValue("body", editor.getHTML());
      },
      shouldRerenderOnTransaction: false,
    });

    useImperativeHandle(ref, () => ({ editor }));

    const commentMutation = useMutation({
      mutationFn: (values: typeof form.values) =>
        submitThreadComment({
          id: threadId,
          body: values.body,
        }),
      onSuccess: (data) => {
        setCreateThreadCommentQueryData({ id: threadId, comment: data });

        form.reset();
        editor?.commands.clearContent();

        notifications.show({
          title: "Comment submitted",
          message: "Your comment has been submitted successfully.",
        });
      },
      onError: (error) => {
        if (error instanceof ServerError) {
          form.setFieldError("body", error.issues[0].message);
        } else {
          form.setFieldError("body", "Something went wrong");
        }
      },
    });

    return (
      <form
        onSubmit={form.onSubmit((values) => commentMutation.mutate(values))}
      >
        <TextEditor editor={editor} error={form.errors.body} />

        <Group mt="md" justify="end">
          <Button
            type="submit"
            disabled={!form.isDirty()}
            loading={commentMutation.isPending}
          >
            Comment
          </Button>
        </Group>
      </form>
    );
  },
);

CommentEditor.displayName = "CommentEditor";
export default CommentEditor;
