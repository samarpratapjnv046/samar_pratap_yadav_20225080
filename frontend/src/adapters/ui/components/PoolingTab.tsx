import React, { useState, useEffect } from 'react';
import { PoolResult, PoolMember } from '../../../core/domain/entities';
import { ApiClient } from '../../infrastructure/api-client';

interface PoolingTabProps {
  apiClient: ApiClient;
}

export const PoolingTab: React.FC<PoolingTabProps> = ({ apiClient }) => {
  const [year, setYear] = useState(2024);
  const [adjustedCBs, setAdjustedCBs] = useState<{ shipId: string; adjustedCb: number }[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [poolResult, setPoolResult] = useState<PoolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdjustedCBs();
    setSelectedMembers([]);
    setPoolResult(null);
  }, [year]);

  const loadAdjustedCBs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdjustedCBs(year);
      setAdjustedCBs(data);
    } catch (err) {
      setError('Failed to load adjusted CBs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (shipId: string) => {
    setSelectedMembers(prev =>
      prev.includes(shipId)
        ? prev.filter(id => id !== shipId)
        : [...prev, shipId]
    );
  };

  const handleCreatePool = async () => {
    if (selectedMembers.length < 2) {
      setError('Need at least 2 members');
      return;
    }

    const members = selectedMembers.map(shipId => {
      const cb = adjustedCBs.find(cb => cb.shipId === shipId);
      return { shipId, cbBefore: cb ? cb.adjustedCb : 0 };
    });

    setLoading(true);
    setError('');
    try {
      const result = await apiClient.createPool(year, members);
      setPoolResult(result);
    } catch (err) {
      setError('Failed to create pool');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMembersData = adjustedCBs.filter(cb => selectedMembers.includes(cb.shipId));
  const poolSum = selectedMembersData.reduce((sum, m) => sum + m.adjustedCb, 0);
  const isValidPool = poolSum >= 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pooling</h2>

      {/* Year Selection */}
      <div className="mb-4">
        <label className="block mb-2">Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="border p-2 rounded"
        />
        <button
          onClick={loadAdjustedCBs}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Load Adjusted CBs
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Ships List */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Available Ships</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Select</th>
                  <th className="border p-2">Ship ID</th>
                  <th className="border p-2">Adjusted CB (gCO₂e)</th>
                </tr>
              </thead>
              <tbody>
                {adjustedCBs.map((cb) => (
                  <tr key={cb.shipId} className="hover:bg-gray-50">
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(cb.shipId)}
                        onChange={() => toggleMemberSelection(cb.shipId)}
                      />
                    </td>
                    <td className="border p-2">{cb.shipId}</td>
                    <td className="border p-2">{cb.adjustedCb.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Members Summary */}
      {selectedMembers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Selected Members ({selectedMembers.length})</h3>
          <div className={`p-4 rounded ${isValidPool ? 'bg-green-100' : 'bg-red-100'}`}>
            <h4 className="font-bold">Pool Sum: {poolSum.toFixed(2)} gCO₂e</h4>
            <p className={isValidPool ? 'text-green-600' : 'text-red-600'}>
              {isValidPool ? 'Valid pool (sum ≥ 0)' : 'Invalid pool (sum < 0)'}
            </p>
          </div>
        </div>
      )}

      {/* Create Pool Button */}
      <button
        onClick={handleCreatePool}
        disabled={selectedMembers.length < 2 || !isValidPool || loading}
        className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 disabled:bg-gray-400 mb-4"
      >
        Create Pool
      </button>

      {/* Pool Result */}
      {poolResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Pool Result</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Ship ID</th>
                  <th className="border p-2">CB Before</th>
                  <th className="border p-2">CB After</th>
                  <th className="border p-2">Change</th>
                </tr>
              </thead>
              <tbody>
                {poolResult.members.map((member) => (
                  <tr key={member.shipId} className="hover:bg-gray-50">
                    <td className="border p-2">{member.shipId}</td>
                    <td className="border p-2">{member.cbBefore.toFixed(2)}</td>
                    <td className="border p-2">{member.cbAfter.toFixed(2)}</td>
                    <td className="border p-2">
                      <span className={member.cbAfter > member.cbBefore ? 'text-green-600' : member.cbAfter < member.cbBefore ? 'text-red-600' : 'text-gray-600'}>
                        {(member.cbAfter - member.cbBefore).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
