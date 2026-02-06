"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Button,
  Group,
  Input,
  Kbd,
  Loader,
  Tooltip,
} from "@mantine/core";
import { useDebouncedState, useDisclosure, useHotkeys } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconMessage, IconSearch, IconX } from "@tabler/icons-react";

import {
  thoughtsInfiniteOptions,
  thoughtsSearchInfiniteOptions,
} from "@/app/(main)/options";
import Thought from "./thought";
import SendThoughtModal from "./send-thought-modal";
import InfiniteScroll from "@/components/infinite-scroll";
import classes from "./home.module.css";

export default function HomeThoughts() {
  const [messageOpen, { open, close, toggle }] = useDisclosure(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const [searchBarValue, setSearchBarValue] = useDebouncedState("", 250);

  const {
    data: thoughtsData,
    fetchNextPage: fetchThoughtsNextPage,
    hasNextPage: hasThoughtsNextPage,
    isFetching: isThoughtsFetching,
    isRefetching: isThoughtsRefetching,
    isRefetchError: isThoughtsError,
  } = useInfiniteQuery(thoughtsInfiniteOptions);

  const {
    data: searchData,
    fetchNextPage: fetchSearchNextPage,
    hasNextPage: hasSearchNextPage,
    isFetching: isSearchFetching,
    isRefetching: isSearchRefetching,
    isRefetchError: isSearchRefetchError,
  } = useInfiniteQuery(thoughtsSearchInfiniteOptions(searchBarValue));

  const focusSearchBar = () => {
    searchRef.current?.focus();
  };

  useHotkeys([
    ["t", focusSearchBar],
    ["s", toggle],
  ]);

  useEffect(() => {
    if (isThoughtsRefetching || isSearchRefetching) {
      notifications.show({
        id: "refetch-thoughts",
        loading: true,
        title: "Fetching new thoughts",
        message: "Please wait...",
        autoClose: false,
        withCloseButton: false,
      });
    } else if (!isThoughtsError || !isSearchRefetchError) {
      notifications.update({
        id: "refetch-thoughts",
        loading: false,
        icon: <IconCheck size="1em" />,
        title: "Thoughts updated",
        message: "New thoughts have been fetched",
        autoClose: 4000,
        withCloseButton: true,
      });
    } else {
      notifications.update({
        id: "refetch-thoughts",
        loading: false,
        color: "red",
        icon: <IconX size="1em" />,
        title: "Failed to reload thoughts",
        message: "Please try again later",
        autoClose: 4000,
        withCloseButton: true,
      });
    }
  }, [
    isThoughtsRefetching,
    isSearchRefetching,
    isThoughtsError,
    isSearchRefetchError,
  ]);

  useEffect(() => {
    return () => {
      // Clean up notification on unmount
      notifications.update({
        id: "refetch-thoughts",
        loading: false,
        autoClose: 0,
        message: "",
      });
    };
  }, []);

  return (
    <>
      <div className={classes["actions-bar"]}>
        <Input
          ref={searchRef}
          leftSection={<IconSearch size="1rem" />}
          rightSection={<Kbd>t</Kbd>}
          placeholder="Search for an author"
          onChange={(e) => setSearchBarValue(e.currentTarget.value)}
          className={classes["actions-bar__search-bar"]}
        />

        <Tooltip label="Press (s) to stick" position="bottom">
          <Button rightSection={<IconMessage size="1em" />} onClick={open}>
            Stick a thought
          </Button>
        </Tooltip>
      </div>

      <InfiniteScroll
        onLoadMore={() => {
          if (searchBarValue.length > 0) {
            fetchSearchNextPage();
          } else {
            fetchThoughtsNextPage();
          }
        }}
        hasNext={
          searchBarValue.length > 0 ? hasSearchNextPage : hasThoughtsNextPage
        }
        loading={isThoughtsFetching || isSearchFetching}
        loader={
          <Group mt="xl" justify="center">
            <Loader />
          </Group>
        }
      >
        <div className={classes.thoughts}>
          {searchBarValue.length > 0
            ? searchData?.pages
                .reduce((acc, page) => acc.concat(page), [])
                .map((thought) => (
                  <Thought
                    key={thought.id}
                    message={thought.message}
                    author={thought.author}
                    color={thought.color}
                    createdAt={thought.createdAt}
                  />
                ))
            : thoughtsData?.pages
                .reduce((acc, page) => acc.concat(page), [])
                .map((thought) => (
                  <Thought
                    key={thought.id}
                    message={thought.message}
                    author={thought.author}
                    color={thought.color}
                    createdAt={thought.createdAt}
                  />
                ))}
        </div>
      </InfiniteScroll>

      <SendThoughtModal open={messageOpen} onClose={close} />
    </>
  );
}
