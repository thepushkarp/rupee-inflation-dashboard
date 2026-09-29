import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { HistoricalEvent, InflationDataPoint } from '@/types/inflation';
import styles from './InflationChart.module.css';

export interface EventPosition {
  year: number;
  x: number;
  y: number;
}

interface Props {
  positions: EventPosition[];
  events: HistoricalEvent[];
  data: InflationDataPoint[];
}

export function EventMarkers({ positions, events, data }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [placement, setPlacement] = useState({ left: 0, top: 0 });
  const active = pinned ?? hovered ?? focused;
  const activePosition = positions.find((point) => point.year === active);
  const activeEvents = events.filter((event) => event.year === active);
  const observation = data.find((point) => point.year === active);
  const activeIndex = positions.findIndex((point) => point.year === active);

  function dismiss() {
    clearTimeout(closeTimer.current);
    setPinned(null);
    setHovered(null);
    setFocused(null);
  }

  function leave() {
    closeTimer.current = setTimeout(() => setHovered(null), 180);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (active === null) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target) &&
        !panel.current?.contains(event.target)
      )
        dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (panel.current?.contains(document.activeElement)) {
        root.current?.querySelector<HTMLButtonElement>('[data-year="' + active + '"]')?.focus();
      }
      dismiss();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!activePosition || !panel.current || !root.current) return;
    const positionPanel = () => {
      const rect = root.current!.getBoundingClientRect();
      const popup = panel.current!.getBoundingClientRect();
      const x = rect.left + activePosition.x;
      const y = rect.top + activePosition.y;
      const top = y - popup.height - 14;
      setPlacement({
        left: Math.max(12, Math.min(x - 20, window.innerWidth - popup.width - 12)),
        top: Math.max(
          12,
          Math.min(top >= 12 ? top : y + 16, window.innerHeight - popup.height - 12)
        ),
      });
    };
    positionPanel();
    window.addEventListener('scroll', positionPanel, true);
    window.addEventListener('resize', positionPanel);
    return () => {
      window.removeEventListener('scroll', positionPanel, true);
      window.removeEventListener('resize', positionPanel);
    };
  }, [activePosition]);

  const popup =
    activePosition && observation && activeEvents.length > 0 ? (
      <div
        ref={panel}
        id="event-details"
        role="dialog"
        aria-label={'Events in ' + active}
        className={styles.popover}
        style={placement}
        onMouseEnter={() => clearTimeout(closeTimer.current)}
        onMouseLeave={leave}
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget) &&
            !root.current?.contains(event.relatedTarget)
          )
            setFocused(null);
        }}
      >
        <div className={styles.popoverHeading}>
          <span>{active}</span>
          <button type="button" onClick={dismiss}>
            Close
          </button>
        </div>
        {activeEvents.map((event) => (
          <div key={event.label} className={styles.eventDetail}>
            <h2>{event.label}</h2>
            <p>{event.impact}</p>
            {event.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            ))}
          </div>
        ))}
        <p className={styles.observed}>
          Annual CPI change:{' '}
          {observation.inflationRate === null
            ? 'Unavailable'
            : observation.inflationRate.toFixed(2) + '%'}
        </p>
        <nav className={styles.eventNavigation} aria-label="Browse events">
          <button
            type="button"
            disabled={activeIndex <= 0}
            onClick={() => setPinned(positions[activeIndex - 1]!.year)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={activeIndex >= positions.length - 1}
            onClick={() => setPinned(positions[activeIndex + 1]!.year)}
          >
            Next
          </button>
        </nav>
      </div>
    ) : null;

  return (
    <div ref={root} className={styles.events}>
      {positions.map((position, index) => {
        const labels = events
          .filter((event) => event.year === position.year)
          .map((event) => event.label)
          .join(', ');
        const isActive = active === position.year;
        return (
          <button
            key={position.year}
            data-year={position.year}
            type="button"
            className={styles.eventMarker}
            style={{ left: position.x, top: position.y }}
            aria-label={position.year + ': ' + labels}
            aria-expanded={isActive}
            aria-controls={isActive ? 'event-details' : undefined}
            aria-haspopup="dialog"
            data-active={isActive}
            onMouseEnter={() => {
              clearTimeout(closeTimer.current);
              setHovered(position.year);
            }}
            onMouseLeave={leave}
            onFocus={() => setFocused(position.year)}
            onBlur={(event) => {
              if (!panel.current?.contains(event.relatedTarget)) setFocused(null);
            }}
            onClick={() =>
              setPinned((current) => (current === position.year ? null : position.year))
            }
            onKeyDown={(event) => {
              if (event.key === 'Tab' && !event.shiftKey && isActive) {
                event.preventDefault();
                panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
              }
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const next = positions[index + (event.key === 'ArrowRight' ? 1 : -1)];
              if (next) {
                setPinned(null);
                root.current
                  ?.querySelector<HTMLButtonElement>('[data-year="' + next.year + '"]')
                  ?.focus();
              }
            }}
          />
        );
      })}
      {popup ? createPortal(popup, document.body) : null}
    </div>
  );
}
