import { Router } from 'express';
import { WorkflowService } from '../services/workflowService.js';

const router = Router();

/**
 * GET /api/workflows
 * Get all workflows
 */
router.get('/', async (req, res) => {
  try {
    const workflows = await WorkflowService.getAllWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflows/:id
 * Get a single workflow by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflows
 * Create a new workflow
 */
router.post('/', async (req, res) => {
  try {
    const workflowData = req.body;

    // Validate workflow before saving
    const validation = WorkflowService.validateWorkflow({
      ...workflowData,
      id: 'temp',
    });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Workflow validation failed',
        details: validation.errors,
      });
    }

    const workflow = await WorkflowService.createWorkflow(workflowData);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflows/:id
 * Update an existing workflow
 */
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;

    // If nodes/edges are being updated, validate the workflow
    if (updates.nodes || updates.edges) {
      const existing = await WorkflowService.getWorkflowById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      const updatedWorkflow = { ...existing, ...updates };
      const validation = WorkflowService.validateWorkflow(updatedWorkflow);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Workflow validation failed',
          details: validation.errors,
        });
      }
    }

    const workflow = await WorkflowService.updateWorkflow(
      req.params.id,
      updates
    );
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/workflows/:id
 * Delete a workflow
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await WorkflowService.deleteWorkflow(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflows/:id/validate
 * Validate a workflow
 */
router.post('/:id/validate', async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const validation = WorkflowService.validateWorkflow(workflow);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

