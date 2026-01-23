"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useMutation } from "@tanstack/react-query";
import { type Editor } from "@tiptap/react";
import { Button, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import TextEditor from "@/components/TextEditor";
import { useTiptapEditor } from "@/hooks/use-tiptap";
import { submitThreadComment } from "@/services/thread";
import ServerError from "@/utils/error/ServerError";
import { setCreateThreadCommentQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import { sanitizeString } from "@/utils/text";
import { THREAD_COMMENT_MAX_LENGTH } from "@/lib/validations/form";

export interface CommentEditorProps {
  threadId: string;
  isDefaultAnonymous?: boolean;
  onOpenSignInWarningModal: () => void;
}

export interface CommentSectionRef {
  editor: Editor | null;
}

const CommentEditor = forwardRef<CommentSectionRef, CommentEditorProps>(
  ({ threadId, isDefaultAnonymous }, ref) => {
    const form = useForm({
      initialValues: {
        body: "<p></p>",
        isAnonymous: isDefaultAnonymous ?? false,
      },
      validate: {
        body: () => {
          const textContent = editor?.isEmpty
            ? ""
            : sanitizeString(editor?.getText() || "");

          if (textContent.length < 1) {
            return "Comment is required";
          } else if (textContent.length > THREAD_COMMENT_MAX_LENGTH) {
            return `Comment must be at most ${THREAD_COMMENT_MAX_LENGTH.toLocaleString()} characters long`;
          }
        },
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
          isAnonymous: values.isAnonymous,
        }),
      onSuccess: (data) => {
        setCreateThreadCommentQueryData({ id: threadId, comment: data });

        form.setValues({
          body: "<p></p>",
          isAnonymous: form.values.isAnonymous,
        });
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

        <Switch
          mt="md"
          label="Post anonymously"
          {...form.getInputProps("isAnonymous", { type: "checkbox" })}
        />

        <Group mt="md" justify="end">
          <Button
            type="submit"
            disabled={!form.isDirty("body")}
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
