import multer from "multer";
import fs from "fs";
import randomstring from "randomstring";

// Types de fichiers acceptés pour les candidatures
let allMimeType = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let fileDestination = "public/uploads/applications/" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
        // Vérifier si le dossier existe, sinon le créer
        if (!fs.existsSync(fileDestination)) {
            fs.mkdirSync(fileDestination, { recursive: true });
        }
        cb(null, fileDestination);
    },
    filename: function (req, file, cb) {
        let mime = file.originalname;
        let getTypeExtension = mime.split(".");
        let CountPoint = getTypeExtension.length;
        let newFileName = Date.now() + "_" + randomstring.generate(8) + `.${getTypeExtension[CountPoint - 1]}`;
        cb(null, newFileName);
    },
});

const fileFilter = (req, file, cb) => {
    let getMime = file.mimetype;
    if (allMimeType.indexOf(getMime) > -1) {
        cb(null, true);
    } else {
        cb(null, false);
        cb(new Error("Format de fichier non supporté. Formats acceptés: PDF, DOC, DOCX, JPG, PNG"));
    }
};

export default multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // Max size 5MB per file
    },
    fileFilter: fileFilter,
}).fields([
    { name: "cv_file", maxCount: 1 },
    { name: "cover_letter_file", maxCount: 1 },
    { name: "additional_documents", maxCount: 3 },
]);
