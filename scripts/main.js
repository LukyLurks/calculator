let t0 = performance.now();

const expression = document.querySelector('#expression');
const result = document.querySelector('#result');
const buttons = document.querySelector('#buttons');

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

const operate = (operand1, operand2, operator) => {
  if (operator === '+') return add(operand1, operand2);
  else if (operator === '-') return subtract(operand1, operand2);
  else if (operator === '*') return multiply(operand1, operand2);
  else if (operator === '/') return divide(operand1, operand2);
};

const calculateExpression = expr => {
  return 1;
};

const updateExpr = (expr, button) => {
  if (button.id === 'clear') {
    expr.textContent = '';
  } else if (button.id === 'backspace') {
    expr.textContent = expr.textContent.slice(0, -1);
  } else if (button.id === 'equals') {
    expr.textContent = '';
    result.textContent = calculateExpression(expr);
  } else {
    expr.textContent += button.textContent;
  }
}

buttons.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'button') {
    updateExpr(expression, e.target);
  }
});

console.log(`main.js ready in ${performance.now() - t0} ms.`);