'use client';

import { useState } from 'react';
import { NodeType } from '../../../shared/types/workflow.js';
import styles from './NodeToolbar.module.css';

export default function NodeToolbar({ onAddNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const nodeTypes = [
    { type: NodeType.START, label: 'Start', icon: '▶' },
    { type: NodeType.PROCESS, label: 'Process', icon: '⚙' },
    { type: NodeType.CONDITION, label: 'Condition', icon: '❓' },
    { type: NodeType.EXTERNAL_CALL, label: 'External', icon: '🌐' },
    { type: NodeType.END, label: 'End', icon: '■' },
  ];

  const handleAddNode = (type, label) => {
    onAddNode(type, label);
    setIsOpen(false);
  };

  return (
    <div className={styles.toolbar}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Add Node"
      >
        + Add Node
      </button>
      {isOpen && (
        <div className={styles.menu}>
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              className={styles.menuItem}
              onClick={() => handleAddNode(nodeType.type, nodeType.label)}
            >
              <span className={styles.icon}>{nodeType.icon}</span>
              <span>{nodeType.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

