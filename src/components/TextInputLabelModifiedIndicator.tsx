import { Text } from "@mantine/core";

import classes from "@/styles/text-input-label-modified-indicator.module.css";

export interface TextInputLabelModifiedIndicatorProps {
  label: React.ReactNode;
  modified?: boolean;
}

export default function TextInputLabelModifiedIndicator({
  label,
  modified,
}: TextInputLabelModifiedIndicatorProps) {
  return (
    <>
      {label}
      {modified && (
        <>
          {" "}
          <Text span size="xs" className={classes["modified-label"]}>
            (modified)
          </Text>
        </>
      )}
    </>
  );
}
