import fetch from "node-fetch";
import fs from "fs";

const modelName = "BasicJS.dev";

const front = fs.readFileSync("model/frontTemplate.html", "utf8");
const back = fs.readFileSync("model/backTemplate.html", "utf8");
const styling = fs.readFileSync("model/styling.css", "utf8");

await fetch("http://localhost:8765", {
  method: "POST",
  body: JSON.stringify({
    action: "updateModelTemplates",
    version: 6,
    params: {
      model: {
        name: modelName,
        templates: {
          "Card 1": {
            Front: front,
            Back: back,
          },
        },
      },
    },
  }),
})
  .then((res) => res.json())
  .then(({ error }) => {
    if (error) {
      console.error("Failed to update model with error:", error);
      process.exit(1);
    }
  });

await fetch("http://localhost:8765", {
  method: "POST",
  body: JSON.stringify({
    action: "updateModelStyling",
    version: 6,
    params: {
      model: {
        name: modelName,
        css: styling,
      },
    },
  }),
})
  .then((res) => res.json())
  .then(({ error }) => {
    if (error) {
      console.error("Failed to update model with error:", error);
      process.exit(1);
    }
  });
