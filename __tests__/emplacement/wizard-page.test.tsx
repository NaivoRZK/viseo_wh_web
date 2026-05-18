import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = jest.fn();
const mockGetDepots = jest.fn();
const mockGetCouloirs = jest.fn();
const mockGetRacks = jest.fn();
const mockGenerate = jest.fn();

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
  generateEmplacementsAction: (...args: unknown[]) => mockGenerate(...args),
}));

const mockDepots = [
  { id: 1, num_depot: 101, nom_depot: 'Dépôt A' },
  { id: 2, num_depot: 102, nom_depot: 'Dépôt B' },
];

const mockCouloirs = [
  { num_couloir: 'C01', nom_couloir: 'Couloir Alpha', id_depot: 1 },
  { num_couloir: 'C02', nom_couloir: 'Couloir Beta', id_depot: 1 },
  { num_couloir: 'C03', nom_couloir: 'Couloir Gamma', id_depot: 2 },
];

const mockRacks = [
  { num_rack: 'R01' },
  { num_rack: 'R02' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: { id: 1, login: 'admin', name: 'Admin', email: 'admin@test.com' }, hydrated: true };
  mockGetDepots.mockResolvedValue(mockDepots);
  mockGetCouloirs.mockResolvedValue(mockCouloirs);
  mockGetRacks.mockResolvedValue(mockRacks);
});

it('renders nothing when not hydrated', () => {
  mockAuth = { user: null, hydrated: false };
  const { container } = render(<WizardPage />);
  expect(container.innerHTML).toBe('');
});

it('redirects to login when hydrated without user', () => {
  mockAuth = { user: null, hydrated: true };
  render(<WizardPage />);
  expect(mockPush).toHaveBeenCalledWith('/login');
});

it('loads depots and couloirs on mount', async () => {
  render(<WizardPage />);
  await waitFor(() => {
    expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument();
  });
  expect(mockGetDepots).toHaveBeenCalled();
  expect(mockGetCouloirs).toHaveBeenCalled();
});

it('filters couloirs by selected depot', async () => {
  render(<WizardPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });

  await waitFor(() => {
    expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument();
    expect(screen.getByText('C02 - Couloir Beta')).toBeInTheDocument();
    expect(screen.queryByText('C03 - Couloir Gamma')).not.toBeInTheDocument();
  });
});

it('loads racks when couloir is selected', async () => {
  render(<WizardPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });

  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());

  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });

  await waitFor(() => {
    expect(mockGetRacks).toHaveBeenCalledWith({ num_couloir: 'C01' });
  });
});

it('generate button is disabled without rack selection', () => {
  render(<WizardPage />);
  const btn = screen.getByRole('button', { name: /générer les emplacements/i });
  expect(btn).toBeDisabled();
});

it('shows success message after generation', async () => {
  mockGenerate.mockResolvedValue({ createdCount: 4, emplacements: [{}, {}, {}, {}] });

  render(<WizardPage />);
  await waitFor(() => expect(screen.getByText('101 - Dépôt A')).toBeInTheDocument());

  const depotSelect = screen.getAllByRole('combobox')[0];
  fireEvent.change(depotSelect, { target: { value: '1' } });
  await waitFor(() => expect(screen.getByText('C01 - Couloir Alpha')).toBeInTheDocument());

  const couloirSelect = screen.getAllByRole('combobox')[1];
  fireEvent.change(couloirSelect, { target: { value: 'C01' } });
  await waitFor(() => expect(screen.getByText('R01')).toBeInTheDocument());

  const rackSelect = screen.getAllByRole('combobox')[2];
  fireEvent.change(rackSelect, { target: { value: 'R01' } });

  const btn = screen.getByRole('button', { name: /générer les emplacements/i });
  fireEvent.click(btn);

  await waitFor(() => {
    expect(screen.getByText(/4 emplacement\(s\) créé\(s\) avec succès/i)).toBeInTheDocument();
  });
  expect(mockGenerate).toHaveBeenCalledWith('R01');
});

it('shows error when createdCount is 0', async () => {
  mockGenerate.mockResolvedValue({ createdCount: 0, emplacements: [] });

  render(<WizardPage />);
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

it('shows error message on generation failure', async () => {
  mockGenerate.mockRejectedValue(new Error('Erreur Odoo'));

  render(<WizardPage />);
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
    expect(screen.getByText('Erreur Odoo')).toBeInTheDocument();
  });
});

import WizardPage from '@/app/(app)/emplacements/page';
