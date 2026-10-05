import categoryModel from "../models/categoryModel.js";
import subCategoryModel from "../models/subcategory.model.js";

const findSubCategoryByCategory = async (userId: string) : Promise<any> => {
    const categoryCreatedBy = await categoryModel.find({ createdBy: userId }).lean();
    if(categoryCreatedBy.length === 0) {
        return {
            success: false,
            message: "User has not created any category.",
        };
    }
    const allData = await Promise.all(
      categoryCreatedBy.map(async (item) => {
        const subCategory = await subCategoryModel.find({
          category: item._id,
        });

        return {
          ...item,
          subCategory: subCategory.length > 0 ? subCategory : null,
        };
      }),
    );

    return {
        success: true,
        data: allData,
    };

}

export default findSubCategoryByCategory;