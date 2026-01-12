import mongoose, { InferSchemaType } from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    usedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Store the date (YYYY-MM-DD) for easy daily querying
    usageDate: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

usageSchema.index({ user: 1, store: 1, usageDate: 1 }, { unique: true });

export type UsageType = Omit<InferSchemaType<typeof usageSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  user: mongoose.Types.ObjectId | string;
  subscription: mongoose.Types.ObjectId | string;
  store: mongoose.Types.ObjectId | string;
  usedAt: Date;
  usageDate: string;
  letter: string;
  createdAt: Date;
  updatedAt: Date;
};

const Usage = mongoose.models.Usage || mongoose.model("Usage", usageSchema);

export default Usage;
