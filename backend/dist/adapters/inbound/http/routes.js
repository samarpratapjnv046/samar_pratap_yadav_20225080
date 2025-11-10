"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
const use_cases_1 = require("../../../core/application/use-cases");
exports.routesRouter = express_1.default.Router();
// Mock repositories
const mockRouteRepo = {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    updateBaseline: jest.fn().mockResolvedValue({}),
    findComparison: jest.fn().mockResolvedValue({ baseline: {}, comparison: [] }),
};
const mockComplianceRepo = {
    findByShipAndYear: jest.fn(),
    save: jest.fn(),
    findAdjustedByShipAndYear: jest.fn(),
};
const mockBankingRepo = {
    findByShipAndYear: jest.fn(),
    save: jest.fn(),
    findAllByShip: jest.fn(),
};
const mockPoolRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByYear: jest.fn(),
};
// Use cases
const routesUseCase = new use_cases_1.FetchRoutesUseCase(mockRouteRepo);
const setBaselineUseCase = new use_cases_1.SetBaselineUseCase(mockRouteRepo);
const getComparisonUseCase = new use_cases_1.ComputeComparisonUseCase(mockRouteRepo);
const computeCBUseCase = new use_cases_1.ComputeCBUseCase(mockRouteRepo, mockComplianceRepo);
const bankSurplusUseCase = new use_cases_1.BankSurplusUseCase(mockComplianceRepo, mockBankingRepo);
const applyBankedUseCase = new use_cases_1.ApplyBankedUseCase(mockComplianceRepo, mockBankingRepo);
const createPoolUseCase = new use_cases_1.CreatePoolUseCase(mockComplianceRepo, mockPoolRepo);
const routesController = new controllers_1.RoutesController(routesUseCase, setBaselineUseCase, getComparisonUseCase);
const complianceController = new controllers_1.ComplianceController(computeCBUseCase);
const bankingController = new controllers_1.BankingController(bankSurplusUseCase, applyBankedUseCase);
const poolsController = new controllers_1.PoolsController(createPoolUseCase);
// Routes
exports.routesRouter.get('/', routesController.getAllRoutes);
exports.routesRouter.post('/:routeId/baseline', routesController.setBaseline);
exports.routesRouter.get('/comparison', routesController.getComparison);
// Compliance routes
exports.routesRouter.get('/compliance/cb', complianceController.getCB);
exports.routesRouter.get('/compliance/adjusted-cb', complianceController.getAdjustedCB);
// Banking routes
exports.routesRouter.get('/banking/records', bankingController.getRecords);
exports.routesRouter.post('/banking/bank-surplus', bankingController.bankSurplus);
exports.routesRouter.post('/banking/apply-banked', bankingController.applyBanked);
// Pooling routes
exports.routesRouter.post('/pools', poolsController.createPool);
//# sourceMappingURL=routes.js.map