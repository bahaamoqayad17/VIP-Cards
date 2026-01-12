import mongoose, { InferSchemaType } from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // Whether the place is active/available
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export type PlaceType = Omit<InferSchemaType<typeof placeSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const Place = mongoose.models.Place || mongoose.model("Place", placeSchema);

export default Place;
