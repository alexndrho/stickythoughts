'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, Anchor, Button, Center, Group, Menu, Text } from '@mantine/core';
import MultilineText from '@/components/multiline-text';
import { formatDistanceToNow } from 'date-fns';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { letterOptions } from '../options';
import { setLikeLetterQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import { likeLetter, unlikeLetter } from '@/services/letter';
import LetterEditor from './letter-editor';
import ReplyEditor, { type ReplySectionRef } from './reply-editor';
import Replies from './replies';
import DeleteLetterModal from './delete-letter-modal';
import AuthorAvatar from '@/components/author-avatar';
import LikeButton from '@/app/(main)/(core)/letters/like-button';
import ReplyButton from '@/app/(main)/(core)/letters/reply-button';
import ShareButton from '@/app/(main)/(core)/letters/share-button';
import SignInWarningModal from '@/components/sign-in-warning-modal';
import classes from './letter.module.css';

export interface ContentProps {
  id: string;
}

export default function Content({ id }: ContentProps) {
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const [isEditable, setIsEditable] = useState(false);
  const [signInWarningModalOpened, signInWarningModalHandlers] = useDisclosure(false);
  const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false);

  const replySectionRef = useRef<ReplySectionRef>(null);

  const { data: letter } = useSuspenseQuery(letterOptions(id));

  const isAuthor = letter.isOwner;
  const hasPermissionToDelete =
    session?.user?.role === 'admin' || session?.user?.role === 'moderator'
      ? authClient.admin.checkRolePermission({
          role: session.user.role,
          permission: {
            letter: ['delete'],
          },
        })
      : false;

  // Like
  const handleLikeMutation = useMutation({
    mutationFn: () => {
      if (letter.likes.liked) {
        return unlikeLetter(id);
      } else {
        return likeLetter(id);
      }
    },

    onSuccess: () => {
      setLikeLetterQueryData({
        letterId: letter.id,
        like: !letter.likes.liked,
        authorUsername: letter.author?.username,
      });
    },
  });

  const handleLike = () => {
    if (!session) {
      signInWarningModalHandlers.open();
      return;
    }

    handleLikeMutation.mutate();
  };

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.header__info}>
          {letter.isAnonymous || !letter.author ? (
            <AuthorAvatar isAnonymous={!!letter.isAnonymous} />
          ) : (
            <AuthorAvatar
              component={Link}
              href={`/user/${letter.author.username}`}
              src={letter.author.image}
            />
          )}

          <div>
            {letter.isAnonymous || !letter.author ? (
              <Text className={classes['header__author-name']}>Anonymous</Text>
            ) : (
              <Anchor
                component={Link}
                href={`/user/${letter.author.username}`}
                className={classes['header__author-name']}
              >
                {letter.author.name || letter.author.username}
              </Anchor>
            )}

            <Text size="xs" className={classes['header__created-at']}>
              Posted{' '}
              {formatDistanceToNow(letter.postedAt ?? letter.createdAt, {
                addSuffix: true,
              })}
              {letter.contentUpdatedAt && <span> (edited)</span>}
            </Text>
          </div>
        </div>

        {(isAuthor || hasPermissionToDelete) && (
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Letter more actions">
                <IconDots size="1.25em" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {isAuthor && (
                <Menu.Item
                  leftSection={<IconEdit size="1em" />}
                  onClick={() => setIsEditable(true)}
                >
                  Edit
                </Menu.Item>
              )}

              <Menu.Item
                color="red"
                leftSection={<IconTrash size="1em" />}
                onClick={deleteModalHandlers.open}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </header>

      {isEditable ? (
        <>
          <Text className={classes.recipient}>To: {letter.recipient}</Text>

          <LetterEditor id={id} body={letter.body} onClose={() => setIsEditable(false)} />
        </>
      ) : (
        <>
          <Text className={classes.recipient}>To: {letter.recipient}</Text>
          <MultilineText text={letter.body} />
        </>
      )}

      <Group my="md">
        <LikeButton
          liked={letter.likes.liked}
          count={letter.likes.count}
          onLike={handleLike}
          size="compact-sm"
          loading={handleLikeMutation.isPending}
        />

        <ReplyButton
          count={letter.replies.count}
          size="compact-sm"
          onClick={() => replySectionRef.current?.focus()}
        />

        <ShareButton
          size="compact-sm"
          link={`${process.env.NEXT_PUBLIC_BASE_URL}/letters/${letter.id}`}
        />
      </Group>

      <section>
        {session ? (
          <ReplyEditor
            ref={replySectionRef}
            letterId={letter.id}
            isDefaultAnonymous={isAuthor && !!letter.isAnonymous}
          />
        ) : (
          <Center mt="lg">
            <Button component={Link} href="/sign-in" variant="default" fullWidth>
              Sign in to reply
            </Button>
          </Center>
        )}

        <Replies
          letterId={letter.id}
          session={session}
          onOpenSignInWarningModal={signInWarningModalHandlers.open}
        />
      </section>

      {(isAuthor || hasPermissionToDelete) && (
        <DeleteLetterModal
          id={letter.id}
          recipient={letter.recipient}
          authorUsername={letter.author?.username}
          opened={deleteModalOpened}
          onClose={deleteModalHandlers.close}
          onDelete={() => router.push('/letters')}
        />
      )}

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandlers.close}
        />
      )}
    </div>
  );
}
