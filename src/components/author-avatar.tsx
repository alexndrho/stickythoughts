import { forwardRef } from 'react';
import { Avatar, createPolymorphicComponent, type AvatarProps } from '@mantine/core';
import { IconEyeOff } from '@tabler/icons-react';

export interface AuthorAvatarProps extends AvatarProps {
  isAnonymous?: boolean;
}

const AuthorAvatarComponent = forwardRef<HTMLDivElement, AuthorAvatarProps>(
  ({ isAnonymous, ...props }, ref) => (
    <Avatar ref={ref} {...props}>
      {isAnonymous && <IconEyeOff />}
    </Avatar>
  ),
);

AuthorAvatarComponent.displayName = 'AuthorAvatar';

const AuthorAvatar = createPolymorphicComponent<'div', AuthorAvatarProps>(AuthorAvatarComponent);

export default AuthorAvatar;
