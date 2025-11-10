import express from 'express';
import { RoutesController, ComplianceController, BankingController, PoolsController } from './controllers';
import { FetchRoutesUseCase, SetBaselineUseCase, ComputeComparisonUseCase, ComputeCBUseCase, BankSurplusUseCase, ApplyBankedUseCase, CreatePoolUseCase } from '../../../core/application/use-cases';
import { RouteRepository, ComplianceRepository, BankingRepository, PoolRepository } from '../../../core/ports/repositories';

export const routesRouter = express.Router();

// Mock repositories
const mockRouteRepo: RouteRepository = {
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn(),
  updateBaseline: jest.fn().mockResolvedValue({}),
  findComparison: jest.fn().mockResolvedValue({ baseline: {}, comparison: [] }),
};

const mockComplianceRepo: ComplianceRepository = {
  findByShipAndYear: jest.fn(),
  save: jest.fn(),
  findAdjustedByShipAndYear: jest.fn(),
};

const mockBankingRepo: BankingRepository = {
  findByShipAndYear: jest.fn(),
  save: jest.fn(),
  findAllByShip: jest.fn(),
};

const mockPoolRepo: PoolRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByYear: jest.fn(),
};

// Use cases
const routesUseCase = new FetchRoutesUseCase(mockRouteRepo);
const setBaselineUseCase = new SetBaselineUseCase(mockRouteRepo);
const getComparisonUseCase = new ComputeComparisonUseCase(mockRouteRepo);

const computeCBUseCase = new ComputeCBUseCase(mockRouteRepo, mockComplianceRepo);
const bankSurplusUseCase = new BankSurplusUseCase(mockComplianceRepo, mockBankingRepo);
const applyBankedUseCase = new ApplyBankedUseCase(mockComplianceRepo, mockBankingRepo);
const createPoolUseCase = new CreatePoolUseCase(mockComplianceRepo, mockPoolRepo);

const routesController = new RoutesController(routesUseCase, setBaselineUseCase, getComparisonUseCase);
const complianceController = new ComplianceController(computeCBUseCase);
const bankingController = new BankingController(bankSurplusUseCase, applyBankedUseCase);
const poolsController = new PoolsController(createPoolUseCase);

// Routes
routesRouter.get('/', routesController.getAllRoutes);
routesRouter.post('/:routeId/baseline', routesController.setBaseline);
routesRouter.get('/comparison', routesController.getComparison);

// Compliance routes
routesRouter.get('/compliance/cb', complianceController.getCB);
routesRouter.get('/compliance/adjusted-cb', complianceController.getAdjustedCB);

// Banking routes
routesRouter.get('/banking/records', bankingController.getRecords);
routesRouter.post('/banking/bank-surplus', bankingController.bankSurplus);
routesRouter.post('/banking/apply-banked', bankingController.applyBanked);

// Pooling routes
routesRouter.post('/pools', poolsController.createPool);
