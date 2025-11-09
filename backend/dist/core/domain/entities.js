"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyInScope = exports.GHGIntensity = exports.ComplianceBalance = void 0;
class ComplianceBalance {
    constructor(value) {
        this.value = value;
    }
    isSurplus() {
        return this.value > 0;
    }
    isDeficit() {
        return this.value < 0;
    }
    add(other) {
        return new ComplianceBalance(this.value + other.value);
    }
    subtract(other) {
        return new ComplianceBalance(this.value - other.value);
    }
}
exports.ComplianceBalance = ComplianceBalance;
class GHGIntensity {
    constructor(value) {
        this.value = value;
    }
    compareTo(other) {
        return this.value - other.value;
    }
    percentDifference(baseline) {
        return ((this.value / baseline.value) - 1) * 100;
    }
    isCompliant(baseline) {
        return this.value <= GHGIntensity.TARGET_2025.value;
    }
}
exports.GHGIntensity = GHGIntensity;
GHGIntensity.TARGET_2025 = new GHGIntensity(89.3368);
class EnergyInScope {
    constructor(value) {
        this.value = value;
    } // in MJ
    static fromFuelConsumption(fuelConsumption) {
        // Approximate: 1 ton of fuel ≈ 41,000 MJ
        return new EnergyInScope(fuelConsumption * 41000);
    }
}
exports.EnergyInScope = EnergyInScope;
//# sourceMappingURL=entities.js.map