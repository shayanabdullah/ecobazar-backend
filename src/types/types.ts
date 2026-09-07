import { JwtPayload } from "jsonwebtoken";

export type userModelType = {
    fullName: string,
    email: string,
    password: string,
    terms: boolean,
    role: string,
    verifyOtp: number,
    verifyOtpExpire: number,
    isAccountVerified: boolean,
    resetOtp: number,
    resetOtpExpire: number,
    status: string,
}

export interface UserJwtPayload  extends JwtPayload {
    _id: string,
    email: string,
    role: string,
}