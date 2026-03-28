'use client';

/**
 * Mermaid Diagram Component
 * Renders Mermaid diagrams from code blocks
 * Perfect for organizational charts, flowcharts, and visualizations
 */

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid with Apex blue theme
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#2c5aa0',
        primaryTextColor: '#fff',
        primaryBorderColor: '#1a4075',
        lineColor: '#2c5aa0',
        secondaryColor: '#4a90e2',
        tertiaryColor: '#e3f2fd',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      flowchart: {
        curve: 'basis',
        padding: 20,
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
      },
    });

    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
        containerRef.current.innerHTML = svg;
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        containerRef.current.innerHTML = `<div class="text-red-600 p-4 border border-red-300 rounded bg-red-50">
          <p class="font-bold">⚠️ Diagram Error</p>
          <pre class="text-xs mt-2 overflow-auto">${error}</pre>
        </div>`;
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className={`mermaid-diagram bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}
