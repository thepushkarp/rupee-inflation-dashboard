import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { YearRangeSelector } from './YearRangeSelector';

describe('YearRangeSelector', () => {
  it('renders only valid start/end year options', () => {
    render(
      <YearRangeSelector
        yearRange={{ startYear: 2000, endYear: 2005 }}
        availableRange={{ min: 1990, max: 2020 }}
        onChange={() => {}}
      />
    );

    const startSelect = screen.getByLabelText('Start year');
    const endSelect = screen.getByLabelText('End year');

    expect(within(startSelect).queryByRole('option', { name: '2005' })).toBeNull();
    expect(within(endSelect).queryByRole('option', { name: '2000' })).toBeNull();
  });

  it('calls onChange with a valid range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <YearRangeSelector
        yearRange={{ startYear: 2000, endYear: 2005 }}
        availableRange={{ min: 1990, max: 2020 }}
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('Start year'), '2003');
    expect(onChange).toHaveBeenLastCalledWith({ startYear: 2003, endYear: 2005 });

    await user.selectOptions(screen.getByLabelText('End year'), '2004');
    expect(onChange).toHaveBeenLastCalledWith({ startYear: 2000, endYear: 2004 });
  });
});
