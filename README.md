# AnkiJS

An Anki note type which allows you to write your cards in JavaScript.

## Create the note type

1. Create a new note type by cloning the Basic note type.
2. Fill in it's card template with the [front template](#front-template), [back template](#back-template), and [styling](#styling) below.

## Create a card

The front and back fields can either be text or Javascript. If it's text, the text will be displayed as is. If it's javascript, the script is evaluated and if the result is a value, it will be used as the field value.

Example 1

Front

```
What's today's date?
```

Back

```
new Date().toLocaleDateString()
```

A big gotcha to keep in mind is that the script on the front side is run twice. Once when the front side is shown and once when the back side is shown. So if you have a script that generates a random number, the number will be different on the front and back side.

To get around this, the note type includes a `get` and `set` function (defined [here](model/frontTemplate.html)). The `get` function takes a key and an optional default value. If the key doesn't exist, the default value is saved and returned. If the key exists, the saved value is returned. So if you can use `get` in your front script, it will set a value when the front side is shown and then retrieve it when the back side is shown.

Example 2

Front

```
const kg = get("kg", Math.ceil(Math.random() * 100));
`What is ${kg} kg in lbs?`;
```

Back

```
const kgToLbs = 2.20462;
const kg = get("kg");
const lbs = Math.floor(kg * kgToLbs);
`${lbs} lbs`;
```

I notice with some cards, I'm just pattern matching based on e.g. the word order. This was a main motivation for this note type: to be able to randomize the prompt on the front of the card. The `random` object is included to help define cards like these. It has two methods: `shuffle` and `choice`. `shuffle` takes an array and returns a new array with the elements in a random order. `choice` takes an array and returns a random element from the array.

Example 3

Front

```
const [city1, city2] = get("cities", random.shuffle(["Toronto", "Vancouver"]));
`Which has a larger population? ${city1} or ${city2}?`
```

Back

```
Toronto
```

## Model

### Front Template

```html
<script>
  window.cardState = window.cardState || {};
  function get(key, initial) {
    const v = window.cardState[key];
    window.cardState[key] = v === undefined ? initial : v;
    return window.cardState[key];
  }
  function set(key, value) {
    window.cardState[key] = value;
    return window.cardState[key];
  }
  // random([lower=0], [upper=1], [floating])
  const random = (...args) => {
    let lower;
    let upper;
    let floating;
    if (typeof args[0] === "boolean") {
      lower = 0;
      upper = 1;
      floating = args[0];
    } else if (typeof args[1] === "boolean") {
      lower = args[0];
      upper = 1;
      floating = args[1];
    } else {
      lower = args[0] || 0;
      upper = args[1] || 1;
      floating = args[2] || false;
    }
    if (floating) {
      return Math.random() * (upper - lower) + lower;
    } else {
      return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }
  };
  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  };
  const times = (count, fn) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(fn(i));
    }
    return result;
  };
  function evalUserscript(side) {
    log(`Starting evalUserscript for ${side}`);
    if (side !== "front" && side !== "back") {
      throw new Error(`Invalid side "${side}"`);
    }
    let html, code, content;
    try {
      log("Get and evaluate user script");
      html = document.querySelector(`.${side}.userscript`).innerHTML.trim();
      code = new DOMParser().parseFromString(html.replace(/<br>/g, "\n"), "text/html")
        .documentElement.textContent;
      log("Parsed code:", code);
      content = eval(code);
      log("Evaluated content:", content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // If the userscript is invalid javascript, we assume it's just text
        // and add it to the DOM as is
        log("Invalid script, adding as text");
        content = code;
      } else {
        // Otherwise, we display the error
        log(`Error evaluating script: ${error.message + error.stack}`);
        document.querySelector(".logs").style.display = "block";
        return;
      }
    }
    // If the script returned content, add it to the DOM
    const el = document.querySelector(`.${side}.side`);
    if (!el || !content) {
      log("No element or content, returning");
      return;
    } else if (content instanceof Node) {
      log("Content is a node, appending");
      el.appendChild(content);
    } else if (typeof content === "string") {
      log("Content is a string, setting innerHTML");
      el.innerHTML = content;
    } else {
      log("Content is not a node or string, returning");
      return;
    }
    log("Finished evalUserscript");
  }
  function log(...args) {
    const el = document.querySelector(".logs");
    if (!el) {
      return;
    }
    const div = document.createElement("div");
    const prefix = document.createElement("span");
    prefix.classList.add("prefix");
    prefix.textContent = "> ";
    div.appendChild(prefix);
    const message = document.createElement("span");
    message.classList.add("message");
    message.textContent = args
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
      .join(" ");
    div.appendChild(message);
    el.appendChild(div);
  }
</script>
<div class="front userscript">{{Front}}</div>
<div class="back userscript">{{Back}}</div>
<div class="front side"></div>
<div class="logs">
  <div>Logs:</div>
</div>
<script>
  evalUserscript("front");
</script>
```

### Back Template

```html
{{FrontSide}}

<hr id="answer" />

<div class="back side"></div>
<div class="extra">{{Extra}}</div>
<script>
  evalUserscript("back");
</script>
```

### Styling

```css
.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}

.userscript {
  display: none;
}

.logs {
  display: none;
  text-align: left;
  background-color: #f1f1f1;
}

.code-block {
  background-color: #f0f0f0;
  border-left: 4px solid #008080;
  overflow: auto;
  padding: 10px;
  font-family: "Courier New", Courier, monospace;
  color: #333;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: left;
}
```
