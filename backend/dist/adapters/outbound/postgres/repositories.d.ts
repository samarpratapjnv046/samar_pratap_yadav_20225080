import { PrismaClient } from '@prisma/client';
import { RouteRepository, ComplianceRepository, BankingRepository, PoolRepository } from '../../../core/ports/repositories';
import { Route, ShipCompliance, BankEntry, Pool } from '../../../core/domain/entities';
export declare class PrismaRouteRepository implements RouteRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(): Promise<Route[]>;
    findById(id: string): Promise<Route | null>;
    updateBaseline(id: string, isBaseline: boolean): Promise<Route>;
    findComparison(): Promise<{
        baseline: Route;
        comparison: Route[];
    }>;
}
export declare class PrismaComplianceRepository implements ComplianceRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
    save(compliance: ShipCompliance): Promise<ShipCompliance>;
    findAdjustedByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
}
export declare class PrismaBankingRepository implements BankingRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findByShipAndYear(shipId: string, year: number): Promise<BankEntry | null>;
    save(entry: BankEntry): Promise<BankEntry>;
    findAllByShip(shipId: string): Promise<BankEntry[]>;
}
export declare class PrismaPoolRepository implements PoolRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(pool: Pool): Promise<Pool>;
    findById(id: string): Promise<Pool | null>;
    findByYear(year: number): Promise<Pool[]>;
}
//# sourceMappingURL=repositories.d.ts.map