const expression = document.querySelector('#expression');
const result = document.querySelector('#result');
const buttons = document.querySelector('#buttons');

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
const pow = (x, n) => x ** n;
const percent = (a, b) => b / 100 * a;

const operate = (operand1, operand2, operator) => {
  if (operator === '+') return add(operand1, operand2);
  else if (operator === '−') return subtract(operand1, operand2);
  else if (operator === '×') return multiply(operand1, operand2);
  else if (operator === '÷') return divide(operand1, operand2);
  else if (operator === '^') return pow(operand1, operand2);
  else if (operator === '%') return percent(operand1, operand2);
  else if (!isOperator(operator)) {
    if (operand1) return operand1;
    if (operand2) return operand2;
  }
  else return "Error"
};

const hasParentheses = expr => expr.indexOf(')') !== -1;

const parseSimpleExpr = expr => {
  if (hasParentheses(expr)) {
    expr = expr.slice(1, -1);
  }
  let opIndex = expr.search(/[^0-9.-]/);
  if (opIndex === -1) return [expr];
  let operand1 = +expr.slice(0, opIndex);
  let operand2 = +expr.slice(opIndex + 1);
  let operator = expr.charAt(opIndex);
  return [operand1, operand2, operator];
};

const getPriorityOp = expr => {
  let startIndex = 0;
  let endIndex = 0;

  if (hasParentheses(expr)) {
    endIndex = expr.indexOf(')') + 1;
    startIndex = expr.slice(0, endIndex).lastIndexOf('(');
  } else {
    let opIndex = expr.search(/[]/);
    let leftOffset = 0;
    let rightOffset = 0;
    if (expr.indexOf('^') !== -1) {
      opIndex = expr.indexOf('^');
    } else if (expr.indexOf('×') !== -1) {
      opIndex = expr.indexOf('×');
    } else if (expr.indexOf('÷') !== -1) {
      opIndex = expr.indexOf('÷');
    } else if (expr.indexOf('%') !== -1) {
      opIndex = expr.indexOf('%');
    } else if (expr.indexOf('−') !== -1) {
      opIndex = expr.indexOf('−');
    } else if (expr.indexOf('+') !== -1) {
      opIndex = expr.indexOf('+');
    }

    leftOffset = [...expr.slice(0, opIndex)]
                     .reverse().join('')
                     .search(/-?[^0-9.-]/);
    if (leftOffset < 0) leftOffset = expr.slice(0, opIndex).length;
    startIndex = opIndex - leftOffset;

    rightOffset = expr.slice(opIndex + 1).search(/[^0-9.-]/);
    if (rightOffset < 0) rightOffset = expr.length - 1;
    endIndex = opIndex + rightOffset;
  }
  if (isOperator(expr.slice(startIndex, endIndex + 1).slice(-1)))
    return expr.slice(startIndex, endIndex);
  else
    return expr.slice(startIndex, endIndex + 1);
};

const calculateExpression = expr => {
  while(Number.isNaN(+expr)) {
    let priorityOp = getPriorityOp(expr);
    let resultPriorityOp = operate(...parseSimpleExpr(priorityOp));
    if (resultPriorityOp === Infinity) {
      return "Error (Infinity)";
    }
    expr = expr.replace(priorityOp, resultPriorityOp);
  }
  return +expr;
};

