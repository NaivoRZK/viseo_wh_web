import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useCouloirDialog } from '@/lib/stores/couloir';

const mockPush = jest.fn();
const mockGetDepots = jest.fn();
const mockGetCouloirs = jest.fn();
const mockCreateCouloir = jest.fn();
const mockUpdateCouloir = jest.fn();
const mockDeleteCouloir = jest.fn();

let mockAuth: { user: unknown; hydrated: boolean } = { user: null, hydrated: false };

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/auth/context', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('@/lib/actions/depots', () => ({
  getDepotsAction: (...args: unknown[]) => mockGetDepots(...args),
}));

jest.mock('@/lib/actions/couloirs', () => ({
  getCouloirsAction: (...args: unknown[]) => mockGetCouloirs(...args),
  createCouloirAction: (...args: unknown[]) => mockCreateCouloir(...args),
  updateCouloirAction: (...args: unknown[]) => mockUpdateCouloir(...args),
  deleteCouloirAction: (...args: unknown[]) => mockDeleteCouloir(...args),
  generateNextCouloirNameAction: jest.fn().mockResolvedValue({ num_couloir: 'C001', nom_couloir: 'Couloir C001', num_depot: '1' }),
}));

const mockDepots = [
  { id: 1, num_depot: 101, nom_depot: 'Dépôt A' },
  { id: 2, num_depot: 102, nom_depot: 'Dépôt B' },
];

const mockCouloirs = [
  { num_couloir: 'C001', nom_couloir: 'Couloir Alpha', id_depot: 1, num_depot: '101' },
  { num_couloir: 'C002', nom_couloir: 'Couloir Beta', id_depot: 1, num_depot: '101' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: { id: 1, login: 'admin', name: 'Admin', email: 'admin@test.com' }, hydrated: true };
  mockGetDepots.mockResolvedValue(mockDepots);
  mockGetCouloirs.mockResolvedValue(mockCouloirs);
  useCouloirDialog.getState().close();
});

afterEach(() => {
  useCouloirDialog.getState().close();
});

it('renders nothing when not hydrated', () => {
  mockAuth = { user: null, hydrated: false };
  const { container } = render(<CouloirPage />);
  expect(container.innerHTML).toBe('');
});

it('redirects to login when hydrated without user', () => {
  mockAuth = { user: null, hydrated: true };
  render(<CouloirPage />);
  expect(mockPush).toHaveBeenCalledWith('/login');
});

it('shows loading state initially', () => {
  mockGetCouloirs.mockImplementation(() => new Promise(() => {}));
  render(<CouloirPage />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});

it('renders couloir list after loading', async () => {
  render(<CouloirPage />);
  await waitFor(() => {
    expect(screen.getByText('Couloir Alpha')).toBeInTheDocument();
  });
  expect(screen.getByText('C001')).toBeInTheDocument();
  expect(screen.getByText('Couloir Beta')).toBeInTheDocument();
  expect(screen.getByText('C002')).toBeInTheDocument();
});

it('shows empty state when no couloirs', async () => {
  mockGetCouloirs.mockResolvedValue([]);
  render(<CouloirPage />);
  await waitFor(() => {
    expect(screen.getByText('Aucun couloir trouvé.')).toBeInTheDocument();
  });
});

it('shows error message on fetch failure', async () => {
  mockGetCouloirs.mockRejectedValue(new Error('Erreur réseau'));
  render(<CouloirPage />);
  await waitFor(() => {
    expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
  });
});

it('loads couloirs filtered by selected depot', async () => {
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  const select = screen.getByRole('combobox');
  fireEvent.change(select, { target: { value: '1' } });

  await waitFor(() => {
    expect(mockGetCouloirs).toHaveBeenLastCalledWith({ id_depot: 1 });
  });
});

it('loads depots for the selector', async () => {
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());
  expect(mockGetDepots).toHaveBeenCalled();
});

it('opens create dialog with depot + nombre fields', async () => {
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /nouveau couloir/i }));

  expect(screen.getByText('Nouveau couloir')).toBeInTheDocument();
  expect(screen.getByLabelText('Dépôt')).toBeInTheDocument();
  expect(screen.getByLabelText('Nombre de couloirs')).toBeInTheDocument();
  expect(screen.queryByLabelText('N° Couloir')).not.toBeInTheDocument();
});

it('calls createCouloirAction with depot + nombre', async () => {
  mockCreateCouloir.mockResolvedValue([{ num_couloir: 'C003' }]);
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /nouveau couloir/i }));

  fireEvent.change(screen.getByLabelText('Dépôt'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Nombre de couloirs'), { target: { value: '3' } });

  fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

  await waitFor(() => {
    expect(mockCreateCouloir).toHaveBeenCalledWith({
      num_couloir: '',
      nom_couloir: '',
      id_depot: 1,
      num_depot: '',
      nombre: 3,
    });
  });
});

it('opens edit dialog with all couloir fields', async () => {
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  const editButtons = screen.getAllByRole('button', { name: /modifier/i });
  fireEvent.click(editButtons[0]);

  await waitFor(() => {
    expect(screen.getByText('Modifier le couloir')).toBeInTheDocument();
  });

  expect(screen.getByLabelText('N° Couloir')).toBeInTheDocument();
  expect(screen.getByLabelText('Nom')).toBeInTheDocument();
  expect(screen.queryByLabelText('Nombre de couloirs')).not.toBeInTheDocument();

  const numInput = screen.getByLabelText('N° Couloir') as HTMLInputElement;
  const nomInput = screen.getByLabelText('Nom') as HTMLInputElement;
  expect(numInput.value).toBe('C001');
  expect(nomInput.value).toBe('Couloir Alpha');
});

it('calls updateCouloirAction on edit submit', async () => {
  mockUpdateCouloir.mockResolvedValue({});
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  const editButtons = screen.getAllByRole('button', { name: /modifier/i });
  fireEvent.click(editButtons[0]);

  await waitFor(() => expect(screen.getByText('Modifier le couloir')).toBeInTheDocument());

  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Couloir Alpha modifié' } });

  fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

  await waitFor(() => {
    expect(mockUpdateCouloir).toHaveBeenCalledWith('C001', expect.objectContaining({
      nom_couloir: 'Couloir Alpha modifié',
    }));
  });
});

it('opens delete confirmation dialog', async () => {
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteButtons[0]);

  expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
});

it('calls deleteCouloirAction on confirm delete', async () => {
  mockDeleteCouloir.mockResolvedValue(undefined);
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteButtons[0]);

  const allSupprimer = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(allSupprimer[allSupprimer.length - 1]);

  await waitFor(() => {
    expect(mockDeleteCouloir).toHaveBeenCalledWith('C001');
  });
});

it('does not submit when depot is missing', async () => {
  render(<CouloirPage />);
  await waitFor(() => expect(screen.getByText('Couloir Alpha')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /nouveau couloir/i }));
  fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

  await waitFor(() => {
    expect(mockCreateCouloir).not.toHaveBeenCalled();
  });
});

import CouloirPage from '@/app/(app)/emplacements/couloir/page';
