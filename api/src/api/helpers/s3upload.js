import dotenv from "dotenv";
import fs from "fs";
import awsS3 from "aws-sdk/clients/s3.js";
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const aws_s3 = new awsS3({
    region,
    accessKeyId,
    secretAccessKey,
});
// uploads a file to s3
async function s3upload(file) {
    const fileStream = fs.createReadStream(file.path);
    fileStream.on("error", (err) => {
        return { error: err };
    });
    let fl = file.path.split("\\").length > 1 ? file.path.split("\\") : file.path.split("/");
    let link = "";
    for (let i in fl) {
        if (i < fl.length - 1) {
            link += "/";
            link += fl[i];
        }
    }
    const uploadParams = {
        Bucket: bucketName + link,
        Body: fileStream,
        Key: file.filename,
    };
    return aws_s3.upload(uploadParams).promise();
}
export default s3upload;
