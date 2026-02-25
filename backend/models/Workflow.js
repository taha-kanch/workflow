import mongoose, { Schema } from 'mongoose';

const WorkflowNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: {
      label: { type: String, required: true },
      type: { type: String, required: true },
      config: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { _id: false }
);

const WorkflowEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String },
    targetHandle: { type: String },
  },
  { _id: false }
);

const WorkflowSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    nodes: { type: [WorkflowNodeSchema], required: true, default: [] },
    edges: { type: [WorkflowEdgeSchema], required: true, default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const WorkflowModel = mongoose.model('Workflow', WorkflowSchema);

