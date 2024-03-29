import fs from "fs";
import express from "express";
import path from "path";
const app = express();
const port = 3000;

function ankiStyleHtmlEncode(s) {
  // replace all reserved characters with their html entity
  const res = s.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
  // replace leading spaces with &nbsp;
  return res
    .split("\n")
    .map((line) => {
      const n = line.match(/^ */)[0].length;
      if (n > 1) {
        return "&nbsp;".repeat(n - 1) + line.slice(n - 1);
      }
      return line;
    })
    .join("<br>");
}

const card = process.argv[2] || "examples/weight-conversion";

// Read front and back user scripts
const FrontScript = fs.readFileSync(path.join(card, "Front.js"), "utf-8");
const BackScript = fs.readFileSync(path.join(card, "Back.js"), "utf-8");
const Front = ankiStyleHtmlEncode(FrontScript);
const Back = ankiStyleHtmlEncode(BackScript);

// Prepare front and back sides
const frontSide = fs
  .readFileSync("./model/frontTemplate.html", "utf-8")
  .replace("{{Front}}", Front)
  .replace("{{Back}}", Back);
const backSide = fs
  .readFileSync("./model/backTemplate.html", "utf-8")
  .replace("{{FrontSide}}", frontSide)
  .replace("{{Front}}", Front)
  .replace("{{Back}}", Back);

const cardTemplate = fs.readFileSync("./test/cardTemplate.html", "utf-8");

app.use(express.static("model"));

app.get("/", (req, res) => {
  res.redirect("/front");
});

app.get("/front", (req, res) => {
  // Add button to card which sends user to back side, passing all the
  // variables created by the front side user script
  const before = `<script>const keys = Object.keys(window);</script>`;
  const after = `
    <button id="btn">Show back</button>
    <script>
      const vars = {};
      Object.entries(window).forEach(([key, value]) => {
        if (!keys.includes(key)) {
          vars[key] = value;
        }
      });
      document.getElementById("btn").addEventListener("click", () => {
        window.location.href = "/back?vars=" + encodeURIComponent(JSON.stringify(vars));
      });
    </script>
  `;
  const card = before + frontSide + after;
  res.send(cardTemplate.replace("{{Card}}", card));
});

app.get("/back", (req, res) => {
  // Render back side with vars passed from the front side
  const script = `<script>
    const vars = JSON.parse(decodeURIComponent('${req.query.vars}'));
    Object.entries(vars).forEach(([key, value]) => {
      window[key] = value;
    });
    </script>`;
  const page = cardTemplate.replace("{{Card}}", script + backSide);
  res.send(page);
});

app.listen(port, () => console.log(`Test environment open at http://localhost:${port}`));
