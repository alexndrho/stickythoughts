import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  thought: ["list", "list-deleted", "delete", "restore", "purge"],
  thread: ["list-deleted", "delete", "restore", "purge"],
  threadComment: ["list-deleted", "delete", "restore", "purge"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  thought: ["list", "list-deleted", "delete", "restore", "purge"],
  thread: ["list-deleted", "delete", "restore", "purge"],
  threadComment: ["list-deleted", "delete", "restore", "purge"],
});

export const moderator = ac.newRole({
  user: ["ban"],
  thought: ["list", "delete"],
  thread: ["delete"],
  threadComment: ["delete"],
});
