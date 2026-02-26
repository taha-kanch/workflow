'use client';

import { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { NodeType } from '../../../shared/types/workflow.js';
import styles from './CustomNode.module.css';

const nodeTypeColors = {
  [NodeType.START]: '#10b981',
  [NodeType.END]: '#ef4444',
  [NodeType.PROCESS]: '#3b82f6',
  [NodeType.CONDITION]: '#f59e0b',
  [NodeType.EXTERNAL_CALL]: '#8b5cf6',
};

const nodeTypeLabels = {
  [NodeType.START]: 'START',
  [NodeType.END]: 'END',
  [NodeType.PROCESS]: 'PROCESS',
  [NodeType.CONDITION]: 'CONDITION',
  [NodeType.EXTERNAL_CALL]: 'EXTERNAL',
};

export default memo(function CustomNode({ id, data }) {
  const { deleteElements } = useReactFlow();
  const nodeType = data.type;
  const backgroundColor = nodeTypeColors[nodeType] || '#6b7280';
  const typeLabel = nodeTypeLabels[nodeType] || 'NODE';

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className={styles.node} style={{ borderColor: backgroundColor }}>
      <div
        className={styles.header}
        style={{ backgroundColor: `${backgroundColor}20` }}
      >
        <span className={styles.typeLabel}>{typeLabel}</span>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={handleDelete}
          title="Delete this node"
          aria-label="Delete node"
        >
          ×
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.label}>{data.label}</div>
      </div>
      {nodeType !== NodeType.START && (
        <Handle
          type="target"
          position={Position.Top}
          className={styles.handle}
        />
      )}
      {nodeType !== NodeType.END && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={styles.handle}
        />
      )}
    </div>
  );
});

