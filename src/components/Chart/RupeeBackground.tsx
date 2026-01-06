import React, { useEffect, useRef, useState } from 'react';
import { InflationDataPoint } from '../../types/inflation';
import rupeeNoteImage from '../../assets/hundred.png';

interface RupeeBackgroundProps {
  data: InflationDataPoint[];
  chartRef: React.RefObject<HTMLDivElement>;
}

interface ChartDimensions {
  width: number;
  height: number;
  plotLeft: number;
  plotTop: number;
  plotWidth: number;
  plotHeight: number;
}

/**
 * Displays the ₹100 note image clipped to appear only below the
 * inflation line - showing how much value has been lost.
 */
export function RupeeBackground({ data, chartRef }: RupeeBackgroundProps) {
  const [dimensions, setDimensions] = useState<ChartDimensions | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!chartRef.current) return;

      const svg = chartRef.current.querySelector('svg');
      const innerArea = chartRef.current.querySelector('.apexcharts-inner');

      if (!svg || !innerArea) return;

      const svgRect = svg.getBoundingClientRect();
      const gridBounds = innerArea.getBoundingClientRect();

      setDimensions({
        width: svgRect.width,
        height: svgRect.height,
        plotLeft: gridBounds.left - svgRect.left,
        plotTop: gridBounds.top - svgRect.top,
        plotWidth: gridBounds.width,
        plotHeight: gridBounds.height,
      });
    };

    if (chartRef.current) {
      observerRef.current = new MutationObserver(updateDimensions);
      observerRef.current.observe(chartRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    const timeout = setTimeout(updateDimensions, 200);
    window.addEventListener('resize', updateDimensions);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateDimensions);
      observerRef.current?.disconnect();
    };
  }, [chartRef, data]);

  if (!dimensions || data.length === 0) return null;

  const { plotLeft, plotTop, plotWidth, plotHeight } = dimensions;
  const baseValue = data[0].purchasingPower;

  // Generate clip polygon points relative to the plot area
  const points: string[] = [];
  data.forEach((d, i) => {
    const x = plotLeft + (i / (data.length - 1)) * plotWidth;
    const y = plotTop + (1 - d.purchasingPower / baseValue) * plotHeight;
    points.push(`${x}px ${y}px`);
  });

  // Close the polygon
  points.push(`${plotLeft + plotWidth}px ${plotTop + plotHeight}px`);
  points.push(`${plotLeft}px ${plotTop + plotHeight}px`);

  const clipPath = `polygon(${points.join(', ')})`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      <img
        src={rupeeNoteImage}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.4,
        }}
      />
    </div>
  );
}
