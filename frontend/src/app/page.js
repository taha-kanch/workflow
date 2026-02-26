'use client';

import { useState, useCallback, useEffect } from 'react';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import ChatPanel from '@/components/ChatPanel';
import WorkflowSidebar from '@/components/WorkflowSidebar';
import ExecutionResults from '@/components/ExecutionResults';
import { workflowApi, executionApi } from '@/lib/api';
import styles from './page.module.css';

export default function Home() {
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastExecution, setLastExecution] = useState(null);

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowApi.getAll();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const handleWorkflowChange = useCallback((workflow) => {
    setCurrentWorkflow(workflow);
  }, []);

  const getSaveErrorMessage = (error) => {
    const data = error.response?.data;
    if (!data) return error.message || 'Something went wrong.';

    const mainMessage = data.error || 'Validation failed';
    const details = data.details;

    if (Array.isArray(details) && details.length > 0) {
      const bulletPoints = details
        .map((d) => (d.message ? `• ${d.message}` : `• ${d.field}`))
        .join('\n');
      return `${mainMessage}\n\n${bulletPoints}`;
    }

    return mainMessage;
  };

  const handleSaveWorkflow = async () => {
    if (!currentWorkflow) return;

    setIsLoading(true);
    try {
      if (currentWorkflow.id) {
        await workflowApi.update(currentWorkflow.id, currentWorkflow);
      } else {
        const saved = await workflowApi.create(currentWorkflow);
        setCurrentWorkflow(saved);
      }
      await loadWorkflows();
      alert('Workflow saved successfully!');
    } catch (error) {
      const message = getSaveErrorMessage(error);
      alert(`Failed to save workflow:\n\n${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getApiErrorMessage = (error, fallback = 'Something went wrong.') => {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
      return data.details.map((d) => d.message || d.field).join(' ');
    }
    return error.message || fallback;
  };

  const handleLoadWorkflow = async (workflowId) => {
    setIsLoading(true);
    try {
      const workflow = await workflowApi.getById(workflowId);
      setCurrentWorkflow(workflow);
    } catch (error) {
      alert(`Failed to load workflow: ${getApiErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    setIsLoading(true);
    try {
      await workflowApi.delete(workflowId);
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null);
      }
      await loadWorkflows();
    } catch (error) {
      alert(`Failed to delete workflow: ${getApiErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewWorkflow = () => {
    setCurrentWorkflow({
      name: 'New Workflow',
      nodes: [],
      edges: [],
    });
  };

  const handleRunWorkflow = async () => {
    if (!currentWorkflow?.id) {
      alert('Save the workflow first, then you can run it.');
      return;
    }
    setIsRunning(true);
    setLastExecution(null);
    try {
      const result = await executionApi.execute({
        workflowId: currentWorkflow.id,
        input: {},
      });
      setLastExecution(result);
    } catch (err) {
      alert(`Execution failed: ${getApiErrorMessage(err, 'Could not run workflow.')}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Workflow Builder</h1>
        <div className={styles.headerActions}>
          <button onClick={handleNewWorkflow} className={styles.button}>
            New Workflow
          </button>
          <button
            onClick={handleSaveWorkflow}
            disabled={!currentWorkflow || isLoading}
            className={styles.button}
          >
            {isLoading ? 'Saving...' : 'Save Workflow'}
          </button>
          <button
            onClick={handleRunWorkflow}
            disabled={!currentWorkflow?.id || isRunning}
            className={styles.buttonRun}
            title="Run workflow (workflow must be saved first)"
          >
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        <WorkflowSidebar
          workflows={workflows}
          currentWorkflow={currentWorkflow}
          onLoadWorkflow={handleLoadWorkflow}
          onDeleteWorkflow={handleDeleteWorkflow}
        />

        <div className={styles.canvasContainer}>
          <WorkflowCanvas
            workflow={currentWorkflow}
            onWorkflowChange={handleWorkflowChange}
          />
        </div>

        <ChatPanel
          workflow={currentWorkflow}
          onWorkflowChange={handleWorkflowChange}
        />
      </div>
      {lastExecution && (
        <ExecutionResults
          execution={lastExecution}
          onClose={() => setLastExecution(null)}
        />
      )}
    </div>
  );
}

