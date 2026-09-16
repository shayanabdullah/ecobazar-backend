import categoryModel from "../models/categoryModel.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
const categoryController = async (req, res) => {
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
export { categoryController };
//# sourceMappingURL=categoryController.js.map