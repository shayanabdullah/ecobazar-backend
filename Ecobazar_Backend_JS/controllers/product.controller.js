import mongoose from "mongoose";
import { productExcelSchema, } from "../types/types.js";
import productModel from "../models/product.model.js";
import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import subCategoryModel from "../models/subcategory.model.js";
import { genarateUniqueSku, isValidNumber } from "../utils/helper.js";
import { sendAdminProductCreatedByAdminEmail, sendAdminVendorProductCreatedEmail, } from "../utils/emailSender.js";
import userModel from "../models/userModel.js";
import { readSheet } from "read-excel-file/node";
import writeExcelFile from "write-excel-file/node";
const createProductController = async (req, res) => {
    try {
        const { productName, description, category, subCategory, brand, manufacturer, countryOfOrigin, price, compareAtPrice, stockQuantity, isMain, } = req.body;
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
        const products = await productModel
            .find({ status: "approved" })
            .populate([
            {
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "subCategory",
                select: " -_id subCategoryName",
            },
        ])
            .select("-__v -createdBy");
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
        if (!categoryId.toString().trim() ||
            !mongoose.Types.ObjectId.isValid(categoryId.toString())) {
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
        const products = await productModel
            .find({
            category: categoryId,
            status: "approved",
        })
            .populate([
            {
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "subCategory",
                select: " -_id subCategoryName",
            },
        ])
            .select("-__v -createdBy");
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
        if (!subCategoryId.toString().trim() ||
            !mongoose.Types.ObjectId.isValid(subCategoryId.toString())) {
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
        const products = await productModel
            .find({
            subCategory: subCategoryId,
            status: "approved",
        })
            .populate([
            {
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "subCategory",
                select: " -_id subCategoryName",
            },
        ])
            .select("-__v -createdBy");
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
        if (!creatorId.toString().trim() ||
            !mongoose.Types.ObjectId.isValid(creatorId.toString())) {
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
        const products = await productModel
            .find({
            createdBy: creatorId,
            status: "approved",
        })
            .populate([
            {
                path: "category",
                select: " -_id categoryName",
            },
            {
                path: "createdBy",
                select: " -_id fullName email role",
            },
        ])
            .select("-__v -createdBy");
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
// Upload bulk products
const uploadBulkProducts = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const file = req?.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file.",
            });
        }
        const { objects, errors } = await readSheet(file.buffer, {
            schema: productExcelSchema,
        });
        if (errors) {
            return res.status(400).json({
                success: false,
                message: "Excel validation failed.",
                errors,
            });
        }
        if (!objects || objects.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Excel file contains no products.",
            });
        }
        const products = [];
        const allSkus = [];
        for (let index = 0; index < objects.length; index++) {
            const product = objects[index];
            const excelRow = index + 2;
            const productName = product.productName.trim();
            const categoryId = product.category.trim();
            const subCategoryId = product.subCategory?.trim();
            if (!productName) {
                return res.status(400).json({
                    success: false,
                    message: `Product name is missing in Excel row .`,
                });
            }
            const images = product.imagesJson ? JSON.parse(product.imagesJson) : [];
            const attributes = product.attributesJson
                ? JSON.parse(product.attributesJson)
                : [];
            const variants = product.variantsJson
                ? JSON.parse(product.variantsJson)
                : [];
            if (!Array.isArray(images) ||
                !Array.isArray(variants) ||
                !Array.isArray(attributes)) {
                return res.status(400).json({
                    success: false,
                    message: `Images, variants, and attributes must be arrays in Excel row ${excelRow}.`,
                });
            }
            if ((categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) ||
                (subCategoryId && !mongoose.Types.ObjectId.isValid(subCategoryId))) {
                return res.status(400).json({
                    success: false,
                    message: `Category and sub category must be valid object IDs in Excel row ${excelRow}.`,
                });
            }
            const categoryExist = await categoryModel.findById(categoryId);
            if (!categoryExist) {
                console.log(categoryId);
                return res.status(400).json({
                    success: false,
                    message: `Category ${categoryId} not found in Excel row ${excelRow}.`,
                });
            }
            if (subCategoryId) {
                const subcategoryExist = await subCategoryModel.findById(subCategoryId);
                if (!subcategoryExist) {
                    return res.status(400).json({
                        success: false,
                        message: `Subcategory ${subCategoryId} not found in Excel row ${excelRow}.`,
                    });
                }
            }
            if (!product.thumbnailUrl.trim() || !product.thumbnailPublicId.trim()) {
                return res.status(400).json({
                    success: false,
                    message: `Thumbnail URL and public ID are missing in Excel row ${excelRow}.`,
                });
            }
            for (const items of attributes) {
                if (!items.key?.trim() ||
                    !items.label?.trim() ||
                    !["string", "number", "boolean"].includes(typeof items.value)) {
                    return res.status(400).json({
                        success: false,
                        message: `Attribute key, label, and value must be valid in Excel row ${excelRow}.`,
                    });
                }
            }
            const allVariants = [];
            for (const item of variants) {
                const variantSku = item.sku?.trim() || (await genarateUniqueSku(allSkus));
                const variantSize = String(item?.size ?? "").trim();
                const variantPrice = Number(item?.price);
                const variantStockQuantity = Number(item?.stockQuantity);
                const variantCompareAtPrice = item.compareAtPrice == null
                    ? undefined
                    : Number(item?.compareAtPrice);
                if (!variantSize) {
                    return res.status(400).json({
                        success: false,
                        message: `Variant size is missing (SKU: ${variantSku}) in Excel row ${excelRow}.`,
                    });
                }
                if (!isValidNumber(variantPrice)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid price (SKU: ${variantSku}) in Excel row ${excelRow}.`,
                    });
                }
                if (!isValidNumber(variantStockQuantity)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid stockQuantity (SKU: ${variantSku}) in Excel row ${excelRow}.`,
                    });
                }
                if (variantCompareAtPrice !== undefined &&
                    (!Number.isFinite(variantCompareAtPrice) ||
                        variantCompareAtPrice < variantPrice)) {
                    return res.status(400).json({
                        success: false,
                        message: `Compare at price must be greater than price (SKU: ${variantSku}) in Excel row ${excelRow}.`,
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
                simpleSku = product.sku?.trim() || (await genarateUniqueSku(allSkus));
                simplePrice = Number(product.price);
                simpleStockQuantity = Number(product.stockQuantity);
                if (product.price === null || product.stockQuantity === null) {
                    return res.status(400).json({
                        success: false,
                        message: `Price and stock quantity are required in Excel row ${excelRow}.`,
                    });
                }
                if (!isValidNumber(simplePrice) ||
                    !isValidNumber(simpleStockQuantity)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid price or stock quantity in Excel row ${excelRow}.`,
                    });
                }
                if (product.compareAtPrice !== null &&
                    (!isValidNumber(Number(product.compareAtPrice)) ||
                        Number(product.compareAtPrice) < simplePrice)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid compare-at price in Excel row ${excelRow}.`,
                    });
                }
                simpleSku = product.sku?.trim() || (await genarateUniqueSku(allSkus));
                if (allSkus.includes(simpleSku)) {
                    return res.status(400).json({
                        success: false,
                        message: `SKU ${simpleSku} already exists in Excel row ${excelRow}.`,
                    });
                }
                allSkus.push(simpleSku);
                simpleCompareAtPrice =
                    product.compareAtPrice == null
                        ? undefined
                        : Number(product.compareAtPrice);
            }
            const slug = product.productName
                ?.trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: "Unable to generate a slug from the product name.",
                });
            }
            const exsitProduct = await productModel.findOne({ slug });
            if (exsitProduct || products.some((item) => item.slug === slug)) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.productName}" already exists or has a duplicate name in the Excel file.`,
                });
            }
            const productCode = `PRD-${Date.now().toString().toUpperCase()}`;
            const productObject = {
                productName,
                productCode,
                slug,
                description: product.description?.trim() || undefined,
                category: new mongoose.Types.ObjectId(categoryId),
                subCategory: subCategoryId
                    ? new mongoose.Types.ObjectId(subCategoryId)
                    : undefined,
                brand: product.brand?.trim() || undefined,
                manufacturer: product.manufacturer?.trim() || undefined,
                countryOfOrigin: product.countryOfOrigin?.trim() || undefined,
                thumbnail: {
                    url: product.thumbnailUrl?.trim(),
                    publicId: product.thumbnailPublicId?.trim(),
                    altText: product.thumbnailAltText?.trim() || undefined,
                },
                images,
                variants: allVariants,
                ...(allVariants.length === 0
                    ? {
                        sku: simpleSku,
                        price: simplePrice,
                        compareAtPrice: simpleCompareAtPrice,
                        stockQuantity: simpleStockQuantity,
                    }
                    : {}),
                status: role === "admin" ? "approved" : "pending",
                createdBy: new mongoose.Types.ObjectId(userId),
            };
            products.push(productObject);
        }
        if (products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid products found in the Excel file.",
            });
        }
        const createdProduct = await productModel.insertMany(products);
        res.send({
            success: true,
            message: "Products uploaded successfully.",
            data: createdProduct,
        });
    }
    catch (error) {
        console.error("Bulk upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to upload products.",
        });
    }
};
// Create Excel file
const createExcelFile = async (request, response) => {
    const { fileName, location, excelRowWidth, excelTextColor, excelFontWeight, excelBackgroundColor, } = request.body;
    const { role, userId } = request.user;
    if (!fileName) {
        return response.status(400).json({
            success: false,
            message: "File name is required.",
        });
    }
    const Productdata = await productModel
        .find({ status: "approved" })
        .select(" -_id productName price compareAtPrice slug productCode description category brand manufacturer countryOfOrigin thumbnail, images, sku, stockQuantity variants attributes status")
        .lean()
        .populate({ path: "createdBy", select: " -_id name role" });
    const products = role === "vendor"
        ? await productModel
            .find({ status: "approved", createdBy: userId })
            .select("-_id productName price compareAtPrice slug productCode description category brand manufacturer countryOfOrigin thumbnail images sku stockQuantity variants attributes status")
            .lean()
        : Productdata;
    if (products.length === 0) {
        return response.status(400).json({
            success: false,
            message: "No products found in the database.",
        });
    }
    const data = [];
    const headerStyle = {
        fontWeight: excelFontWeight?.trim() || "bold",
        backgroundColor: excelBackgroundColor?.trim() || "#0E2841",
        textColor: excelTextColor?.trim() || "#FFFFFF",
    };
    const productKeys = Object.keys(products[0]);
    const excelHeader = productKeys.map((key) => ({
        value: key.trim(),
        ...headerStyle,
    }));
    const excelData = products.map((product) => productKeys.map((key) => {
        const value = product[key] ?? "";
        if (value == null)
            return "";
        if (Array.isArray(value) || typeof value === "object") {
            return JSON.stringify(value);
        }
        return String(value);
    }));
    data.push(excelHeader, ...excelData);
    const columns = [];
    for (const item of excelData) {
        item.forEach((value) => {
            columns.push({ width: value.length + 10 });
        });
    }
    await writeExcelFile(data, {
        columns,
    }).toFile(`${location}\\${fileName}.xlsx`);
    response.send({
        success: true,
        message: `Excel file created at ${location}\\${fileName}.xlsx successfully.`,
    });
};
// Edit products
const editProducts = async (req, res) => {
    try {
        const { productName, description, category, subCategory, brand, manufacturer, countryOfOrigin, price, compareAtPrice, stockQuantity, deleteImg, variants, attributes, deleteMultipleImg, } = req.body;
        const { id } = req.params;
        const { userId } = req.user;
        const products = await productModel.findOne({
            _id: id,
            status: "approved",
            createdBy: userId,
        });
        if (!products) {
            return res.status(400).json({
                success: false,
                message: "Product not found.",
            });
        }
        const files = req.files;
        const isMain = req.body.isMain !== undefined && req.body.isMain !== ""
            ? Number(req.body.isMain)
            : undefined;
        const deleteIndex = deleteImg !== undefined && deleteImg !== ""
            ? Number(deleteImg)
            : undefined;
        const productPrice = price ? Number(price.trim()) : products?.price;
        const productCompareAtPrice = compareAtPrice
            ? Number(compareAtPrice.trim())
            : products?.compareAtPrice;
        const productStockQuantity = stockQuantity
            ? Number(stockQuantity.trim())
            : products?.stockQuantity;
        const images = [...(products.images ?? [])];
        const imgFiles = files?.images ?? [];
        const mainVariant = variants ? JSON.parse(variants) : [];
        const mainAttributes = attributes ? JSON.parse(attributes) : [];
        if (imgFiles !== undefined) {
            for (const file of imgFiles) {
                const { publicId, imgUrl } = await uploadToCloudinary(file.path, "ecobazar/products/gallery");
                images.push({
                    url: imgUrl,
                    isMain: false,
                    publicId,
                });
                products.images = images;
            }
        }
        if (isMain !== undefined && products.images?.length) {
            if (!Number.isInteger(isMain) ||
                isMain < 0 ||
                isMain > products.images?.length - 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid main image index.",
                });
            }
            products.images?.forEach((img, index) => {
                img.isMain = index === isMain;
            });
        }
        if (deleteIndex !== undefined) {
            if (!Number.isInteger(deleteIndex) ||
                deleteIndex < 0 ||
                deleteIndex >= images?.length) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid delete image index.",
                });
            }
            const deleteImg = images[deleteIndex];
            images.splice(deleteIndex, 1);
            products.images = images;
            if (deleteImg?.isMain && images.length > 0) {
                images[0].isMain = true;
            }
        }
        // delete multiple images
        if (deleteMultipleImg !== undefined) {
            if (deleteMultipleImg.trim() == "all") {
                images.splice(0, images.length);
                products.images = images;
                await products.save();
                return res.status(200).json({
                    success: true,
                    message: "all Images deleted successfully",
                });
            }
            const deleteIndex = deleteMultipleImg
                ? JSON.parse(deleteMultipleImg.trim())
                : undefined;
            const allIndexs = Array.isArray(deleteIndex)
                ? deleteIndex.map((item) => typeof item === "string" ? Number(item) : item)
                : String(deleteIndex)
                    ?.split("")
                    .map((item) => (typeof item === "string" ? Number(item) : item));
            for (const index of allIndexs) {
                if (!Number.isInteger(index) ||
                    index < 0 ||
                    index > images.length - 1) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid image index.",
                    });
                }
            }
            allIndexs.sort((a, b) => b - a);
            // Delete images
            for (const index of allIndexs) {
                const deleteMultiImg = images[index];
                images.splice(index, 1);
                if (deleteMultiImg?.isMain && images.length > 0) {
                    images.forEach((img, i) => {
                        img.isMain = i === 0;
                    });
                }
            }
            products.images = images;
        }
        if (productName !== undefined && productName.trim().length <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product name cannot be empty.",
            });
        }
        if (productPrice !== undefined &&
            (!Number.isFinite(productPrice) || productPrice <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number.",
            });
        }
        if (productCompareAtPrice !== undefined &&
            (!Number.isFinite(productCompareAtPrice) || productCompareAtPrice <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Compare-at price must be a positive number.",
            });
        }
        if (productCompareAtPrice != undefined &&
            productPrice !== undefined &&
            productCompareAtPrice <= productPrice) {
            return res.status(400).json({
                success: false,
                message: "Compare-at price must be greater than price.",
            });
        }
        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "A valid category is required.",
                });
            }
            const existingCategory = await categoryModel.findById(category);
            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found.",
                });
            }
        }
        if (subCategory !== undefined &&
            !mongoose.Types.ObjectId.isValid(subCategory)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID.",
            });
        }
        if ((brand !== undefined && brand.trim().length <= 0) ||
            (manufacturer !== undefined && manufacturer.trim().length <= 0) ||
            (countryOfOrigin !== undefined && countryOfOrigin.trim().length <= 0)) {
            return res.status(400).json({
                success: false,
                message: "you cant set empty brand, manufacturer, and country of origin.",
            });
        }
        if (productPrice !== undefined || compareAtPrice !== undefined) {
            if (!Number.isInteger(productPrice)) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a positive Number.",
                });
            }
            if (!Number.isInteger(productCompareAtPrice) ||
                (productPrice !== undefined &&
                    productCompareAtPrice !== undefined &&
                    productCompareAtPrice <= productPrice)) {
                return res.status(400).json({
                    success: false,
                    message: "compare price must be a positive Number and greater than price.",
                });
            }
        }
        if (productStockQuantity !== undefined) {
            if (!Number.isInteger(productStockQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: "Stock quantity must be a positive Number.",
                });
            }
            if (productStockQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Stock quantity nust be at least 1.",
                });
            }
        }
        if ((variants !== undefined && mainVariant.length > 0) ||
            (attributes !== undefined && mainAttributes.length > 0)) {
            if (!Array.isArray(mainVariant) || !Array.isArray(mainAttributes)) {
                return res.status(400).json({
                    success: false,
                    message: "Variants and attributes must be JSON arrays.",
                });
            }
            // Edit attributes
            const updatedAttributes = [];
            for (const item of mainAttributes) {
                const key = item.key?.trim();
                const label = item.label?.trim();
                const isValidValue = ["string", "number", "boolean"].includes(typeof item?.value);
                if (!key || !label || !isValidValue) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid attributes format.",
                    });
                }
                // Check duplicate key
                const existAttribute = updatedAttributes.some((attribute) => attribute.key === key);
                if (existAttribute) {
                    return res.status(400).json({
                        success: false,
                        message: "Same attribute already exists.",
                    });
                }
                updatedAttributes.push({
                    ...item,
                    key,
                    label,
                });
            }
            products.attributes = updatedAttributes;
            // Edit variants
            if (variants !== undefined) {
                if (!Array.isArray(mainVariant)) {
                    return res.status(400).json({
                        success: false,
                        message: "Variants must be a JSON array.",
                    });
                }
                const updatedVariants = [];
                const allSizes = new Set();
                const allSkus = [];
                for (const item of mainVariant) {
                    const variantSize = String(item?.size ?? "").trim();
                    const variantPrice = Number(item?.price);
                    const variantStockQuantity = Number(item?.stockQuantity);
                    const variantCompareAtPrice = item.compareAtPrice == null
                        ? undefined
                        : Number(item.compareAtPrice);
                    if (!variantSize) {
                        return res.status(400).json({
                            success: false,
                            message: "Variant size is missing.",
                        });
                    }
                    if (allSizes.has(variantSize)) {
                        return res.status(400).json({
                            success: false,
                            message: "Duplicate variant size.",
                        });
                    }
                    allSizes.add(variantSize);
                    if (!isValidNumber(variantPrice)) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid price for variant ${variantSize}.`,
                        });
                    }
                    if (!isValidNumber(variantStockQuantity)) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid stock quantity for variant ${variantSize}.`,
                        });
                    }
                    if (variantCompareAtPrice !== undefined &&
                        (!Number.isFinite(variantCompareAtPrice) ||
                            variantCompareAtPrice <= variantPrice)) {
                        return res.status(400).json({
                            success: false,
                            message: "Compare-at price must be greater than price.",
                        });
                    }
                    const variantSku = await genarateUniqueSku(allSkus);
                    updatedVariants.push({
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
                products.variants = updatedVariants;
            }
        }
        if (productName !== undefined)
            products.productName = productName.trim();
        if (description !== undefined)
            products.description = description;
        if (subCategory !== undefined)
            products.subCategory = subCategory;
        if (brand !== undefined)
            products.brand = brand.trim();
        if (manufacturer !== undefined)
            products.manufacturer = manufacturer.trim();
        if (countryOfOrigin !== undefined)
            products.countryOfOrigin = countryOfOrigin.trim();
        if (productPrice !== undefined)
            products.price = productPrice;
        if (productCompareAtPrice !== undefined) {
            products.compareAtPrice = productCompareAtPrice;
        }
        if (productStockQuantity !== undefined) {
            products.stockQuantity = productStockQuantity;
        }
        await products.save();
        return res.status(200).json({
            success: true,
            message: "Product edited successfully.",
        });
    }
    catch (error) {
        console.error("editProducts error:", error);
        console.log("Headers already sent:", res.headersSent);
        if (res.headersSent) {
            console.error("Response was already sent. Find the earlier response.");
            return;
        }
        return res.status(500).json({
            success: false,
            message: "Unable to edit products.",
        });
    }
};
export { createProductController, getAllProducts, getProductbyCategory, getProductbySubCategory, getProductbyCreatedBy, uploadBulkProducts, createExcelFile, editProducts, };
//# sourceMappingURL=product.controller.js.map