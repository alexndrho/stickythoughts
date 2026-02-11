import { countPublicThoughts } from "./query";
import ThoughtCountClient from "./thought-count.client";

export default async function ThoughtCountServer() {
  const thoughtCount = await countPublicThoughts();

  return <ThoughtCountClient initialCount={thoughtCount} />;
}
