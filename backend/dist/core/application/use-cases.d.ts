import { RouteRepository, ComplianceRepository, BankingRepository, PoolRepository } from '../ports/repositories';
import { Route, ShipCompliance, BankEntry, Pool } from '../domain/entities';
export declare class FetchRoutesUseCase {
    private routeRepo;
    constructor(routeRepo: RouteRepository);
    execute(): Promise<Route[]>;
}
export declare class SetBaselineUseCase {
    private routeRepo;
    constructor(routeRepo: RouteRepository);
    execute(routeId: string): Promise<Route>;
}
export declare class ComputeComparisonUseCase {
    private routeRepo;
    constructor(routeRepo: RouteRepository);
    execute(): Promise<{
        baseline: Route;
        comparison: Array<Route & {
            percentDiff: number;
            compliant: boolean;
        }>;
    }>;
}
export declare class ComputeCBUseCase {
    private routeRepo;
    private complianceRepo;
    constructor(routeRepo: RouteRepository, complianceRepo: ComplianceRepository);
    execute(shipId: string, year: number): Promise<ShipCompliance>;
}
export declare class BankSurplusUseCase {
    private complianceRepo;
    private bankingRepo;
    constructor(complianceRepo: ComplianceRepository, bankingRepo: BankingRepository);
    execute(shipId: string, year: number): Promise<BankEntry>;
}
export declare class ApplyBankedUseCase {
    private complianceRepo;
    private bankingRepo;
    constructor(complianceRepo: ComplianceRepository, bankingRepo: BankingRepository);
    execute(shipId: string, year: number, amount: number): Promise<ShipCompliance>;
}
export declare class CreatePoolUseCase {
    private complianceRepo;
    private poolRepo;
    constructor(complianceRepo: ComplianceRepository, poolRepo: PoolRepository);
    execute(year: number, memberShipIds: string[]): Promise<Pool>;
}
//# sourceMappingURL=use-cases.d.ts.map