import { Route, ShipCompliance, BankEntry, Pool } from '../domain/entities';
export interface RouteRepository {
    findAll(): Promise<Route[]>;
    findById(id: string): Promise<Route | null>;
    updateBaseline(id: string, isBaseline: boolean): Promise<Route>;
    findComparison(): Promise<{
        baseline: Route;
        comparison: Route[];
    }>;
}
export interface ComplianceRepository {
    findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
    save(compliance: ShipCompliance): Promise<ShipCompliance>;
    findAdjustedByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
}
export interface BankingRepository {
    findByShipAndYear(shipId: string, year: number): Promise<BankEntry | null>;
    save(entry: BankEntry): Promise<BankEntry>;
    findAllByShip(shipId: string): Promise<BankEntry[]>;
}
export interface PoolRepository {
    create(pool: Pool): Promise<Pool>;
    findById(id: string): Promise<Pool | null>;
    findByYear(year: number): Promise<Pool[]>;
}
//# sourceMappingURL=repositories.d.ts.map