const kgToLbs = 2.20462;
const [kg] = useCardState("kg", Math.ceil(Math.random() * 100));
const [lbs] = useCardState("lbs", Math.floor(kg * kgToLbs));
document.createTextNode(`What is ${kg} kg in lbs?`);
