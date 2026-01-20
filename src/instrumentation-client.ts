import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/thoughts",
      method: "POST",
    },
  ],
});
