import mongoose from 'mongoose';

/** Single-document store — mirrors legacy data.json structure for zero route changes */
const appStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'main' },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'app_state', minimize: false }
);

export default mongoose.models.AppState || mongoose.model('AppState', appStateSchema);
