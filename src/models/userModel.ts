import mongoose from "mongoose"
import { userModelType } from "../types/types.js"


const { Schema, model } = mongoose

const userSchema = new Schema<userModelType>({
  fullName:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true,
  },
  terms:{
    type: Boolean,
    required: true,
  },
  role:{
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status:{
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
 
  isAccountVerified:{
    type: Boolean,
    default: false,
  },

})

const userModel = model<userModelType>('user', userSchema);
export default userModel;
