import multer from "multer";
const excelUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 5 MB
        files: 1,
    },
});
export default excelUpload;
//# sourceMappingURL=multer.file.js.map