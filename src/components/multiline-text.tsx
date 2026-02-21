import { Box, Text, type MantineSpacing } from '@mantine/core';
import classes from '@/styles/components/multiline-text.module.css';

export interface MultilineTextProps {
  text: string;
  mt?: MantineSpacing;
}

export default function MultilineText({ text, mt }: MultilineTextProps) {
  return (
    <Box mt={mt} className={classes['multiline-text']}>
      {text.split('\n').map((line, index) => (
        <Text key={index} className={classes['multiline-text__line']}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
