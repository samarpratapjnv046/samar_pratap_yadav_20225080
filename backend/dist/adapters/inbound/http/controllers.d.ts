import { Request, Response } from 'express';
import { FetchRoutesUseCase } from '../../../core/application/use-cases';
import { SetBaselineUseCase } from '../../../core/application/use-cases';
import { ComputeComparisonUseCase } from '../../../core/application/use-cases';
import { ComputeCBUseCase } from '../../../core/application/use-cases';
import { BankSurplusUseCase } from '../../../core/application/use-cases';
import { ApplyBankedUseCase } from '../../../core/application/use-cases';
import { CreatePoolUseCase } from '../../../core/application/use-cases';
export declare class RoutesController {
    private fetchRoutesUseCase;
    private setBaselineUseCase;
    private getComparisonUseCase;
    constructor(fetchRoutesUseCase: FetchRoutesUseCase, setBaselineUseCase: SetBaselineUseCase, getComparisonUseCase: ComputeComparisonUseCase);
    getAllRoutes: (req: Request, res: Response) => Promise<void>;
    setBaseline: (req: Request, res: Response) => Promise<void>;
    getComparison: (req: Request, res: Response) => Promise<void>;
}
export declare class ComplianceController {
    private computeCBUseCase;
    constructor(computeCBUseCase: ComputeCBUseCase);
    getCB: (req: Request, res: Response) => Promise<void>;
    getAdjustedCB: (req: Request, res: Response) => Promise<void>;
}
export declare class BankingController {
    private bankSurplusUseCase;
    private applyBankedUseCase;
    constructor(bankSurplusUseCase: BankSurplusUseCase, applyBankedUseCase: ApplyBankedUseCase);
    getRecords: (req: Request, res: Response) => Promise<void>;
    bankSurplus: (req: Request, res: Response) => Promise<void>;
    applyBanked: (req: Request, res: Response) => Promise<void>;
}
export declare class PoolsController {
    private createPoolUseCase;
    constructor(createPoolUseCase: CreatePoolUseCase);
    createPool: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=controllers.d.ts.map