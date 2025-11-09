"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolsController = exports.BankingController = exports.ComplianceController = exports.RoutesController = void 0;
class RoutesController {
    constructor(fetchRoutesUseCase, setBaselineUseCase, getComparisonUseCase) {
        this.fetchRoutesUseCase = fetchRoutesUseCase;
        this.setBaselineUseCase = setBaselineUseCase;
        this.getComparisonUseCase = getComparisonUseCase;
        this.getAllRoutes = async (req, res) => {
            try {
                const routes = await this.fetchRoutesUseCase.execute();
                res.json(routes);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to fetch routes' });
            }
        };
        this.setBaseline = async (req, res) => {
            try {
                const { routeId } = req.params;
                await this.setBaselineUseCase.execute(routeId);
                res.json({ success: true });
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to set baseline' });
            }
        };
        this.getComparison = async (req, res) => {
            try {
                const comparison = await this.getComparisonUseCase.execute();
                res.json(comparison);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to get comparison' });
            }
        };
    }
}
exports.RoutesController = RoutesController;
class ComplianceController {
    constructor(computeCBUseCase) {
        this.computeCBUseCase = computeCBUseCase;
        this.getCB = async (req, res) => {
            try {
                const { shipId, year } = req.query;
                const cb = await this.computeCBUseCase.execute(shipId, parseInt(year));
                res.json(cb);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to compute CB' });
            }
        };
        this.getAdjustedCB = async (req, res) => {
            try {
                const { shipId, year } = req.query;
                // For now, return same as CB (adjusted CB would include banking)
                const adjustedCB = await this.computeCBUseCase.execute(shipId, parseInt(year));
                res.json(adjustedCB);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to get adjusted CB' });
            }
        };
    }
}
exports.ComplianceController = ComplianceController;
class BankingController {
    constructor(bankSurplusUseCase, applyBankedUseCase) {
        this.bankSurplusUseCase = bankSurplusUseCase;
        this.applyBankedUseCase = applyBankedUseCase;
        this.getRecords = async (req, res) => {
            try {
                const { shipId, year } = req.query;
                // For now, return empty array (would need a use case to fetch records)
                res.json([]);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to get banking records' });
            }
        };
        this.bankSurplus = async (req, res) => {
            try {
                const { shipId, year } = req.body;
                const result = await this.bankSurplusUseCase.execute(shipId, parseInt(year));
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to bank surplus' });
            }
        };
        this.applyBanked = async (req, res) => {
            try {
                const { shipId, year, amount } = req.body;
                const result = await this.applyBankedUseCase.execute(shipId, parseInt(year), amount);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to apply banked surplus' });
            }
        };
    }
}
exports.BankingController = BankingController;
class PoolsController {
    constructor(createPoolUseCase) {
        this.createPoolUseCase = createPoolUseCase;
        this.createPool = async (req, res) => {
            try {
                const { year, members } = req.body;
                const pool = await this.createPoolUseCase.execute(parseInt(year), members);
                res.json(pool);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to create pool' });
            }
        };
    }
}
exports.PoolsController = PoolsController;
//# sourceMappingURL=controllers.js.map