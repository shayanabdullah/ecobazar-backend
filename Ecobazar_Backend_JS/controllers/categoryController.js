import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
const categoryCreateController = async (req, res) => {
    try {
        const { categoryName, slug, description, status } = req.body;
        const img = req.file;
        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: "Category name is required.",
            });
        }
        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Slug is required.",
            });
        }
        if (!img) {
            return res.status(400).json({
                success: false,
                message: "Category image is required.",
            });
        }
        const existingName = await categoryModel.findOne({
            categoryName: categoryName.trim().toLowerCase(),
        });
        if (existingName) {
            return res.status(409).json({
                success: false,
                message: "Category already exists.",
            });
        }
        const existingSlug = await categoryModel.findOne({
            slug: slug.trim().toLowerCase(),
        });
        if (existingSlug) {
            return res.status(409).json({
                success: false,
                message: "Slug already exists.",
            });
        }
        const { publicId, imgUrl } = await uploadToCloudinary(img.path, "ecobazar/categories");
        const category = await categoryModel.create({
            categoryName: categoryName.trim().toLowerCase(),
            slug: slug.trim().toLowerCase(),
            description: description?.trim() || "Explore our products in this category.",
            status: status,
            image: imgUrl,
            imagePublicId: publicId,
        });
        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: category,
        });
    }
    catch (error) {
        console.error("Create category error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create category at this time.",
        });
    }
};
const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryExist = await categoryModel.findById(id);
        if (!categoryExist) {
            return res.status(404).json({
                success: false,
                message: "Category was not found.",
            });
        }
        const updatedCategory = await categoryModel.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
        return res.status(200).json({
            success: true,
            message: `${categoryExist.categoryName} category updated successfully.`,
            data: updatedCategory,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryExist = await categoryModel.findById(id);
        if (!categoryExist) {
            return res.status(404).json({
                success: false,
                message: "Category was not found.",
            });
        }
        await categoryModel.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: `${categoryExist.categoryName} category deleted successfully.`,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
export { categoryCreateController, updateCategoryController, deleteCategoryController };
//# sourceMappingURL=categoryController.js.map