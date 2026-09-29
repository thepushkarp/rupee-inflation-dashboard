import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { EventMarkers } from './EventMarkers';
import { historicalEvents } from '@data/historicalEvents';

const data = [
  { year: 1973, cpi: 100, inflationRate: 17 },
  { year: 1979, cpi: 150, inflationRate: 6 },
];
const positions = [
  { year: 1973, x: 100, y: 100 },
  { year: 1979, x: 200, y: 200 },
];

it('opens sourced context on hover, stays open over the popup, and dismisses with Escape', async () => {
  const user = userEvent.setup();
  render(<EventMarkers positions={positions} events={historicalEvents} data={data} />);
  await user.hover(screen.getByRole('button', { name: '1973: First oil shock' }));
  const popup = screen.getByRole('dialog', { name: 'Events in 1973' });
  await user.hover(popup);
  expect(screen.getByRole('link', { name: 'RBI: monetary policy history' })).toHaveAttribute(
    'href',
    expect.stringContaining('rbi.org.in')
  );
  expect(screen.getByText('Annual CPI change: 17.00%')).toBeVisible();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('supports keyboard focus, source access, arrow navigation and outside dismissal', async () => {
  const user = userEvent.setup();
  render(<EventMarkers positions={positions} events={historicalEvents} data={data} />);
  await user.tab();
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Events in 1973');
  await user.tab();
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('link', { name: 'RBI: monetary policy history' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: '1973: First oil shock' })).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Events in 1979');
  await user.click(document.body);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('pins on touch and groups events in the same year under one point', async () => {
  render(
    <EventMarkers
      positions={[positions[0]!]}
      events={[
        historicalEvents.find((event) => event.year === 1973)!,
        { year: 1973, label: 'Drought', impact: 'Supply pressure.', sources: [] },
      ]}
      data={data}
    />
  );
  const marker = screen.getByRole('button', { name: '1973: First oil shock, Drought' });
  fireEvent.pointerDown(marker, { pointerType: 'touch' });
  fireEvent.click(marker);
  fireEvent.mouseLeave(marker);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Drought' })).toBeVisible());
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.queryByRole('button', { name: /1979/ })).toBeNull();
});

it('lets touch users browse nearby events without targeting crowded markers', () => {
  render(<EventMarkers positions={positions} events={historicalEvents} data={data} />);
  fireEvent.click(screen.getByRole('button', { name: '1973: First oil shock' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Events in 1979');
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Events in 1973');
});
