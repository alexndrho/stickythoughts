"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Flex,
  Group,
  Input,
  Kbd,
  Loader,
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
  thoughtInfiniteOptions,
  thoughtSearchInfiniteOptions,
} from "@/app/(core)/options";
import Thoughts from "@/app/(core)/Thoughts";
import SendThoughtModal from "./SendThoughtModal";
import InfiniteScroll from "@/components/InfiniteScroll";
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
  } = useInfiniteQuery(thoughtInfiniteOptions);

  const {
    data: searchData,
    fetchNextPage: fetchSearchNextPage,
    hasNextPage: hasSearchNextPage,
    isFetching: isSearchFetching,
    isRefetching: isSearchRefetching,
    isRefetchError: isSearchRefetchError,
  } = useInfiniteQuery(thoughtSearchInfiniteOptions(searchBarValue));

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
        icon: <IconCheck className={classes["color-swatch__icon"]} />,
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
    <Box py="md">
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
        <Flex direction="column" justify="center" align="center">
          <Title mb="md" ta="center">
            A place where you can freely express yourself
          </Title>

          <Skeleton w="auto" h="auto" visible={!thoughtsCountIsFetched}>
            <Group gap={5}>
              <IconMessage />

              <Text fz="md" fw="bold">
                {thoughtsCountData?.toLocaleString()}{" "}
                <Text span c="blue" inherit>
                  thoughts
                </Text>{" "}
                submitted
              </Text>
            </Group>
          </Skeleton>
        </Flex>

        <Flex my="lg" gap="md">
          <Input
            ref={searchRef}
            leftSection={<IconSearch size="1rem" />}
            rightSection={<Kbd>t</Kbd>}
            placeholder="Search for an author"
            onChange={(e) => setSearchBarValue(e.currentTarget.value)}
            styles={() => ({
              wrapper: {
                flex: 1,
              },
              rightSection: { pointerEvents: "none" },
            })}
          />

          <Tooltip label={`Press (s) to stick`} position="bottom">
            <Button rightSection={<IconMessage size="1em" />} onClick={open}>
              Stick a thought
            </Button>
          </Tooltip>
        </Flex>

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
    </Box>
  );
}
