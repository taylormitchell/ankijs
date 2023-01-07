const render = () => {
  const kgToLbs = 2.20462;
  const kg = Math.ceil(Math.random() * 100);
  const lbs = Math.floor(kg * kgToLbs);
  return {
    front: document.createTextNode(`What is ${kg} kg in lbs?`),
    back: document.createTextNode(`${lbs} lbs`),
  };
};

module.exports = {
  render: render.toString(),
};
