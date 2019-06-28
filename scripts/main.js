const expression = document.querySelector('#expression');
const result = document.querySelector('#result');
const buttons = document.querySelector('#buttons');

const parentheseErr = 'ERROR: parentheses mismatch';
const divideZeroErr = 'ERROR: divided by 0';
const genericErr = 'ERROR: unexpected error';
const numberRegex = /\(-?\d*\.?\d*\)/;

let lastExpr = '';
let currentExpr = expression.textContent;
let isDownLocked = true;
let isUpLocked = true;
let parentheseBalance = 0;

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
  }
  else return genericErr;
};

const hasParentheses = expr => /[()]/.test(expr);

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

// Get operation with highest precedence
const getPriorityOp = expr => {
  let startIndex = 0;
  let endIndex = expr.length;
  let opIndex = 0;

  // Go in innermost parentheses if there are any
  if (hasParentheses(expr)) {
    if (numberRegex.test(expr)) return expr.match(/\(-?\d*\.?\d*\)/)[0];
    let end = expr.indexOf(')');
    let start = expr.slice(0, end).lastIndexOf('(');
    expr = expr.slice(start + 1, end)
  }
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

  // Gets the 2 operands left and right of the operator
  leftOffset = [...expr.slice(0, opIndex)]
                    .reverse().join('')
                    .search(/-?[^0-9.-]/);
  if (leftOffset < 0) leftOffset = expr.slice(0, opIndex).length;
  startIndex = opIndex - leftOffset;

  rightOffset = expr.slice(opIndex + 1).search(/[^0-9.-]/);
  if (rightOffset < 0) rightOffset = expr.length - 1;
  endIndex = opIndex + rightOffset;
  
  if (isOperator(expr.slice(startIndex, endIndex + 1).slice(-1)))
    return expr.slice(startIndex, endIndex);
  else
    return expr.slice(startIndex, endIndex + 1);
};

// Simplifies the expression until we get a number
const calculateExpression = expr => {
  while(Number.isNaN(+expr)) {
    let priorityOp = getPriorityOp(expr);
    let resultPriorityOp = operate(...parseSimpleExpr(priorityOp));
    if (resultPriorityOp === Infinity) {
      return divideZeroErr;
    }
    expr = expr.replace(priorityOp, resultPriorityOp);
  }
  return +expr;
};

const countParentheses = expr => {
  return [...expr].reduce((parentheseBalance, char) => {
    if (char === '(') ++parentheseBalance;
    else if (char === ')') --parentheseBalance;
    return parentheseBalance;
  }, 0);
}

const isOperator = c => /[+−×÷^%]/.test(c);
const hasOperator = expr => /[+−×÷^%]/.test(expr);

// Checks if the last term in the expression is a float
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

const trimZeros = (expr, digit) => {
  let lastOperand = getLastOperand(expr);
  if (/[1-9]/.test(digit)) {
    if (lastOperand === '0') {
      expr = expr.slice(0, -1);
    }
    return expr + digit;
  } else if (digit === '0') {
    if (lastOperand === '') return expr + '0';
    if (hasFloatPoint(lastOperand) || +lastOperand !== 0) {
      return expr + '0';
    } else {
      return expr;
    }
  }
};

const getLastOperand = expr => {
  let flippedExpr = [...expr].reverse().join('');
  let lastOperandIndex = flippedExpr.search(/[^\d.-]/);
  return [...flippedExpr.slice(0, lastOperandIndex)].reverse().join('');
};

const updateExpr = (expr, button) => {
  expr.textContent = expr.textContent.trim();
  let lastChar = expr.textContent.slice(-1);
  if (button.id === 'clear') {
    expr.textContent = '';
    lastExpr = '';
    currentExpr = '';
    exprBuffer = '';
    result.textContent = 0;
    parentheseBalance = 0;
  } else if (button.id === 'backspace') {
    if (lastChar === '(') {
      parentheseBalance--;
    } else if (lastChar === ')') {
      parentheseBalance++;
    }
    expr.textContent = expr.textContent.slice(0, -1);
  } else if (button.id === 'equals') {
    lastExpr = expr.textContent;
    isUpLocked = false;
    if (parentheseBalance !== 0) {
      result.textContent = parentheseErr;
    } else {
      result.textContent = calculateExpression(expr.textContent);
    }
    expr.textContent = '';
    parentheseBalance = 0;
  } else if (button.classList.contains('operator')) {
    if (isOperator(lastChar)) {
      expr.textContent = expr.textContent.slice(0, -1);
    }
    if (expr.textContent !== '' && lastChar !== '.' && lastChar !== '(') {
      expr.textContent += button.textContent;
    }
  } else if (button.id === 'floatingPoint') {
    if (expr.textContent === '') {
      expr.textContent += button.textContent;
    } else if (!hasFloatPoint(expr.textContent)) {
      expr.textContent += button.textContent;
    }
  } else if (button.classList.contains('parenthese')) {
    if (expr.textContent.slice(-1) === '.') return;
    if (button.id === 'openParenthese') {
      if (isOperator(lastChar) ||
          lastChar === '-' ||
          lastChar === '(' ||
          expr.textContent === '') {
            expr.textContent += button.textContent;
            parentheseBalance++;
      }
    }
    if (button.id === 'closeParenthese') {
      if (parentheseBalance >= 1 &&
          (/\d/.test(lastChar) || lastChar === ')')) { 
            expr.textContent += button.textContent;
            parentheseBalance--;
      }
    } 
  } else if (button.id === 'sign') {
    expr.textContent = changeLastOperandSign(expr.textContent);
  } else if (/\d/.test(button.textContent)) {
    expr.textContent = trimZeros(expr.textContent, button.textContent);
  }
  // For display purposes I can't have an empty expression
  if (expr.textContent === '') {
    expr.textContent = '　';
  }
}

buttons.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'button') {
    updateExpr(expression, e.target);
  }
});

window.addEventListener('keydown', e => {
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
  } else if (/ArrowUp/i.test(String(e.key))) {
    if (lastExpr === '' || isUpLocked) return;
    currentExpr = expression.textContent;
    expression.textContent = lastExpr;
    isUpLocked = true;
    isDownLocked = false;
    parentheseBalance = countParentheses(expression.textContent);
  } else if (/ArrowDown/i.test(String(e.key))) {
    if (isDownLocked) return;
    expression.textContent = currentExpr;
    isDownLocked = true;
    isUpLocked = false;
    parentheseBalance = countParentheses(expression.textContent);
  } else {
    [...buttons.children].forEach(button => {
      if (String(e.key) === button.textContent) {
        updateExpr(expression, button);
      }
    });
  }
});