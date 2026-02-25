import { WorkflowModel } from '../models/Workflow.js';
import { WorkflowValidator } from '../../shared/validation/workflowValidator.js';
import { Types } from 'mongoose';

export class WorkflowService {
  /**
   * Create a new workflow
   */
  static async createWorkflow(workflowData) {
    const workflow = new WorkflowModel(workflowData);
    const saved = await workflow.save();
    return this.toWorkflow(saved);
  }

  /**
   * Get all workflows
   */
  static async getAllWorkflows() {
    const workflows = await WorkflowModel.find().sort({ updatedAt: -1 });
    return workflows.map(this.toWorkflow);
  }

  /**
   * Get a single workflow by ID
   */
  static async getWorkflowById(id) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const workflow = await WorkflowModel.findById(id);
    return workflow ? this.toWorkflow(workflow) : null;
  }

  /**
   * Update an existing workflow
   */
  static async updateWorkflow(id, updates) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const workflow = await WorkflowModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return workflow ? this.toWorkflow(workflow) : null;
  }

  /**
   * Delete a workflow
   */
  static async deleteWorkflow(id) {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await WorkflowModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Validate a workflow
   */
  static validateWorkflow(workflow) {
    return WorkflowValidator.validate(workflow);
  }

  /**
   * Convert MongoDB document to Workflow type
   */
  static toWorkflow(doc) {
    return {
      id: doc.id || doc._id.toString(),
      name: doc.name,
      description: doc.description,
      nodes: doc.nodes,
      edges: doc.edges,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

