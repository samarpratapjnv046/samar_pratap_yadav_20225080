import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoutesTab } from './RoutesTab';
import { ApiClient } from '../../infrastructure/api-client';

// Mock the ApiClient
jest.mock('../../infrastructure/api-client', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    fetchRoutes: jest.fn(),
    setBaseline: jest.fn(),
  })),
}));

const mockApiClient = new ApiClient();

describe('RoutesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the routes table', async () => {
    const mockRoutes = [
      {
        id: '1',
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false,
      },
    ];

    (mockApiClient.fetchRoutes as jest.Mock).mockResolvedValue(mockRoutes);

    render(<RoutesTab apiClient={mockApiClient} />);

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeInTheDocument();
      expect(screen.getByText('Container')).toBeInTheDocument();
      expect(screen.getByText('HFO')).toBeInTheDocument();
    });
  });

  it('should apply filters when changed', async () => {
    const mockRoutes = [
      {
        id: '1',
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false,
      },
    ];

    (mockApiClient.fetchRoutes as jest.Mock).mockResolvedValue(mockRoutes);

    render(<RoutesTab apiClient={mockApiClient} />);

    const vesselTypeSelect = screen.getByDisplayValue('All Vessel Types');
    fireEvent.change(vesselTypeSelect, { target: { value: 'Container' } });

    await waitFor(() => {
      expect(mockApiClient.fetchRoutes).toHaveBeenCalledWith({
        vesselType: 'Container',
        fuelType: undefined,
        year: undefined,
      });
    });
  });

  it('should call setBaseline when button is clicked', async () => {
    const mockRoutes = [
      {
        id: '1',
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false,
      },
    ];

    (mockApiClient.fetchRoutes as jest.Mock).mockResolvedValue(mockRoutes);
    (mockApiClient.setBaseline as jest.Mock).mockResolvedValue(undefined);

    render(<RoutesTab apiClient={mockApiClient} />);

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeInTheDocument();
    });

    const setBaselineButton = screen.getByText('Set Baseline');
    fireEvent.click(setBaselineButton);

    await waitFor(() => {
      expect(mockApiClient.setBaseline).toHaveBeenCalledWith('R001');
    });
  });

  it('should show loading state', () => {
    (mockApiClient.fetchRoutes as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<RoutesTab apiClient={mockApiClient} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
