import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import type { Schema } from "read-excel-file/universal";

export type userModelType = {
  fullName: string;
  email: string;
  password: string;
  terms: boolean;
  role: "user" | "admin" | "vendor";
  verifyOtp: string;
  verifyOtpExpire: Date;
  isAccountVerified: boolean;
  resetOtp: number;
  resetOtpExpire: number;
  status: string;
};
export type categoryModelType = {
  categoryName: string;
  slug: string;
  image: string;
  description: string;
  status: string;
  imagePublicId: string;
  createdBy: Types.ObjectId;
};

export type subCategoryModelType = {
  subCategoryName: string;
  slug: string;
  category: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: string;
  image: string;
  imagePublicId: string;
};

export interface UserJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: "user" | "admin" | "vendor";
}

export type productStatusType =
  | "approved"
  | "pending"
  | "rejected";

export interface productThumbnailType {
  url: string;
  publicId: string;
  altText?: string;
}

export interface productImageType {
  url: string;
  publicId: string;
  altText?: string;
  isMain?: boolean;
}

export interface productAttributeType {
  key: string;
  label: string;
  value: string | number | boolean;
}

export interface productVariantType {
  sku: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface productModelType {
  productName: string;
  slug: string;
  productCode: string;

  description?: string;

  category: Types.ObjectId;
  subCategory?: Types.ObjectId;

  brand?: string;
  manufacturer?: string;
  countryOfOrigin?: string;

  thumbnail: productThumbnailType;
  images?: productImageType[];
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  
  attributes?: productAttributeType[];
  variants?: productVariantType[];

  status: productStatusType;

  createdBy: Types.ObjectId;
}



export interface ProductExcelRow {
  productName: string;
  description?: string | null;

  category: string;
  subCategory?: string | null;

  brand?: string | null;
  manufacturer?: string | null;
  countryOfOrigin?: string | null;

  thumbnailUrl: string;
  thumbnailPublicId: string;
  thumbnailAltText?: string | null;

  imagesJson?: string | null;

  sku?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  stockQuantity?: number | null;

  attributesJson?: string | null;
  variantsJson?: string | null;
}



export const productExcelSchema: Schema<ProductExcelRow> = {
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