import mongoose, { InferSchemaType } from "mongoose";
import { UserType } from "./User";
import { StoreType } from "./Store";

const FavoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true }
);

export type FavoriteType = Omit<InferSchemaType<typeof FavoriteSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  user: UserType | mongoose.Types.ObjectId | string;
  store: StoreType | mongoose.Types.ObjectId | string;
};

const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;
