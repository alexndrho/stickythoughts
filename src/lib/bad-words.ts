// import { Profanity, ProfanityOptions } from "@2toad/profanity";

// import badwords from "@/config/badwords.json";

// const options = new ProfanityOptions();
// options.grawlix = "*****";

// export const profanity = new Profanity(options);
// profanity.addWords([...badwords.filipino]);

import { Filter } from "bad-words";

import badwords from "@/config/badwords.json";

export const filter = new Filter({ list: badwords.filipino });
