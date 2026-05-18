import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PinForm } from '../../components/auth/PinForm';

describe('PinForm', () => {
  const mockSubmit = jest.fn();
  const mockProps = {
    onSubmit: mockSubmit,
    error: null,
    loading: false,
  };

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders 4 PIN input boxes', () => {
    render(<PinForm {...mockProps} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('auto-submits when all 4 digits are entered', async () => {
    render(<PinForm {...mockProps} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });
    fireEvent.change(inputs[3], { target: { value: '4' } });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({ pin: '1234' });
    });
  });

  it('only accepts digits in each input', () => {
    render(<PinForm {...mockProps} />);
    const input = screen.getAllByRole('textbox')[0];

    fireEvent.change(input, { target: { value: 'a' } });
    expect(input).toHaveValue('');
  });

  it('moves to next input after entering a digit', () => {
    render(<PinForm {...mockProps} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('handles backspace to clear digit then move to previous input', () => {
    render(<PinForm {...mockProps} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[1], { target: { value: '2' } });
    expect(inputs[1]).toHaveValue('2');

    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    expect(inputs[1]).toHaveValue('');
    expect(document.activeElement?.getAttribute('type')).toBe('text');

    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('displays server error message', () => {
    render(<PinForm {...mockProps} error="Invalid PIN" />);
    expect(screen.getByText(/invalid pin/i)).toBeInTheDocument();
  });

  it('has a clear button when error is shown', () => {
    render(<PinForm {...mockProps} error="Invalid PIN" />);
    expect(screen.getByText(/clear/i)).toBeInTheDocument();
  });

  it('shows verifying text when loading', () => {
    render(<PinForm {...mockProps} loading={true} />);
    expect(screen.getByText(/verifying/i)).toBeInTheDocument();
  });
});
