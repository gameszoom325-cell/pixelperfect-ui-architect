import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { StatCard } from '../common/StatCard';
import { 
  FileText, 
  CheckSquare, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign,
  Layers
} from 'lucide-react';

export const ExecutiveMetrics: React.FC = () => {
  const { metrics, setCurrentView } = useContracts();

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(metrics.totalContractValue);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Active Commitments"
        value={formattedValue}
        subValue={`across ${metrics.totalActiveContracts} active contracts`}
        icon={<DollarSign className="h-4 w-4" />}
        trend={{ value: '+14.2%', isPositive: true }}
        onClick={() => setCurrentView('dashboard')}
      />

      <StatCard
        label="Execution Task Board"
        value={metrics.activeTasksCount}
        subValue={`${metrics.totalObligations} extracted obligations tracked`}
        icon={<Layers className="h-4 w-4" />}
        trend={{ value: '+4 approved', isPositive: true }}
        onClick={() => setCurrentView('obligations')}
      />

      <StatCard
        label="Human Approval Queue"
        value={metrics.pendingObligationsCount}
        subValue={metrics.pendingObligationsCount > 0 ? 'Awaiting human authorization' : 'All approved'}
        icon={<ShieldCheck className="h-4 w-4" />}
        badge={
          metrics.pendingObligationsCount > 0 ? (
            <span className="rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-[10px] font-mono font-medium px-2 py-0.5 text-amber-800 dark:text-amber-400">
              Action Required
            </span>
          ) : undefined
        }
        onClick={() => setCurrentView('approvals')}
      />

      <StatCard
        label="Risk & Compliance Index"
        value={`${metrics.averageComplianceRate}%`}
        subValue={`${metrics.criticalRisksCount} high/critical risk flags`}
        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        trend={{ value: '99.4% SLA met', isPositive: true }}
        onClick={() => setCurrentView('analysis')}
      />
    </div>
  );
};
