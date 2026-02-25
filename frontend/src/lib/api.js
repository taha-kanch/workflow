import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workflowApi = {
  getAll: async () => {
    const response = await apiClient.get('/workflows');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/workflows/${id}`);
    return response.data;
  },

  create: async (workflow) => {
    const response = await apiClient.post('/workflows', workflow);
    return response.data;
  },

  update: async (id, workflow) => {
    const response = await apiClient.put(`/workflows/${id}`, workflow);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/workflows/${id}`);
  },

  validate: async (id) => {
    const response = await apiClient.post(`/workflows/${id}/validate`);
    return response.data;
  },
};

export const executionApi = {
  execute: async (request) => {
    const response = await apiClient.post('/executions', request);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/executions/${id}`);
    return response.data;
  },

  getByWorkflowId: async (workflowId) => {
    const response = await apiClient.get(`/executions/workflow/${workflowId}`);
    return response.data;
  },
};

export const chatApi = {
  sendMessage: async (message, workflowId, currentWorkflow) => {
    const response = await apiClient.post('/chat', {
      message,
      workflowId,
      currentWorkflow,
    });
    return response.data;
  },
};

