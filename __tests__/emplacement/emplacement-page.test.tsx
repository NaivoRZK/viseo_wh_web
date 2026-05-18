import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmplacementRow } from '@/components/features/emplacement/emplacement-table';

const mockPush = jest.fn();
const mockGetDepots = jest.fn();
const mockGetCouloirs = jest.fn();
const mockGetRacks = jest.fn();
const mockGetEmplacements = jest.fn();
const mockGenerate = jest.fn();
const mockDelete = jest.fn();

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
}));

jest.mock('@/lib/actions/racks', () => ({
  getRacksAction: (...args: unknown[]) => mockGetRacks(...args),
}));

jest.mock('@/lib/actions/emplacements', () => ({
  getEmplacementsAction: (...args: unknown[]) => mockGetEmplacements(...args),
  generateEmplacementsAction: (...args: unknown[]) => mockGenerate(...args),
  deleteEmplacementAction: (...args: unknown[]) => mockDelete(...args),
}));

const mockDepots = [
  { id: 1, num_depot: 101, nom_depot: 'Dépôt A' },
];

const mockCouloirs = [
  { num_couloir: 'C01', nom_couloir: 'Couloir Alpha', id_depot: 1 },
];

const mockRacks = [
  { num_rack: 'R01' },
];

const mockEmplacements: EmplacementRow[] = [
  { num_emplacement: 'R01A0', num_niveau: 0, num_rangee: 'A', quantite: 0, volume_occupe: 0, volume_libre: 2, charge_occupee: 0, charge_libre: 50 },
  { num_emplacement: 'R01A1', num_niveau: 1, num_rangee: 'A', quantite: 0, volume_occupe: 0, volume_libre: 2, charge_occupee: 0, charge_libre: 50 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: { id: 1, login: 'admin', name: 'Admin', email: 'admin@test.com' }, hydrated: true };
  mockGetDepots.mockResolvedValue(mockDepots);
  mockGetCouloirs.mockResolvedValue(mockCouloirs);
  mockGetRacks.mockResolvedValue(mockRacks);
  mockGetEmplacements.mockResolvedValue(mockEmplacements);
});

it('renders nothing when not hydrated', () => {
  mockAuth = { user: null, hydrated: false };
  const { container } = render(<EmplacementPage />);
  expect(container.innerHTML).toBe('');
});

it('redirects to login when hydrated without user', () => {
  mockAuth = { user: null, hydrated: true };
  render(<EmplacementPage />);
  expect(mockPush).toHaveBeenCalledWith('/login');
});

it('shows loading state initially', () => {
  mockGetEmplacements.mockImplementation(() => new Promise(() => {}));
  render(<EmplacementPage />);
  expect(screen.getByText('Chargement...')).toBeInTheDocument();
});

it('renders emplacement list when rack is selected', async () => {
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());

  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());

  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  await waitFor(() => {
    expect(screen.getByText('R01A0')).toBeInTheDocument();
    expect(screen.getByText('R01A1')).toBeInTheDocument();
  });
  expect(mockGetEmplacements).toHaveBeenCalledWith({ num_rack: 'R01' });
});

it('shows empty state when no emplacements', async () => {
  mockGetEmplacements.mockResolvedValue([]);
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());
  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());
  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());
  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });
  await waitFor(() => {
    expect(screen.getByText('Aucun emplacement trouvé.')).toBeInTheDocument();
  });
});

it('shows error message on fetch failure', async () => {
  mockGetEmplacements.mockRejectedValue(new Error('Erreur réseau'));
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());
  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());
  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());
  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });
  await waitFor(() => {
    expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
  });
});

it('calls generate and shows success message', async () => {
  mockGenerate.mockResolvedValue({ createdCount: 6, emplacements: [{}, {}, {}, {}, {}, {}] });
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());
  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());
  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  fireEvent.click(screen.getByRole('button', { name: /générer les emplacements/i }));

  await waitFor(() => {
    expect(screen.getByText(/6 emplacement\(s\) créé\(s\) avec succès/i)).toBeInTheDocument();
  });
  expect(mockGenerate).toHaveBeenCalledWith('R01');
});

it('shows error when generate returns 0 emplacements', async () => {
  mockGenerate.mockResolvedValue({ createdCount: 0, emplacements: [] });
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());
  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());
  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());
  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  fireEvent.click(screen.getByRole('button', { name: /générer les emplacements/i }));

  await waitFor(() => {
    expect(screen.getByText(/aucun emplacement créé/i)).toBeInTheDocument();
  });
});

it('shows delete confirmation dialog', async () => {
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());
  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());
  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());
  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  await waitFor(() => expect(screen.getByText('R01A0')).toBeInTheDocument());

  const deleteBtns = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteBtns[0]);

  expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
});

it('calls deleteEmplacementAction on confirm', async () => {
  mockDelete.mockResolvedValue(undefined);
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());
  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());
  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());
  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  await waitFor(() => expect(screen.getByText('R01A0')).toBeInTheDocument());

  const deleteBtns = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(deleteBtns[0]);

  await waitFor(() => {
    expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
  });

  const dialogConfirmBtns = screen.getAllByRole('button', { name: /supprimer/i });
  fireEvent.click(dialogConfirmBtns[dialogConfirmBtns.length - 1]);

  await waitFor(() => {
    expect(mockDelete).toHaveBeenCalledWith('R01A0');
  });
});

it('disables couloir select when no depot is selected', () => {
  render(<EmplacementPage />);
  const selects = screen.getAllByRole('combobox');
  expect(selects[1]).toBeDisabled();
});

it('enables couloir select when a depot is selected', async () => {
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });

  await waitFor(() => {
    expect(screen.getAllByRole('combobox')[1]).not.toBeDisabled();
  });
});

it('enables rack select when a couloir is selected', async () => {
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());

  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });

  await waitFor(() => {
    expect(screen.getAllByRole('combobox')[2]).not.toBeDisabled();
  });
});

it('disables generate button when no rack is selected', () => {
  render(<EmplacementPage />);
  expect(screen.getByRole('button', { name: /générer les emplacements/i })).toBeDisabled();
});

it('shows generating text while generating', async () => {
  mockGenerate.mockImplementation(() => new Promise(() => {}));
  render(<EmplacementPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());

  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());

  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /générer les emplacements/i })).not.toBeDisabled();
  });

  fireEvent.click(screen.getByRole('button', { name: /générer les emplacements/i }));

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /génération\.\.\./i })).toBeDisabled();
  });
});

import EmplacementPage from '@/app/(app)/emplacements/emplacement/page';
