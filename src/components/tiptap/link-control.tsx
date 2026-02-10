"use client";

import { useState } from "react";

import { Button, Flex, Input, Popover } from "@mantine/core";
import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { IconLink } from "@tabler/icons-react";

export default function LinkControl() {
  const { editor } = useRichTextEditorContext();

  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState("");

  const handleOpen = () => {
    setOpened(true);
    if (editor?.isActive("link")) {
      setValue(editor.getAttributes("link").href || "");
    }
  };

  const handleClose = () => {
    setOpened(false);
    setValue("");
  };

  return (
    <Popover opened={opened} onClose={handleClose}>
      <Popover.Target>
        <RichTextEditor.Control
          aria-label="Link"
          title="Link"
          onClick={handleOpen}
          active={editor?.isActive("link")}
        >
          <IconLink size="1em" />
        </RichTextEditor.Control>
      </Popover.Target>

      <Popover.Dropdown bg="var(--mantine-color-body)">
        <Flex>
          <Input
            autoFocus
            placeholder="https://example.com/"
            styles={{
              input: {
                borderRight: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />

          <Button
            variant="default"
            styles={{
              root: {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              },
            }}
            onClick={() => {
              if (value) {
                editor?.chain().focus().setLink({ href: value }).run();
              }
              setOpened(false);
              setValue("");
            }}
          >
            Save
          </Button>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  );
}
