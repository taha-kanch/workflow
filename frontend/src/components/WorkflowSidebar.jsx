'use client';

import styles from './WorkflowSidebar.module.css';

export default function WorkflowSidebar({
  workflows,
  currentWorkflow,
  onLoadWorkflow,
  onDeleteWorkflow,
}) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>Workflows</h2>
        <span className={styles.count}>{workflows.length}</span>
      </div>
      <div className={styles.list}>
        {workflows.length === 0 ? (
          <div className={styles.empty}>No workflows yet</div>
        ) : (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`${styles.item} ${
                currentWorkflow?.id === workflow.id ? styles.active : ''
              }`}
            >
              <div
                className={styles.itemContent}
                onClick={() => workflow.id && onLoadWorkflow(workflow.id)}
              >
                <div className={styles.itemName}>{workflow.name}</div>
                <div className={styles.itemMeta}>
                  {workflow.nodes.length} nodes, {workflow.edges.length} edges
                </div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  if (workflow.id) {
                    onDeleteWorkflow(workflow.id);
                  }
                }}
                title="Delete workflow"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

