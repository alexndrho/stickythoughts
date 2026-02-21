'use client';

import { Card, List, Text } from '@mantine/core';

import classes from './letters.module.css';

export default function HeaderNote() {
  return (
    <Card withBorder className={classes['header__note']}>
      <Text className={classes['header__note-title']}>What you can do</Text>

      <List>
        <List.Item>Write a letter for someone you care about.</List.Item>
        <List.Item>Reply to a letter that resonates.</List.Item>
        <List.Item>Prefer privacy? Write anonymously.</List.Item>
      </List>
    </Card>
  );
}
