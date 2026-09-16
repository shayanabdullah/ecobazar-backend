import cloudinary from "../config/cloudinaryConfig.js";
const uploadToCloudinary = async (filePath, folder) => {
    const uploadResult = await cloudinary.uploader
        .upload(filePath, {
        folder,
        resource_type: "image",
    });
    const imgUrl = cloudinary.url(uploadResult.public_id, {
        fetch_format: "auto",
        quality: "auto",
    });
    return {
        publicId: uploadResult.public_id,
        imgUrl,
    };
};
export default uploadToCloudinary;
//# sourceMappingURL=cloudinaryUpload.js.map