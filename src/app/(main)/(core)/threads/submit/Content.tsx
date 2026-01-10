"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import {
  Button,
  Container,
  Group,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import {
  searchBaseOptions,
  threadsInfiniteOptions,
} from "@/app/(main)/(core)/threads/options";
import { THREAD_BODY_MAX_LENGTH } from "@/lib/validations/form";
import { submitThread } from "@/services/thread";
import { useEffect } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap";
import TextEditor from "@/components/TextEditor";
import ServerError from "@/utils/error/ServerError";
import { userUsernameThreadsInfiniteOptions } from "@/app/(main)/(core)/user/options";
import classes from "./thread-submit.module.css";

export default function Content() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/");
    }
  }, [isSessionPending, session, router]);

  const form = useForm({
    initialValues: {
      title: "",
      body: "<p></p>",
      isAnonymous: false,
    },
    validate: {
      title: (value) => {
        if (value.length < 1) return "Title is required";
        if (value.length > 100) {
          return `Title must be at most 100 characters long`;
        }
      },
      body: () => {
        if (editor?.isEmpty) {
          return "Body is required";
        } else if (
          (editor?.getText()?.trim().split(/\s+/).length ?? 0) >
          THREAD_BODY_MAX_LENGTH
        ) {
          return `Body must be at most ${THREAD_BODY_MAX_LENGTH.toLocaleString()} characters long`;
        }
      },
    },
  });

  const editor = useTiptapEditor({
    content: "<p></p>",
    placeholder: "Write your post...",
    onUpdate: ({ editor }) => {
      form.setFieldValue("body", editor.getHTML());
    },
    shouldRerenderOnTransaction: false,
  });

  const mutation = useMutation({
    mutationFn: submitThread,
    onSuccess: ({ id }) => {
      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: threadsInfiniteOptions.queryKey,
      });

      if (session?.user.username) {
        queryClient.invalidateQueries({
          queryKey: userUsernameThreadsInfiniteOptions(session.user.username)
            .queryKey,
        });
      }

      queryClient.invalidateQueries({
        queryKey: searchBaseOptions.queryKey,
      });

      router.push(`/threads/${id}`);
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        error.issues.forEach((issue) => {
          if (issue.code === "thread/title-already-exists") {
            form.setFieldError("title", issue.message);
          } else {
            form.setFieldError("root", issue.message);
          }
        });
      }
    },
  });

  return (
    <Container size="sm" className={classes.container}>
      <Title className={classes.title}>Create post</Title>

      <form onSubmit={form.onSubmit((value) => mutation.mutate(value))}>
        <TextInput
          label="Title"
          withAsterisk
          {...form.getInputProps("title")}
          className={classes["title-text-input"]}
        />

        <TextEditor editor={editor} error={form.errors.body} />

        <Switch
          mt="md"
          label="Post anonymously"
          {...form.getInputProps("isAnonymous", { type: "checkbox" })}
        />

        {form.errors.root && (
          <Text size="xs" className={classes["root-error-messsage"]}>
            {form.errors.root}
          </Text>
        )}

        <Group mt="md" justify="end">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!form.isDirty("title") || !form.isDirty("body")}
          >
            Submit
          </Button>
        </Group>
      </form>
    </Container>
  );
}
