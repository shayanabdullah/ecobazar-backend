import { JwtPayload } from "jsonwebtoken";

export type userModelType = {
    fullName: string,
    email: string,
    password: string,
    terms: boolean,
    role: 'user' | 'admin',
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

export interface UserJwtPayload  extends JwtPayload {
    _id: string,
    email: string,
    role: 'user' | 'admin',
}