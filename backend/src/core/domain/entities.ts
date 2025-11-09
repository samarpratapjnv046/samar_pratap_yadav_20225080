export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface ShipCompliance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number;
}

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface Pool {
  id: string;
  year: number;
  members: PoolMember[];
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export class ComplianceBalance {
  constructor(public value: number) {}

  isSurplus(): boolean {
    return this.value > 0;
  }

  isDeficit(): boolean {
    return this.value < 0;
  }

  add(other: ComplianceBalance): ComplianceBalance {
    return new ComplianceBalance(this.value + other.value);
  }

  subtract(other: ComplianceBalance): ComplianceBalance {
    return new ComplianceBalance(this.value - other.value);
  }
}

export class GHGIntensity {
  constructor(public value: number) {}

  static TARGET_2025 = new GHGIntensity(89.3368);

  compareTo(other: GHGIntensity): number {
    return this.value - other.value;
  }

  percentDifference(baseline: GHGIntensity): number {
    return ((this.value / baseline.value) - 1) * 100;
  }

  isCompliant(baseline: GHGIntensity): boolean {
    return this.value <= GHGIntensity.TARGET_2025.value;
  }
}

export class EnergyInScope {
  constructor(public value: number) {} // in MJ

  static fromFuelConsumption(fuelConsumption: number): EnergyInScope {
    // Approximate: 1 ton of fuel ≈ 41,000 MJ
    return new EnergyInScope(fuelConsumption * 41000);
  }
}
