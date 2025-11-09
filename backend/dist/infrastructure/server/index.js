"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Mock data for now to get the server running
const mockRoutes = [
    {
        id: '1',
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
    },
    {
        id: '2',
        routeId: 'R002',
        vesselType: 'BulkCarrier',
        fuelType: 'LNG',
        year: 2024,
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        isBaseline: false
    },
    {
        id: '3',
        routeId: 'R003',
        vesselType: 'Tanker',
        fuelType: 'MGO',
        year: 2024,
        ghgIntensity: 92.5,
        fuelConsumption: 5500,
        distance: 13000,
        totalEmissions: 5100,
        isBaseline: false
    },
    {
        id: '4',
        routeId: 'R004',
        vesselType: 'RoRo',
        fuelType: 'HFO',
        year: 2023,
        ghgIntensity: 89.0,
        fuelConsumption: 4800,
        distance: 11000,
        totalEmissions: 4300,
        isBaseline: false
    }
];
// In-memory storage for banking
const bankedBalances = {};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get('/routes', async (req, res) => {
    try {
        const { vesselType, fuelType, year } = req.query;
        let filteredRoutes = mockRoutes;
        if (vesselType) {
            filteredRoutes = filteredRoutes.filter(r => r.vesselType === vesselType);
        }
        if (fuelType) {
            filteredRoutes = filteredRoutes.filter(r => r.fuelType === fuelType);
        }
        if (year) {
            filteredRoutes = filteredRoutes.filter(r => r.year === parseInt(year));
        }
        res.json(filteredRoutes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
});
app.post('/routes/:routeId/baseline', async (req, res) => {
    try {
        const { routeId } = req.params;
        // Mock baseline setting
        const routeIndex = mockRoutes.findIndex(r => r.routeId === routeId);
        if (routeIndex !== -1) {
            mockRoutes[routeIndex].isBaseline = true;
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to set baseline' });
    }
});
app.get('/routes/comparison', async (req, res) => {
    try {
        const baseline = mockRoutes.find(r => r.isBaseline);
        if (!baseline)
            return res.status(404).json({ error: 'No baseline set' });
        const comparisonRoutes = mockRoutes.filter(r => !r.isBaseline);
        const comparisonData = comparisonRoutes.map(route => {
            const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
            const compliant = route.ghgIntensity <= 89.3368; // Target: 89.3368 gCO₂e/MJ
            return {
                baseline,
                comparison: route,
                percentDiff,
                compliant
            };
        });
        res.json(comparisonData);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get comparison' });
    }
});
// Compliance
app.get('/compliance/cb', async (req, res) => {
    try {
        const { shipId, year } = req.query;
        // Simple CB calculation for now
        const route = mockRoutes.find(r => r.routeId === shipId);
        if (!route)
            return res.status(404).json({ error: 'Route not found' });
        const cb = (2.16 - route.ghgIntensity) * route.fuelConsumption;
        res.json({ cbGco2eq: Math.max(0, cb) });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to compute CB' });
    }
});
app.get('/compliance/adjusted-cb', async (req, res) => {
    try {
        const { year } = req.query;
        if (!year)
            return res.status(400).json({ error: 'Year is required' });
        const yearInt = parseInt(year);
        const adjustedCBs = mockRoutes
            .filter(r => r.year === yearInt)
            .map(route => {
            const cb = (2.16 - route.ghgIntensity) * route.fuelConsumption;
            return {
                shipId: route.routeId,
                adjustedCb: Math.max(0, cb)
            };
        });
        res.json(adjustedCBs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get adjusted CB' });
    }
});
// Banking
app.get('/banking/records', async (req, res) => {
    try {
        // Mock empty records for now
        res.json([]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get banking records' });
    }
});
app.post('/banking/bank', async (req, res) => {
    try {
        const { shipId, year } = req.body;
        const route = mockRoutes.find(r => r.routeId === shipId);
        if (!route)
            return res.status(404).json({ error: 'Route not found' });
        const cbBefore = (2.16 - route.ghgIntensity) * route.fuelConsumption;
        if (cbBefore <= 0)
            return res.status(400).json({ error: 'No surplus to bank' });
        // Bank the surplus
        if (!bankedBalances[shipId])
            bankedBalances[shipId] = {};
        bankedBalances[shipId][year] = (bankedBalances[shipId][year] || 0) + cbBefore;
        const result = {
            cbBefore,
            applied: cbBefore,
            cbAfter: 0
        };
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to bank surplus' });
    }
});
app.post('/banking/apply', async (req, res) => {
    try {
        const { shipId, year, amount } = req.body;
        const route = mockRoutes.find(r => r.routeId === shipId);
        if (!route)
            return res.status(404).json({ error: 'Route not found' });
        const cbBefore = (2.16 - route.ghgIntensity) * route.fuelConsumption;
        const bankedAmount = bankedBalances[shipId]?.[year] || 0;
        if (bankedAmount < amount)
            return res.status(400).json({ error: 'Insufficient banked balance' });
        // Apply the banked surplus to deficit
        bankedBalances[shipId][year] -= amount;
        const result = {
            cbBefore,
            applied: amount,
            cbAfter: cbBefore + amount
        };
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to apply banked surplus' });
    }
});
// Pools
app.post('/pools', async (req, res) => {
    try {
        const { year, members } = req.body;
        // Validate pool rules
        const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);
        if (totalCB < 0)
            return res.status(400).json({ error: 'Pool sum must be >= 0' });
        // Distribute CB equally among members
        const numMembers = members.length;
        const equalCB = totalCB / numMembers;
        const poolMembers = members.map((m) => {
            const cbAfter = equalCB;
            // Check rules: deficit ship cannot exit worse, surplus ship cannot exit negative
            if (m.cbBefore < 0 && cbAfter < m.cbBefore) {
                return res.status(400).json({ error: `Deficit ship ${m.shipId} would exit worse off` });
            }
            if (m.cbBefore > 0 && cbAfter < 0) {
                return res.status(400).json({ error: `Surplus ship ${m.shipId} would exit negative` });
            }
            return {
                shipId: m.shipId,
                cbBefore: m.cbBefore,
                cbAfter
            };
        });
        const pool = {
            id: `pool-${Date.now()}`,
            year: parseInt(year),
            members: poolMembers,
            poolSum: totalCB,
            valid: true
        };
        res.json(pool);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create pool' });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map