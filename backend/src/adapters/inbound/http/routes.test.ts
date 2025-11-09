import request from 'supertest';
import express from 'express';
import { routesRouter } from './routes';
import { FetchRoutesUseCase } from '../../../core/application/use-cases';

// Mock use cases
jest.mock('../../../core/application/use-cases', () => ({
  FetchRoutesUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
  SetBaselineUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
  GetComparisonUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

const mockFetchRoutesUseCase = new (require('../../../core/application/use-cases').FetchRoutesUseCase)();

describe('Routes API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/routes', routesRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /routes', () => {
    it('should return all routes', async () => {
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

      mockFetchRoutesUseCase.execute.mockResolvedValue(mockRoutes);

      const response = await request(app).get('/routes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRoutes);
      expect(mockFetchRoutesUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should filter routes by vessel type', async () => {
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

      mockFetchRoutesUseCase.execute.mockResolvedValue(mockRoutes);

      const response = await request(app).get('/routes?vesselType=Container');

      expect(response.status).toBe(200);
      expect(mockFetchRoutesUseCase.execute).toHaveBeenCalledWith({
        vesselType: 'Container',
      });
    });

    it('should filter routes by year', async () => {
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

      mockFetchRoutesUseCase.execute.mockResolvedValue(mockRoutes);

      const response = await request(app).get('/routes?year=2024');

      expect(response.status).toBe(200);
      expect(mockFetchRoutesUseCase.execute).toHaveBeenCalledWith({
        year: 2024,
      });
    });
  });

  describe('POST /routes/:routeId/baseline', () => {
    it('should set baseline successfully', async () => {
      const mockSetBaselineUseCase = new (require('../../../core/application/use-cases').SetBaselineUseCase)();
      mockSetBaselineUseCase.execute.mockResolvedValue(undefined);

      const response = await request(app).post('/routes/R001/baseline');

      expect(response.status).toBe(200);
      expect(mockSetBaselineUseCase.execute).toHaveBeenCalledWith('R001');
    });

    it('should handle errors when setting baseline', async () => {
      const mockSetBaselineUseCase = new (require('../../../core/application/use-cases').SetBaselineUseCase)();
      mockSetBaselineUseCase.execute.mockRejectedValue(new Error('Route not found'));

      const response = await request(app).post('/routes/R999/baseline');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /routes/comparison', () => {
    it('should return comparison data', async () => {
      const mockComparison = [
        {
          baseline: {
            id: '1',
            routeId: 'R001',
            vesselType: 'Container',
            fuelType: 'HFO',
            year: 2024,
            ghgIntensity: 91.0,
            fuelConsumption: 5000,
            distance: 12000,
            totalEmissions: 4500,
            isBaseline: true,
          },
          comparison: {
            id: '2',
            routeId: 'R002',
            vesselType: 'BulkCarrier',
            fuelType: 'LNG',
            year: 2024,
            ghgIntensity: 88.0,
            fuelConsumption: 4800,
            distance: 11500,
            totalEmissions: 4200,
            isBaseline: false,
          },
          percentDiff: -3.3,
          compliant: true,
        },
      ];

      const mockGetComparisonUseCase = new (require('../../../core/application/use-cases').GetComparisonUseCase)();
      mockGetComparisonUseCase.execute.mockResolvedValue(mockComparison);

      const response = await request(app).get('/routes/comparison');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComparison);
    });
  });
});
