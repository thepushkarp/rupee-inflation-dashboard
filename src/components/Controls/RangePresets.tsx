import type { YearRange } from '@/types/inflation';

import styles from './RangePresets.module.css';

interface RangePresetsProps {
  availableRange: { min: number; max: number };
  activeRange: YearRange;
  onSelect: (range: YearRange) => void;
}

function rangesEqual(a: YearRange, b: YearRange) {
  return a.startYear === b.startYear && a.endYear === b.endYear;
}

export function RangePresets({ availableRange, activeRange, onSelect }: RangePresetsProps) {
  const max = availableRange.max;

  const presets: Array<{ label: string; range: YearRange }> = [
    { label: 'Full', range: { startYear: availableRange.min, endYear: max } },
    { label: '1991→Now', range: { startYear: 1991, endYear: max } },
    { label: '2008→Now', range: { startYear: 2008, endYear: max } },
    { label: '2016→Now', range: { startYear: 2016, endYear: max } },
  ]
    .map((preset) => ({
      ...preset,
      range: {
        startYear: Math.max(availableRange.min, preset.range.startYear),
        endYear: Math.min(availableRange.max, preset.range.endYear),
      },
    }))
    .filter((preset) => preset.range.startYear < preset.range.endYear);

  return (
    <div className={styles.container} aria-label="Year range presets">
      {presets.map((preset) => {
        const isActive = rangesEqual(preset.range, activeRange);
        return (
          <button
            key={preset.label}
            type="button"
            className={isActive ? styles.pillActive : styles.pill}
            onClick={() => onSelect(preset.range)}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
