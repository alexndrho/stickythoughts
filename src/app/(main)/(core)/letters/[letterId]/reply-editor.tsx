"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useMutation } from "@tanstack/react-query";
import { type Editor } from "@tiptap/react";
import { Button, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import TextEditor from "@/components/text-editor";
import { useTiptapEditor } from "@/hooks/use-tiptap";
import { submitLetterReply } from "@/services/letter";
import ServerError from "@/utils/error/ServerError";
import { setCreateLetterReplyQueryData } from "@/app/(main)/(core)/letters/set-query-data";
import { sanitizeString } from "@/utils/text";
import { LETTER_REPLY_MAX_LENGTH } from "@/lib/validations/letter";

export interface ReplyEditorProps {
  letterId: string;
  isDefaultAnonymous?: boolean;
}

export interface ReplySectionRef {
  editor: Editor | null;
}

const ReplyEditor = forwardRef<ReplySectionRef, ReplyEditorProps>(
  ({ letterId, isDefaultAnonymous }, ref) => {
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
            return "Reply is required";
          } else if (textContent.length > LETTER_REPLY_MAX_LENGTH) {
            return `Reply must be at most ${LETTER_REPLY_MAX_LENGTH.toLocaleString()} characters long`;
          }
        },
      },
    });

    const editor = useTiptapEditor({
      content: "<p></p>",
      placeholder: "Write a reply...",
      onUpdate: ({ editor }) => {
        form.setFieldValue("body", editor.getHTML());
      },
      shouldRerenderOnTransaction: false,
    });

    useImperativeHandle(ref, () => ({ editor }));

    const replyMutation = useMutation({
      mutationFn: (values: typeof form.values) =>
        submitLetterReply({
          id: letterId,
          body: values.body,
          isAnonymous: values.isAnonymous,
        }),
      onSuccess: (data) => {
        setCreateLetterReplyQueryData({ id: letterId, reply: data });

        form.setValues({
          body: "<p></p>",
          isAnonymous: form.values.isAnonymous,
        });
        editor?.commands.clearContent();

        notifications.show({
          title: "Reply submitted",
          message: "Your reply has been submitted successfully.",
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
        onSubmit={form.onSubmit((values) => replyMutation.mutate(values))}
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
            loading={replyMutation.isPending}
          >
            Reply
          </Button>
        </Group>
      </form>
    );
  },
);

ReplyEditor.displayName = "ReplyEditor";
export default ReplyEditor;
