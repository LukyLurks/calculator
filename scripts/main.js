const expression = document.querySelector('#expression');
const result = document.querySelector('#result');
const buttons = document.querySelector('#buttons');

const syntaxErr = 'SYNTAX ERROR';
const mathErr = 'MATH ERROR';
const genericErr = 'ERROR';
// Matches parenthesed numbers: (5), (-2.4), (.482), but not (3+5) for instance 
const enclosedNumber = /\(-?\d*\.?\d*\)/;
// Matches numbers like 3, -2.42, 92875, .889, 0.27
const number = /[^+–×÷^%()]-?\d*\.?\d*/;
// Matches all numbers like 3, -2.42, 92875, .889, 0.27 from the expression we
// check against: "32.4+68−.6".match(numbers) -> ["32.4", "68", ".6"]
const numbers = /[^+–×÷^%()]-?\d*\.?\d*/g;

// Last computed expression
let lastExpr = '';
// Buffers the expression the user was typing before they loaded the previous
let currentExpr = expression.textContent;
// Flags to keep this expression history working properly
let isDownLocked = true;
let isUpLocked = true;
// +1 (resp. -1) when user inputs an opening (resp. closing) parenthese
// Can't be negative
let parentheseBalance = 0;

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
const pow = (x, n) => x ** n;
const percent = (a, b) => b / 100 * a;

function operate (operand1, operand2, operator) {
  if      (operator === '+') return add(operand1, operand2);
  else if (operator === '–') return subtract(operand1, operand2);
  else if (operator === '×') return multiply(operand1, operand2);
  else if (operator === '÷') return divide(operand1, operand2);
  else if (operator === '^') return pow(operand1, operand2);
  else if (operator === '%') return percent(operand1, operand2);
  else if (!isOperator(operator)) {
    if (operand1) return operand1;
  }
  else return genericErr;
}

const hasParentheses = expr => /[()]/.test(expr);

function parseSimpleExpr(expr) {
  if (hasParentheses(expr)) {
    expr = expr.slice(1, -1);
  }
  let opIndex = expr.search(/[^\d.-]/);
  if (opIndex === -1) return [expr];
  let operand1 = +expr.slice(0, opIndex);
  let operand2 = +expr.slice(opIndex + 1);
  let operator = expr.charAt(opIndex);
  return [operand1, operand2, operator];
}

// Get the substring containing the operation with highest precedence
function getPriorityOp(expr) {
  if (hasParentheses(expr)) {
    if (enclosedNumber.test(expr)) {
      /** If there is an expression enclosed in parentheses, we simplify
       * it until it becomes a number. At that point we return the number
       * WITH its parentheses so that everything is simplified/replaced in
       * the expression.
       */
      return String(expr.match(enclosedNumber));
    }
    let end = expr.indexOf(')');
    let start = expr.slice(0, end).lastIndexOf('(');
    expr = expr.slice(start + 1, end);
  }

  let opIndex = 0;
  if (expr.includes('^')) opIndex = expr.indexOf('^');
  else if (expr.includes('×')) opIndex = expr.indexOf('×');
  else if (expr.includes('÷')) opIndex = expr.indexOf('÷');
  else if (expr.includes('%')) opIndex = expr.indexOf('%');
  else if (expr.includes('–')) opIndex = expr.indexOf('–');
  else if (expr.includes('+')) opIndex = expr.indexOf('+');

  let leftOperand = getLastOperand(expr.slice(0, opIndex));
  let rightOperand = expr.slice(opIndex + 1).match(number);
  return leftOperand + expr.charAt(opIndex) + rightOperand;
}

// Simplifies the expression string until it's a number
function calculateExpression(expr) {
  while(Number.isNaN(+expr)) {
    let priorityOp = getPriorityOp(expr);
    let resultPriorityOp = operate(...parseSimpleExpr(priorityOp));
    if (resultPriorityOp === Infinity) {
      return mathErr;
    }
    expr = expr.replace(priorityOp, resultPriorityOp);
  }
  return +expr;
}

/** Although the parentheses are counted as the expression is being written,
 * We need to update the count when switching between current/old expression.
 */
