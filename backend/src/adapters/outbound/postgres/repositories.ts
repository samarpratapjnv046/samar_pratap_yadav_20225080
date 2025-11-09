import { PrismaClient } from '@prisma/client';
import {
  RouteRepository,
  ComplianceRepository,
  BankingRepository,
  PoolRepository,
} from '../../../core/ports/repositories';
import {
  Route,
  ShipCompliance,
  BankEntry,
  Pool,
} from '../../../core/domain/entities';

export class PrismaRouteRepository implements RouteRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Route[]> {
    const routes = await this.prisma.route.findMany();
    return routes.map(route => ({
      id: route.id,
      routeId: route.routeId,
      vesselType: route.vesselType,
      fuelType: route.fuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      fuelConsumption: route.fuelConsumption,
      distance: route.distance,
      totalEmissions: route.totalEmissions,
      isBaseline: route.isBaseline,
    }));
  }

  async findById(id: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) return null;
    return {
      id: route.id,
      routeId: route.routeId,
      vesselType: route.vesselType,
      fuelType: route.fuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      fuelConsumption: route.fuelConsumption,
      distance: route.distance,
      totalEmissions: route.totalEmissions,
      isBaseline: route.isBaseline,
    };
  }

  async updateBaseline(id: string, isBaseline: boolean): Promise<Route> {
    const route = await this.prisma.route.update({
      where: { id },
      data: { isBaseline: isBaseline },
    });
    return {
      id: route.id,
      routeId: route.routeId,
      vesselType: route.vesselType,
      fuelType: route.fuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      fuelConsumption: route.fuelConsumption,
      distance: route.distance,
      totalEmissions: route.totalEmissions,
      isBaseline: route.isBaseline,
    };
  }

  async findComparison(): Promise<{ baseline: Route; comparison: Route[] }> {
    const baseline = await this.prisma.route.findFirst({
      where: { isBaseline: true },
    });
    if (!baseline) throw new Error('No baseline route found');

    const comparison = await this.prisma.route.findMany({
      where: { isBaseline: false },
    });

    const mapRoute = (route: any): Route => ({
      id: route.id,
      routeId: route.routeId,
      vesselType: route.vesselType,
      fuelType: route.fuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      fuelConsumption: route.fuelConsumption,
      distance: route.distance,
      totalEmissions: route.totalEmissions,
      isBaseline: route.isBaseline,
    });

    return {
      baseline: mapRoute(baseline),
      comparison: comparison.map(mapRoute),
    };
  }
}

export class PrismaComplianceRepository implements ComplianceRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    const compliance = await this.prisma.shipCompliance.findFirst({
      where: { shipId: shipId, year },
    });
    if (!compliance) return null;
    return {
      id: compliance.id,
      shipId: compliance.shipId,
      year: compliance.year,
      cbGco2eq: compliance.cbGco2eq,
    };
  }

  async save(compliance: ShipCompliance): Promise<ShipCompliance> {
    if (!compliance.id) {
      const saved = await this.prisma.shipCompliance.create({
        data: {
          shipId: compliance.shipId,
          year: compliance.year,
          cbGco2eq: compliance.cbGco2eq,
        },
      });
      return {
        id: saved.id,
        shipId: saved.shipId,
        year: saved.year,
        cbGco2eq: saved.cbGco2eq,
      };
    } else {
      const saved = await this.prisma.shipCompliance.update({
        where: { id: compliance.id },
        data: {
          shipId: compliance.shipId,
          year: compliance.year,
          cbGco2eq: compliance.cbGco2eq,
        },
      });
      return {
        id: saved.id,
        shipId: saved.shipId,
        year: saved.year,
        cbGco2eq: saved.cbGco2eq,
      };
    }
  }

  async findAdjustedByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    // For now, same as findByShipAndYear; banking adjustments would modify this
    return this.findByShipAndYear(shipId, year);
  }
}

export class PrismaBankingRepository implements BankingRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry | null> {
    const entry = await this.prisma.bankEntry.findFirst({
      where: { shipId: shipId, year },
    });
    if (!entry) return null;
    return {
      id: entry.id,
      shipId: entry.shipId,
      year: entry.year,
      amountGco2eq: entry.amountGco2eq,
    };
  }

  async save(entry: BankEntry): Promise<BankEntry> {
    if (!entry.id) {
      const saved = await this.prisma.bankEntry.create({
        data: {
          shipId: entry.shipId,
          year: entry.year,
          amountGco2eq: entry.amountGco2eq,
        },
      });
      return {
        id: saved.id,
        shipId: saved.shipId,
        year: saved.year,
        amountGco2eq: saved.amountGco2eq,
      };
    } else {
      const saved = await this.prisma.bankEntry.update({
        where: { id: entry.id },
        data: {
          shipId: entry.shipId,
          year: entry.year,
          amountGco2eq: entry.amountGco2eq,
        },
      });
      return {
        id: saved.id,
        shipId: saved.shipId,
        year: saved.year,
        amountGco2eq: saved.amountGco2eq,
      };
    }
  }

  async findAllByShip(shipId: string): Promise<BankEntry[]> {
    const entries = await this.prisma.bankEntry.findMany({
      where: { shipId: shipId },
    });
    return entries.map(entry => ({
      id: entry.id,
      shipId: entry.shipId,
      year: entry.year,
      amountGco2eq: entry.amountGco2eq,
    }));
  }
}

export class PrismaPoolRepository implements PoolRepository {
  constructor(private prisma: PrismaClient) {}

  async create(pool: Pool): Promise<Pool> {
    const savedPool = await this.prisma.pool.create({
      data: {
        year: pool.year,
        members: {
          create: pool.members.map(member => ({
            shipId: member.shipId,
            cbBefore: member.cbBefore,
            cbAfter: member.cbAfter,
          })),
        },
      },
      include: { members: true },
    });

    return {
      id: savedPool.id,
      year: savedPool.year,
      members: savedPool.members.map(member => ({
        id: member.id,
        poolId: savedPool.id,
        shipId: member.shipId,
        cbBefore: member.cbBefore,
        cbAfter: member.cbAfter,
      })),
    };
  }

  async findById(id: string): Promise<Pool | null> {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!pool) return null;
    return {
      id: pool.id,
      year: pool.year,
      members: pool.members.map(member => ({
        id: member.id,
        poolId: pool.id,
        shipId: member.shipId,
        cbBefore: member.cbBefore,
        cbAfter: member.cbAfter,
      })),
    };
  }

  async findByYear(year: number): Promise<Pool[]> {
    const pools = await this.prisma.pool.findMany({
      where: { year },
      include: { members: true },
    });
    return pools.map(pool => ({
      id: pool.id,
      year: pool.year,
      members: pool.members.map(member => ({
        id: member.id,
        poolId: pool.id,
        shipId: member.shipId,
        cbBefore: member.cbBefore,
        cbAfter: member.cbAfter,
      })),
    }));
  }
}
