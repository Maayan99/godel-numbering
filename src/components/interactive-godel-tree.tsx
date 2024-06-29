import React, { useState, useCallback } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinkRadial } from '@visx/shape';
import { useSpring, animated } from '@react-spring/web';

const InteractiveGodelTree = ({ encoding }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    const width = 600;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 80;

    const data = {
        name: 'Gödel Number',
        children: encoding.map((item) => ({
            name: item.symbol,
            children: [
                { name: `Prime: ${item.prime}`, size: 1 },
                { name: `Code: ${item.code}`, size: 1 },
                { name: `Factor: ${item.factor}`, size: 1 },
            ],
        })),
    };

    const root = hierarchy(data);
    root.dx = 10;
    root.dy = radius / (root.height + 1);

    const DragNode = ({ node }) => {
        const [position, setPosition] = useState({ x: node.x, y: node.y });
        const [isDragging, setIsDragging] = useState(false);

        const springProps = useSpring({
            x: position.x,
            y: position.y,
            config: { tension: 300, friction: 30 },
        });

        const handleMouseDown = useCallback((event) => {
            event.stopPropagation();
            setIsDragging(true);
        }, []);

        const handleMouseMove = useCallback((event) => {
            if (isDragging) {
                setPosition((prev) => ({
                    x: prev.x + event.movementX,
                    y: prev.y + event.movementY,
                }));
            }
        }, [isDragging]);

        const handleMouseUp = useCallback(() => {
            setIsDragging(false);
        }, []);

        return (
            <animated.g
                transform={`translate(${springProps.x}, ${springProps.y})`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <circle
                    r={10}
                    fill={node.data.name === selectedNode?.name ? '#f6ad55' : '#4299e1'}
                    stroke={isDragging ? '#f6ad55' : '#2b6cb0'}
                    strokeWidth={2}
                    onClick={() => setSelectedNode(node.data)}
                    cursor="pointer"
                />
                <text
                    dy=".33em"
                    fontSize={9}
                    fontFamily="Arial"
                    textAnchor="middle"
                    fill="#2d3748"
                    style={{ pointerEvents: 'none' }}
                >
                    {node.data.name.length > 10 ? `${node.data.name.slice(0, 10)}...` : node.data.name}
                </text>
            </animated.g>
        );
    };

    return (
        <div className="relative">
            <svg width={width} height={height}>
                <Group top={centerY} left={centerX}>
                    <Tree root={root} size={[2 * Math.PI, radius]}>
                        {(tree) => (
                            <Group>
                                {tree.links().map((link, i) => (
                                    <LinkRadial
                                        key={i}
                                        data={link}
                                        stroke="#4299e1"
                                        strokeWidth="1"
                                        fill="none"
                                    />
                                ))}
                                {tree.descendants().map((node, i) => (
                                    <DragNode key={i} node={node} />
                                ))}
                            </Group>
                        )}
                    </Tree>
                </Group>
            </svg>
            {selectedNode && (
                <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">{selectedNode.name}</h3>
                    {selectedNode.children && (
                        <ul className="list-disc pl-5">
                            {selectedNode.children.map((child, index) => (
                                <li key={index}>{child.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default InteractiveGodelTree;