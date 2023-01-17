# AnkiJS

An Anki note type which allows you to write your cards in JavaScript.

## Create the note type

1. Create a new note type by cloning the Basic note type.
2. Add the following to the template:

- Front Template: [model/frontTemplate.html](model/frontTemplate.html)
- Back Template: [model/backTemplate.html](model/backTemplate.html)
- Styling: [model/style.css](model/style.css)

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
const kgToLbs = 2.20462;
const kg = get("kg", Math.ceil(Math.random() * 100));
set("lbs", Math.floor(kg * kgToLbs));
`What is ${kg} kg in lbs?`;
```

Back

```
`${get("lbs")} lbs`;
```
