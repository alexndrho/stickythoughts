import { Box, Text, Tooltip } from "@mantine/core";

import { getFormattedDate } from "@/utils/date";
import { filterText } from "@/utils/text";
import classes from "./home.module.css";

export interface NoteProps {
  message: string;
  author: string;
  color: string;
  createdAt: Date;
}

export default function Thought({
  message,
  author,
  color,
  createdAt,
}: NoteProps) {
  return (
    <Tooltip label={getFormattedDate(createdAt)}>
      <Box role="article" bg={`${color}.6`} className={classes.thought}>
        <Text lineClamp={9}>{filterText(message)}</Text>

        <Text
          lineClamp={1}
          className={classes["thought__author"]}
        >{`-${filterText(author)}`}</Text>
      </Box>
    </Tooltip>
  );
}
