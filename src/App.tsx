import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { CashBooks } from './components/CashBooks';
import { ProgressRecap } from './components/ProgressRecap';
import { ReceiptGenerator } from './components/ReceiptGenerator';
import { WorkerPayroll } from './components/WorkerPayroll';
import { LPJReport } from './components/LPJReport';
import { RabProgressSyncModal } from './components/RabProgressSyncModal';
import { TechnicalDocsManager } from './components/TechnicalDocsManager';
import { MasterDataManager } from './components/MasterDataManager';
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransferKasModal } from './components/TransferKasModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { WorkspaceManagerModal } from './components/WorkspaceManagerModal';
import { NavTab } from './types';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Workspace & Portable File Hub Modal
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceModalInitialTab, setWorkspaceModalInitialTab] = useState<'switcher' | 'upload' | 'download' | 'pin'>('switcher');

  const handleOpenWorkspaceManager = (tab: 'switcher' | 'upload' | 'download' | 'pin' = 'switcher') => {
    setWorkspaceModalInitialTab(tab);
    setIsWorkspaceModalOpen(true);
  };

  const handlePrintLPJ = () => {
    setActiveTab('lpj');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 w-full max-w-full overflow-x-hidden">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onOpenTransfer={() => setIsTransferOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWorkspaceManager={handleOpenWorkspaceManager}
        onPrintLPJ={handlePrintLPJ}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 py-4 sm:py-6 min-w-0 box-border">
        {activeTab === 'overview' && (
          <DashboardOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddTxModal={() => setIsAddTxOpen(true)}
            onOpenTransferModal={() => setIsTransferOpen(true)}
            onOpenWorkspaceManager={handleOpenWorkspaceManager}
          />
        )}

        {activeTab === 'data_master' && (
          <MasterDataManager onNavigateToTab={(tab) => setActiveTab(tab as NavTab)} />
        )}

        {activeTab === 'cashbooks' && (
          <CashBooks
            onOpenAddTxModal={() => setIsAddTxOpen(true)}
            onOpenTransferModal={() => setIsTransferOpen(true)}
          />
        )}

        {activeTab === 'technical_docs' && (
          <TechnicalDocsManager onNavigateToProgressSync={() => setActiveTab('rab_sync')} />
        )}

        {activeTab === 'rab_sync' && (
          <RabProgressSyncModal
            onNavigateToReceipts={() => setActiveTab('receipts')}
            onNavigateToBKU={() => setActiveTab('cashbooks')}
            onNavigateToPayroll={() => setActiveTab('payroll')}
          />
        )}

        {activeTab === 'progress' && <ProgressRecap />}

        {activeTab === 'receipts' && (
          <ReceiptGenerator onNavigateToRabSync={() => setActiveTab('rab_sync')} />
        )}

        {activeTab === 'payroll' && <WorkerPayroll />}

        {activeTab === 'lpj' && <LPJReport />}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
      <TransferKasModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <WorkspaceManagerModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        initialTab={workspaceModalInitialTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <MainContent />
    </ProjectProvider>
  );
}
