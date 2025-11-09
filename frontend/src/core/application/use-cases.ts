import { Route, ComparisonData, ComplianceBalance, PoolResult } from '../domain/entities';

export interface FetchRoutesUseCase {
  execute(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]>;
}

export interface SetBaselineUseCase {
  execute(routeId: string): Promise<void>;
}

export interface CompareRoutesUseCase {
  execute(): Promise<ComparisonData[]>;
}

export interface FetchComplianceBalanceUseCase {
  execute(shipId: string, year: number): Promise<number>;
}

export interface BankComplianceBalanceUseCase {
  execute(shipId: string, year: number): Promise<ComplianceBalance>;
}

export interface ApplyBankedBalanceUseCase {
  execute(shipId: string, year: number, amount: number): Promise<ComplianceBalance>;
}

export interface CreatePoolUseCase {
  execute(year: number, members: { shipId: string; cbBefore: number }[]): Promise<PoolResult>;
}
