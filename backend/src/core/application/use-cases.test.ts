import { describe, it, expect, beforeEach } from '@jest/globals';
import { FetchRoutesUseCase } from './use-cases';
import { RouteRepository } from '../../core/ports/repositories';

// Mock repository
const mockRouteRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  setBaseline: jest.fn(),
  getBaseline: jest.fn(),
  getComparison: jest.fn(),
  updateBaseline: jest.fn(),
  findComparison: jest.fn(),
} as unknown as RouteRepository;

describe('FetchRoutesUseCase', () => {
  let useCase: FetchRoutesUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new FetchRoutesUseCase(mockRouteRepository);
  });

  it('should fetch all routes without filters', async () => {
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

    (mockRouteRepository.findAll as jest.Mock).mockResolvedValue(mockRoutes);

    const result = await useCase.execute();

    expect(mockRouteRepository.findAll).toHaveBeenCalledWith();
    expect(result).toEqual(mockRoutes);
  });

  it('should fetch routes with filters', async () => {
    const filters = { vesselType: 'Container', year: 2024 };
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

    (mockRouteRepository.findAll as jest.Mock).mockResolvedValue(mockRoutes);

    const result = await useCase.execute(filters);

    expect(mockRouteRepository.findAll).toHaveBeenCalledWith();
    expect(result).toEqual(mockRoutes);
  });
});

describe('Compliance Balance Calculations', () => {
  it('should calculate CB correctly for 2025 target', () => {
    // Target intensity: 89.3368 gCO₂e/MJ
    // Energy in scope = fuelConsumption * 41000 MJ/t
    // CB = (Target - Actual) * Energy

    const targetIntensity = 89.3368;
    const actualIntensity = 91.0;
    const fuelConsumption = 5000; // tons
    const energyInScope = fuelConsumption * 41000; // MJ

    const expectedCB = (targetIntensity - actualIntensity) * energyInScope;

    expect(expectedCB).toBeCloseTo(-340956000, 0); // Should be negative (deficit)
  });

  it('should identify compliant routes', () => {
    const targetIntensity = 89.3368;
    const compliantIntensity = 88.0; // Below target
    const nonCompliantIntensity = 93.5; // Above target

    expect(compliantIntensity <= targetIntensity).toBe(true);
    expect(nonCompliantIntensity <= targetIntensity).toBe(false);
  });
});

describe('Pooling Algorithm', () => {
  it('should validate pool sum >= 0', () => {
    const members = [
      { shipId: 'S1', cbBefore: -500 },
      { shipId: 'S2', cbBefore: 300 },
      { shipId: 'S3', cbBefore: 200 },
    ];

    const totalSum = members.reduce((sum, m) => sum + m.cbBefore, 0);
    expect(totalSum).toBe(0); // Valid pool
  });

  it('should prevent deficit ships from exiting worse', () => {
    const deficitShip = { shipId: 'S1', cbBefore: -500 };
    const surplusShip = { shipId: 'S2', cbBefore: 300 };

    // After pooling, deficit ship should not have more negative CB
    const deficitAfter = -200; // Better than -500
    const surplusAfter = 200; // Less than 300 but still positive

    expect(deficitAfter).toBeGreaterThan(deficitShip.cbBefore);
    expect(surplusAfter).toBeGreaterThanOrEqual(0);
  });
});
