const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;

const card = process.argv[2] || "weight-conversion";

const Front = fs.readFileSync(`./examples/${card}/Front.js`, "utf-8");
const Back = fs.readFileSync(`./examples/${card}/Back.js`, "utf-8");

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
  const script = `
    <button id="btn">Show back</button>
    <script>
      function showBack() {
        window.location.href = "/back?props=" + encodeURIComponent(JSON.stringify(window.props));
      }
      document.getElementById("btn").addEventListener("click", showBack);
    </script>
  `;
  const page = cardTemplate.replace("{{Card}}", frontSide + script);
  res.send(page);
});

app.get("/back", (req, res) => {
  // Render back side with props passed from front side
  const script = `<script>window.props = ${req.query.props}</script>`;
  const page = cardTemplate.replace("{{Card}}", script + backSide);
  res.send(page);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
