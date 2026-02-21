import type { Prisma } from '@/generated/prisma/client';
import type { SerializeDates } from './serialization';

export const searchSegments = [
  { label: 'All', value: 'all' },
  { label: 'Recipients', value: 'recipients' },
  { label: 'Users', value: 'users' },
] as const;

export type SearchSegmentType = (typeof searchSegments)[number]['value'];

export type SearchResultMap = {
  users: SearchUserType[];
  recipients: SearchLetterType[];
  all: SearchAllType[];
};

export type SearchResultDTOMap = {
  users: SearchUserDTO[];
  recipients: SearchLetterDTO[];
  all: SearchAllDTO[];
};

export type SearchResult = {
  type: SearchSegmentType;
};

export type SearchUserType = Prisma.UserGetPayload<{
  select: {
    name: true;
    displayUsername: true;
    username: true;
    image: true;
  };
}> &
  SearchResult;

export type SearchLetterType = Prisma.LetterGetPayload<{
  select: {
    id: true;
    recipient: true;
  };
}> &
  SearchResult;

export type SearchAllType = SearchUserType | SearchLetterType;

export type SearchUserDTO = SerializeDates<SearchUserType>;
export type SearchLetterDTO = SerializeDates<SearchLetterType>;
export type SearchAllDTO = SerializeDates<SearchAllType>;
