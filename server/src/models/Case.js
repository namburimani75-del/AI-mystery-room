import mongoose from 'mongoose';

// Suspect sub-schema
const suspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  description: { type: String, required: true },
  publicMotive: { type: String, required: true },
  privateMotive: { type: String, required: true }, // hidden from public API
  alibi: { type: String, required: true },
  background: { type: String, required: true },
}, { _id: false });

// Clue sub-schema
const clueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }, // hidden until discovered
  category: { type: String, default: 'evidence' },
  isDiscovered: { type: Boolean, default: false },
}, { _id: false });

// Hint sub-schema
const hintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
}, { _id: false });

// Solution sub-schema
const solutionSchema = new mongoose.Schema({
  culpritId: { type: String, required: true },
  motive: { type: String, required: true },
  explanation: { type: String, required: true },
  supportingClueIds: [{ type: String }],
}, { _id: false });

// Accusation sub-schema
const accusationSchema = new mongoose.Schema({
  suspectId: { type: String, required: true },
  suspectName: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  madeAt: { type: Date, default: Date.now },
}, { _id: false });

// Main Case schema
const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  story: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  suspects: [suspectSchema],
  clues: [clueSchema],
  hints: [hintSchema],
  solution: { type: solutionSchema, required: true },
  discoveredClueIds: [{ type: String }],
  usedHintIds: [{ type: String }],
  accusation: { type: accusationSchema, default: null },
  currentScore: { type: Number, default: 0 },
  finalScore: { type: Number, default: null },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  playerId: { type: String, required: true, index: true },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// Index for efficient queries
caseSchema.index({ playerId: 1, createdAt: -1 });
caseSchema.index({ status: 1 });

const Case = mongoose.model('Case', caseSchema);

export default Case;
