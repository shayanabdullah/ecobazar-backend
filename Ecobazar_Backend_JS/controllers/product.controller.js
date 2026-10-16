import mongoose from "mongoose";
import productModel from "../models/product.model.js";
import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import subCategoryModel from "../models/subcategory.model.js";
import { genarateUniqueSku, isValidNumber } from "../utils/helper.js";
import { sendAdminProductCreatedByAdminEmail, sendAdminVendorProductCreatedEmail } from "../utils/emailSender.js";
import userModel from "../models/userModel.js";
const createProductController = async (req, res) => {
    try {
        const { productName, description, category, subCategory, brand, manufacturer, countryOfOrigin, price, compareAtPrice, stockQuantity, isMain } = req.body;
        const { userId, role } = req.user;
        if (role !== "admin" && role !== "vendor") {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create products.",
            });
        }
        const files = req.files;
        const thumbnail = files?.thumbnail?.[0];
        const imageFiles = files?.images ?? [];
        if (!productName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required.",
            });
        }
        if (!category.trim() || !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "A valid category is required.",
            });
        }
        if (subCategory && !mongoose.Types.ObjectId.isValid(subCategory)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID.",
            });
        }
        if (!thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Product thumbnail is required.",
            });
        }
        let variants = [];
        let attributes = [];
        try {
            variants = req.body.variants ? JSON.parse(req.body.variants) : [];
            attributes = req.body.attributes ? JSON.parse(req.body.attributes) : [];
            if (!Array.isArray(variants) || !Array.isArray(attributes)) {
                return res.status(400).json({
                    success: false,
                    message: "Variants and attributes must be JSON arrays.",
                });
            }
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid variants or attributes format",
            });
        }
        for (const item of attributes) {
            const key = item.key?.trim();
            const label = item.label?.trim();
            const isValidValue = ["string", "number", "boolean"].includes(typeof item?.value);
            if (!key || !label || !isValidValue) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid attributes format",
                });
            }
        }
        const allVariants = [];
        const allSkus = [];
        for (const item of variants) {
            const variantSku = await genarateUniqueSku(allSkus);
            const variantSize = String(item?.size ?? "").trim();
            const variantPrice = Number(item?.price);
            const variantStockQuantity = Number(item?.stockQuantity);
            const variantCompareAtPrice = item.compareAtPrice == null ? undefined : Number(item?.compareAtPrice);
            if (!variantSize) {
                return res.status(400).json({
                    success: false,
                    message: `Variant size is missing (SKU: ${variantSku}).`,
                });
            }
            if (!isValidNumber(variantPrice)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price (SKU: ${variantSku}).`,
                });
            }
            if (!isValidNumber(variantStockQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid stockQuantity (SKU: ${variantSku}).`,
                });
            }
            if (variantCompareAtPrice !== undefined &&
                (!Number.isFinite(variantCompareAtPrice) ||
                    variantCompareAtPrice < variantPrice)) {
                return res.status(400).json({
                    success: false,
                    message: "Compare at price must be greater than price.",
                });
            }
            allVariants.push({
                ...item,
                sku: variantSku,
                size: variantSize,
                price: variantPrice,
                compareAtPrice: variantCompareAtPrice,
                stockQuantity: variantStockQuantity,
                isDefault: item.isDefault === true,
                isActive: item.isActive !== false,
            });
            allSkus.push(variantSku);
        }
        let simpleSku;
        let simplePrice;
        let simpleCompareAtPrice;
        let simpleStockQuantity;
        if (allVariants.length === 0) {
            simpleSku = await genarateUniqueSku(allSkus);
            if (simpleSku === undefined ||
                price === undefined ||
                price === "" ||
                stockQuantity === undefined ||
                stockQuantity === "") {
                return res.status(400).json({
                    success: false,
                    message: "Price and stock quantity are required for creating a product.",
                });
            }
            simplePrice = Number(price);
            simpleStockQuantity = Number(stockQuantity);
            if (!isValidNumber(simplePrice) || !isValidNumber(simpleStockQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: "Price or stock quantity is invalid.",
                });
            }
            if (compareAtPrice !== undefined && compareAtPrice !== "") {
                simpleCompareAtPrice = Number(compareAtPrice);
                if (!isValidNumber(simpleCompareAtPrice) ||
                    simpleCompareAtPrice < simplePrice) {
                    return res.status(400).json({
                        success: false,
                        message: "Compare at price must be greater than price.",
                    });
                }
            }
            allSkus.push(simpleSku);
        }
        const existingCategory = await categoryModel.findById(category);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        if (subCategory) {
            const existingSubCategory = await subCategoryModel.findById(subCategory);
            if (!existingSubCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Subcategory not found.",
                });
            }
            if (String(existingSubCategory.category) !== String(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Subcategory does not belong to this category.",
                });
            }
        }
        const slug = productName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Unable to generate a slug from the product name.",
            });
        }
        const productCode = `PRD-${Date.now().toString().toUpperCase()}`;
        const { publicId: thumbnailPublicId, imgUrl: thumbnailUrl } = await uploadToCloudinary(thumbnail.path, "ecobazar/products/thumbnails");
        const uploadImages = [];
        for (const [index, img] of imageFiles.entries()) {
            const { publicId, imgUrl } = await uploadToCloudinary(img.path, "ecobazar/products/gallery");
            uploadImages.push({
                url: imgUrl,
                publicId,
                altText: productName.trim(),
                isMain: index === Number(isMain) ? true : false,
            });
        }
        const product = await productModel.create({
            productName: productName.trim(),
            slug,
            productCode,
            description: description?.trim() || undefined,
            category,
            subCategory,
            brand: brand?.trim() || undefined,
            manufacturer: manufacturer?.trim() || undefined,
            countryOfOrigin: countryOfOrigin?.trim() || undefined,
            thumbnail: {
                url: thumbnailUrl,
                publicId: thumbnailPublicId,
                altText: productName.trim(),
            },
            images: uploadImages,
            variants: allVariants,
            attributes,
            ...(allVariants.length === 0
                ? {
                    sku: simpleSku,
                    price: simplePrice,
                    compareAtPrice: simpleCompareAtPrice,
                    stockQuantity: simpleStockQuantity,
                }
                : {}),
            status: role === "admin" ? "approved" : "pending",
            createdBy: userId,
        });
        if (role === "admin") {
            await sendAdminProductCreatedByAdminEmail(product.productName, product.productCode, existingCategory.categoryName);
        }
        if (role === "vendor") {
            try {
                const vendor = await userModel.findById(userId);
                if (!vendor) {
                    return res.status(404).json({
                        success: false,
                        message: "Vendor not found.",
                    });
                }
                await sendAdminVendorProductCreatedEmail(product.productName, product.productCode, existingCategory.categoryName, vendor.fullName, vendor.email, String(product._id));
            }
            catch (emailError) {
                console.error("Admin product notification failed:", emailError);
            }
        }
        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: product,
        });
    }
    catch (error) {
        console.error("Create product error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create product at this time.",
            error: error.message,
        });
    }
};
const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({ status: "approved" }).populate([{
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "subCategory",
                select: " -_id subCategoryName",
            },
        ]).select("-__v -createdBy");
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: `${products.length} Products retrieved successfully.`,
            data: products,
        });
    }
    catch (error) {
        console.error("Get all products error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to get products at this time.",
            error: error.message,
        });
    }
};
const getProductbyCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId.toString().trim() || !mongoose.Types.ObjectId.isValid(categoryId.toString())) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID.",
            });
        }
        const existingCategory = await categoryModel.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        const products = await productModel.find({
            category: categoryId, status: "approved"
        }).populate([{
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "subCategory",
                select: " -_id subCategoryName",
            },
        ]).select("-__v -createdBy");
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: `${products.length} Products retrieved successfully.`,
            data: products,
        });
    }
    catch (error) {
        console.error("Get products by category error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to get products at this time.",
            error: error.message,
        });
    }
};
const getProductbySubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        if (!subCategoryId.toString().trim() || !mongoose.Types.ObjectId.isValid(subCategoryId.toString())) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub category ID.",
            });
        }
        const existingCategory = await subCategoryModel.findById(subCategoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub category not found.",
            });
        }
        const products = await productModel.find({
            subCategory: subCategoryId, status: "approved"
        }).populate([{
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "subCategory",
                select: " -_id subCategoryName",
            },
        ]).select("-__v -createdBy");
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found with sub category.",
            });
        }
        return res.status(200).json({
            success: true,
            message: `${products.length} Products retrieved successfully.`,
            data: products,
        });
    }
    catch (error) {
        console.error("Get products by sub category error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to get products at this time.",
            error: error.message,
        });
    }
};
const getProductbyCreatedBy = async (req, res) => {
    try {
        const { creatorId } = req.params;
        if (!creatorId.toString().trim() || !mongoose.Types.ObjectId.isValid(creatorId.toString())) {
            return res.status(400).json({
                success: false,
                message: "Invalid creator ID.",
            });
        }
        const existingCreator = await userModel.findById(creatorId);
        if (!existingCreator) {
            return res.status(404).json({
                success: false,
                message: "Creator not found.",
            });
        }
        const products = await productModel.find({
            createdBy: creatorId, status: "approved"
        }).populate([{
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "createdBy",
                select: " -_id fullName email role",
            }
        ]).select("-__v -createdBy");
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found with creator.",
            });
        }
        return res.status(200).json({
            success: true,
            message: `${products.length} Products retrieved successfully.`,
            data: products,
        });
    }
    catch (error) {
        console.error("Get products by creator error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to get products at this time.",
            error: error.message,
        });
    }
};
export { createProductController, getAllProducts, getProductbyCategory, getProductbySubCategory, getProductbyCreatedBy };
//# sourceMappingURL=product.controller.js.map