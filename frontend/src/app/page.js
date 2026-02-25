'use client';

import { useState, useCallback, useEffect } from 'react';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import ChatPanel from '@/components/ChatPanel';
import WorkflowSidebar from '@/components/WorkflowSidebar';
import { workflowApi } from '@/lib/api';
import styles from './page.module.css';

export default function Home() {
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      alert(`Failed to save workflow: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadWorkflow = async (workflowId) => {
    setIsLoading(true);
    try {
      const workflow = await workflowApi.getById(workflowId);
      setCurrentWorkflow(workflow);
    } catch (error) {
      alert(`Failed to load workflow: ${error.message}`);
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
      alert(`Failed to delete workflow: ${error.message}`);
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
    </div>
  );
}

