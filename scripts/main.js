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
  else return 0;
};

const parseExpr = operation => {
  return [undefined, undefined, undefined];
};

// Takes an expression with parentheses
const getPriorityOp = expr => {
  return expr;
};

const calculateExpression = expr => {
  while(Number.isNaN(+expr)) {
    let priorityOp = getPriorityOp(expr);
    expr = expr.replace(priorityOp, operate(...parseSimpleExpr(priorityOp)));
  }
  return +expr;
};

const hasGoodParentheses = expr => {
  return expr.split('').reduce((parentheseBalance, char) => {
    if (char === '(') {
      ++parentheseBalance;
    } else if (char === ')') {
      --parentheseBalance;
    }
    if (parentheseBalance < 0) {
      parentheseBalance += Infinity;
    }
    return parentheseBalance;
  }, 0) === 0;
}

const updateExpr = (expr, button) => {
  if (button.id === 'clear') {
    expr.textContent = '.';
    result.textContent = 0;
  } else if (button.id === 'backspace') {
    expr.textContent = expr.textContent.slice(0, -1);
  } else if (button.id === 'equals') {
    if (!hasGoodParentheses(expr.textContent)) {
      result.textContent = 'Error (parentheses)';
    } else {
      result.textContent = calculateExpression(expr.textContent);
    }
    expr.textContent = '';
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