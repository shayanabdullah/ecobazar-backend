import { randomBytes } from "node:crypto";
import categoryModel from "../models/categoryModel.js";
import subCategoryModel from "../models/subcategory.model.js";
import productModel from "../models/product.model.js";
const findSubCategoryByCategory = async (userId) => {
    const categoryCreatedBy = await categoryModel.find({ createdBy: userId }).lean();
    if (categoryCreatedBy.length === 0) {
        return {
            success: false,
            message: "User has not created any category.",
        };
    }
    const allData = await Promise.all(categoryCreatedBy.map(async (item) => {
        const subCategory = await subCategoryModel.find({
            category: item._id,
        });
        return {
            ...item,
            subCategory: subCategory.length > 0 ? subCategory : null,
        };
    }));
    return {
        success: true,
        data: allData,
    };
};
const isValidNumber = (num) => {
    return Number.isFinite(num) && num > 0;
};
const genarateUniqueSku = async (usedSku) => {
    let sku = "";
    let alreadyExist = true;
    while (alreadyExist === true) {
        sku = `SKU-${randomBytes(6).toString("hex")}`;
        const existSku = await productModel.findOne({
            $or: [{ sku: sku }, { 'variants.sku': sku }]
        });
        if (!Boolean(existSku) && !usedSku.includes(sku)) {
            alreadyExist = false;
        }
    }
    return sku;
};
export { findSubCategoryByCategory, isValidNumber, genarateUniqueSku };
//# sourceMappingURL=helper.js.map