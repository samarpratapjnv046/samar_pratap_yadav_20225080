import React, { useState } from 'react';
import { ComplianceBalance } from '../../../core/domain/entities';
import { ApiClient } from '../../infrastructure/api-client';

interface BankingTabProps {
  apiClient: ApiClient;
}

export const BankingTab: React.FC<BankingTabProps> = ({ apiClient }) => {
  const [shipId, setShipId] = useState('');
  const [year, setYear] = useState(2024);
  const [currentCB, setCurrentCB] = useState<number | null>(null);
  const [bankResult, setBankResult] = useState<ComplianceBalance | null>(null);
  const [applyAmount, setApplyAmount] = useState('');
  const [applyResult, setApplyResult] = useState<ComplianceBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadComplianceBalance = async () => {
    if (!shipId) return;
    setLoading(true);
    setError('');
    try {
      const cb = await apiClient.getComplianceBalance(shipId, year);
      setCurrentCB(cb);
    } catch (err) {
      setError('Failed to load compliance balance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    if (!shipId || currentCB === null || currentCB <= 0) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiClient.bankComplianceBalance(shipId, year);
      setBankResult(result);
      await loadComplianceBalance(); // Refresh CB
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to bank compliance balance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!shipId || !applyAmount) return;
    const amount = parseFloat(applyAmount);
    if (isNaN(amount) || amount <= 0) return;

    setLoading(true);
    setError('');
    try {
      const result = await apiClient.applyBankedBalance(shipId, year, amount);
      setApplyResult(result);
      await loadComplianceBalance(); // Refresh CB
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply banked balance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Banking</h2>

      {/* Ship and Year Selection */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Ship ID"
          value={shipId}
          onChange={(e) => setShipId(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="border p-2 rounded"
        />
        <button
          onClick={loadComplianceBalance}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!shipId}
        >
          Load CB
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Current CB Display */}
      {currentCB !== null && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Current Compliance Balance: {currentCB.toFixed(2)} gCO₂e</h3>
        </div>
      )}

      {/* Banking Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bank Surplus</h3>
        <button
          onClick={handleBank}
          disabled={currentCB === null || currentCB <= 0 || loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Bank Positive CB
        </button>

        {bankResult && (
          <div className="mt-2 p-4 bg-green-100 rounded">
            <p>CB Before: {bankResult.cbBefore.toFixed(2)}</p>
            <p>Applied: {bankResult.applied.toFixed(2)}</p>
            <p>CB After: {bankResult.cbAfter.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Apply Banked Balance */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Apply Banked Surplus</h3>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Amount to apply"
            value={applyAmount}
            onChange={(e) => setApplyAmount(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleApply}
            disabled={!applyAmount || loading}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
          >
            Apply
          </button>
        </div>

        {applyResult && (
          <div className="mt-2 p-4 bg-orange-100 rounded">
            <p>CB Before: {applyResult.cbBefore.toFixed(2)}</p>
            <p>Applied: {applyResult.applied.toFixed(2)}</p>
            <p>CB After: {applyResult.cbAfter.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
