import { Route, ComparisonData, ComplianceBalance, PoolResult } from '../domain/entities';

export interface RouteRepository {
  fetchAll(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<ComparisonData[]>;
}

export interface ComplianceRepository {
  getComplianceBalance(shipId: string, year: number): Promise<number>;
  bankComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  applyBankedBalance(shipId: string, year: number, amount: number): Promise<ComplianceBalance>;
}

export interface PoolRepository {
  createPool(year: number, members: { shipId: string; cbBefore: number }[]): Promise<PoolResult>;
}
