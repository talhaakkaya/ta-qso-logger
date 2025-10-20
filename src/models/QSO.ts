import mongoose from "mongoose";

export interface IQSO extends mongoose.Document {
  userId: string;
  datetime: Date;
  callsign: string;
  name: string;
  freq: number;
  mode: string;
  txPower: number;
  rstSent: string;
  rstReceived: string;
  qth: string;
  notes: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QSOSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    datetime: {
      type: Date,
      required: true,
    },
    callsign: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    freq: {
      type: Number,
      default: 0,
    },
    mode: {
      type: String,
      default: "",
    },
    txPower: {
      type: Number,
      default: 0,
    },
    rstSent: {
      type: String,
      default: "",
    },
    rstReceived: {
      type: String,
      default: "",
    },
    qth: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient user-specific queries
QSOSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.QSO || mongoose.model<IQSO>("QSO", QSOSchema);
