import React from 'react';
import { RiskTier, ObligationStatus, ContractStatus } from '../../types/contract';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  icon
}) => {
  const variantStyles = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} whitespace-nowrap shrink-0 font-medium ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ tier: RiskTier; score?: number }> = ({ tier, score }) => {
  const config = {
    Low: { variant: 'success' as const, label: 'Low Risk' },
    Medium: { variant: 'warning' as const, label: 'Medium Risk' },
    High: { variant: 'danger' as const, label: 'High Risk' },
    Critical: { variant: 'danger' as const, label: 'Critical Risk' }
  }[tier] || { variant: 'neutral' as const, label: tier };

  return (
    <Badge variant={config.variant} size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="font-mono opacity-80 text-[10px] ml-0.5">({score})</span>
      )}
    </Badge>
  );
};

export const ObligationStatusBadge: React.FC<{ status: ObligationStatus }> = ({ status }) => {
  const config = {
    Pending: { variant: 'neutral' as const, label: 'Pending' },
    'In Progress': { variant: 'info' as const, label: 'In Progress' },
    Fulfilled: { variant: 'success' as const, label: 'Fulfilled' },
    'At Risk': { variant: 'warning' as const, label: 'At Risk' },
    Overdue: { variant: 'danger' as const, label: 'Overdue' }
  }[status] || { variant: 'neutral' as const, label: status };

  return (
    <Badge variant={config.variant}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{config.label}</span>
    </Badge>
  );
};

export const ContractStatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
  const config = {
    Active: { variant: 'success' as const, label: 'Active' },
    'Pending Review': { variant: 'warning' as const, label: 'Pending Review' },
    'Under Ingestion': { variant: 'info' as const, label: 'Ingesting' },
    'Expiring Soon': { variant: 'danger' as const, label: 'Expiring Soon' },
    Terminated: { variant: 'neutral' as const, label: 'Terminated' },
    Draft: { variant: 'neutral' as const, label: 'Draft' }
  }[status] || { variant: 'neutral' as const, label: status };

  return (
    <Badge variant={config.variant}>
      <span>{config.label}</span>
    </Badge>
  );
};
