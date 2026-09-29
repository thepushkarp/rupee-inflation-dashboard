import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { historicalEvents } from '@data/historicalEvents';
import type { InflationDataPoint } from '@/types/inflation';
import { createChartOptions, createChartSeries, purchasingPower } from './chartConfig';
import { EventMarkers, type EventPosition } from './EventMarkers';
import styles from './InflationChart.module.css';

const ApexChart = lazy(async () => ({ default: (await import('react-apexcharts')).default }));
const SVG_NS = 'http://www.w3.org/2000/svg';

export function InflationChart({ data }: { data: InflationDataPoint[] }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const clipId = 'note-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [positions, setPositions] = useState<EventPosition[]>([]);
  const [imageFailed, setImageFailed] = useState(false);
  const events = useMemo(
    () => historicalEvents.filter((event) => data.some((point) => point.year === event.year)),
    [data]
  );
  const rangeKey = data[0]?.year + '-' + data.at(-1)?.year;

  const syncPlot = useCallback(() => {
    const container = root.current;
    const area = container?.querySelector<SVGPathElement>('.apexcharts-area');
    const grid = container?.querySelector<SVGGElement>('.apexcharts-grid');
    if (!container || !area || !grid || !area.parentNode) return;
    const bounds = grid.getBBox();
    let layer = container.querySelector<SVGGElement>('[data-banknote]');
    if (!layer) {
      layer = document.createElementNS(SVG_NS, 'g');
      layer.setAttribute('data-banknote', '');
      layer.setAttribute('pointer-events', 'none');
      layer.setAttribute('aria-hidden', 'true');
      const defs = document.createElementNS(SVG_NS, 'defs');
      const clip = document.createElementNS(SVG_NS, 'clipPath');
      clip.id = clipId;
      clip.appendChild(document.createElementNS(SVG_NS, 'path'));
      defs.appendChild(clip);
      layer.appendChild(defs);
      const image = document.createElementNS(SVG_NS, 'image');
      image.setAttribute('href', '/rupee-100.jpg');
      image.setAttribute('preserveAspectRatio', 'xMidYMax slice');
      image.setAttribute('clip-path', 'url(#' + clipId + ')');
      image.addEventListener('error', () => setImageFailed(true), { once: true });
      image.addEventListener('load', () => setImageFailed(false), { once: true });
      layer.appendChild(image);
      area.parentNode.insertBefore(layer, area);
    }
    // Reuse the rendered area path in its SVG coordinate system: a separately
    // calculated curve can drift from the note mask when the plot is resized.
    layer.querySelector('path')!.setAttribute('d', area.getAttribute('d') ?? '');
    const image = layer.querySelector('image')!;
    image.setAttribute('x', String(bounds.x));
    image.setAttribute('y', String(bounds.y));
    image.setAttribute('width', String(bounds.width));
    image.setAttribute('height', String(bounds.height));
    const containerRect = container.getBoundingClientRect();
    const next = [...new Set(events.map((event) => event.year))].flatMap((year) => {
      const marker = container.querySelector('.apexcharts-point-annotation-marker.event-' + year);
      if (!marker) return [];
      const rect = marker.getBoundingClientRect();
      return [
        {
          year,
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        },
      ];
    });
    setPositions((previous) =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next
    );
  }, [clipId, events]);

  const scheduleSync = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(syncPlot);
  }, [syncPlot]);

  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(scheduleSync);
    observer.observe(root.current);
    scheduleSync();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [scheduleSync]);

  const options = useMemo(
    () => createChartOptions(data, events, scheduleSync),
    [data, events, scheduleSync]
  );
  const series = useMemo(() => createChartSeries(data), [data]);
  const first = data.at(0);
  const last = data.at(-1);
  if (!first || !last) return null;

  return (
    <section aria-label="Purchasing power of ₹100" className={styles.chartSection}>
      <p className={styles.srOnly}>
        ₹100 in {last.year} has the purchasing power of ₹{purchasingPower(data, last).toFixed(2)} in{' '}
        {first.year}. Explore the event points for historical context.
      </p>
      <div ref={root} className={styles.chartWrapper}>
        <Suspense
          fallback={
            <div className={styles.skeleton} role="status">
              Loading chart…
            </div>
          }
        >
          <ApexChart
            key={rangeKey}
            options={options}
            series={series}
            type="area"
            height="100%"
            width="100%"
          />
        </Suspense>
        <EventMarkers key={rangeKey} positions={positions} events={events} data={data} />
      </div>
      {imageFailed ? (
        <p className={styles.imageError} role="status">
          Banknote image couldn’t load. The chart data is still available.
        </p>
      ) : null}
    </section>
  );
}
