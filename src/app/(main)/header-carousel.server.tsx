import { getHighlightedThought } from './query';
import HeaderCarousel from './header-carousel';

export default async function HeaderCarouselServer() {
  const highlightedThought = await getHighlightedThought();

  return <HeaderCarousel initialHighlightedThought={highlightedThought} />;
}
