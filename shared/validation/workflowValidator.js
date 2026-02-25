import { NodeType } from '../types/workflow.js';

/**
 * Validates workflow structure and business rules
 */
export class WorkflowValidator {
  static validate(workflow) {
    const errors = [];

    // Check for nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push({
        field: 'nodes',
        message: 'Workflow must contain at least one node',
      });
      return { isValid: false, errors };
    }

    // Check for exactly one Start node
    const startNodes = workflow.nodes.filter(
      (node) => node.data.type === NodeType.START
    );
    if (startNodes.length === 0) {
      errors.push({
        field: 'nodes',
        message: 'Workflow must contain exactly one Start node',
      });
    } else if (startNodes.length > 1) {
      errors.push({
        field: 'nodes',
        message: `Workflow contains ${startNodes.length} Start nodes. Only one Start node is allowed.`,
      });
    }

    // Check for at least one End node
    const endNodes = workflow.nodes.filter(
      (node) => node.data.type === NodeType.END
    );
    if (endNodes.length === 0) {
      errors.push({
        field: 'nodes',
        message: 'Workflow must contain at least one End node',
      });
    }

    // Validate node IDs are unique
    const nodeIds = workflow.nodes.map((node) => node.id);
    const uniqueNodeIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueNodeIds.size) {
      errors.push({
        field: 'nodes',
        message: 'All node IDs must be unique',
      });
    }

    // Validate edges
    if (workflow.edges && workflow.edges.length > 0) {
      const nodeIdSet = new Set(nodeIds);

      for (const edge of workflow.edges) {
        // Check source node exists
        if (!nodeIdSet.has(edge.source)) {
          errors.push({
            field: 'edges',
            message: `Edge references non-existent source node: ${edge.source}`,
          });
        }

        // Check target node exists
        if (!nodeIdSet.has(edge.target)) {
          errors.push({
            field: 'edges',
            message: `Edge references non-existent target node: ${edge.target}`,
          });
        }

        // Check no self-loops
        if (edge.source === edge.target) {
          errors.push({
            field: 'edges',
            message: `Node ${edge.source} cannot connect to itself`,
          });
        }
      }

      // Check for cycles
      if (this.hasCycle(workflow.nodes, workflow.edges)) {
        errors.push({
          field: 'edges',
          message: 'Workflow contains cycles. Only acyclic workflows are supported.',
        });
      }

      // Check all nodes are reachable from Start node
      if (startNodes.length === 1) {
        const reachableNodes = this.getReachableNodes(
          startNodes[0].id,
          workflow.edges
        );
        const allNodeIds = new Set(workflow.nodes.map((n) => n.id));
        const unreachableNodes = Array.from(allNodeIds).filter(
          (id) => !reachableNodes.has(id)
        );
        if (unreachableNodes.length > 0) {
          errors.push({
            field: 'nodes',
            message: `Unreachable nodes found: ${unreachableNodes.join(', ')}`,
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Simple cycle detection using DFS
   */
  static hasCycle(nodes, edges) {
    const graph = new Map();
    const visited = new Set();
    const recursionStack = new Set();

    // Build adjacency list
    for (const node of nodes) {
      graph.set(node.id, []);
    }
    for (const edge of edges) {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
    }

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  /**
   * Get all nodes reachable from a given start node
   */
  static getReachableNodes(startNodeId, edges) {
    const reachable = new Set();
    const queue = [startNodeId];
    reachable.add(startNodeId);

    const graph = new Map();
    for (const edge of edges) {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
    }

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        if (!reachable.has(neighbor)) {
          reachable.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return reachable;
  }
}

