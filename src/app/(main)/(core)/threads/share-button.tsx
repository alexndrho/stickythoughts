import { Button, type ButtonProps, CopyButton, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconClipboard, IconLink, IconShare } from "@tabler/icons-react";

export interface ShareButtonProps extends ButtonProps {
  link: string;
}

export default function ShareButton({ link, ...props }: ShareButtonProps) {
  return (
    <Menu>
      <Menu.Target>
        <Button
          variant="default"
          leftSection={<IconShare size="1em" />}
          {...props}
        >
          Share
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <CopyButton value={link}>
          {({ copy }) => (
            <Menu.Item
              leftSection={<IconLink size="1em" />}
              onClick={() => {
                copy();
                notifications.show({
                  icon: <IconClipboard size="1em" />,
                  title: "Link copied",
                  message: "The link has been copied to your clipboard",
                });
              }}
            >
              Copy Link
            </Menu.Item>
          )}
        </CopyButton>
      </Menu.Dropdown>
    </Menu>
  );
}
