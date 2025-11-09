"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePoolUseCase = exports.ApplyBankedUseCase = exports.BankSurplusUseCase = exports.ComputeCBUseCase = exports.ComputeComparisonUseCase = exports.SetBaselineUseCase = exports.FetchRoutesUseCase = void 0;
const entities_1 = require("../domain/entities");
class FetchRoutesUseCase {
    constructor(routeRepo) {
        this.routeRepo = routeRepo;
    }
    async execute() {
        return this.routeRepo.findAll();
    }
}
exports.FetchRoutesUseCase = FetchRoutesUseCase;
class SetBaselineUseCase {
    constructor(routeRepo) {
        this.routeRepo = routeRepo;
    }
    async execute(routeId) {
        return this.routeRepo.updateBaseline(routeId, true);
    }
}
exports.SetBaselineUseCase = SetBaselineUseCase;
class ComputeComparisonUseCase {
    constructor(routeRepo) {
        this.routeRepo = routeRepo;
    }
    async execute() {
        const { baseline, comparison } = await this.routeRepo.findComparison();
        const result = comparison.map((route) => {
            const baselineIntensity = new entities_1.GHGIntensity(baseline.ghgIntensity);
            const routeIntensity = new entities_1.GHGIntensity(route.ghgIntensity);
            const percentDiff = routeIntensity.percentDifference(baselineIntensity);
            const compliant = routeIntensity.isCompliant(baselineIntensity);
            return {
                ...route,
                percentDiff,
                compliant,
            };
        });
        return { baseline, comparison: result };
    }
}
exports.ComputeComparisonUseCase = ComputeComparisonUseCase;
class ComputeCBUseCase {
    constructor(routeRepo, complianceRepo) {
        this.routeRepo = routeRepo;
        this.complianceRepo = complianceRepo;
    }
    async execute(shipId, year) {
        // Find route for ship (assuming routeId maps to shipId)
        const routes = await this.routeRepo.findAll();
        const route = routes.find((r) => r.routeId === shipId);
        if (!route)
            throw new Error('Route not found for ship');
        const actualIntensity = new entities_1.GHGIntensity(route.ghgIntensity);
        const targetIntensity = entities_1.GHGIntensity.TARGET_2025;
        const energyInScope = entities_1.EnergyInScope.fromFuelConsumption(route.fuelConsumption);
        const cbValue = (targetIntensity.value - actualIntensity.value) * energyInScope.value;
        const compliance = {
            id: '',
            shipId,
            year,
            cbGco2eq: cbValue,
        };
        return this.complianceRepo.save(compliance);
    }
}
exports.ComputeCBUseCase = ComputeCBUseCase;
class BankSurplusUseCase {
    constructor(complianceRepo, bankingRepo) {
        this.complianceRepo = complianceRepo;
        this.bankingRepo = bankingRepo;
    }
    async execute(shipId, year) {
        const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
        if (!compliance || compliance.cbGco2eq <= 0) {
            throw new Error('No surplus to bank');
        }
        const entry = {
            id: '',
            shipId,
            year,
            amountGco2eq: compliance.cbGco2eq,
        };
        return this.bankingRepo.save(entry);
    }
}
exports.BankSurplusUseCase = BankSurplusUseCase;
class ApplyBankedUseCase {
    constructor(complianceRepo, bankingRepo) {
        this.complianceRepo = complianceRepo;
        this.bankingRepo = bankingRepo;
    }
    async execute(shipId, year, amount) {
        const banked = await this.bankingRepo.findByShipAndYear(shipId, year);
        if (!banked || banked.amountGco2eq < amount) {
            throw new Error('Insufficient banked amount');
        }
        const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
        if (!compliance)
            throw new Error('Compliance not found');
        const newCb = compliance.cbGco2eq + amount;
        const updatedCompliance = {
            ...compliance,
            cbGco2eq: newCb,
        };
        return this.complianceRepo.save(updatedCompliance);
    }
}
exports.ApplyBankedUseCase = ApplyBankedUseCase;
class CreatePoolUseCase {
    constructor(complianceRepo, poolRepo) {
        this.complianceRepo = complianceRepo;
        this.poolRepo = poolRepo;
    }
    async execute(year, memberShipIds) {
        const members = [];
        for (const shipId of memberShipIds) {
            const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
            if (!compliance)
                throw new Error(`Compliance not found for ship ${shipId}`);
            members.push({
                id: '',
                poolId: '',
                shipId,
                cbBefore: compliance.cbGco2eq,
                cbAfter: 0, // Will be calculated
            });
        }
        const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);
        if (totalCB < 0)
            throw new Error('Pool CB sum must be >= 0');
        // Greedy allocation: sort by CB desc, transfer surplus to deficits
        const sortedMembers = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
        const surplus = sortedMembers.filter((m) => m.cbBefore > 0);
        const deficits = sortedMembers.filter((m) => m.cbBefore < 0);
        let surplusIndex = 0;
        let deficitIndex = 0;
        while (surplusIndex < surplus.length && deficitIndex < deficits.length) {
            const s = surplus[surplusIndex];
            const d = deficits[deficitIndex];
            const transfer = Math.min(s.cbBefore, -d.cbBefore);
            s.cbAfter = s.cbBefore - transfer;
            d.cbAfter = d.cbBefore + transfer;
            if (s.cbAfter === 0)
                surplusIndex++;
            if (d.cbAfter === 0)
                deficitIndex++;
        }
        // Set remaining surpluses and deficits
        for (const m of members) {
            if (m.cbAfter === 0) {
                m.cbAfter = m.cbBefore;
            }
        }
        const pool = {
            id: '',
            year,
            members,
        };
        return this.poolRepo.create(pool);
    }
}
exports.CreatePoolUseCase = CreatePoolUseCase;
//# sourceMappingURL=use-cases.js.map