// bathp.ts

/**
 * A TypeScript library for parsing and evaluating mathematical expressions, including LaTeX input, except its not good and shouldn't be used                   
 * @module bathp
 */

/** Interface defining the precedence and associativity of operators */
interface Operator {
    precedence: number;
    rightAssociative: boolean;
}

/** Enumeration of token types used in the tokenizer */
enum TokenType {
    Number,
    Operator,
    Function,
    LeftParen,
    RightParen,
    Unknown,
}

/** Set of supported mathematical functions */
const functions = new Set<string>([
    'sin', 'cos', 'tan',
    'asin', 'acos', 'atan',
    'sqrt', 'log', 'ln',
    'abs',
]);

/** Map of supported constants and their numerical values */
const constants = new Map<string, number>([
    ['pi', Math.PI],
    ['e', Math.E],
]);

/** Map defining operators with their precedence and associativity */
const operators: { [key: string]: Operator } = {
    '+': { precedence: 2, rightAssociative: false },
    '-': { precedence: 2, rightAssociative: false },
    '*': { precedence: 3, rightAssociative: false },
    '/': { precedence: 3, rightAssociative: false },
    '^': { precedence: 4, rightAssociative: true },
};

/** Checks if a token is a supported function */
function isFunction(token: string): boolean {
    return functions.has(token);
}

/** Checks if a character is an operator */
function isOperatorChar(c: string): boolean {
    return '+-*/^'.includes(c);
}

/** Checks if a token is a supported constant */
function isConstant(token: string): boolean {
    return constants.has(token);
}

/**
 * Tokenizes a mathematical expression string into individual tokens.
 * @param expression The input mathematical expression as a string.
 * @returns An array of tokens.
 */
function tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    let prevTokenType: TokenType | null = null;

    while (i < expression.length) {
        const c = expression[i];

        if (/\s/.test(c)) {
            i++;
            continue;
        }

        // Handle numbers, including negative numbers
        if (/\d/.test(c) || c === '.' || ((c === '-' || c === '+') && (prevTokenType === null || prevTokenType === TokenType.Operator || prevTokenType === TokenType.LeftParen))) {
            let number = '';
            if (c === '-' || c === '+') {
                number += c;
                i++;
            }
            while (i < expression.length && (/\d/.test(expression[i]) || expression[i] === '.')) {
                number += expression[i++];
            }
            tokens.push(number);
            prevTokenType = TokenType.Number;
            continue;
        }

        // Handle functions and constants
        if (/[a-zA-Z]/.test(c)) {
            let name = '';
            while (i < expression.length && /[a-zA-Z]/.test(expression[i])) {
                name += expression[i++];
            }
            tokens.push(name);
            if (isFunction(name)) {
                prevTokenType = TokenType.Function;
            } else if (isConstant(name)) {
                prevTokenType = TokenType.Number;
            } else {
                prevTokenType = TokenType.Unknown;
            }
            continue;
        }

        // Handle parentheses
        if (c === '(') {
            tokens.push(c);
            i++;
            prevTokenType = TokenType.LeftParen;
            continue;
        }
        if (c === ')') {
            tokens.push(c);
            i++;
            prevTokenType = TokenType.RightParen;
            continue;
        }

        // Handle operators
        if (isOperatorChar(c)) {
            tokens.push(c);
            i++;
            prevTokenType = TokenType.Operator;
            continue;
        }

        throw new Error(`Invalid character in expression: ${c}`);
    }

    return tokens;
}

/**
 * Converts tokens from infix to postfix notation using the Shunting Yard algorithm.
 * @param tokens An array of tokens in infix notation.
 * @returns An array of tokens in postfix notation.
 */
function shuntingYard(tokens: string[]): string[] {
    const outputQueue: string[] = [];
    const operatorStack: string[] = [];

    while (tokens.length > 0) {
        const token = tokens.shift()!; // Non-null assertion

        // Numbers and constants
        if (/\d/.test(token[0]) || (token.length > 1 && token[0] === '.' && /\d/.test(token[1])) || isConstant(token)) {
            outputQueue.push(token);
        }
        // Functions
        else if (isFunction(token)) {
            operatorStack.push(token);
        }
        // Operators
        else if (operators.hasOwnProperty(token)) {
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (operators.hasOwnProperty(top)) {
                    if ((operators[top].precedence > operators[token].precedence) ||
                        (operators[top].precedence === operators[token].precedence && !operators[token].rightAssociative)) {
                        outputQueue.push(operatorStack.pop()!);
                        continue;
                    }
                }
                break;
            }
            operatorStack.push(token);
        }
        // Left parenthesis
        else if (token === '(') {
            operatorStack.push(token);
        }
        // Right parenthesis
        else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop()!);
            }
            if (operatorStack.length === 0) {
                throw new Error('Mismatched parentheses');
            }
            operatorStack.pop(); // Pop the "("
            // If the token at the top of the stack is a function, pop it onto the output queue
            if (operatorStack.length > 0 && isFunction(operatorStack[operatorStack.length - 1])) {
                outputQueue.push(operatorStack.pop()!);
            }
        }
        else {
            throw new Error(`Unknown token: ${token}`);
        }
    }

    // Pop any remaining operators to the output queue
    while (operatorStack.length > 0) {
        const top = operatorStack.pop()!;
        if (top === '(' || top === ')') {
            throw new Error('Mismatched parentheses');
        }
        outputQueue.push(top);
    }

    return outputQueue;
}

