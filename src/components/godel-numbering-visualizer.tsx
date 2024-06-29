import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const symbolMap = {
    '∀': 1, '∃': 2, '¬': 3, '∨': 4, '∧': 5, '→': 6, '↔': 7,
    '=': 8, '+': 9, '*': 10, '(': 11, ')': 12, '0': 13,
    'S': 14, 'x': 15, 'y': 16, 'z': 17
};

const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];

const godelEncode = (sentence) => {
    const symbols = sentence.split('');
    let godelNumber = 1n;
    const encoding = symbols.map((symbol, index) => {
        const code = symbolMap[symbol] || 0;
        const prime = BigInt(primes[index]);
        const factor = prime ** BigInt(code);
        godelNumber *= factor;
        return { symbol, code, prime: prime.toString(), factor: factor.toString() };
    });
    return { encoding, godelNumber: godelNumber.toString() };
};

const MathKeyboard = ({ onSymbolClick }) => {
    const symbols = ['∀', '∃', '¬', '∨', '∧', '→', '↔', '=', '+', '*', '(', ')', '0', 'S', 'x', 'y', 'z'];
    return (
        <div className="grid grid-cols-6 gap-2 mb-4">
            {symbols.map((symbol) => (
                <Button key={symbol} onClick={() => onSymbolClick(symbol)} variant="outline" className="w-10 h-10">
                    {symbol}
                </Button>
            ))}
        </div>
    );
};

const GodelTree = ({ encoding }) => {
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

const GodelNumberingCreator = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const handleSymbolClick = (symbol) => {
        setInput(prev => prev + symbol);
    };

    const handleEncode = () => {
        const { encoding, godelNumber } = godelEncode(input);
        setResult({ encoding, godelNumber });
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Enhanced Gödel Numbering Creator</CardTitle>
            </CardHeader>
            <CardContent>
                <MathKeyboard onSymbolClick={handleSymbolClick} />
                <div className="flex space-x-2 mb-4">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter Peano Arithmetic sentence"
                    />
                    <Button onClick={handleEncode}>Encode</Button>
                </div>

                {result && (
                    <div>
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