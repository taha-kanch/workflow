import { Router } from 'express';
import { NodeType } from '../../shared/types/workflow.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/chat
 * Process chat commands and return workflow modifications
 */
router.post('/', async (req, res) => {
  try {
    const { message, workflowId, currentWorkflow } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const command = parseChatCommand(message);
    const response = await processChatCommand(
      command,
      workflowId,
      currentWorkflow
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Parse natural language into structured command
 */
function parseChatCommand(message) {
  const lowerMessage = message.toLowerCase().trim();

  // Create workflow
  if (
    lowerMessage.includes('create') ||
    lowerMessage.includes('new') ||
    lowerMessage.includes('make')
  ) {
    const nameMatch = message.match(/workflow\s+(?:called|named)?\s*["']?([^"']+)["']?/i);
    const name = nameMatch ? nameMatch[1] : 'New Workflow';
    return {
      type: 'create',
      action: 'create_workflow',
      parameters: { name },
    };
  }

  // Add node
  if (lowerMessage.includes('add') || lowerMessage.includes('insert')) {
    const nodeTypeMatch = message.match(/(start|end|process|condition|external)/i);
    const nodeType = nodeTypeMatch
      ? nodeTypeMatch[1].toLowerCase()
      : 'process';
    const labelMatch = message.match(/(?:node|step)\s+["']?([^"']+)["']?/i);
    const label = labelMatch ? labelMatch[1] : `${nodeType} node`;

    return {
      type: 'modify',
      action: 'add_node',
      parameters: { type: nodeType, label },
    };
  }

  // Delete node
  if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
    const nodeIdMatch = message.match(/node\s+(\w+)/i);
    return {
      type: 'modify',
      action: 'delete_node',
      parameters: { nodeId: nodeIdMatch ? nodeIdMatch[1] : null },
    };
  }

  // Connect nodes
  if (
    lowerMessage.includes('connect') ||
    lowerMessage.includes('link') ||
    lowerMessage.includes('join')
  ) {
    const connectMatch = message.match(/(\w+)\s+to\s+(\w+)/i);
    if (connectMatch) {
      return {
        type: 'modify',
        action: 'connect_nodes',
        parameters: {
          source: connectMatch[1],
          target: connectMatch[2],
        },
      };
    }
  }

  // Default: query
  return {
    type: 'query',
    action: 'query',
    parameters: {},
  };
}

/**
 * Process chat command and return response with workflow changes
 */
async function processChatCommand(command, workflowId, currentWorkflow) {
  switch (command.action) {
    case 'create_workflow': {
      const name = command.parameters?.name || 'New Workflow';
      const startNode = {
        id: uuidv4(),
        type: 'default',
        position: { x: 250, y: 100 },
        data: {
          label: 'Start',
          type: NodeType.START,
        },
      };

      return {
        message: `Created new workflow: ${name}`,
        workflowChanges: {
          nodes: [startNode],
          edges: [],
        },
      };
    }

    case 'add_node': {
      if (!currentWorkflow) {
        return {
          message: 'Please create or load a workflow first',
          error: 'No workflow context',
        };
      }

      const nodeType = command.parameters?.type || 'process';
      const label = command.parameters?.label || `${nodeType} node`;

      const typeMap = {
        start: NodeType.START,
        end: NodeType.END,
        process: NodeType.PROCESS,
        condition: NodeType.CONDITION,
        external: NodeType.EXTERNAL_CALL,
      };

      const newNode = {
        id: uuidv4(),
        type: 'default',
        position: {
          x: 250 + Math.random() * 200,
          y: 200 + Math.random() * 200,
        },
        data: {
          label,
          type: typeMap[nodeType] || NodeType.PROCESS,
        },
      };

      return {
        message: `Added ${nodeType} node: ${label}`,
        workflowChanges: {
          nodes: [...currentWorkflow.nodes, newNode],
        },
      };
    }

    case 'delete_node': {
      if (!currentWorkflow) {
        return {
          message: 'Please create or load a workflow first',
          error: 'No workflow context',
        };
      }

      const nodeId = command.parameters?.nodeId;
      if (!nodeId) {
        return {
          message: 'Please specify which node to delete',
          error: 'Missing node ID',
        };
      }

      const updatedNodes = currentWorkflow.nodes.filter((n) => n.id !== nodeId);
      const updatedEdges = currentWorkflow.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );

      return {
        message: `Deleted node: ${nodeId}`,
        workflowChanges: {
          nodes: updatedNodes,
          edges: updatedEdges,
        },
      };
    }

    case 'connect_nodes': {
      if (!currentWorkflow) {
        return {
          message: 'Please create or load a workflow first',
          error: 'No workflow context',
        };
      }

      const source = command.parameters?.source;
      const target = command.parameters?.target;

      if (!source || !target) {
        return {
          message: 'Please specify source and target nodes',
          error: 'Missing connection parameters',
        };
      }

      const newEdge = {
        id: uuidv4(),
        source,
        target,
      };

      return {
        message: `Connected ${source} to ${target}`,
        workflowChanges: {
          edges: [...currentWorkflow.edges, newEdge],
        },
      };
    }

    default:
      return {
        message: 'I can help you create workflows, add nodes, connect them, and more. Try: "create a workflow called MyWorkflow" or "add a process node"',
      };
  }
}

export default router;

