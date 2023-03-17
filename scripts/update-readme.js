import fs from "fs";
const readme = fs.readFileSync("README.md", "utf8");
const frontTemplate = fs.readFileSync("model/frontTemplate.html", "utf8");
const backTemplate = fs.readFileSync("model/backTemplate.html", "utf8");
const styling = fs.readFileSync("model/styling.css", "utf8");
const newReadme = readme
  .replace(/(?<=### Front Template\n\n```html\n)[\s\S]*?(?=\n```)/, frontTemplate.trim())
  .replace(/(?<=### Back Template\n\n```html\n)[\s\S]*?(?=\n```)/, backTemplate.trim())
  .replace(/(?<=### Styling\n\n```css\n)[\s\S]*?(?=\n```)/, styling.trim());
fs.writeFileSync("README.md", newReadme, "utf8");
