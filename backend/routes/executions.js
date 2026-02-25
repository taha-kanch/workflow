import { Router } from 'express';
import { ExecutionService } from '../services/executionService.js';

const router = Router();

/**
 * POST /api/executions
 * Execute a workflow
 */
router.post('/', async (req, res) => {
  try {
    const request = req.body;
    const result = await ExecutionService.executeWorkflow(request);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/executions/:id
 * Get execution by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const execution = await ExecutionService.getExecutionById(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/executions/workflow/:workflowId
 * Get all executions for a workflow
 */
router.get('/workflow/:workflowId', async (req, res) => {
  try {
    const executions = await ExecutionService.getWorkflowExecutions(
      req.params.workflowId
    );
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

