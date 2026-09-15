import mongoose from "mongoose"
import { categoryModelType } from "../types/types.js"


const { Schema, model } = mongoose

const categorySchema = new Schema<categoryModelType>({
  categoryName: {
    type : String, 
    unique:true,
    required: true
  },
  slug: {
     type : String, 
      unique:true,
    required: true
  },
  image: {
     type : String, 
    required: true
  },
  imagePublicId: {
  type: String,
  required: true,
},
  description: {
    type : String, 
    required: false
  },
  status: {
     type : String, 
    enum : ['active', 'inactive', 'reject'],
    default: 'inactive'
  } 
})

const categoryModel = model<categoryModelType>('category', categorySchema);
export default categoryModel;
