import mongoose, { InferSchemaType } from "mongoose";
import { UserType } from "./User";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startDate: { type: Date },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export type SubscriptionType = Omit<
  InferSchemaType<typeof subscriptionSchema>,
  ""
> & {
  _id: mongoose.Types.ObjectId | string;
  user: UserType | mongoose.Types.ObjectId | string;
  startDate: Date;
  expiresAt: Date;
  status: string;
};

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
