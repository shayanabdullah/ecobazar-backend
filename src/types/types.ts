import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

export type userModelType = {
    fullName: string,
    email: string,
    password: string,
    terms: boolean,
    role: 'user' | 'admin' | 'vendor',
    verifyOtp: string,
    verifyOtpExpire: Date,
    isAccountVerified: boolean,
    resetOtp: number,
    resetOtpExpire: number,
    status: string,
}
export type categoryModelType = {
categoryName: string,
  slug: string,
  image: string,
  description: string,
  status: string
  imagePublicId: string
}
export type subCategoryModelType = {
  subCategoryName: string;
  slug: string;
  category: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: string;
  image: string;
  imagePublicId: string;
};

export interface UserJwtPayload  extends JwtPayload {
    userId: string,
    email: string,
    role: 'user' | 'admin' | 'vendor',
}