function countParentheses (expr) {
  return [...expr].reduce((parentheseBalance, char) => {
    if (char === '(') ++parentheseBalance;
    else if (char === ')') --parentheseBalance;
    return parentheseBalance;
  }, 0);
}

const isOperator = c => /[+–×÷^%]/.test(c);

const isNumberFloat = operand => /\./.test(operand);

function getLastOperand (expr) {
  let operands = expr.match(numbers);
  if (operands) {
    return operands[operands.length - 1];
  } else {
    return null;
  }
}

function resetCalculator() {
  expression.textContent = '';
  lastExpr = '';
  currentExpr = '';
  exprBuffer = '';
  result.textContent = 0;
  parentheseBalance = 0;
  isUpLocked = true;
  isDownLocked = true;
}

function backspace (expr, lastChar) {
  if (lastChar === '(') {
    parentheseBalance--;
  } else if (lastChar === ')') {
    parentheseBalance++;
  }
  expr.textContent = expr.textContent.slice(0, -1);
}

function updateResult (expr, lastChar) {
  lastExpr = expr.textContent;
  let text = expr.textContent;
  isUpLocked = false;
  if (parentheseBalance !== 0 ||
      getLastOperand(text) === '.' ||
      getLastOperand(text) === '-' ||
      getLastOperand(text) === '-.' ||
      isOperator(lastChar)) {
    result.textContent = syntaxErr;
  } else {
    result.textContent = calculateExpression(expr.textContent);
  }
  expr.textContent = '';
  parentheseBalance = 0;
}

function appendOperator (expr, button, lastChar) {
  if (isOperator(lastChar)) {
    expr.textContent = expr.textContent.slice(0, -1);
  }
  if (expr.textContent !== '' && lastChar !== '.' && lastChar !== '(') {
    expr.textContent += button.textContent;
  }
}

function appendFloatPoint(expr, button, lastChar) {
  let lastOperand = getLastOperand(expr.textContent);
  if (expr.textContent === '') {
    expr.textContent += button.textContent;
  } else if ((!isNumberFloat(lastOperand) && lastChar !== ')') ||
              isOperator(lastChar)) {
    expr.textContent += button.textContent;
  }
}

function appendParenthese (expr, button, lastChar) {
  if (expr.textContent.slice(-1) === '.') return;
  if (button.id === 'openParenthese') {
    if (isOperator(lastChar) || lastChar === '-' || lastChar === '(' ||
        expr.textContent === '') {
          expr.textContent += button.textContent;
          parentheseBalance++;
    }
  } else if (button.id === 'closeParenthese') {
    if (parentheseBalance >= 1 &&
        (/\d/.test(lastChar) || lastChar === ')')) { 
          expr.textContent += button.textContent;
          parentheseBalance--;
    }
  }
}

function appendDigits(expr, digit, lastChar) {
  let lastOperand = getLastOperand(expr.textContent);
  if (!lastOperand) {
    expr.textContent += digit;
  } else {
    if (/[1-9]/.test(digit)) {
      // Preventing leading zeroes
      if (lastOperand === '0') {
        // Can't use replace("lastOperand", `${digit}`), if there's more
        // than 1 occurence of lastOperand ; only the first would be replaced.
        let index = expr.textContent.lastIndexOf(lastOperand);
        let start = expr.textContent.slice(0, index);
        expr.textContent = start + `${digit}${expr.textContent.slice(index)}`;
      } else if (lastChar !== ')') {
        expr.textContent += digit;
      }
    } else if (digit === '0') {
      // Preventing trailing zeroes
      if (isNumberFloat(lastOperand) || +lastOperand !== 0) {
        expr.textContent += '0';
      }
    }
  }
}

