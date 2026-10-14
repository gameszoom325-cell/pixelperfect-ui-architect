import React from 'react';
import { ExecutiveMetrics } from '../components/dashboard/ExecutiveMetrics';
import { InsightsAlertsBanner } from '../components/dashboard/InsightsAlertsBanner';
import { ContractsTable } from '../components/dashboard/ContractsTable';
import { ObligationMilestoneChart } from '../components/dashboard/ObligationMilestoneChart';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Executive KPI Stats */}
      <ExecutiveMetrics />

      {/* Autonomous AI Risk Alert Banner */}
      <InsightsAlertsBanner />

      {/* Main Contracts Table */}
      <ContractsTable />

      {/* Obligations Distribution & Timeline */}
      <ObligationMilestoneChart />
    </div>
  );
};
