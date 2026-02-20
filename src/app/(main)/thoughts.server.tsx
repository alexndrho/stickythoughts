import { listPublicThoughts } from './query';
import Thoughts from './thoughts';

export default async function ThoughtsServer() {
  const thoughts = await listPublicThoughts();

  return <Thoughts initialData={thoughts} />;
}
