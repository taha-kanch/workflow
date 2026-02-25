'use client';

import { useState, useRef, useEffect } from 'react';
import { chatApi } from '@/lib/api';
import styles from './ChatPanel.module.css';

export default function ChatPanel({ workflow, onWorkflowChange }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I can help you create and modify workflows. Try saying "create a workflow called MyWorkflow" or "add a process node".',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(
        input,
        workflow?.id,
        workflow || undefined
      );

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'assistant',
        timestamp: new Date(),
        workflowChanges: response.workflowChanges,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Apply workflow changes if any
      if (response.workflowChanges && workflow) {
        const updatedWorkflow = {
          ...workflow,
          nodes: response.workflowChanges.nodes || workflow.nodes,
          edges: response.workflowChanges.edges || workflow.edges,
        };
        onWorkflowChange(updatedWorkflow);
      } else if (response.workflowChanges && !workflow) {
        // Create new workflow from chat
        const newWorkflow = {
          name: 'New Workflow',
          nodes: response.workflowChanges.nodes || [],
          edges: response.workflowChanges.edges || [],
        };
        onWorkflowChange(newWorkflow);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Failed to process message'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Chat Assistant</h2>
      </div>
      <div className={styles.messages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.sender === 'user' ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{message.text}</div>
              {message.workflowChanges && (
                <div className={styles.changesIndicator}>
                  ✓ Workflow updated
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              <div className={styles.typing}>Thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a command... (e.g., 'add a process node')"
          className={styles.input}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
}

