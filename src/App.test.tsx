import { render, screen } from '@testing-library/react';
import App from './App';

// Mock SWR to avoid actual API calls in tests
jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({
    data: [
      { year: 1960, cpi: 100, purchasingPower: 100, inflationRate: 0 },
      { year: 1970, cpi: 150, purchasingPower: 66.67, inflationRate: 5 },
      { year: 1980, cpi: 200, purchasingPower: 50, inflationRate: 4 },
    ],
    error: undefined,
    isLoading: false,
  }),
  mutate: jest.fn(),
}));

describe('App', () => {
  test('renders the dashboard title', () => {
    render(<App />);
    expect(screen.getByText(/Rupee Inflation Dashboard/i)).toBeInTheDocument();
  });

  test('renders year range selectors', () => {
    render(<App />);
    expect(screen.getByLabelText(/Start year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End year/i)).toBeInTheDocument();
  });

  test('displays purchasing power statistics', () => {
    render(<App />);
    expect(screen.getByText(/Value of ₹100/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchasing Power Lost/i)).toBeInTheDocument();
  });
});
