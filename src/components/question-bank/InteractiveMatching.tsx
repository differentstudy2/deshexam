'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface MatchingPair {
    left: string;
    right: string;
    leftImage?: string;
    rightImage?: string;
}

interface InteractiveMatchingProps {
    pairs: MatchingPair[];
    testMode?: boolean;
    onAttempt?: (isCorrect: boolean) => void;
    showAnswer?: boolean; // Prop to force show answers
}

interface Connection {
    leftIndex: number; // original index
    rightId: string;   // right node unique id (because they are shuffled)
}

export default function InteractiveMatching({ pairs, testMode = false, onAttempt, showAnswer = false }: InteractiveMatchingProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // We need to shuffle the right side. We'll store an array of objects to keep track of their original correct index.
    const [shuffledRight, setShuffledRight] = useState<{ id: string; content: string; image?: string; correctLeftIndex: number }[]>([]);
    
    // Connections established by the user
    const [connections, setConnections] = useState<Connection[]>([]);
    
    // Currently selected node waiting for a pair
    const [activeSelection, setActiveSelection] = useState<{ side: 'left' | 'right', indexOrId: string | number } | null>(null);
    
    // State of the component
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [svgHeight, setSvgHeight] = useState(0);

    // Refs for calculating positions
    const leftRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const rightRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // We force a re-render for SVG lines on resize
    const [tick, setTick] = useState(0);

    useEffect(() => {
        // Only shuffle once on mount
        const rightItems = pairs.map((p, i) => ({
            id: `r_${i}_${Math.random().toString(36).substr(2, 9)}`,
            content: p.right,
            image: p.rightImage,
            correctLeftIndex: i
        }));
        
        // Always shuffle the right side so it looks like a matching puzzle
        // We use rejection sampling to guarantee a "derangement" (no item in its original spot)
        // so that the lines always crisscross beautifully.
        let isValidShuffle = false;
        let attempts = 0;
        
        while (!isValidShuffle && attempts < 50) {
            // Simple Fisher-Yates shuffle
            for (let i = rightItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
            }
            
            // Check if it's a derangement
            isValidShuffle = true;
            for (let i = 0; i < rightItems.length; i++) {
                if (rightItems[i].correctLeftIndex === i) {
                    isValidShuffle = false;
                    break;
                }
            }
            
            // If only 1 item, a derangement is impossible
            if (rightItems.length <= 1) break;
            
            attempts++;
        }
        
        // If not in test mode (reading mode), automatically connect them correctly
        if (!testMode) {
            const initialConnections = rightItems.map((item) => ({
                leftIndex: item.correctLeftIndex,
                rightId: item.id
            }));
            setConnections(initialConnections);
            setIsSubmitted(true);
        }
        
        setShuffledRight(rightItems);
    }, [pairs]);

    useEffect(() => {
        if (showAnswer) {
            setIsSubmitted(true);
        }
    }, [showAnswer]);

    useEffect(() => {
        const handleResize = () => setTick(t => t + 1);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update SVG height based on container height to ensure we can draw lines fully
    useEffect(() => {
        if (containerRef.current) {
            const updateHeight = () => {
                if (containerRef.current) {
                    setSvgHeight(containerRef.current.scrollHeight);
                }
            };
            
            // Allow layout to settle
            setTimeout(updateHeight, 50);
            updateHeight();
        }
    }, [shuffledRight, tick]);

    const handleNodeClick = (side: 'left' | 'right', indexOrId: string | number) => {
        if (!testMode || isSubmitted) return;

        // If nothing is selected, select this node
        if (!activeSelection) {
            setActiveSelection({ side, indexOrId });
            return;
        }

        // If clicking the same node, deselect it
        if (activeSelection.side === side && activeSelection.indexOrId === indexOrId) {
            setActiveSelection(null);
            return;
        }

        // If clicking a node on the same side, switch selection
        if (activeSelection.side === side) {
            setActiveSelection({ side, indexOrId });
            return;
        }

        // Valid connection (one left, one right)
        const leftIndex = side === 'left' ? (indexOrId as number) : (activeSelection.indexOrId as number);
        const rightId = side === 'right' ? (indexOrId as string) : (activeSelection.indexOrId as string);

        // Remove any existing connections for these nodes
        const newConnections = connections.filter(c => c.leftIndex !== leftIndex && c.rightId !== rightId);
        newConnections.push({ leftIndex, rightId });
        
        setConnections(newConnections);
        setActiveSelection(null);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        
        // Calculate correctness
        let correctCount = 0;
        connections.forEach(conn => {
            const rightItem = shuffledRight.find(r => r.id === conn.rightId);
            if (rightItem && rightItem.correctLeftIndex === conn.leftIndex) {
                correctCount++;
            }
        });
        
        const isFullyCorrect = correctCount === pairs.length && connections.length === pairs.length;
        if (onAttempt) {
            onAttempt(isFullyCorrect);
        }
    };

    const renderLines = () => {
        if (!containerRef.current) return null;
        const containerRect = containerRef.current.getBoundingClientRect();

        return connections.map(conn => {
            const leftEl = leftRefs.current[conn.leftIndex];
            const rightEl = rightRefs.current[conn.rightId];
            
            if (!leftEl || !rightEl) return null;

            const leftRect = leftEl.getBoundingClientRect();
            const rightRect = rightEl.getBoundingClientRect();

            // Calculate center points of the connection dots
            // The dots are aligned on the right side of left item, and left side of right item
            const startX = leftRect.right - containerRect.left;
            const startY = leftRect.top + (leftRect.height / 2) - containerRect.top;
            
            const endX = rightRect.left - containerRect.left;
            const endY = rightRect.top + (rightRect.height / 2) - containerRect.top;

            // Determine line color
            let strokeColor = "#10b981"; // default green-ish for established line
            let strokeWidth = 3;
            let opacity = 1;

            if (isSubmitted) {
                const rightItem = shuffledRight.find(r => r.id === conn.rightId);
                const isCorrect = rightItem && rightItem.correctLeftIndex === conn.leftIndex;
                strokeColor = isCorrect ? "#10b981" : "#ef4444"; // emerald-500 or red-500
                strokeWidth = isCorrect ? 4 : 3;
                opacity = isCorrect ? 1 : 0.6;
            }

            // Create a nice cubic bezier curve
            const controlPointOffsetX = Math.abs(endX - startX) * 0.5;
            const pathData = `M ${startX} ${startY} C ${startX + controlPointOffsetX} ${startY}, ${endX - controlPointOffsetX} ${endY}, ${endX} ${endY}`;

            return (
                <path 
                    key={`${conn.leftIndex}-${conn.rightId}`}
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{ opacity, transition: 'all 0.3s ease-in-out' }}
                />
            );
        });
    };

    // Auto-reveal missing answers if submitted
    const renderMissingLines = () => {
        if (!isSubmitted || !containerRef.current) return null;
        const containerRect = containerRef.current.getBoundingClientRect();

        return pairs.map((pair, idx) => {
            // Did user connect this left index correctly?
            const userConn = connections.find(c => c.leftIndex === idx);
            const rightItemForUserConn = userConn ? shuffledRight.find(r => r.id === userConn.rightId) : null;
            const userWasCorrect = rightItemForUserConn?.correctLeftIndex === idx;

            // If user didn't get it right, show the correct line as a dashed/faded line
            if (!userWasCorrect) {
                const correctRightItem = shuffledRight.find(r => r.correctLeftIndex === idx);
                if (!correctRightItem) return null;

                const leftEl = leftRefs.current[idx];
                const rightEl = rightRefs.current[correctRightItem.id];
                
                if (!leftEl || !rightEl) return null;

                const leftRect = leftEl.getBoundingClientRect();
                const rightRect = rightEl.getBoundingClientRect();

                const startX = leftRect.right - containerRect.left;
                const startY = leftRect.top + (leftRect.height / 2) - containerRect.top;
                
                const endX = rightRect.left - containerRect.left;
                const endY = rightRect.top + (rightRect.height / 2) - containerRect.top;

                const controlPointOffsetX = Math.abs(endX - startX) * 0.5;
                const pathData = `M ${startX} ${startY} C ${startX + controlPointOffsetX} ${startY}, ${endX - controlPointOffsetX} ${endY}, ${endX} ${endY}`;

                return (
                    <path 
                        key={`missing-${idx}`}
                        d={pathData}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        strokeLinecap="round"
                        style={{ opacity: 0.5 }}
                    />
                );
            }
            return null;
        });
    };

    if (shuffledRight.length === 0) return null;

    const isAllConnected = connections.length === pairs.length;

    return (
        <div className="flex flex-col mb-6">
            <div className="grid grid-cols-2 gap-8 text-sm font-bold text-slate-500 mb-4 px-2 text-center">
                <div>Column A</div>
                <div>Column B</div>
            </div>
            
            <div 
                ref={containerRef} 
                className="relative grid grid-cols-2 gap-x-16 gap-y-4 select-none px-2"
                style={{ paddingBottom: '20px' }} // extra space for last dot
            >
                {/* SVG Overlay for lines */}
                <svg 
                    className="absolute inset-0 pointer-events-none z-10" 
                    style={{ width: '100%', height: svgHeight > 0 ? svgHeight : '100%', overflow: 'visible' }}
                >
                    {renderMissingLines()}
                    {renderLines()}
                </svg>

                {/* Left Column */}
                <div className="flex flex-col gap-4 relative z-20">
                    {pairs.map((pair, idx) => {
                        const isSelected = activeSelection?.side === 'left' && activeSelection.indexOrId === idx;
                        const isConnected = connections.some(c => c.leftIndex === idx);
                        
                        let bgClass = "bg-white dark:bg-slate-900";
                        let borderClass = "border-slate-200 dark:border-slate-700";
                        
                        if (isSelected) {
                            bgClass = "bg-green-50 dark:bg-green-900/20";
                            borderClass = "border-green-400";
                        } else if (isConnected) {
                            bgClass = "bg-slate-50 dark:bg-slate-800/50";
                            borderClass = "border-slate-300 dark:border-slate-600";
                        }

                        // Status icon if submitted
                        let StatusIcon = null;
                        if (isSubmitted && isConnected) {
                            const conn = connections.find(c => c.leftIndex === idx);
                            const rightItem = shuffledRight.find(r => r.id === conn?.rightId);
                            if (rightItem && rightItem.correctLeftIndex === idx) {
                                StatusIcon = <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />;
                            } else {
                                StatusIcon = <XCircle className="w-5 h-5 text-red-500 ml-auto" />;
                            }
                        } else if (isSubmitted && !isConnected) {
                            StatusIcon = <XCircle className="w-5 h-5 text-red-500 ml-auto" />;
                        }

                        return (
                            <div 
                                key={`left-${idx}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-all relative pr-8",
                                    bgClass, borderClass,
                                    !isSubmitted && testMode ? "cursor-pointer hover:shadow-md" : ""
                                )}
                                onClick={() => handleNodeClick('left', idx)}
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold uppercase border border-slate-200 dark:border-slate-700">
                                    {String.fromCharCode(65 + idx)} {/* A, B, C */}
                                </div>
                                {pair.leftImage && (
                                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                        <img src={pair.leftImage} alt="Left match" className="object-cover w-full h-full" />
                                    </div>
                                )}
                                <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">{pair.left}</span>
                                
                                {StatusIcon}

                                {/* Connection Dot */}
                                <div 
                                    ref={el => { leftRefs.current[idx] = el }}
                                    className={cn(
                                        "absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 transition-colors z-20",
                                        isSelected || isConnected ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600 hover:bg-green-400"
                                    )}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 relative z-20">
                    {shuffledRight.map((item, idx) => {
                        const isSelected = activeSelection?.side === 'right' && activeSelection.indexOrId === item.id;
                        const isConnected = connections.some(c => c.rightId === item.id);
                        
                        let bgClass = "bg-white dark:bg-slate-900";
                        let borderClass = "border-slate-200 dark:border-slate-700";
                        
                        if (isSelected) {
                            bgClass = "bg-green-50 dark:bg-green-900/20";
                            borderClass = "border-green-400";
                        } else if (isConnected) {
                            bgClass = "bg-slate-50 dark:bg-slate-800/50";
                            borderClass = "border-slate-300 dark:border-slate-600";
                        }

                        return (
                            <div 
                                key={`right-${item.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-all relative pl-8",
                                    bgClass, borderClass,
                                    !isSubmitted && testMode ? "cursor-pointer hover:shadow-md" : ""
                                )}
                                onClick={() => handleNodeClick('right', item.id)}
                            >
                                {/* Connection Dot */}
                                <div 
                                    ref={el => { rightRefs.current[item.id] = el }}
                                    className={cn(
                                        "absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 transition-colors z-20",
                                        isSelected || isConnected ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600 hover:bg-green-400"
                                    )}
                                />

                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700">
                                    {idx + 1} {/* 1, 2, 3 */}
                                </div>
                                {item.image && (
                                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                        <img src={item.image} alt="Right match" className="object-cover w-full h-full" />
                                    </div>
                                )}
                                <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">{item.content}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Area */}
            {testMode && !isSubmitted && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={!isAllConnected}
                        className={cn(
                            "px-6 py-2.5 rounded-full font-bold transition-all",
                            isAllConnected 
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        )}
                    >
                        Submit Matches
                    </button>
                </div>
            )}
        </div>
    );
}
