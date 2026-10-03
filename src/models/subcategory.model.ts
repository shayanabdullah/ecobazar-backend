import mongoose from "mongoose";
import { subCategoryModelType } from "../types/types.js";

const { Schema, model } = mongoose;

const subCategorySchema = new Schema<subCategoryModelType>({
  subCategoryName: {
    type: String,
    unique: true,
    required: true,
  },

  slug: {
    type: String,
    unique: true,
    required: true,
  },

  category: {
    type: Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  imagePublicId: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "inactive", "reject"],
    default: "inactive",
  },
});

const subCategoryModel = model<subCategoryModelType>(
  "SubCategory",
  subCategorySchema,
);

export default subCategoryModel;