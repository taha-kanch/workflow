import { ExecutionModel } from '../models/Execution.js';
import { WorkflowService } from './workflowService.js';
import { NodeType } from '../../shared/types/workflow.js';
import { Types } from 'mongoose';

export class ExecutionService {
  /**
   * Execute a workflow
   */
  static async executeWorkflow(request) {
    // Get workflow
    const workflow = await WorkflowService.getWorkflowById(request.workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${request.workflowId} not found`);
    }

    // Validate workflow before execution
    const validation = WorkflowService.validateWorkflow(workflow);
    if (!validation.isValid) {
      throw new Error(
        `Workflow validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // Create execution record
    const execution = new ExecutionModel({
      workflowId: request.workflowId,
      status: 'running',
      startTime: new Date(),
      results: [],
    });
    await execution.save();

    try {
      // Find start node
      const startNode = workflow.nodes.find(
        (node) => node.data.type === NodeType.START
      );
      if (!startNode) {
        throw new Error('Start node not found');
      }

      // Build execution graph
      const executionOrder = this.getExecutionOrder(
        startNode.id,
        workflow.nodes,
        workflow.edges
      );

      const results = [];

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        const startTime = Date.now();
        try {
          const output = await this.executeNode(node, request.input || {});
          const duration = Date.now() - startTime;

          results.push({
            nodeId: node.id,
            success: true,
            output,
            duration,
          });
        } catch (error) {
          const duration = Date.now() - startTime;
          results.push({
            nodeId: node.id,
            success: false,
            error: error.message || 'Unknown error',
            duration,
          });

          // Stop execution on error
          await ExecutionModel.findByIdAndUpdate(execution._id, {
            status: 'failed',
            endTime: new Date(),
            results,
            error: `Execution failed at node ${node.id}: ${error.message}`,
          });

          return {
            executionId: execution._id.toString(),
            workflowId: request.workflowId,
            status: 'failed',
            results,
            startTime: execution.startTime,
            endTime: new Date(),
            error: `Execution failed at node ${node.id}: ${error.message}`,
          };
        }
      }

      // Update execution as completed
      await ExecutionModel.findByIdAndUpdate(execution._id, {
        status: 'completed',
        endTime: new Date(),
        results,
      });

      return {
        executionId: execution._id.toString(),
        workflowId: request.workflowId,
        status: 'completed',
        results,
        startTime: execution.startTime,
        endTime: new Date(),
      };
    } catch (error) {
      await ExecutionModel.findByIdAndUpdate(execution._id, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Get execution order using topological sort (BFS)
   */
  static getExecutionOrder(startNodeId, nodes, edges) {
    const order = [];
    const visited = new Set();
    const queue = [startNodeId];

    // Build adjacency list
    const graph = new Map();
    for (const edge of edges) {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
    }

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;

      visited.add(current);
      order.push(current);

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return order;
  }

  /**
   * Execute a single node
   */
  static async executeNode(node, input) {
    switch (node.data.type) {
      case NodeType.START:
        return { message: 'Workflow started', input };

      case NodeType.END:
        return { message: 'Workflow completed' };

      case NodeType.PROCESS:
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          message: `Processed: ${node.data.label}`,
          result: `Processed data for ${node.data.label}`,
        };

      case NodeType.CONDITION:
        // Simple condition evaluation
        const condition = node.data.config?.condition || 'true';
        const result = this.evaluateCondition(condition, input);
        return {
          condition,
          result,
          message: `Condition evaluated to: ${result}`,
        };

      case NodeType.EXTERNAL_CALL:
        // Simulate external API call
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
          message: `External call completed: ${node.data.label}`,
          response: { status: 'success', data: 'Mock external response' },
        };

      default:
        return { message: `Unknown node type: ${node.data.type}` };
    }
  }

  /**
   * Simple condition evaluator (for demo purposes)
   */
  static evaluateCondition(condition, input) {
    try {
      // Simple evaluation - in production, use a proper expression evaluator
      if (condition === 'true') return true;
      if (condition === 'false') return false;
      // Could implement more sophisticated evaluation here
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get execution by ID
   */
  static async getExecutionById(executionId) {
    if (!Types.ObjectId.isValid(executionId)) {
      return null;
    }
    return await ExecutionModel.findById(executionId);
  }

  /**
   * Get all executions for a workflow
   */
  static async getWorkflowExecutions(workflowId) {
    return await ExecutionModel.find({ workflowId }).sort({ createdAt: -1 });
  }
}

