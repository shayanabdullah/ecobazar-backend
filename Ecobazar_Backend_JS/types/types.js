export const productExcelSchema = {
    productName: {
        column: "Product Name",
        type: String,
        required: true,
    },
    description: {
        column: "Description",
        type: String,
    },
    category: {
        column: "Category ID",
        type: String,
        required: true,
    },
    subCategory: {
        column: "Subcategory ID",
        type: String,
    },
    brand: {
        column: "Brand",
        type: String,
    },
    manufacturer: {
        column: "Manufacturer",
        type: String,
    },
    countryOfOrigin: {
        column: "Country Of Origin",
        type: String,
    },
    thumbnailUrl: {
        column: "Thumbnail URL",
        type: String,
        required: true,
    },
    thumbnailPublicId: {
        column: "Thumbnail Public ID",
        type: String,
        required: true,
    },
    thumbnailAltText: {
        column: "Thumbnail Alt Text",
        type: String,
    },
    imagesJson: {
        column: "Images JSON",
        type: String,
    },
    sku: {
        column: "SKU (Simple Products)",
        type: String,
    },
    price: {
        column: "Price (Simple Products)",
        type: Number,
    },
    compareAtPrice: {
        column: "Compare At Price (Simple Products)",
        type: Number,
    },
    stockQuantity: {
        column: "Stock Quantity (Simple Products)",
        type: Number,
    },
    attributesJson: {
        column: "Attributes JSON",
        type: String,
    },
    variantsJson: {
        column: "Variants JSON",
        type: String,
    },
};
//# sourceMappingURL=types.js.map