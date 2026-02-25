import mongoose, { Schema } from 'mongoose';

const NodeExecutionResultSchema = new Schema(
  {
    nodeId: { type: String, required: true },
    success: { type: Boolean, required: true },
    output: { type: Schema.Types.Mixed },
    error: { type: String },
    duration: { type: Number, required: true },
  },
  { _id: false }
);

const ExecutionSchema = new Schema(
  {
    workflowId: {
      type: String,
      required: true,
      ref: 'Workflow',
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      required: true,
    },
    results: { type: [NodeExecutionResultSchema], default: [] },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    error: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.executionId = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ExecutionModel = mongoose.model('Execution', ExecutionSchema);

