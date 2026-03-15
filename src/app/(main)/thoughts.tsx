'use client';

import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Input, Kbd, SegmentedControl, Tooltip } from '@mantine/core';
import { useDebouncedState, useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconMessage, IconSearch, IconX } from '@tabler/icons-react';

import { thoughtsInfiniteOptions, thoughtsSearchInfiniteOptions } from '@/app/(main)/options';
import Thought from '@/components/thought';
import SendThoughtModal from './send-thought-modal';
import InfiniteScroll from '@/components/infinite-scroll';
import classes from './home.module.css';
import ThoughtsLoader from './thoughts-loader';
import type { PublicThought, ThoughtsSort } from '@/types/thought';

export default function HomeThoughts({ initialData }: { initialData?: PublicThought[] }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchBarValue, setSearchBarValue] = useDebouncedState('', 250);
  const [messageOpen, { open, close, toggle }] = useDisclosure(false);
  const [sortOrder, setSortOrder] = useState<ThoughtsSort>('newest');
  const [randomSeed, setRandomSeed] = useState(() => crypto.randomUUID());

  const {
    data: thoughtsData,
    fetchNextPage: fetchThoughtsNextPage,
    hasNextPage: hasThoughtsNextPage,
    isFetching: isThoughtsFetching,
    isRefetching: isThoughtsRefetching,
    isRefetchError: isThoughtsError,
  } = useInfiniteQuery({
    ...thoughtsInfiniteOptions({
      sort: sortOrder,
      seed: sortOrder === 'random' ? randomSeed : undefined,
    }),
    initialData:
      initialData !== undefined && sortOrder === 'newest'
        ? {
            pages: [initialData],
            pageParams: [undefined],
          }
        : undefined,
  });

  const {
    data: searchData,
    fetchNextPage: fetchSearchNextPage,
    hasNextPage: hasSearchNextPage,
    isFetching: isSearchFetching,
    isRefetching: isSearchRefetching,
    isRefetchError: isSearchRefetchError,
  } = useInfiniteQuery(
    thoughtsSearchInfiniteOptions({
      search: searchBarValue,
      sort: sortOrder,
      seed: sortOrder === 'random' ? randomSeed : undefined,
    }),
  );

  const focusSearchBar = () => {
    searchRef.current?.focus();
  };

  useHotkeys([
    ['t', focusSearchBar],
    ['s', toggle],
  ]);

  useEffect(() => {
    if (isThoughtsRefetching || isSearchRefetching) {
      notifications.show({
        id: 'refetch-thoughts',
        loading: true,
        title: 'Fetching new thoughts',
        message: 'Please wait...',
        autoClose: false,
        withCloseButton: false,
      });
    } else if (!isThoughtsError || !isSearchRefetchError) {
      notifications.update({
        id: 'refetch-thoughts',
        loading: false,
        icon: <IconCheck size="1em" />,
        title: 'Thoughts updated',
        message: 'New thoughts have been fetched',
        autoClose: 4000,
        withCloseButton: true,
      });
    } else {
      notifications.update({
        id: 'refetch-thoughts',
        loading: false,
        color: 'red',
        icon: <IconX size="1em" />,
        title: 'Failed to reload thoughts',
        message: 'Please try again later',
        autoClose: 4000,
        withCloseButton: true,
      });
    }
  }, [isThoughtsRefetching, isSearchRefetching, isThoughtsError, isSearchRefetchError]);

  useEffect(() => {
    return () => {
      // Clean up notification on unmount
      notifications.update({
        id: 'refetch-thoughts',
        loading: false,
        autoClose: 0,
        message: '',
      });
    };
  }, []);

  const hasSearch = searchBarValue.length > 0;
  const visibleThoughts = hasSearch
    ? searchData?.pages.reduce((acc, page) => acc.concat(page), [])
    : thoughtsData?.pages.reduce((acc, page) => acc.concat(page), []);
  const isActiveListLoading = hasSearch ? isSearchFetching : isThoughtsFetching;

  return (
    <>
      <div className={classes['actions-bar']}>
        <Input
          ref={searchRef}
          leftSection={<IconSearch size="1rem" />}
          rightSection={<Kbd>t</Kbd>}
          placeholder="Search for an author"
          onChange={(e) => setSearchBarValue(e.currentTarget.value)}
          className={classes['actions-bar__search-bar']}
        />

        <SegmentedControl
          data={[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
            { label: 'Random', value: 'random' },
          ]}
          value={sortOrder}
          onChange={(value) => {
            if (value === 'random') {
              setRandomSeed(crypto.randomUUID());
            }
            setSortOrder(value as ThoughtsSort);
          }}
        />

        <Tooltip label="Press (s) to stick">
          <Button
            rightSection={<IconMessage size="1em" />}
            onClick={open}
            className={classes['send-thought-button']}
          >
            Stick a thought
          </Button>
        </Tooltip>
      </div>

      <InfiniteScroll
        onLoadMore={() => {
          if (hasSearch) {
            fetchSearchNextPage();
          } else {
            fetchThoughtsNextPage();
          }
        }}
        hasNext={hasSearch ? hasSearchNextPage : hasThoughtsNextPage}
        loading={isActiveListLoading}
        loader={<ThoughtsLoader />}
      >
        <section className={classes.thoughts}>
          {visibleThoughts?.map((thought) => (
            <Thought
              key={thought.id}
              message={thought.message}
              author={thought.author}
              color={thought.color}
              createdAt={thought.createdAt}
            />
          ))}
        </section>
      </InfiniteScroll>

      <SendThoughtModal open={messageOpen} onClose={close} />
    </>
  );
}
