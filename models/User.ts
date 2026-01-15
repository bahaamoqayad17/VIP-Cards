import mongoose, { InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: false,
      unique: false,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    id_number: {
      type: String,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure virtual fields are serialized
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    delete (ret as any).password;
    return ret;
  },
});

export type UserType = Omit<InferSchemaType<typeof userSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  password?: string; // Optional because it gets deleted in toJSON
  mobile_number: string;
  id_number: string;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