/**
 * Evaluates a postfix expression.
 * @param postfix An array of tokens in postfix notation.
 * @returns The numerical result of the expression.
 */
function evalExpression(postfix: string[]): number {
    const evalStack: number[] = [];

    while (postfix.length > 0) {
        const token = postfix.shift()!;

        if (/\d/.test(token[0]) || (token.length > 1 && token[0] === '.' && /\d/.test(token[1]))) {
            evalStack.push(parseFloat(token));
        }
        else if (isConstant(token)) {
            evalStack.push(constants.get(token)!);
        }
        // Basic operators
        else if (token === '+' || token === '-' || token === '*' || token === '/' || token === '^') {
            if (evalStack.length < 2) {
                throw new Error('Operators did not have matching operands');
            }
            const right = evalStack.pop()!;
            const left = evalStack.pop()!;
            if (token === '+') evalStack.push(left + right);
            else if (token === '-') evalStack.push(left - right);
            else if (token === '*') evalStack.push(left * right);
            else if (token === '/') {
                if (right === 0) throw new Error('Division by zero');
                evalStack.push(left / right);
            }
            else if (token === '^') evalStack.push(Math.pow(left, right));
        }
        // Functions
        else if (isFunction(token)) {
            if (evalStack.length === 0) {
                throw new Error('Function was missing values');
            }
            const value = evalStack.pop()!;
            if (token === 'sin') evalStack.push(Math.sin(value));
            else if (token === 'cos') evalStack.push(Math.cos(value));
            else if (token === 'tan') evalStack.push(Math.tan(value));
            else if (token === 'asin') evalStack.push(Math.asin(value));
            else if (token === 'acos') evalStack.push(Math.acos(value));
            else if (token === 'atan') evalStack.push(Math.atan(value));
            else if (token === 'sqrt') {
                if (value < 0) throw new Error('Square root of negative number');
                evalStack.push(Math.sqrt(value));
            }
            else if (token === 'log') evalStack.push(Math.log10(value));
            else if (token === 'ln') evalStack.push(Math.log(value));
            else if (token === 'abs') evalStack.push(Math.abs(value));
            else throw new Error(`Unknown function: ${token}`);
        }
        else {
            throw new Error(`Unknown token: ${token}`);
        }
    }

    if (evalStack.length !== 1) {
        throw new Error('Too many values');
    }

    return evalStack[0];
}

/**
 * Parses and evaluates a mathematical expression.
 * @param expression The input mathematical expression as a string.
 * @returns The numerical result of the expression.
 */
export function parseAndEvaluate(expression: string): number {
    const tokens = tokenize(expression);
    const postfix = shuntingYard(tokens);
    return evalExpression(postfix);
}

/**
 * Parses LaTeX input and converts it into a mathematical expression.
 * @param latex The LaTeX input string.
 * @returns A mathematical expression as a string.
 */
function parseLaTeX(latex: string): string {
    // I used ChatGPT for this because I absolutely hate Latex
    
    let expression = latex;

    // Replace \frac{a}{b} with (a)/(b)
    expression = expression.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1)/($2)');

    // Replace \sqrt{a} with sqrt(a)
    expression = expression.replace(/\\sqrt\s*\{([^{}]+)\}/g, 'sqrt($1)');

    // Replace functions like \sin{a} with sin(a)
    expression = expression.replace(/\\(sin|cos|tan|asin|acos|atan|ln|log|abs)\s*(\{([^{}]+)\}|([a-zA-Z0-9\.\+\-*/\^\(\)]+))/g, function (match, func, arg1, arg2, arg3) {
        let arg = arg2 || arg3;
        return func + '(' + arg + ')';
    });

    // Replace \left( and \right) with (
    expression = expression.replace(/\\left\s*\(/g, '(');
    expression = expression.replace(/\\right\s*\)/g, ')');

    // Replace \pi with pi
    expression = expression.replace(/\\pi\b/g, 'pi');

    // Remove any remaining LaTeX commands
    expression = expression.replace(/\\[a-zA-Z]+/g, '');

    return expression;
}

/**
 * Parses and evaluates a LaTeX mathematical expression.
 * @param latex The LaTeX input string.
 * @returns The numerical result of the expression.
 */
export function parseAndEvaluateLaTeX(latex: string): number {
    const expression = parseLaTeX(latex);
    return parseAndEvaluate(expression);
}


