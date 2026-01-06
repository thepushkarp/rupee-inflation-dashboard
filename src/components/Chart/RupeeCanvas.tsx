import React, { useRef, useEffect, useCallback } from 'react';
import { InflationDataPoint } from '../../types/inflation';
import styles from './RupeeCanvas.module.css';

// Import the rupee note image
import rupeeNoteUrl from '../../assets/hundred.png';

interface RupeeCanvasProps {
  data: InflationDataPoint[];
  chartRef: React.RefObject<HTMLDivElement | null>;
}

interface PlotDimensions {
  plotLeft: number;
  plotTop: number;
  plotWidth: number;
  plotHeight: number;
}

/**
 * Canvas component that draws the ₹100 note image,
 * clipped to only show below the inflation line.
 */
export function RupeeCanvas({ data, chartRef }: RupeeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Get plot area dimensions from ApexCharts DOM
  const getPlotDimensions = useCallback((): PlotDimensions | null => {
    if (!chartRef.current) return null;

    const plotArea = chartRef.current.querySelector('.apexcharts-inner');
    const svg = chartRef.current.querySelector('svg');

    if (!plotArea || !svg) return null;

    const svgRect = svg.getBoundingClientRect();
    const plotRect = plotArea.getBoundingClientRect();

    return {
      plotLeft: plotRect.left - svgRect.left,
      plotTop: plotRect.top - svgRect.top,
      plotWidth: plotRect.width,
      plotHeight: plotRect.height,
    };
  }, [chartRef]);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img || data.length === 0) return;

    const dims = getPlotDimensions();
    if (!dims) {
      // Chart not ready yet, retry
      animationFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const { plotLeft, plotTop, plotWidth, plotHeight } = dims;

    // Set canvas size to match container
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate base value (first data point)
    const baseValue = data[0].purchasingPower;

    // Y-axis range matches chartConfig.ts (yaxis.min/max)
    const Y_AXIS_MIN = 0;
    const Y_AXIS_MAX = 105;

    // Build clip path from inflation line down to bottom
    ctx.save();
    ctx.beginPath();

    // Trace the inflation line path
    data.forEach((point, i) => {
      const x = plotLeft + (i / (data.length - 1)) * plotWidth;

      // Calculate chart value (same formula as chartConfig.createChartSeries)
      const chartValue = (point.purchasingPower / baseValue) * 100;

      // Map to Y position using chart's axis range
      const y =
        plotTop +
        ((Y_AXIS_MAX - chartValue) / (Y_AXIS_MAX - Y_AXIS_MIN)) * plotHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close path: go to bottom-right, bottom-left, back to start
    ctx.lineTo(plotLeft + plotWidth, plotTop + plotHeight);
    ctx.lineTo(plotLeft, plotTop + plotHeight);
    ctx.closePath();
    ctx.clip();

    // Draw the rupee note image, centered in plot area
    // Maintain aspect ratio, scale to fit height
    const imgAspect = img.width / img.height;
    const drawHeight = plotHeight * 0.9; // 90% of plot height
    const drawWidth = drawHeight * imgAspect;

    const drawX = plotLeft + (plotWidth - drawWidth) / 2;
    const drawY = plotTop + (plotHeight - drawHeight) / 2;

    // Slight opacity for subtlety
    ctx.globalAlpha = 0.15;
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    ctx.restore();
  }, [data, getPlotDimensions]);

  // Load the rupee note image once
  useEffect(() => {
    const img = new Image();
    img.src = rupeeNoteUrl;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
    return () => {
      imageRef.current = null;
    };
  }, [draw]);

  // Redraw on data change or resize
  useEffect(() => {
    const handleResize = () => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Initial draw with delay to let ApexCharts render
    const timeout = setTimeout(() => {
      draw();
    }, 300);

    // Watch for chart mutations
    let observer: MutationObserver | null = null;
    if (chartRef.current) {
      observer = new MutationObserver(handleResize);
      observer.observe(chartRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [chartRef, draw]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
