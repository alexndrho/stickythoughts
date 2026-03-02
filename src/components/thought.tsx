import { Card, type CardProps, Group, Skeleton, Text, Tooltip } from '@mantine/core';

import { getFormattedDate } from '@/utils/date';
import { filterText } from '@/utils/text';
import classes from '@/styles/components/thought.module.css';

export interface ThoughtProps extends CardProps {
  message?: string;
  author?: string;
  color?: string;
  createdAt?: Date;
  fluid?: boolean;
  loading?: boolean;
}

export default function Thought({
  message,
  author,
  color,
  createdAt,
  fluid = false,
  loading = false,
  className,
  ...rest
}: ThoughtProps) {
  const resolvedColor = loading ? undefined : color;
  const resolvedLabel = createdAt ? getFormattedDate(createdAt) : null;
  const resolvedClassName = [
    classes.thought,
    !resolvedColor ? classes['thought--empty'] : null,
    fluid ? classes['thought--fluid'] : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <Card
      component="article"
      bg={resolvedColor ? `${resolvedColor}.6` : undefined}
      className={resolvedClassName}
      withBorder={!resolvedColor}
      {...rest}
    >
      {!loading ? (
        <>
          {message != null && <Text lineClamp={9}>{filterText(message)}</Text>}

          {author != null && (
            <Text
              lineClamp={1}
              className={classes['thought__author']}
            >{`\u2013 ${filterText(author)}`}</Text>
          )}
        </>
      ) : (
        <>
          <div>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} mb={8} height={16} radius="sm" />
            ))}
            <Skeleton height={16} w="65%" radius="sm" />
          </div>

          <Group justify="end">
            <Skeleton height={16} w="30%" radius="sm" />
          </Group>
        </>
      )}
    </Card>
  );

  if (!resolvedLabel) {
    return content;
  }

  return (
    <Tooltip label={resolvedLabel} events={{ hover: true, focus: true, touch: true }}>
      {content}
    </Tooltip>
  );
}
