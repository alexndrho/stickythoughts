import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  thought: ["moderate"],
  thread: ["moderate"],
  threadComment: ["moderate"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  thought: ["moderate"],
  thread: ["moderate"],
  threadComment: ["moderate"],
});
