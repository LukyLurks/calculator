let t0 = performance.now();

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

const operate = (operand1, operand2, operator) => {
  if(operator === '+') return add(operand1, operand2);
  else if(operator === '-') return subtract(operand1, operand2);
  else if(operator === '*') return multiply(operand1, operand2);
  else if(operator === '/') return divide(operand1, operand2);
};

console.log(`main.js ready in ${performance.now() - t0} ms.`);