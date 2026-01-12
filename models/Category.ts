import mongoose, { InferSchemaType } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String },
    letter: { type: String },
  },
  { timestamps: true }
);

export type CategoryType = Omit<InferSchemaType<typeof categorySchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  letter: string;
};

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
