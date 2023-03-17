import fetch from "node-fetch";
import fs from "fs";
import util from "util";
import { exec } from "child_process";
const execPromise = async (command) => {
  const { stdout, stderr } = await util.promisify(exec)(command);
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout;
};

// Confirm there are no uncommitted changes in the repo
const uncommitted = await execPromise("git status --porcelain | grep model | wc -l");
if (parseInt(uncommitted.trim()) > 0) {
  throw new Error(
    "There are uncommitted changes in the model directory. Please commit them before deploying."
  );
}

// Get the current commit hash
const commitHash = await execPromise("git rev-parse HEAD");
const shortCommitHash = commitHash.slice(0, 7);
if (shortCommitHash.length !== 7) {
  throw new Error("Failed to get current commit hash");
}

// today's datetime in YYYY-MM-DD-HH-MM-SS format
const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
const modelName = `BasicJS.${datetime}.${shortCommitHash}`;
const Front = fs.readFileSync("model/frontTemplate.html", "utf8");
const Back = fs.readFileSync("model/backTemplate.html", "utf8");
const css = fs.readFileSync("model/styling.css", "utf8");

await fetch("http://localhost:8765", {
  method: "POST",
  body: JSON.stringify({
    action: "createModel",
    version: 6,
    params: {
      modelName,
      css,
      inOrderFields: ["Front", "Back"],
      isCloze: false,
      cardTemplates: [
        {
          Front,
          Back,
        },
      ],
    },
  }),
})
  .then((res) => res.json())
  .then(({ result, error }) => {
    if (error) {
      console.error("Failed to update model with error:", error);
    } else {
      console.log("Created model with name:", result.name);
    }
  });

// await fetch("http://localhost:8765", {
//   method: "POST",
//   body: JSON.stringify({
//     action: "updateModelStyling",
//     version: 6,
//     params: {
//       model: {
//         name: modelName,
//         css: styling,
//       },
//     },
//   }),
// })
//   .then((res) => res.json())
//   .then(({ error }) => {
//     if (error) {
//       console.error("Failed to update model with error:", error);
//       process.exit(1);
//     }
//   });
