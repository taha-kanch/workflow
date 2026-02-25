# Workflow Builder - Full Stack Application

A comprehensive workflow builder application that allows users to design, validate, manage, and execute workflows using both a visual interface and conversational commands.

## 🎯 Overview

This application provides a complete solution for workflow management with the following key features:

- **Visual Workflow Builder**: Create workflows using a node-based canvas with React Flow
- **Workflow State Management**: Full CRUD operations for workflows
- **Conversational Control**: Chat interface for creating and modifying workflows via text commands
- **Workflow Validation**: Comprehensive validation before saving and execution
- **Workflow Execution**: Execute workflows and track execution results

## 🏗️ Architecture

This project has a simple structure:

```
workflow/
├── backend/          # Express.js API server with MongoDB
├── frontend/         # Next.js application with React Flow
├── shared/           # Shared JavaScript modules (types and validation)
├── package.json      # Root scripts
└── README.md
```

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, React Flow 11
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Language**: JavaScript (ES Modules)

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (running locally or connection string)

## 🚀 Setup Instructions

### 1. Install Dependencies

From the root directory:

```bash
npm run install:all
```

This will install dependencies for root, backend, and frontend.

### 2. Configure Environment Variables

#### Backend Configuration

Create `backend/.env`:

```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/workflow-builder
NODE_ENV=development
```

#### Frontend Configuration

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Start MongoDB

Make sure MongoDB is running. If using a local installation:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start Development Servers

From the root directory, start both frontend and backend:

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📖 Usage Guide

### Visual Workflow Builder

1. **Create a New Workflow**: Click "New Workflow" button
2. **Add Nodes**: Click "+ Add Node" button and select a node type:
   - **Start**: Entry point of the workflow
   - **Process**: Processing step
   - **Condition**: Conditional logic node
   - **External Call**: External API/service call
   - **End**: Exit point of the workflow
3. **Connect Nodes**: Drag from the bottom handle of a node to the top handle of another node
4. **Delete Nodes/Edges**: Select and press Delete key, or use the delete button
5. **Save Workflow**: Click "Save Workflow" button

### Conversational Control

Use the chat panel on the right to interact with the workflow:

**Example Commands:**
- `create a workflow called "My Workflow"`
- `add a process node`
- `add a condition node`
- `connect node1 to node2`
- `delete node node1`

The chat interface will parse your commands and apply changes to the workflow in real-time.

### Workflow Validation

Workflows are automatically validated before saving. The system enforces:

- Exactly one Start node
- At least one End node
- All nodes must be reachable from the Start node
- No cycles in the workflow
- Valid node connections

### Workflow Execution

Workflows can be executed via the API. The execution engine:

- Processes nodes in topological order
- Tracks execution results for each node
- Handles errors gracefully
- Returns detailed execution status

## 🔌 API Endpoints

### Workflows

- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/validate` - Validate workflow

### Executions

- `POST /api/executions` - Execute a workflow
- `GET /api/executions/:id` - Get execution by ID
- `GET /api/executions/workflow/:workflowId` - Get executions for a workflow

### Chat

- `POST /api/chat` - Send chat message and get workflow modifications

## 🏛️ Design Decisions

### Project Structure

- **Simple Structure**: Frontend and backend in root folders for easy navigation
- **Shared Code**: Common validation and types in shared folder
- **ES Modules**: Modern JavaScript with ES6 import/export syntax

### Frontend Architecture

- **Next.js App Router**: Modern React framework
- **React Flow**: Industry-standard library for node-based UIs
- **Client Components**: Used where interactivity is required (canvas, chat)
- **CSS Modules**: Scoped styling for components

### Backend Architecture

- **RESTful API**: Standard HTTP methods for CRUD operations
- **Service Layer**: Business logic separated from routes
- **MongoDB Models**: Mongoose schemas
- **Error Handling**: Comprehensive error handling with meaningful messages

### Validation Strategy

- **Client-side Validation**: Immediate feedback in the UI
- **Server-side Validation**: Ensures data integrity before persistence
- **Execution Validation**: Validates workflow structure before execution
- **Clear Error Messages**: Actionable error messages for users

### Workflow Execution

- **Topological Sort**: Ensures nodes are executed in correct order
- **Node Execution**: Each node type has specific execution logic
- **Error Handling**: Execution stops on error with detailed reporting
- **Execution Tracking**: Full audit trail of execution results

## 📁 Project Structure

```
workflow/
├── backend/
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── Workflow.js        # Workflow model
│   │   └── Execution.js       # Execution model
│   ├── services/
│   │   ├── workflowService.js # Workflow business logic
│   │   └── executionService.js # Execution engine
│   ├── routes/
│   │   ├── workflows.js       # Workflow routes
│   │   ├── executions.js      # Execution routes
│   │   └── chat.js            # Chat routes
│   ├── index.js               # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js      # Root layout
│   │   │   ├── page.js        # Main page
│   │   │   └── globals.css    # Global styles
│   │   ├── components/
│   │   │   ├── WorkflowCanvas.jsx  # React Flow canvas
│   │   │   ├── CustomNode.jsx      # Custom node component
│   │   │   ├── ChatPanel.jsx       # Chat interface
│   │   │   ├── WorkflowSidebar.jsx # Workflow list
│   │   │   └── NodeToolbar.jsx     # Node creation toolbar
│   │   └── lib/
│   │       └── api.js         # API client
│   ├── next.config.js
│   └── package.json
├── shared/
│   ├── types/
│   │   └── workflow.js        # Node types and constants
│   └── validation/
│       └── workflowValidator.js  # Validation logic
└── package.json
```

## 🔒 Error Handling

The application implements comprehensive error handling:

- **API Errors**: Proper HTTP status codes and error messages
- **Validation Errors**: Clear, actionable validation messages
- **Execution Errors**: Detailed error reporting with node-level errors
- **Network Errors**: User-friendly error messages in the UI

## 🚧 Future Enhancements

Potential improvements for production:

- [ ] User authentication and authorization
- [ ] Workflow versioning
- [ ] Advanced node configuration UI
- [ ] Workflow templates
- [ ] Real-time collaboration
- [ ] Workflow scheduling
- [ ] Advanced execution monitoring
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization

## 📝 License

This project is created for assessment purposes.

## 👨‍💻 Developer Notes

This application demonstrates:

- **Production-ready code structure**: Clean, maintainable, and scalable
- **Error handling**: Comprehensive error handling at all layers
- **User experience**: Intuitive UI with real-time feedback
- **Architecture**: Well-structured with clear separation of concerns
- **Best practices**: Following industry standards for Next.js, Express, and MongoDB

---

Built with ❤️ for the Full Stack Developer Assessment
