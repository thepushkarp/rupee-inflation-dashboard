import React from 'react';
import { YearRange } from '../../types/inflation';
import styles from './YearRangeSelector.module.css';

interface YearRangeSelectorProps {
  yearRange: YearRange;
  availableRange: { min: number; max: number };
  onChange: (range: YearRange) => void;
}

export function YearRangeSelector({
  yearRange,
  availableRange,
  onChange,
}: YearRangeSelectorProps) {
  const years = Array.from(
    { length: availableRange.max - availableRange.min + 1 },
    (_, i) => availableRange.min + i
  );

  const handleStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = parseInt(e.target.value);
    onChange({
      startYear: newStart,
      endYear: Math.max(newStart + 1, yearRange.endYear),
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnd = parseInt(e.target.value);
    onChange({
      startYear: Math.min(yearRange.startYear, newEnd - 1),
      endYear: newEnd,
    });
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        From
        <select
          className={styles.select}
          value={yearRange.startYear}
          onChange={handleStartChange}
          aria-label="Start year"
        >
          {years
            .filter((y) => y < yearRange.endYear)
            .map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
      </label>

      <span className={styles.separator}>—</span>

      <label className={styles.label}>
        To
        <select
          className={styles.select}
          value={yearRange.endYear}
          onChange={handleEndChange}
          aria-label="End year"
        >
          {years
            .filter((y) => y > yearRange.startYear)
            .map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
}
