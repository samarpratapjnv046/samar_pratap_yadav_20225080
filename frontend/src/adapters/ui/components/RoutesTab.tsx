import React, { useState, useEffect } from 'react';
import { Route } from '../../../core/domain/entities';
import { ApiClient } from '../../infrastructure/api-client';

interface RoutesTabProps {
  apiClient: ApiClient;
}

interface AddRouteFormData {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: string;
  ghgIntensity: string;
  fuelConsumption: string;
  distance: string;
  totalEmissions: string;
}

export const RoutesTab: React.FC<RoutesTabProps> = ({ apiClient }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filters, setFilters] = useState({
    vesselType: '',
    fuelType: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState<AddRouteFormData>({
    routeId: '',
    vesselType: '',
    fuelType: '',
    year: '',
    ghgIntensity: '',
    fuelConsumption: '',
    distance: '',
    totalEmissions: '',
  });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    loadRoutes();
  }, [filters]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const filterParams = {
        vesselType: filters.vesselType || undefined,
        fuelType: filters.fuelType || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
      };
      const data = await apiClient.fetchRoutes(filterParams);
      setRoutes(data);
    } catch (error) {
      console.error('Failed to load routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await apiClient.setBaseline(routeId);
      await loadRoutes(); // Refresh data
      // Trigger a global refresh event for other tabs
      window.dispatchEvent(new CustomEvent('baselineChanged'));
    } catch (error) {
      console.error('Failed to set baseline:', error);
    }
  };

  const handleAddRoute = async () => {
    // Validation
    if (!addFormData.routeId || !addFormData.vesselType || !addFormData.fuelType || !addFormData.year ||
        !addFormData.ghgIntensity || !addFormData.fuelConsumption || !addFormData.distance || !addFormData.totalEmissions) {
      setAddError('All fields are required');
      return;
    }

    try {
      const newRoute = await apiClient.addRoute({
        routeId: addFormData.routeId,
        vesselType: addFormData.vesselType,
        fuelType: addFormData.fuelType,
        year: parseInt(addFormData.year),
        ghgIntensity: parseFloat(addFormData.ghgIntensity),
        fuelConsumption: parseFloat(addFormData.fuelConsumption),
        distance: parseFloat(addFormData.distance),
        totalEmissions: parseFloat(addFormData.totalEmissions),
      });

      setRoutes([...routes, newRoute]);
      setShowAddForm(false);
      setAddFormData({
        routeId: '',
        vesselType: '',
        fuelType: '',
        year: '',
        ghgIntensity: '',
        fuelConsumption: '',
        distance: '',
        totalEmissions: '',
      });
      setAddError('');
    } catch (error: any) {
      setAddError(error.response?.data?.error || 'Failed to add route');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Routes</h2>

      {/* Add Route Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {showAddForm ? 'Cancel' : 'Add New Route'}
      </button>

      {/* Add Route Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Add New Route</h3>
          {addError && <div className="text-red-600 mb-2">{addError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Route ID"
              value={addFormData.routeId}
              onChange={(e) => setAddFormData({ ...addFormData, routeId: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={addFormData.vesselType}
              onChange={(e) => setAddFormData({ ...addFormData, vesselType: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Vessel Type</option>
              <option value="Container">Container</option>
              <option value="BulkCarrier">Bulk Carrier</option>
              <option value="Tanker">Tanker</option>
              <option value="RoRo">RoRo</option>
            </select>
            <select
              value={addFormData.fuelType}
              onChange={(e) => setAddFormData({ ...addFormData, fuelType: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Fuel Type</option>
              <option value="HFO">HFO</option>
              <option value="LNG">LNG</option>
              <option value="MGO">MGO</option>
            </select>
            <input
              type="number"
              placeholder="Year"
              value={addFormData.year}
              onChange={(e) => setAddFormData({ ...addFormData, year: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="GHG Intensity (gCO₂e/MJ)"
              value={addFormData.ghgIntensity}
              onChange={(e) => setAddFormData({ ...addFormData, ghgIntensity: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Fuel Consumption (t)"
              value={addFormData.fuelConsumption}
              onChange={(e) => setAddFormData({ ...addFormData, fuelConsumption: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Distance (km)"
              value={addFormData.distance}
              onChange={(e) => setAddFormData({ ...addFormData, distance: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Total Emissions (t)"
              value={addFormData.totalEmissions}
              onChange={(e) => setAddFormData({ ...addFormData, totalEmissions: e.target.value })}
              className="border p-2 rounded"
            />
          </div>
          <button
            onClick={handleAddRoute}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Route
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={filters.vesselType}
          onChange={(e) => setFilters({ ...filters, vesselType: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Vessel Types</option>
          <option value="Container">Container</option>
          <option value="BulkCarrier">Bulk Carrier</option>
          <option value="Tanker">Tanker</option>
          <option value="RoRo">RoRo</option>
        </select>

        <select
          value={filters.fuelType}
          onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Fuel Types</option>
          <option value="HFO">HFO</option>
          <option value="LNG">LNG</option>
          <option value="MGO">MGO</option>
        </select>

        <input
          type="number"
          placeholder="Year"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Route ID</th>
                <th className="border p-2">Vessel Type</th>
                <th className="border p-2">Fuel Type</th>
                <th className="border p-2">Year</th>
                <th className="border p-2">GHG Intensity (gCO₂e/MJ)</th>
                <th className="border p-2">Fuel Consumption (t)</th>
                <th className="border p-2">Distance (km)</th>
                <th className="border p-2">Total Emissions (t)</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="border p-2">{route.routeId}</td>
                  <td className="border p-2">{route.vesselType}</td>
                  <td className="border p-2">{route.fuelType}</td>
                  <td className="border p-2">{route.year}</td>
                  <td className="border p-2">{route.ghgIntensity.toFixed(2)}</td>
                  <td className="border p-2">{route.fuelConsumption}</td>
                  <td className="border p-2">{route.distance}</td>
                  <td className="border p-2">{route.totalEmissions.toFixed(2)}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleSetBaseline(route.routeId)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Set Baseline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
