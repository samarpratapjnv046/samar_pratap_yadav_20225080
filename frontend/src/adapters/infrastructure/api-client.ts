import axios, { AxiosInstance } from 'axios';
import { Route, ComparisonData, ComplianceBalance, PoolResult } from '../../core/domain/entities';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Routes
  async fetchRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    const params = new URLSearchParams();
    if (filters?.vesselType) params.append('vesselType', filters.vesselType);
    if (filters?.fuelType) params.append('fuelType', filters.fuelType);
    if (filters?.year) params.append('year', filters.year.toString());

    const response = await this.client.get(`/routes?${params.toString()}`);
    return response.data;
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.client.post(`/routes/${routeId}/baseline`);
  }

  async getComparison(): Promise<ComparisonData[]> {
    const response = await this.client.get('/routes/comparison');
    return response.data;
  }

  // Compliance
  async getComplianceBalance(shipId: string, year: number): Promise<number> {
    const response = await this.client.get(`/compliance/cb?shipId=${shipId}&year=${year}`);
    return response.data.cbGco2eq;
  }

  async bankComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    const response = await this.client.post('/banking/bank', { shipId, year });
    return response.data;
  }

  async applyBankedBalance(shipId: string, year: number, amount: number): Promise<ComplianceBalance> {
    const response = await this.client.post('/banking/apply', { shipId, year, amount });
    return response.data;
  }

  // Pools
  async getAdjustedCBs(year: number): Promise<{ shipId: string; adjustedCb: number }[]> {
    const response = await this.client.get(`/compliance/adjusted-cb?year=${year}`);
    return response.data;
  }

  async createPool(year: number, members: { shipId: string; cbBefore: number }[]): Promise<PoolResult> {
    const response = await this.client.post('/pools', { year, members });
    return response.data;
  }

  async addRoute(route: Omit<Route, 'id' | 'isBaseline'>): Promise<Route> {
    const response = await this.client.post('/routes', route);
    return response.data;
  }
}
