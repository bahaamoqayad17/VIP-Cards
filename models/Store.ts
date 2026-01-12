import mongoose, { InferSchemaType } from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String },
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    discount: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type StoreType = Omit<InferSchemaType<typeof storeSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  place: mongoose.Types.ObjectId | string;
  category: mongoose.Types.ObjectId | string;
  discount: number;
  isActive: boolean;
};

const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);

export default Store;
