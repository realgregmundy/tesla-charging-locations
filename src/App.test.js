import { render, screen } from '@testing-library/react';
import App from './App';

test('App should load without crashing', () => {
  render(<App />);
});
