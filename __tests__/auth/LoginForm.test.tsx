import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../components/auth/LoginForm';

describe('LoginForm', () => {
  const mockSubmit = jest.fn();
  const mockProps = {
    onSubmit: mockSubmit,
    error: null,
    loading: false,
  };

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders email and password fields', () => {
    render(<LoginForm {...mockProps} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm {...mockProps} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty password', async () => {
    render(<LoginForm {...mockProps} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    render(<LoginForm {...mockProps} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
    
    const calledWith = mockSubmit.mock.calls[0][0];
    expect(calledWith).toHaveProperty('login', 'test@example.com');
    expect(calledWith).toHaveProperty('password', 'password123');
  });

  it('displays server error message', () => {
    render(<LoginForm {...mockProps} error="Invalid credentials" />);
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('disables submit button when loading', () => {
    render(<LoginForm {...mockProps} loading={true} />);
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
