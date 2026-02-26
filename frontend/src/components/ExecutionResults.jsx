'use client';

import styles from './ExecutionResults.module.css';

export default function ExecutionResults({ execution, onClose }) {
  if (!execution) return null;

  const { status, results = [], startTime, endTime, error: executionError } = execution;
  const statusClass = status === 'completed' ? styles.success : status === 'failed' ? styles.failed : styles.running;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Execution Result</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.body}>
          <div className={`${styles.statusBadge} ${statusClass}`}>
            {status.toUpperCase()}
          </div>
          {executionError && (
            <div className={styles.errorMessage}>{executionError}</div>
          )}
          <div className={styles.meta}>
            <span>Started: {new Date(startTime).toLocaleString()}</span>
            {endTime && (
              <span>Ended: {new Date(endTime).toLocaleString()}</span>
            )}
          </div>
          <div className={styles.resultsSection}>
            <h3>Node Results ({results.length})</h3>
            <ul className={styles.resultsList}>
              {results.map((r, i) => (
                <li key={r.nodeId || i} className={r.success ? styles.resultOk : styles.resultFail}>
                  <div className={styles.resultHeader}>
                    <strong>{r.nodeId}</strong>
                    <span className={r.success ? styles.badgeOk : styles.badgeFail}>
                      {r.success ? 'OK' : 'Failed'}
                    </span>
                    <span className={styles.duration}>{r.duration}ms</span>
                  </div>
                  {r.error && <div className={styles.resultError}>{r.error}</div>}
                  {r.output && (
                    <pre className={styles.resultOutput}>
                      {JSON.stringify(r.output, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
