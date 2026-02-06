"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Group,
  Input,
  Kbd,
  Loader,
  Paper,
  Skeleton,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedState, useDisclosure, useHotkeys } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconMessage, IconSearch, IconX } from "@tabler/icons-react";

import {
  thoughtCountOptions,
  thoughtsInfiniteOptions,
  thoughtsSearchInfiniteOptions,
} from "@/app/(main)/options";
import Thoughts from "@/app/(main)/thoughts";
import SendThoughtModal from "./send-thought-modal";
import InfiniteScroll from "@/components/infinite-scroll";
import classes from "./home.module.css";

export default function Content() {
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

  const { data: thoughtsCountData, isFetched: thoughtsCountIsFetched } =
    useQuery(thoughtCountOptions);

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
    <div className={classes.container}>
      <Paper withBorder className={classes.header}>
        <div>
          <Text size="xs" className={classes["header__eyebrow"]}>
            STICKYTHOUGHTS
          </Text>

          <Title className={classes["header__title"]}>
            A place where you can freely express yourself
          </Title>

          <Text className={classes["header__description"]}>
            Share a thought, start a letter, or find the voices you care about.
            Everything begins with a line.
          </Text>

          <Skeleton
            visible={!thoughtsCountIsFetched}
            component={Card}
            className={classes["header__skeleton-wrapper-thought-counter"]}
          >
            <IconMessage
              size="1em"
              className={classes["header__thought-counter-icon"]}
            />

            <Text className={classes["header__thought-counter"]}>
              {thoughtsCountData ? thoughtsCountData.toLocaleString() : 0}{" "}
              <Text c="blue" span inherit>
                thoughts
              </Text>{" "}
              submitted
            </Text>
          </Skeleton>
        </div>

        <div className={classes["header__notes"]}>
          <Card withBorder className={classes["header__note"]}>
            <Text className={classes["header__note-title"]}>
              Stick a thought
            </Text>
            <Text size="sm" className={classes["header__note-description"]}>
              Share a feeling, a moment, or a question. Short or long, it&apos;s
              welcome.
            </Text>
          </Card>

          <Card withBorder className={classes["header__note"]}>
            <Text className={classes["header__note-title"]}>
              Find your people
            </Text>
            <Text size="sm" className={classes["header__note-description"]}>
              Search by author to follow voices you care about and discover new
              ones.
            </Text>
          </Card>
        </div>
      </Paper>

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
        {searchBarValue.length > 0
          ? searchData && (
              <Thoughts
                thoughts={searchData.pages.reduce((acc, page) =>
                  acc.concat(page),
                )}
              />
            )
          : thoughtsData && (
              <Thoughts
                thoughts={thoughtsData.pages.reduce(
                  (acc, page) => acc.concat(page),
                  [],
                )}
              />
            )}
      </InfiniteScroll>

      <SendThoughtModal open={messageOpen} onClose={close} />
    </div>
  );
}
