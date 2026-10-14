import mongoose from "mongoose";
const { Schema, model } = mongoose;
const productSchema = new Schema({
    productName: {
        type: String,
        required: [true, "Product name is required"],
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true,
    },
    productCode: {
        type: String,
        required: [true, "Product code is required"],
        unique: true,
    },
    description: {
        type: String,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: [true, "Category is required"],
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
    },
    brand: {
        type: String,
    },
    manufacturer: {
        type: String,
    },
    countryOfOrigin: {
        type: String,
    },
    thumbnail: {
        url: {
            type: String,
            required: [true, "URL is required"],
        },
        publicId: {
            type: String,
            required: [true, "Public ID is required"],
        },
        altText: {
            type: String,
        },
    },
    images: [
        {
            url: {
                type: String,
                required: [true, "URL is required"],
            },
            publicId: {
                type: String,
                required: [true, "Public ID is required"],
            },
            altText: {
                type: String,
            },
            isMain: {
                type: Boolean,
                default: false,
            },
        },
        { _id: false },
    ],
    sku: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        min: 0,
    },
    compareAtPrice: {
        type: Number,
        min: 0,
    },
    stockQuantity: {
        type: Number,
        min: 0,
    },
    variants: {
        type: [
            {
                sku: {
                    type: String,
                    required: [true, "SKU is required"],
                    trim: true,
                },
                size: {
                    type: String,
                    required: [true, "Size is required"],
                },
                price: {
                    type: Number,
                    required: [true, "Price is required"],
                    min: 0,
                },
                compareAtPrice: {
                    type: Number,
                    min: 0,
                },
                stockQuantity: {
                    type: Number,
                    required: [true, "Stock quantity is required"],
                    min: 0,
                },
                isDefault: {
                    type: Boolean,
                    default: false,
                },
                isActive: {
                    type: Boolean,
                    default: true,
                },
            },
        ],
        default: [],
    },
    attributes: {
        type: [
            {
                key: {
                    type: String,
                    required: true,
                },
                label: {
                    type: String,
                    required: true,
                },
                value: {
                    type: Schema.Types.Mixed,
                    required: true,
                },
                unit: {
                    type: String,
                },
            },
        ],
        default: [],
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["approved", "pending", "rejected"],
        default: "pending",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Created by is required"],
    },
}, { timestamps: true });
const productModel = model("products", productSchema);
export default productModel;
//# sourceMappingURL=product.model.js.map