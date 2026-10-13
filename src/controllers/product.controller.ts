import { Request, Response } from "express";
import mongoose from "mongoose";
import { productAttributeType, productVariantType } from "../types/types.js";
import productModel from "../models/product.model.js";
import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import subCategoryModel from "../models/subcategory.model.js";
const isValidNumber = (num: number) => {
  return Number.isFinite(num) && num > 0;
};
const createProductController = async (req: Request, res: Response) => {
  try {
    const {
      productName,
      description,
      category,
      subCategory,
      brand,
      manufacturer,
      countryOfOrigin,
      sku,
      price,
      compareAtPrice,
      stockQuantity,
    } = req.body;

    const { userId, role } = req.user;

    if (role !== "admin" && role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create products.",
      });
    }

    const files = req.files as
      | { [field: string]: Express.Multer.File[] | [] }
      | undefined;

    const thumbnail = files?.thumbnail?.[0];
    const imageFiles = files?.images ?? [];

    if (!productName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required.",
      });
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
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

    let variants: productVariantType[] = [];
    let attributes: productAttributeType[] = [];

    try {
      variants = req.body.variants ? JSON.parse(req.body.variants) : [];

      attributes = req.body.attributes ? JSON.parse(req.body.attributes) : [];

      if (!Array.isArray(variants) || !Array.isArray(attributes)) {
        return res.status(400).json({
          success: false,
          message: "Variants and attributes must be JSON arrays.",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid variants or attributes format",
      });
    }

    for (const item of attributes) {
      const key = item.key?.trim();
      const label = item.label?.trim();
      const values = ["string", "number", "boolean"].includes(
        typeof item?.value,
      );
      if (!key || !label || !values) {
        return res.status(400).json({
          success: false,
          message: "Invalid attributes format",
        });
      }
    }

    const allVariants: productVariantType[] = [];
    const allSkus: string[] = [];
    for (const item of variants) {
      const variantSku = String(item?.sku ?? "").trim();
      const variantSize = String(item?.size ?? "").trim();
      const variantPrice = Number(item?.price);
      const variantStockQuantity = Number(item?.stockQuantity);
      const variantCompareAtPrice =
        item.compareAtPrice == null ? undefined : Number(item?.compareAtPrice);

      if (!variantSku) {
        return res
          .status(400)
          .json({ success: false, message: "Variant SKU is missing." });
      }
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

      if (
        variantCompareAtPrice !== undefined &&
        (!Number.isFinite(variantCompareAtPrice) ||
          variantCompareAtPrice < variantPrice)
      ) {
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

    let simpleSku: string | undefined;
    let simplePrice: number | undefined;
    let simpleCompareAtPrice: number | undefined;
    let simpleStockQuantity: number | undefined;

    if (allVariants.length === 0) {
      simpleSku = typeof sku === "string" ? sku : "";

      if (
        !simpleSku ||
        !price ||
        price === "" ||
        stockQuantity === undefined ||
        stockQuantity === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "SKU, price and stock quantity are required for creating a product.",
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
        if (
          !isValidNumber(simpleCompareAtPrice) ||
          simpleCompareAtPrice < simplePrice
        ) {
          return res.status(400).json({
            success: false,
            message: "Compare at price must be greater than price.",
          });
        }
      }

      allSkus.push(simpleSku);
    }

    const skuExist: Record<string, boolean> = {};

    for (const sku of allSkus) {
      if (skuExist[sku]) {
        return res.status(409).json({
          success: false,
          message: "Duplicate SKU found in the product.",
        });
      }
      skuExist[sku] = true;
    }
    const exitingSku = await productModel.findOne({
      $or: [{ sku: { $in: allSkus } }, { "variants.sku": { $in: allSkus } }],
    });

    if (exitingSku) {
      return res.status(409).json({
        success: false,
        message: "SKU or variant SKU already exists.",
      });
    }

    const existingCategory = await categoryModel.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    const slug = productName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    console.log(slug);
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Unable to generate a slug from the product name.",
      });
    }
    const productCode = `PRD-${Date.now().toString().toUpperCase()}`;

    const { publicId: thumbnailPublicId, imgUrl: thumbnailUrl } =
      await uploadToCloudinary(thumbnail.path, "ecobazar/products/thumbnails");

    const uploadImages: { url: string; publicId: string; altText: string }[] =
      [];

    for (const img of imageFiles) {
      const { publicId, imgUrl } = await uploadToCloudinary(
        img.path,
        "ecobazar/products/gallery",
      );
      uploadImages.push({
        url: imgUrl,
        publicId,
        altText: productName.trim(),
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

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create product at this time.",
    });
  }
};

export { createProductController };
