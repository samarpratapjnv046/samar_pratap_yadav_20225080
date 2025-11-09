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
export declare class ComplianceBalance {
    value: number;
    constructor(value: number);
    isSurplus(): boolean;
    isDeficit(): boolean;
    add(other: ComplianceBalance): ComplianceBalance;
    subtract(other: ComplianceBalance): ComplianceBalance;
}
export declare class GHGIntensity {
    value: number;
    constructor(value: number);
    static TARGET_2025: GHGIntensity;
    compareTo(other: GHGIntensity): number;
    percentDifference(baseline: GHGIntensity): number;
    isCompliant(baseline: GHGIntensity): boolean;
}
export declare class EnergyInScope {
    value: number;
    constructor(value: number);
    static fromFuelConsumption(fuelConsumption: number): EnergyInScope;
}
//# sourceMappingURL=entities.d.ts.map