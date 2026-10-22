import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  productAttributeType,
  ProductExcelRow,
  productExcelSchema,
  productModelType,
  productVariantType,
} from "../types/types.js";
import productModel from "../models/product.model.js";
import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import subCategoryModel from "../models/subcategory.model.js";
import { genarateUniqueSku, isValidNumber } from "../utils/helper.js";
import {
  sendAdminProductCreatedByAdminEmail,
  sendAdminVendorProductCreatedEmail,
} from "../utils/emailSender.js";
import userModel from "../models/userModel.js";
import { readSheet } from "read-excel-file/node";
import writeExcelFile from "write-excel-file/node";
import { validateHeaderName } from "node:http";

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
      price,
      compareAtPrice,
      stockQuantity,
      isMain,
    } = req.body;

    const { userId, role } = req.user;

    if (role !== "admin" && role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create products.",
      });
    }

    const files = req.files as
      | { [field: string]: Express.Multer.File[] }
      | undefined;

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
      const isValidValue = ["string", "number", "boolean"].includes(
        typeof item?.value,
      );
      if (!key || !label || !isValidValue) {
        return res.status(400).json({
          success: false,
          message: "Invalid attributes format",
        });
      }
    }

    const allVariants: productVariantType[] = [];
    const allSkus: string[] = [];

    for (const item of variants) {
      const variantSku = await genarateUniqueSku(allSkus);

      const variantSize = String(item?.size ?? "").trim();
      const variantPrice = Number(item?.price);
      const variantStockQuantity = Number(item?.stockQuantity);
      const variantCompareAtPrice =
        item.compareAtPrice == null ? undefined : Number(item?.compareAtPrice);

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
      simpleSku = await genarateUniqueSku(allSkus);

      if (
        simpleSku === undefined ||
        price === undefined ||
        price === "" ||
        stockQuantity === undefined ||
        stockQuantity === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Price and stock quantity are required for creating a product.",
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

    const { publicId: thumbnailPublicId, imgUrl: thumbnailUrl } =
      await uploadToCloudinary(thumbnail.path, "ecobazar/products/thumbnails");

    const uploadImages: {
      url: string;
      publicId: string;
      altText: string;
      isMain: boolean;
    }[] = [];

    for (const [index, img] of imageFiles.entries()) {
      const { publicId, imgUrl } = await uploadToCloudinary(
        img.path,
        "ecobazar/products/gallery",
      );
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
      await sendAdminProductCreatedByAdminEmail(
        product.productName,
        product.productCode,
        existingCategory.categoryName,
      );
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
        await sendAdminVendorProductCreatedEmail(
          product.productName,
          product.productCode,
          existingCategory.categoryName,
          vendor.fullName,
          vendor.email,
          String(product._id),
        );
      } catch (emailError) {
        console.error("Admin product notification failed:", emailError);
      }
    }

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
      error: error.message,
    });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("Get all products error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get products at this time.",
      error: error.message,
    });
  }
};

const getProductbyCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    if (
      !categoryId.toString().trim() ||
      !mongoose.Types.ObjectId.isValid(categoryId.toString())
    ) {
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
  } catch (error: any) {
    console.error("Get products by category error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get products at this time.",
      error: error.message,
    });
  }
};
const getProductbySubCategory = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    if (
      !subCategoryId.toString().trim() ||
      !mongoose.Types.ObjectId.isValid(subCategoryId.toString())
    ) {
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
  } catch (error: any) {
    console.error("Get products by sub category error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get products at this time.",
      error: error.message,
    });
  }
};
const getProductbyCreatedBy = async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    if (
      !creatorId.toString().trim() ||
      !mongoose.Types.ObjectId.isValid(creatorId.toString())
    ) {
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
  } catch (error: any) {
    console.error("Get products by creator error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get products at this time.",
      error: error.message,
    });
  }
};

const uploadBulkProducts = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user;
    const file = req?.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }
    const { objects, errors } = await readSheet<ProductExcelRow>(file.buffer, {
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

    const products: productModelType[] = [];
    const allSkus: string[] = [];

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

      if (
        !Array.isArray(images) ||
        !Array.isArray(variants) ||
        !Array.isArray(attributes)
      ) {
        return res.status(400).json({
          success: false,
          message: `Images, variants, and attributes must be arrays in Excel row ${excelRow}.`,
        });
      }

      if (
        (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) ||
        (subCategoryId && !mongoose.Types.ObjectId.isValid(subCategoryId))
      ) {
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
        if (
          !items.key?.trim() ||
          !items.label?.trim() ||
          !["string", "number", "boolean"].includes(typeof items.value)
        ) {
          return res.status(400).json({
            success: false,
            message: `Attribute key, label, and value must be valid in Excel row ${excelRow}.`,
          });
        }
      }

      const allVariants: productVariantType[] = [];
      for (const item of variants) {
        const variantSku =
          item.sku?.trim() || (await genarateUniqueSku(allSkus));

        const variantSize = String(item?.size ?? "").trim();
        const variantPrice = Number(item?.price);
        const variantStockQuantity = Number(item?.stockQuantity);
        const variantCompareAtPrice =
          item.compareAtPrice == null
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

        if (
          variantCompareAtPrice !== undefined &&
          (!Number.isFinite(variantCompareAtPrice) ||
            variantCompareAtPrice < variantPrice)
        ) {
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
      let simpleSku: string | undefined;
      let simplePrice: number | undefined;
      let simpleCompareAtPrice: number | undefined;
      let simpleStockQuantity: number | undefined;

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
        if (
          !isValidNumber(simplePrice) ||
          !isValidNumber(simpleStockQuantity)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid price or stock quantity in Excel row ${excelRow}.`,
          });
        }

        if (
          product.compareAtPrice !== null &&
          (!isValidNumber(Number(product.compareAtPrice)) ||
            Number(product.compareAtPrice) < simplePrice)
        ) {
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
      const productObject: productModelType = {
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
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to upload products.",
    });
  }
};

async function createExcelFile(request: Request, response: Response) {
  const {
    fileName,
    location,
    excelRowWidth,
    excelTextColor,
    excelFontWeight,
    excelBackgroundColor,
  } = request.body;
  if (!fileName) {
    return response.status(400).json({
      success: false,
      message: "File name is required.",
    });
  }
  

  const products = await productModel.find({}).select(" -_id productName price compareAtPrice slug productCode description category brand manufacturer countryOfOrigin thumbnail, images, sku, stockQuantity variants attributes status").lean() 

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

type ProductKey = keyof (typeof products)[number];

const productKeys = Object.keys(products[0]) as ProductKey[];

const excelHeader : any[] = productKeys.map((key) => ({
  value : key.trim(),
  ...headerStyle,
}));

const excelData = products.map((product) => (
    productKeys.map((key) => {
      const value = product[key] ?? "";      
    if (value == null) return "";

    if (Array.isArray(value) || typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
 })
))

data.push(excelHeader, ...excelData);



const columns : any[] = [];

for(const item of excelData){
  item.forEach((value) => {
    columns.push({width: value.length + 10});
  })

}



await writeExcelFile(data, {
  columns,
}).toFile(`${location}\\${fileName}.xlsx`);


  response.send({
    success: true,
    message: `Excel file created at ${location}\\${fileName}.xlsx successfully.`,
  });
}

export {
  createProductController,
  getAllProducts,
  getProductbyCategory,
  getProductbySubCategory,
  getProductbyCreatedBy,
  uploadBulkProducts,
  createExcelFile,
};
