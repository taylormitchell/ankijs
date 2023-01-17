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
    window.cardState[key] = window.cardState[key] || initial;
    return window.cardState[key];
  }
  function set(key, value) {
    window.cardState[key] = value;
    return window.cardState[key];
  }
  const random = {
    shuffle: (array) => {
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
    },
    choice: (array) => array[Math.floor(Math.random() * array.length)],
  };
  function evalUserscript(side) {
    if (side !== "front" && side !== "back") {
      throw new Error(`Invalid side "${side}"`);
    }
    let html, code, content;
    try {
      // Get and evaluate user script
      html = document.querySelector(`.${side}.userscript`).innerHTML.trim();
      code = new DOMParser().parseFromString(html.replace(/<br>/g, "\n"), "text/html")
        .documentElement.textContent;
      content = eval(code);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // If the userscript is invalid javascript, we assume it's just text
        // and add it to the DOM as is
        content = code;
      } else {
        // Otherwise, we display the error
        content = `Error evaluating ${side}: ${error.message + error.stack}`;
      }
    }
    // If the script returned content, add it to the DOM
    const el = document.querySelector(`.${side}.side`);
    if (!el || !content) {
      return;
    } else if (content instanceof Node) {
      el.appendChild(content);
    } else if (typeof content === "string") {
      el.innerHTML = content;
    }
  }
</script>
<div class="front userscript">{{Front}}</div>
<div class="back userscript">{{Back}}</div>
<div class="front side"></div>
<script>
  evalUserscript("front");
</script>
```

### Back Template

```html
{{FrontSide}}

<hr id="answer" />

<div class="back side"></div>
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
```
