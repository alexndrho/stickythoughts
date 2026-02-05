"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Loader, SegmentedControl } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import { IconMessage, IconSearch } from "@tabler/icons-react";

import { searchSegments, type SearchSegmentType } from "@/types/search";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { searchOptions } from "./options";
import type { SearchUserType, SearchLetterType } from "@/types/search";
import classes from "./letters.module.css";

export default function SearchSpotlight() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [filter, setFilter] = useState<SearchSegmentType>("all");

  const { data: searchResults, isLoading } = useQuery(
    searchOptions({
      query: debouncedQuery,
      type: filter,
    }),
  );

  return (
    <Spotlight.Root query={query} onQueryChange={setQuery} shortcut={["t"]}>
      <Spotlight.Search
        placeholder="Search..."
        leftSection={<IconSearch size="1em" />}
      />

      <SegmentedControl
        value={filter}
        onChange={(value) => setFilter(value as SearchSegmentType)}
        data={[...searchSegments]}
      />

      <Spotlight.ActionsList>
        {searchResults && searchResults.length > 0 ? (
          searchResults.map((result, index) =>
            result.type === "users" ? (
              <ActionUser
                key={index}
                result={result as SearchUserType}
                router={router}
              />
            ) : (
              <ActionLetter
                key={index}
                result={result as SearchLetterType}
                router={router}
              />
            ),
          )
        ) : isLoading && debouncedQuery ? (
          <Spotlight.Empty>
            <Loader />
          </Spotlight.Empty>
        ) : (
          <Spotlight.Empty>Nothing found...</Spotlight.Empty>
        )}
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
}

function ActionUser({
  result,
  router,
}: {
  result: SearchUserType;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Spotlight.Action
      role="link"
      leftSection={<Avatar src={result.image ?? undefined} size="sm" />}
      label={
        result.name ? `${result.name} (${result.username})` : result.username
      }
      onClick={() => router.push(`/user/${result.username}`)}
      className={classes["spotlight__action-overide"]}
    />
  );
}

function ActionLetter({
  result,
  router,
}: {
  result: SearchLetterType;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Spotlight.Action
      role="link"
      leftSection={<IconMessage />}
      label={result.title}
      onClick={() => router.push(`/letters/${result.id}`)}
      className={classes["spotlight__action-overide"]}
    />
  );
}
