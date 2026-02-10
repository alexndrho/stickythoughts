import { Card, type CardProps, Text, Tooltip } from "@mantine/core";

import { getFormattedDate } from "@/utils/date";
import { filterText } from "@/utils/text";
import classes from "./home.module.css";

export interface ThoughtProps extends CardProps {
  message: string;
  author: string;
  color?: string;
  createdAt?: Date;
  fluid?: boolean;
}

export default function Thought({
  message,
  author,
  color,
  createdAt,
  fluid = false,
  className,
  ...rest
}: ThoughtProps) {
  const resolvedLabel = createdAt ? getFormattedDate(createdAt) : null;
  const resolvedClassName = [
    classes.thought,
    !color ? classes["thought--empty"] : null,
    fluid ? classes["thought--fluid"] : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <Card
      component="article"
      bg={color ? `${color}.6` : undefined}
      className={resolvedClassName}
      withBorder={!color}
      {...rest}
    >
      <Text lineClamp={9}>{filterText(message)}</Text>

      <Text
        lineClamp={1}
        className={classes["thought__author"]}
      >{`\u2013 ${filterText(author)}`}</Text>
    </Card>
  );

  if (!resolvedLabel) {
    return content;
  }

  return <Tooltip label={resolvedLabel}>{content}</Tooltip>;
}
