import { getHighlightedThought } from "@/server/thought";
import HeaderCarousel from "./header-carousel";

export default async function HeaderCarouselServer() {
  const highlightedThought = await getHighlightedThought();

  return (
    <HeaderCarousel highlightedThought={highlightedThought ?? undefined} />
  );
}
