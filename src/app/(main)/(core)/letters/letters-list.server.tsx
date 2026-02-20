import { listLetters } from './query';
import LettersList from './letters-list';

export default async function LettersListServer() {
  const letters = await listLetters();

  return <LettersList initialData={letters} />;
}
