import { Request, Response } from 'express';
import { FetchRoutesUseCase } from '../../../core/application/use-cases';
import { SetBaselineUseCase } from '../../../core/application/use-cases';
import { ComputeComparisonUseCase } from '../../../core/application/use-cases';
import { ComputeCBUseCase } from '../../../core/application/use-cases';
import { BankSurplusUseCase } from '../../../core/application/use-cases';
import { ApplyBankedUseCase } from '../../../core/application/use-cases';
import { CreatePoolUseCase } from '../../../core/application/use-cases';

export class RoutesController {
  constructor(
    private fetchRoutesUseCase: FetchRoutesUseCase,
    private setBaselineUseCase: SetBaselineUseCase,
    private getComparisonUseCase: ComputeComparisonUseCase
  ) {}

  getAllRoutes = async (req: Request, res: Response) => {
    try {
      const routes = await this.fetchRoutesUseCase.execute();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  };

  setBaseline = async (req: Request, res: Response) => {
    try {
      const { routeId } = req.params;
      await this.setBaselineUseCase.execute(routeId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set baseline' });
    }
  };

  getComparison = async (req: Request, res: Response) => {
    try {
      const comparison = await this.getComparisonUseCase.execute();
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get comparison' });
    }
  };
}

export class ComplianceController {
  constructor(private computeCBUseCase: ComputeCBUseCase) {}

  getCB = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query as { shipId: string; year: string };
      const cb = await this.computeCBUseCase.execute(shipId, parseInt(year));
      res.json(cb);
    } catch (error) {
      res.status(500).json({ error: 'Failed to compute CB' });
    }
  };

  getAdjustedCB = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query as { shipId: string; year: string };
      // For now, return same as CB (adjusted CB would include banking)
      const adjustedCB = await this.computeCBUseCase.execute(shipId, parseInt(year));
      res.json(adjustedCB);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get adjusted CB' });
    }
  };
}

export class BankingController {
  constructor(
    private bankSurplusUseCase: BankSurplusUseCase,
    private applyBankedUseCase: ApplyBankedUseCase
  ) {}

  getRecords = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query as { shipId: string; year: string };
      // For now, return empty array (would need a use case to fetch records)
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get banking records' });
    }
  };

  bankSurplus = async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.body;
      const result = await this.bankSurplusUseCase.execute(shipId, parseInt(year));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to bank surplus' });
    }
  };

  applyBanked = async (req: Request, res: Response) => {
    try {
      const { shipId, year, amount } = req.body;
      const result = await this.applyBankedUseCase.execute(shipId, parseInt(year), amount);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to apply banked surplus' });
    }
  };
}

export class PoolsController {
  constructor(private createPoolUseCase: CreatePoolUseCase) {}

  createPool = async (req: Request, res: Response) => {
    try {
      const { year, members } = req.body;
      const pool = await this.createPoolUseCase.execute(parseInt(year), members);
      res.json(pool);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create pool' });
    }
  };
}
