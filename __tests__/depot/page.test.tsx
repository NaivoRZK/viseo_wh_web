import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDepotDialog } from '@/lib/stores/depot';

const mockPush = jest.fn();
const mockGetDepots = jest.fn();
const mockCreateDepot = jest.fn();
const mockUpdateDepot = jest.fn();
const mockDeleteDepot = jest.fn();

let mockAuth: { user: unknown; hydrated: boolean } = { user: null, hydrated: false };

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/auth/context', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('@/lib/actions/depots', () => ({
  getDepotsAction: (...args: unknown[]) => mockGetDepots(...args),
  createDepotAction: (...args: unknown[]) => mockCreateDepot(...args),
  updateDepotAction: (...args: unknown[]) => mockUpdateDepot(...args),
  deleteDepotAction: (...args: unknown[]) => mockDeleteDepot(...args),
}));

const mockDepots = [
  { id: 1, num_depot: 101, nom_depot: 'Dépôt A', contenu_depot: 'Produits finis', usr: 'admin' },
  { id: 2, num_depot: 102, nom_depot: 'Dépôt B', contenu_depot: 'Matières premières', usr: 'admin' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: { id: 1, login: 'admin', name: 'Admin', email: 'admin@test.com' }, hydrated: true };
  mockGetDepots.mockResolvedValue(mockDepots);
  useDepotDialog.getState().close();
});

afterEach(() => {
  useDepotDialog.getState().close();
});

it('renders nothing when not hydrated', () => {
  mockAuth = { user: null, hydrated: false };
  const { container } = render(<DepotPage />);
  expect(container.innerHTML).toBe('');
});

it('redirects to login when hydrated without user', () => {
  mockAuth = { user: null, hydrated: true };
  render(<DepotPage />);
  expect(mockPush).toHaveBeenCalledWith('/login');
});

it('shows loading state initially', () => {
  mockGetDepots.mockImplementation(() => new Promise(() => {}));
  render(<DepotPage />);
  expect(screen.getByText('Chargement...')).toBeInTheDocument();
});

it('renders depot list after loading', async () => {
  render(<DepotPage />);
  await waitFor(() => {
    expect(screen.getByText('Dépôt A')).toBeInTheDocument();
  });
  expect(screen.getByText('101')).toBeInTheDocument();
  expect(screen.getByText('Dépôt B')).toBeInTheDocument();
  expect(screen.getByText('102')).toBeInTheDocument();
});

it('shows empty state when no depots', async () => {
  mockGetDepots.mockResolvedValue([]);
  render(<DepotPage />);
  await waitFor(() => {
    expect(screen.getByText('Aucun dépôt trouvé.')).toBeInTheDocument();
  });
});

it('shows error message on fetch failure', async () => {
  mockGetDepots.mockRejectedValue(new Error('Erreur réseau'));
  render(<DepotPage />);
  await waitFor(() => {
    expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
  });
});

it('loads all depots on mount', async () => {
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());
  expect(mockGetDepots).toHaveBeenCalledWith();
});

it('opens create dialog on button click', async () => {
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /nouveau dépôt/i }));

  expect(screen.getByText('Nouveau dépôt')).toBeInTheDocument();
  expect(screen.getByLabelText('N° Dépôt')).toBeInTheDocument();
  expect(screen.getByLabelText('Nom')).toBeInTheDocument();
  expect(screen.getByLabelText('Contenu')).toBeInTheDocument();
  expect(screen.getByLabelText('Utilisateur')).toBeInTheDocument();
});

it('calls createDepotAction on form submit', async () => {
  mockCreateDepot.mockResolvedValue({ id: 3 });
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /nouveau dépôt/i }));

  fireEvent.change(screen.getByLabelText('N° Dépôt'), { target: { value: '103' } });
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Dépôt C' } });
  fireEvent.change(screen.getByLabelText('Contenu'), { target: { value: 'Stock divers' } });
  fireEvent.change(screen.getByLabelText('Utilisateur'), { target: { value: 'operateur' } });

  fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

  await waitFor(() => {
    expect(mockCreateDepot).toHaveBeenCalledWith({
      num_depot: 103,
      nom_depot: 'Dépôt C',
      contenu_depot: 'Stock divers',
      usr: 'operateur',
    });
  });
});

it('opens edit dialog pre-filled with depot data', async () => {
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  const editButtons = screen.getAllByRole('button', { name: /modifier/i });
  fireEvent.click(editButtons[0]);

  await waitFor(() => {
    expect(screen.getByText('Modifier le dépôt')).toBeInTheDocument();
  });

  const numInput = screen.getByLabelText('N° Dépôt') as HTMLInputElement;
  const nomInput = screen.getByLabelText('Nom') as HTMLInputElement;
  expect(numInput.value).toBe('101');
  expect(nomInput.value).toBe('Dépôt A');
});

it('calls updateDepotAction on edit submit', async () => {
  mockUpdateDepot.mockResolvedValue({});
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  const editButtons = screen.getAllByRole('button', { name: /modifier/i });
  fireEvent.click(editButtons[0]);

  await waitFor(() => expect(screen.getByText('Modifier le dépôt')).toBeInTheDocument());

  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Dépôt A modifié' } });

  fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

  await waitFor(() => {
    expect(mockUpdateDepot).toHaveBeenCalledWith(101, expect.objectContaining({
      nom_depot: 'Dépôt A modifié',
    }));
  });
});

it('opens delete confirmation dialog', async () => {
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteButtons[0]);

  expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
});

it('calls deleteDepotAction on confirm delete', async () => {
  mockDeleteDepot.mockResolvedValue(undefined);
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteButtons[0]);

  const allSupprimer = screen.getAllByRole('button', { name: /supprimer/i });
  const confirmButton = allSupprimer[allSupprimer.length - 1];
  fireEvent.click(confirmButton);

  await waitFor(() => {
    expect(mockDeleteDepot).toHaveBeenCalledWith(101);
  });
});

it('closes delete dialog via close button', async () => {
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteButtons[0]);
  expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();

  const closeButtons = screen.getAllByRole('button', { name: /close/i });
  fireEvent.click(closeButtons[0]);

  await waitFor(() => {
    expect(screen.queryByText(/êtes-vous sûr/i)).not.toBeInTheDocument();
  });
});

it('shows validation error for empty nom_depot', async () => {
  render(<DepotPage />);
  await waitFor(() => expect(screen.getByText('Dépôt A')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /nouveau dépôt/i }));
  fireEvent.change(screen.getByLabelText('N° Dépôt'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

  await waitFor(() => {
    expect(screen.getByText(/nom du dépôt est requis/i)).toBeInTheDocument();
  });
});

import DepotPage from '@/app/(app)/emplacements/depot/page';
