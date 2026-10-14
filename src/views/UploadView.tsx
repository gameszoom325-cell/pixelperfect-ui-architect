import React from 'react';
import { DropZone } from '../components/upload/DropZone';
import { PresetContractPicker } from '../components/upload/PresetContractPicker';
import { IngestionPipelineVisualizer } from '../components/upload/IngestionPipelineVisualizer';
import { UploadHistoryList } from '../components/upload/UploadHistoryList';

export const UploadView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Active Pipeline Status Banner if task running */}
      <IngestionPipelineVisualizer />

      {/* Main Drag & Drop Zone */}
      <DropZone />

      {/* 1-Click Preset Samples for testing */}
      <PresetContractPicker />

      {/* Ingestion History & Confidence Ledger */}
      <UploadHistoryList />
    </div>
  );
};
