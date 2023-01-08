const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

const card = process.argv[2] || "examples/weight-conversion";

// Read front and back user scripts
const Front = fs.readFileSync(path.join(card, "Front.js"), "utf-8");
const Back = fs.readFileSync(path.join(card, "Back.js"), "utf-8");

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
  // Send user to back side and pass props
  const before = `
    <script>
      const keys = Object.keys(window);
      </script>
    `;
  const after = `
    <button id="btn">Show back</button>
    <script>
      const data = {};
      Object.entries(window).forEach(([key, value]) => {
        if (!keys.includes(key)) {
          data[key] = value;
        }
      });
      document.getElementById("btn").addEventListener("click", () => {
        window.location.href = "/back?data=" + encodeURIComponent(JSON.stringify(data));
      });
    </script>
  `;
  const page = cardTemplate.replace("{{Card}}", before + frontSide + after);
  res.send(page);
});

app.get("/back", (req, res) => {
  // Render back side with props passed from front side
  const script = `<script>
    const data = JSON.parse(decodeURIComponent('${req.query.data}'));
    Object.entries(data).forEach(([key, value]) => {
      window[key] = value;
    });
    </script>`;
  const page = cardTemplate.replace("{{Card}}", script + backSide);
  res.send(page);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