const hasGoodParentheses = expr => {
  return [...expr].reduce((parentheseBalance, char) => {
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
};

const isOperator = c => {
  let isOp = c === '+' ||
             c === '−' ||
             c === '×' ||
             c === '÷' ||
             c === '%' ||
             c === '^'
  return isOp;
};

const hasFloatPoint = expr => {
  let flippedExprArray = [...expr].reverse();
  let hasFloatPoint = false;
  let i = 0;
  let len = flippedExprArray.length;
  while ((i < len) &&
         (flippedExprArray[i] !== '(' &&
         !isOperator(flippedExprArray[i]))) {
    if (flippedExprArray[i] === '.') {
      hasFloatPoint = true;
      break;
    }
    i++;
  }
  return hasFloatPoint;
};

const changeLastOperandSign = expr => {
  let flippedExpr = [...expr].reverse().join('');
  let operandStart = flippedExpr.search(/[+−×÷^%(]/);
  if (operandStart === -1) {
    if (expr.indexOf('-') === -1) {
      return '-' + expr;
    } else {
      return expr.slice(1);
    }
  }
  let operand = [...flippedExpr.slice(0, operandStart)].reverse().join('');
  let exprStem = [...flippedExpr.slice(operandStart)].reverse().join('');
  if (operand.indexOf('-') === -1) {
    operand = '-' + operand;
  } else {
    operand = operand.slice(1);
  }
  return exprStem + operand;
};

const updateExpr = (expr, button) => {
  if (button.id === 'clear') {
    expr.textContent = '　';
    result.textContent = 0;
  } else if (button.id === 'backspace') {
    expr.textContent = expr.textContent.slice(0, -1);
    if (expr.textContent === '') {
      expr.textContent = '　';
    }
  } else if (button.id === 'equals') {
    if (!hasGoodParentheses(expr.textContent)) {
      result.textContent = 'Error (parentheses)';
    } else {
      result.textContent = calculateExpression(expr.textContent.trim());
    }
    expr.textContent = '　';
  } else if (button.classList.contains('operator')) {
    if (expr.textContent === '　') return;
    if (expr.textContent.slice(-1) === '.') return;
    if (isOperator(expr.textContent.slice(-1))) {
      expr.textContent = expr.textContent.slice(0, -1);
    }
    expr.textContent += button.textContent;
  } else if (button.id === 'floatingPoint') {
    if (expr.textContent === '　') {
      expr.textContent += button.textContent;
    } else if (!hasFloatPoint(expr.textContent.trim())) {
      expr.textContent += button.textContent;
    }
  } else if (button.classList.contains('parenthese')) {
    if (expr.textContent.slice(-1) === '.') return;
    if (button.id === 'openParenthese') {
      if (!isOperator(expr.textContent.slice(-1)) &&
          expr.textContent.slice(-1) !== '-' &&
          expr.textContent !== '　') return;
    }
    if (button.id === 'closeParenthese') {
      if (expr.textContent.search(/[0-9]/) === -1) return;
    } 
    expr.textContent += button.textContent;
  } else if (button.id === 'sign') {
    expr.textContent = changeLastOperandSign(expr.textContent.trim());
    if (expr.textContent === '') {
      expr.textContent = '　';
    }
  } else {
    if (expr.textContent === '　') {
      expr.textContent = '';
    }
    expr.textContent += button.textContent;
  }
}

buttons.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'button') {
    updateExpr(expression, e.target);
  }
});

window.addEventListener('keydown', e => {
  console.log(String(e.key));
  if (/Escape/i.test(String(e.key))) {
    const esc = document.querySelector('#clear');
    updateExpr(expression, esc);
  } else if (/Backspace/i.test(String(e.key))) {
    const back = document.querySelector('#backspace');
    updateExpr(expression, back);
  } else if (/Enter/i.test(String(e.key))) {
    const enter = document.querySelector('#equals');
    updateExpr(expression, enter);
  } else if (String(e.key) === 's') {
    const sign = document.querySelector('#sign');
    updateExpr(expression, sign);
  } else if (String(e.key) === '-') {
    const minus = document.querySelector('#subtract');
    updateExpr(expression, minus);
  } else if (String(e.key) === '*') {
    const mult = document.querySelector('#multiply');
    updateExpr(expression, mult);
  } else if (String(e.key) === '/') {
    const divi = document.querySelector('#divide');
    updateExpr(expression, divi);
  } else {
    [...buttons.children].forEach(button => {
      if (String(e.key) === button.textContent) {
        updateExpr(expression, button);
      }
    });
  }
});