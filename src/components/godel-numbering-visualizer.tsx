import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle } from 'lucide-react'

interface SymbolMap {
    [key: string]: number;
}

const symbolMap: SymbolMap = {
    '∀': 1, '∃': 2, '¬': 3, '∨': 4, '∧': 5, '→': 6, '↔': 7,
    '=': 8, '+': 9, '*': 10, '(': 11, ')': 12, '0': 13,
    'S': 14, 'x': 15, 'y': 16, 'z': 17
};

const primes: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];

interface EncodingItem {
    symbol: string;
    code: number;
    prime: string;
    factor: string;
}

interface EncodingResult {
    encoding: EncodingItem[];
    godelNumber: string;
}

const godelEncode = (sentence: string): EncodingResult => {
    const symbols = sentence.split('');
    let godelNumber = 1n;
    const encoding = symbols.map((symbol, index) => {
        const code = symbolMap[symbol] || 0;
        const prime = BigInt(primes[index]);
        const factor = prime ** BigInt(code);
        godelNumber *= factor;
        return {
            symbol,
            code,
            prime: prime.toString(),
            factor: factor.toString()
        };
    });
    return { encoding, godelNumber: godelNumber.toString() };
};

interface MathKeyboardProps {
    onSymbolClick: (symbol: string) => void;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({ onSymbolClick }) => {
    const symbols = ['∀', '∃', '¬', '∨', '∧', '→', '↔', '=', '+', '*', '(', ')', '0', 'S', 'x', 'y', 'z'];
    return (
        <div className="grid grid-cols-6 gap-2 mb-4">
            {symbols.map((symbol) => (
                <button key={symbol} onClick={() => onSymbolClick(symbol)} className="px-3 py-1 border rounded">
                    {symbol}
                </button>
            ))}
        </div>
    );
};

interface GodelTreeProps {
    encoding: EncodingItem[];
}

const GodelTree: React.FC<GodelTreeProps> = ({ encoding }) => {
    if (!encoding || encoding.length === 0) return null;

    const maxDepth = Math.max(...encoding.map(item => item.code));

    return (
        <div className="overflow-x-auto">
            <svg width={encoding.length * 60} height={maxDepth * 35 + 60}>
                {encoding.map((item, index) => (
                    <g key={index} transform={`translate(${index * 60 + 30}, 30)`}>
                        <circle cx="0" cy="0" r="20" fill="#4a5568" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14">
                            {item.symbol}
                        </text>
                        {Array.from({ length: item.code }, (_, i) => (
                            <g key={i}>
                                <line
                                    x1="0"
                                    y1={(i + 1) * 30}
                                    x2="0"
                                    y2={(i + 2) * 30}
                                    stroke="#718096"
                                    strokeWidth="2"
                                />
                                <circle cx="0" cy={(i + 2) * 30} r="10" fill="#718096" />
                            </g>
                        ))}
                    </g>
                ))}
            </svg>
        </div>
    );
};

interface RecursiveFunctionBuilderProps {
    sentence: string;
}

const RecursiveFunctionBuilder = ({ sentence }) => {
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        if (sentence) {
            const newSteps = buildRecursiveFunction(sentence);
            setSteps(newSteps);
        }
    }, [sentence]);

    const tokenize = (input) => {
        return input.match(/∀|∃|¬|∨|∧|→|↔|=|\+|\*|\(|\)|0|S|[xyz]|\s+/g) || [];
    };

    const parse = (tokens) => {
        let position = 0;

        const parseExpression = () => {
            let left = parseTerm();
            while (position < tokens.length && ['+', '*', '∨', '∧', '→', '↔', '='].includes(tokens[position])) {
                const operator = tokens[position++];
                const right = parseTerm();
                left = { type: 'binary', operator, left, right };
            }
            return left;
        };

        const parseTerm = () => {
            if (tokens[position] === '(') {
                position++;
                const exp = parseExpression();
                position++; // consume ')'
                return exp;
            } else if (tokens[position] === '¬') {
                position++;
                return { type: 'unary', operator: '¬', operand: parseTerm() };
            } else if (['∀', '∃'].includes(tokens[position])) {
                const quantifier = tokens[position++];
                const variable = tokens[position++];
                return { type: 'quantifier', quantifier, variable, body: parseExpression() };
            } else if (tokens[position] === 'S') {
                position++;
                return { type: 'successor', operand: parseTerm() };
            } else {
                return { type: 'atom', value: tokens[position++] };
            }
        };

        return parseExpression();
    };

    const buildRecursiveFunction = (sent) => {
        const tokens = tokenize(sent);
        const ast = parse(tokens);
        const steps = [];
        let functionCounter = 0;

        const processNode = (node) => {
            switch (node.type) {
                case 'atom':
                    if (node.value === '0') {
                        steps.push({
                            type: 'basic',
                            content: `f${functionCounter} = Z`,
                            description: 'Zero function'
                        });
                    } else {
                        steps.push({
                            type: 'basic',
                            content: `f${functionCounter} = U^1_1`,
                            description: `Identity function for ${node.value}`
                        });
                    }
                    break;
                case 'successor':
                    processNode(node.operand);
                    steps.push({
                        type: 'composition',
                        content: `f${functionCounter + 1} = S ∘ f${functionCounter}`,
                        description: 'Successor function'
                    });
                    functionCounter++;
                    break;
                case 'binary':
                    processNode(node.left);
                    const leftIndex = functionCounter;
                    processNode(node.right);
                    const rightIndex = functionCounter;
                    let op, desc;
                    switch (node.operator) {
                        case '+':
                            op = 'add';
                            desc = 'Addition';
                            break;
                        case '*':
                            op = 'mul';
                            desc = 'Multiplication';
                            break;
                        case '∨':
                            op = 'or';
                            desc = 'Logical OR';
                            break;
                        case '∧':
                            op = 'and';
                            desc = 'Logical AND';
                            break;
                        case '→':
                            op = 'impl';
                            desc = 'Implication';
                            break;
                        case '↔':
                            op = 'equiv';
                            desc = 'Equivalence';
                            break;
                        case '=':
                            op = 'eq';
                            desc = 'Equality';
                            break;
                    }
                    steps.push({
                        type: 'composition',
                        content: `f${functionCounter + 1} = ${op} ∘ (f${leftIndex}, f${rightIndex})`,
                        description: `${desc}: ${op}(x, y)`
                    });
                    functionCounter++;
                    break;
                case 'unary':
                    processNode(node.operand);
                    steps.push({
                        type: 'composition',
                        content: `f${functionCounter + 1} = not ∘ f${functionCounter}`,
                        description: 'Logical NOT'
                    });
                    functionCounter++;
                    break;
                case 'quantifier':
                    processNode(node.body);
                    steps.push({
                        type: 'minimization',
                        content: `f${functionCounter + 1} = μ[f${functionCounter}]`,
                        description: `${node.quantifier === '∀' ? 'Universal' : 'Existential'} quantifier over ${node.variable}`
                    });
                    functionCounter++;
                    break;
            }
        };

        processNode(ast);
        return steps;
    };

    const renderStep = (step, index) => {
        let color = 'text-blue-600';
        switch (step.type) {
            case 'basic': color = 'text-green-600'; break;
            case 'composition': color = 'text-red-600'; break;
            case 'minimization': color = 'text-yellow-600'; break;
        }

        return (
            <div key={index} className={`${color} my-1`}>
                <span className="font-bold">{step.content}</span>
                <span className="ml-2 text-gray-600">// {step.description}</span>
            </div>
        );
    };

    return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recursive Function Construction:</h3>
            {steps.length > 0 ? (
                <div className="font-mono">
                    {steps.map((step, index) => renderStep(step, index))}
                </div>
            ) : (
                <div className="flex items-center text-yellow-600">
                    <AlertCircle className="mr-2" />
                    <span>Enter a sentence to see its recursive function construction.</span>
                </div>
            )}
        </div>
    );
};

const GodelNumberingCreator: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [result, setResult] = useState<EncodingResult | null>(null);

    useEffect(() => {
        if (input) {
            const encodingResult = godelEncode(input);
            setResult(encodingResult);
        } else {
            setResult(null);
        }
    }, [input]);

    const handleSymbolClick = (symbol: string) => {
        setInput(prev => prev + symbol);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Gödel Numbering Creator with Recursive Function Builder</CardTitle>
            </CardHeader>
            <CardContent>
                <MathKeyboard onSymbolClick={handleSymbolClick} />
                <div className="mb-4">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter Peano Arithmetic sentence"
                    />
                </div>

                <RecursiveFunctionBuilder sentence={input} />

                {result && (
                    <div className="mt-4">
                        <p className="mb-2">Gödel Number: {result.godelNumber}</p>
                        <GodelTree encoding={result.encoding} />
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Encoding Details:</h3>
                            <ul className="list-disc pl-5">
                                {result.encoding.map((item, index) => (
                                    <li key={index}>
                                        {item.symbol}: {item.prime}^{item.code} = {item.factor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GodelNumberingCreator;