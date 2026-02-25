# Quick Start Guide

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory (`/home/taha/projects/workflow`):

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install:all
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

**Option A: If MongoDB is installed locally**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

**Option B: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: If MongoDB is already running**
- Just verify it's accessible at `mongodb://localhost:27017`

### 3. Environment Variables

The `.env` files have been created:
- `backend/.env` - Backend configuration
- `frontend/.env.local` - Frontend configuration

You can modify them if needed (e.g., if MongoDB is on a different port).

### 4. Start the Application

**Option A: Run both servers together (Recommended)**
```bash
# From the root directory
npm run dev
```

This will start both backend (port 3001) and frontend (port 3000) simultaneously.

**Option B: Run servers separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Once both servers are running:
- **Frontend**: Open http://localhost:3000 in your browser
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Troubleshooting

### MongoDB Connection Error
If you see "MongoDB connection error":
- Make sure MongoDB is running
- Check the `MONGODB_URI` in `backend/.env`
- Try connecting manually: `mongosh mongodb://localhost:27017`

### Port Already in Use
If port 3000 or 3001 is already in use:
- Change the port in `backend/.env` (for backend)
- Change the port in `frontend/package.json` scripts (for frontend)
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if backend port changes

### Module Not Found Errors
If you see import errors:
- Make sure you've run `npm install` in both `backend/` and `frontend/` directories
- Delete `node_modules` and `package-lock.json`, then reinstall:
  ```bash
  cd backend && rm -rf node_modules package-lock.json && npm install
  cd ../frontend && rm -rf node_modules package-lock.json && npm install
  ```

## First Time Usage

1. Open http://localhost:3000
2. Click "New Workflow" to create a workflow
3. Click "+ Add Node" to add nodes to your workflow
4. Connect nodes by dragging from one node's bottom handle to another's top handle
5. Click "Save Workflow" to persist your workflow
6. Try the chat panel: Type "add a process node" to see conversational control

## Development Commands

- `npm run dev` - Start both servers (from root)
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend


