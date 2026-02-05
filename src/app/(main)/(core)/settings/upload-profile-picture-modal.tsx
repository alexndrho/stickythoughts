"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  FileButton,
  Flex,
  Group,
  Modal,
  Text,
} from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { uploadProfilePicture } from "@/services/user";
import { getQueryClient } from "@/lib/get-query-client";
import {
  lettersInfiniteOptions,
  letterBaseOptions,
} from "@/app/(main)/(core)/letters/options";
import ServerError from "@/utils/error/ServerError";
import classes from "./account.module.css";

export interface UploadProfilePictureModalProps {
  opened: boolean;
  onClose: () => void;
  defaultImage?: string;
}

export default function UploadProfilePictureModal({
  opened,
  onClose,
}: UploadProfilePictureModalProps) {
  const { refetch: refetchSession } = authClient.useSession();

  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create preview URL from image using useMemo
  const previewUrl = useMemo(() => {
    return image ? URL.createObjectURL(image) : null;
  }, [image]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const mutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: async () => {
      refetchSession();

      onClose();

      setImage(null);
      setError(null);

      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: letterBaseOptions.queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: lettersInfiniteOptions.queryKey,
      });
    },
    onError: (err) => {
      if (err instanceof ServerError) {
        setError(err.issues[0].message);
      } else {
        setError("An error occurred while uploading the image");
      }
    },
  });

  const handleUpload = async () => {
    if (!image) return;

    setError(null);

    const formData = new FormData();
    formData.append("user-image", image);

    mutation.mutate(formData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upload Profile Picture"
      centered
    >
      <Flex justify="center">
        <Avatar
          src={previewUrl || undefined}
          className={classes["upload-profile-picture-modal__avatar"]}
        />
      </Flex>

      {error && (
        <Group mt="md">
          <Text
            size="sm"
            className={classes["upload-profile-picture-modal__error-message"]}
          >
            {error}
          </Text>
        </Group>
      )}

      <Group mt="md" justify="end">
        <FileButton
          onChange={setImage}
          accept="image/png,image/jpeg,image/jpg,image/webp"
        >
          {(props) => (
            <Button variant="default" {...props}>
              Change Picture
            </Button>
          )}
        </FileButton>

        <Button
          onClick={handleUpload}
          loading={mutation.isPending}
          disabled={!image}
        >
          Upload
        </Button>
      </Group>
    </Modal>
  );
}
