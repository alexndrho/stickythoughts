import { Text } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { IconHeading } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";

import classes from "@/styles/text-editor.module.css";

export interface TextEditorProps {
  editor: Editor | null;
  error?: React.ReactNode | string | null;
}

export default function TextEditor({ editor, error }: TextEditorProps) {
  if (!editor) {
    return null;
  }

  return (
    <div>
      <RichTextEditor
        editor={editor}
        classNames={{
          content: !editor.isEditable
            ? classes["not-editable-content"]
            : undefined,
        }}
        styles={{
          root: {
            border: !editor.isEditable
              ? "none"
              : error
                ? "calc(.0625rem * var(--mantine-scale)) solid var(--mantine-color-error)"
                : undefined,
          },
          toolbar: {
            borderColor: error ? "var(--mantine-color-error)" : undefined,
          },
          content: {
            padding: 0,
          },
        }}
      >
        {editor.isEditable && (
          <RichTextEditor.Toolbar sticky>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Code />
              <RichTextEditor.Control
                aria-label="Heading"
                title="Heading"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <IconHeading size="1em" />
              </RichTextEditor.Control>
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link
                styles={{
                  linkEditorInput: {
                    padding: 0,
                  },
                  linkEditorExternalControl: {
                    display: "none",
                  },
                }}
              />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
        )}

        <RichTextEditor.Content />
      </RichTextEditor>

      {error && (
        <Text size="xs" c="red.8" mt={5}>
          {error}
        </Text>
      )}
    </div>
  );
}
