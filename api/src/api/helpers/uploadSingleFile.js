import multer from "multer";
import fs from "fs";
import randomstring from "randomstring";

let allMimeType = ["text"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let fileDestination = "public/uploads/files/" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
        // Vérifier si le dossier existe, sinon le créer
        if (!fs.existsSync(fileDestination)) {
            fs.mkdirSync(fileDestination, { recursive: true }); // Crée les dossiers manquants
        }
        cb(null, fileDestination);
    },
    filename: function (req, file, cb) {
        let mime = file.originalname;
        let getTypeExtension = mime.split(".");
        let CountPoint = getTypeExtension.length;
        let newFileName = Date.now() + "_" + randomstring.generate() + `.${getTypeExtension[CountPoint - 1]}`;
        cb(null, newFileName);
    },
});

const fileFilter = (req, file, cb) => {
    let getMime = file.mimetype.split("/")[0];
    if (allMimeType.indexOf(getMime) > -1) {
        cb(null, true);
    } else {
        cb(null, false);
        cb(new Error("Format de fichier non supporté"));
    }
};

export default multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 8, //Max size 8Mb
    },
    fileFilter: fileFilter,
}).single("file");
