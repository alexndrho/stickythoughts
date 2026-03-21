import { Card, type CardProps, Group, Skeleton, Text, Tooltip } from '@mantine/core';

import type { ThoughtPattern } from '@/generated/prisma/enums';
import { getFormattedDate } from '@/utils/date';
import { getThoughtPatternStyle } from '@/utils/thought';
import { filterText } from '@/utils/text';
import classes from '@/styles/components/thought.module.css';

export interface ThoughtProps extends CardProps {
  thought?: {
    message: string;
    author: string;
    color?: string;
    pattern?: ThoughtPattern;
    createdAt?: Date;
  };
  fluid?: boolean;
  loading?: boolean;
}

export default function Thought({
  thought,
  fluid = false,
  loading = false,
  className,
  style,
  ...rest
}: ThoughtProps) {
  const resolvedColor = loading ? undefined : thought?.color;
  const resolvedLabel = thought?.createdAt ? getFormattedDate(thought.createdAt) : null;
  const resolvedClassName = [
    classes.thought,
    !resolvedColor ? classes['thought--empty'] : null,
    fluid ? classes['thought--fluid'] : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const patternStyle = getThoughtPatternStyle(thought?.pattern);
  const backgroundStyle: React.CSSProperties = resolvedColor
    ? { backgroundColor: `var(--mantine-color-${resolvedColor}-5)`, ...patternStyle }
    : {};

  const content = (
    <Card
      component="article"
      className={resolvedClassName}
      withBorder={!resolvedColor}
      style={{ ...backgroundStyle, ...style }}
      {...rest}
    >
      {!loading ? (
        <>
          {thought?.message != null && <Text lineClamp={9}>{filterText(thought.message)}</Text>}

          {thought?.author != null && (
            <Text
              lineClamp={1}
              className={classes['thought__author']}
            >{`\u2013 ${filterText(thought.author)}`}</Text>
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
