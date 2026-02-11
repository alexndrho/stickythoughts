import { listPublicThoughts } from "./query";
import { filterText } from "@/utils/text";
import { getColorFallback } from "@/utils/color";
import Thoughts from "./thoughts";

export default async function ThoughtsServer() {
  const thoughts = (await listPublicThoughts()).map((thought) => ({
    ...thought,
    message: filterText(thought.message),
    author: filterText(thought.author),
    color: getColorFallback(thought.color),
  }));

  return <Thoughts initialData={thoughts} />;
}
