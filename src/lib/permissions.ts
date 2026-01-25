import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  thought: ["delete"],
  thread: ["delete"],
  threadComment: ["delete"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  thought: ["delete"],
  thread: ["delete"],
  threadComment: ["delete"],
});
