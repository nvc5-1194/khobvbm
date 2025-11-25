import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Operations } from './pages/Operations';
import { Reports } from './pages/Reports';
import { Assistant } from './pages/Assistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onChangeTab={setActiveTab} />;
      case 'inventory':
        return <Inventory />;
      case 'operations':
        return <Operations />;
      case 'reports':
        return <Reports />;
      case 'assistant':
        return <Assistant />;
      default:
        return <Dashboard onChangeTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
