import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

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