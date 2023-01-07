if (!window.props) {
  const kgToLbs = 2.20462;
  const kg = Math.ceil(Math.random() * 100);
  const lbs = Math.floor(kg * kgToLbs);
  window.props = { kg, lbs };
}
const { kg } = window.props;
document.createTextNode(`What is ${kg} kg in lbs?`);
