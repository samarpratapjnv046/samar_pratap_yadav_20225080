import React, { useState, useEffect } from 'react';
import { ComparisonData } from '../../../core/domain/entities';
import { ApiClient } from '../../infrastructure/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CompareTabProps {
  apiClient: ApiClient;
}

const DEFAULT_TARGET_INTENSITY = 89.3368; // gCO₂e/MJ

export const CompareTab: React.FC<CompareTabProps> = ({ apiClient }) => {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetIntensity, setTargetIntensity] = useState(DEFAULT_TARGET_INTENSITY.toString());

  useEffect(() => {
    loadComparison();
  }, []);

  // Refresh comparison data when baseline changes
  useEffect(() => {
    const handleBaselineChange = () => {
      loadComparison();
    };

    window.addEventListener('baselineChanged', handleBaselineChange);

    return () => {
      window.removeEventListener('baselineChanged', handleBaselineChange);
    };
  }, []);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getComparison();
      setComparisonData(data);
    } catch (error: any) {
      console.error('Failed to load comparison:', error);
      setError(error.response?.data?.error || 'Failed to load comparison data');
      setComparisonData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentTarget = parseFloat(targetIntensity) || DEFAULT_TARGET_INTENSITY;

  const chartData = comparisonData.map((item) => ({
    routeId: item.baseline.routeId,
    baseline: item.baseline.ghgIntensity,
    comparison: item.comparison.ghgIntensity,
    target: currentTarget,
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Compare Routes</h2>

      {/* Target Intensity Input */}
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold">Target GHG Intensity (gCO₂e/MJ):</label>
        <input
          type="number"
          step="0.01"
          value={targetIntensity}
          onChange={(e) => setTargetIntensity(e.target.value)}
          className="border p-2 rounded w-32"
          placeholder="89.3368"
        />
        <button
          onClick={() => setTargetIntensity(DEFAULT_TARGET_INTENSITY.toString())}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
        >
          Reset to Default
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">
          Error: {error}
          <button
            onClick={loadComparison}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : comparisonData.length === 0 ? (
        <div className="text-gray-600 mb-4">
          No baseline set. Please set a baseline in the Routes tab to see comparisons.
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Route ID</th>
                  <th className="border p-2">Baseline GHG (gCO₂e/MJ)</th>
                  <th className="border p-2">Comparison GHG (gCO₂e/MJ)</th>
                  <th className="border p-2">% Difference</th>
                  <th className="border p-2">Compliant</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item) => {
                  const isCompliant = item.comparison.ghgIntensity <= currentTarget;
                  return (
                    <tr key={item.baseline.id} className="hover:bg-gray-50">
                      <td className="border p-2">{item.baseline.routeId}</td>
                      <td className="border p-2">{item.baseline.ghgIntensity.toFixed(2)}</td>
                      <td className="border p-2">{item.comparison.ghgIntensity.toFixed(2)}</td>
                      <td className="border p-2">{item.percentDiff.toFixed(2)}%</td>
                      <td className="border p-2">
                        <span className={isCompliant ? 'text-green-600' : 'text-red-600'}>
                          {isCompliant ? '✅' : '❌'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="routeId" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#8884d8" name="Baseline" />
                <Bar dataKey="comparison" fill="#82ca9d" name="Comparison" />
                <Bar dataKey="target" fill="#ff7300" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