function changeLastOperandSign(expr, lastChar) {
  let lastOperand = getLastOperand(expr.textContent);
  if (!lastOperand) {
    if (lastChar === '-') {
      expr.textContent = expr.textContent.slice(0, -1);
    } else {
      expr.textContent += '-';
    }
  } else {
    // Can't use replace("lastOperand", `-${lastOperand}`), if there's more
    // than 1 occurence of lastOperand ; only the first would be replaced.
    let signIndex = expr.textContent.lastIndexOf(lastOperand);
    let exprStart = expr.textContent.slice(0, signIndex);
    if (/-/.test(lastOperand)) {
      expr.textContent = exprStart + expr.textContent.slice(signIndex + 1);
    } else {
      expr.textContent = exprStart + `-${expr.textContent.slice(signIndex)}`;
    }
  }
}

function updateExpr(expr, button) {
  expr.textContent = expr.textContent.trim();
  let lastChar = expr.textContent.slice(-1);

  if (button.id === 'clear') {
    resetCalculator();
  } else if (button.id === 'backspace') {
    backspace(expr, lastChar);
  } else if (button.id === 'equals') {
    updateResult(expr, lastChar);
  } else if (button.classList.contains('operator')) {
    appendOperator(expr, button, lastChar);
  } else if (button.id === 'floatingPoint') {
    appendFloatPoint(expr, button, lastChar);
  } else if (button.classList.contains('parenthese')) {
    appendParenthese(expr, button, lastChar);
  } else if (button.id === 'sign') {
    changeLastOperandSign(expr, lastChar);
  } else if (/\d/.test(button.textContent)) {
    appendDigits(expr, button.textContent, lastChar);
  }
  // For display purposes I can't have an empty expression
  if (expr.textContent === '') {
    expr.textContent = '　';
  }
}

const helpToggle = document.querySelector('#helpToggle');
const help = document.querySelector('#help');
function toggleHelp() {
  if (help.classList.contains('hidden')) {
    help.classList.remove('hidden');
  } else {
    help.classList.add('hidden');
  }
}

helpToggle.addEventListener('click', toggleHelp);

buttons.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'button') {
    updateExpr(expression, e.target);
    /** When clicking buttons with the mouse, they gain focus.
     * If we press Enter to calculate, it will also immediately input
     * that focused button afterwards. We manually lose the focus with this.
     **/
    e.target.blur();
  }
});

// Keyboard mappings
window.addEventListener('keydown', e => {
  let key = String(e.key).toLowerCase();
  if (key === 'escape' || key === 'c') {
    const esc = document.querySelector('#clear');
    esc.classList.add('active');
    updateExpr(expression, esc);
  } else if (key === 'backspace') {
    const back = document.querySelector('#backspace');
    back.classList.add('active');
    updateExpr(expression, back);
  } else if (key === 'enter') {
    const enter = document.querySelector('#equals');
    enter.classList.add('active');
    updateExpr(expression, enter);
  } else if (key === 's') {
    const sign = document.querySelector('#sign');
    sign.classList.add('active');
    updateExpr(expression, sign);
  } else if (key === '-') {
    const minus = document.querySelector('#subtract');
    minus.classList.add('active');
    updateExpr(expression, minus);
  } else if (key === '*') {
    const mult = document.querySelector('#multiply');
    mult.classList.add('active');
    updateExpr(expression, mult);
  } else if (key === '/') {
    e.preventDefault();
    const divi = document.querySelector('#divide');
    divi.classList.add('active');
    updateExpr(expression, divi);
  } else if (key === 'arrowup') {
    if (lastExpr === '' || isUpLocked) return;
    currentExpr = expression.textContent;
    expression.textContent = lastExpr;
    isUpLocked = true;
    isDownLocked = false;
    parentheseBalance = countParentheses(expression.textContent);
  } else if (key === 'arrowdown') {
    if (isDownLocked) return;
    expression.textContent = currentExpr;
    isDownLocked = true;
    isUpLocked = false;
    parentheseBalance = countParentheses(expression.textContent);
  } else if (key === 'h') {
    toggleHelp();
  } else {
    [...buttons.children].forEach(button => {
      if (String(e.key) === button.textContent) {
        button.classList.add('active');
        updateExpr(expression, button);
      }
    });
  }
});

[...buttons.children].forEach(button => {
  button.addEventListener('transitionend', e => {
    if (e.propertyName !== 'outline-width') return;
    e.target.classList.remove('active');
  });
});

