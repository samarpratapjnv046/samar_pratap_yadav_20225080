import {
  RouteRepository,
  ComplianceRepository,
  BankingRepository,
  PoolRepository,
} from '../ports/repositories';
import {
  Route,
  ShipCompliance,
  BankEntry,
  Pool,
  PoolMember,
  ComplianceBalance,
  GHGIntensity,
  EnergyInScope,
} from '../domain/entities';

export class FetchRoutesUseCase {
  constructor(private routeRepo: RouteRepository) {}

  async execute(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    return this.routeRepo.findAll();
  }
}

export class SetBaselineUseCase {
  constructor(private routeRepo: RouteRepository) {}

  async execute(routeId: string): Promise<Route> {
    return this.routeRepo.updateBaseline(routeId, true);
  }
}

export class ComputeComparisonUseCase {
  constructor(private routeRepo: RouteRepository) {}

  async execute(): Promise<{
    baseline: Route;
    comparison: Array<Route & { percentDiff: number; compliant: boolean }>;
  }> {
    const { baseline, comparison } = await this.routeRepo.findComparison();

    const result = comparison.map((route) => {
      const baselineIntensity = new GHGIntensity(baseline.ghgIntensity);
      const routeIntensity = new GHGIntensity(route.ghgIntensity);
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

export class ComputeCBUseCase {
  constructor(
    private routeRepo: RouteRepository,
    private complianceRepo: ComplianceRepository
  ) {}

  async execute(shipId: string, year: number): Promise<ShipCompliance> {
    // Find route for ship (assuming routeId maps to shipId)
    const routes = await this.routeRepo.findAll();
    const route = routes.find((r) => r.routeId === shipId);
    if (!route) throw new Error('Route not found for ship');

    const actualIntensity = new GHGIntensity(route.ghgIntensity);
    const targetIntensity = GHGIntensity.TARGET_2025;
    const energyInScope = EnergyInScope.fromFuelConsumption(route.fuelConsumption);

    const cbValue = (targetIntensity.value - actualIntensity.value) * energyInScope.value;
    const compliance: ShipCompliance = {
      id: '',
      shipId,
      year,
      cbGco2eq: cbValue,
    };

    return this.complianceRepo.save(compliance);
  }
}

export class BankSurplusUseCase {
  constructor(
    private complianceRepo: ComplianceRepository,
    private bankingRepo: BankingRepository
  ) {}

  async execute(shipId: string, year: number): Promise<BankEntry> {
    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance || compliance.cbGco2eq <= 0) {
      throw new Error('No surplus to bank');
    }

    const entry: BankEntry = {
      id: '',
      shipId,
      year,
      amountGco2eq: compliance.cbGco2eq,
    };

    return this.bankingRepo.save(entry);
  }
}

export class ApplyBankedUseCase {
  constructor(
    private complianceRepo: ComplianceRepository,
    private bankingRepo: BankingRepository
  ) {}

  async execute(shipId: string, year: number, amount: number): Promise<ShipCompliance> {
    const banked = await this.bankingRepo.findByShipAndYear(shipId, year);
    if (!banked || banked.amountGco2eq < amount) {
      throw new Error('Insufficient banked amount');
    }

    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance) throw new Error('Compliance not found');

    const newCb = compliance.cbGco2eq + amount;
    const updatedCompliance: ShipCompliance = {
      ...compliance,
      cbGco2eq: newCb,
    };

    return this.complianceRepo.save(updatedCompliance);
  }
}

export class CreatePoolUseCase {
  constructor(
    private complianceRepo: ComplianceRepository,
    private poolRepo: PoolRepository
  ) {}

  async execute(year: number, memberShipIds: string[]): Promise<Pool> {
    const members: PoolMember[] = [];

    for (const shipId of memberShipIds) {
      const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
      if (!compliance) throw new Error(`Compliance not found for ship ${shipId}`);

      members.push({
        id: '',
        poolId: '',
        shipId,
        cbBefore: compliance.cbGco2eq,
        cbAfter: 0, // Will be calculated
      });
    }

    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCB < 0) throw new Error('Pool CB sum must be >= 0');

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

      if (s.cbAfter === 0) surplusIndex++;
      if (d.cbAfter === 0) deficitIndex++;
    }

    // Set remaining surpluses and deficits
    for (const m of members) {
      if (m.cbAfter === 0) {
        m.cbAfter = m.cbBefore;
      }
    }

    const pool: Pool = {
      id: '',
      year,
      members,
    };

    return this.poolRepo.create(pool);
  }
}
