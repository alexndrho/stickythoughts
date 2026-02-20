import {
  RegExpMatcher,
  TextCensor,
  asteriskCensorStrategy,
  englishDataset,
  englishRecommendedTransformers,
  pattern,
} from 'obscenity';

import badwords from '@/config/badwords.json';

const englishData = englishDataset.build();

// Start IDs after the English dataset's terms
const startId = englishData.blacklistedTerms.length;

const customBlacklistedTerms = badwords.filipino.map((word, index) => ({
  id: startId + index,
  pattern: pattern`${word}`,
}));

export const matcher = new RegExpMatcher({
  ...englishData,
  blacklistedTerms: [...englishData.blacklistedTerms, ...customBlacklistedTerms],
  ...englishRecommendedTransformers,
});

export const censor = new TextCensor().setStrategy(asteriskCensorStrategy());
