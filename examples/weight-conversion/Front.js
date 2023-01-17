const kgToLbs = 2.20462;
const kg = get("kg", Math.ceil(Math.random() * 100));
set("lbs", Math.floor(kg * kgToLbs));
`What is ${kg} kg in lbs?`;
