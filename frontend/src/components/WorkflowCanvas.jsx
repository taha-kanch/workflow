'use client';

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeType } from '../../../shared/types/workflow.js';
import { v4 as uuidv4 } from 'uuid';
import CustomNode from './CustomNode';
import NodeToolbar from './NodeToolbar';
import styles from './WorkflowCanvas.module.css';

const nodeTypes = {
  custom: CustomNode,
};

export default function WorkflowCanvas({ workflow, onWorkflowChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.edges || []
  );
  const isUpdatingRef = useRef(false);

  // Sync with workflow prop - only when workflow ID changes
  useEffect(() => {
    if (workflow && !isUpdatingRef.current) {
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
    }
  }, [workflow?.id]);

  const updateWorkflow = useCallback((updatedNodes, updatedEdges) => {
    if (workflow && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      onWorkflowChange({
        ...workflow,
        nodes: updatedNodes || nodes,
        edges: updatedEdges || edges,
      });
      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [workflow, nodes, edges, onWorkflowChange]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
      };
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        updateWorkflow(null, updated);
        return updated;
      });
    },
    [setEdges, updateWorkflow]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      setNodes((nds) => {
        const updated = nds.filter((node) => !deleted.find((d) => d.id === node.id));
        updateWorkflow(updated, null);
        return updated;
      });
    },
    [setNodes, updateWorkflow]
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      setEdges((eds) => {
        const updated = eds.filter((edge) => !deleted.find((d) => d.id === edge.id));
        updateWorkflow(null, updated);
        return updated;
      });
    },
    [setEdges, updateWorkflow]
  );

  const handleAddNode = useCallback(
    (type, label) => {
      if (!workflow) return;

      const newNode = {
        id: uuidv4(),
        type: 'custom',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label,
          type,
        },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        updateWorkflow(updated, null);
        return updated;
      });
    },
    [workflow, setNodes, updateWorkflow]
  );

  if (!workflow) {
    return (
      <div className={styles.emptyState}>
        <p>No workflow selected. Create a new workflow or load an existing one.</p>
      </div>
    );
  }

  return (
    <div className={styles.canvas}>
      <div className={styles.toolbarContainer}>
        <NodeToolbar onAddNode={handleAddNode} />
        <span className={styles.hint}>Click × on a node to delete it, or select and press Delete</span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        fitView
        className={styles.reactFlow}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

