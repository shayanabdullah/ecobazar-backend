import mongoose from "mongoose";
const { Schema, model } = mongoose;
const subCategorySchema = new Schema({
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
const subCategoryModel = model("SubCategory", subCategorySchema);
export default subCategoryModel;
//# sourceMappingURL=subcategory.model.js.map