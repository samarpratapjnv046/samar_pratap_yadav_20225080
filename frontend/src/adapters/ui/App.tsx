import React, { useState } from 'react';
import { RoutesTab } from './components/RoutesTab';
import { CompareTab } from './components/CompareTab';
import { BankingTab } from './components/BankingTab';
import { PoolingTab } from './components/PoolingTab';
import { ApiClient } from '../infrastructure/api-client';

const apiClient = new ApiClient();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'compare' | 'banking' | 'pooling'>('routes');

  const tabs = [
    { id: 'routes', label: 'Routes' },
    { id: 'compare', label: 'Compare' },
    { id: 'banking', label: 'Banking' },
    { id: 'pooling', label: 'Pooling' },
  ] as const;

  const renderTab = () => {
    switch (activeTab) {
      case 'routes':
        return <RoutesTab apiClient={apiClient} />;
      case 'compare':
        return <CompareTab apiClient={apiClient} />;
      case 'banking':
        return <BankingTab apiClient={apiClient} />;
      case 'pooling':
        return <PoolingTab apiClient={apiClient} />;
      default:
        return <RoutesTab apiClient={apiClient} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              FuelEU Maritime Compliance Dashboard
            </h1>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderTab()}
      </main>
    </div>
  );
};
