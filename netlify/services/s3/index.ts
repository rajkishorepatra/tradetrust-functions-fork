import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";
import { Readable } from "stream";

const account = process.env.TT_AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.TT_AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.TT_AZURE_STORAGE_CONTAINER_NAME;

if (!account || !accountKey || !containerName) {
  throw new Error("Azure storage account name, key, or container name is missing.");
}

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const containerClient = blobServiceClient.getContainerClient(containerName);

export const azureBlobPut = async (blobName: string, content: string | Buffer) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
    return uploadBlobResponse;
  } catch (error) {
    throw new createError(400, error.message);
  }
};

export const azureBlobGet = async (blobName: string) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const readableStream = downloadBlockBlobResponse.readableStreamBody as Readable;
    const downloadedContent = await streamToString(readableStream);
    return JSON.parse(downloadedContent);
  } catch (error) {
    throw new createError(400, ERROR_MESSAGE.DOCUMENT_NOT_FOUND);
  }
};

export const azureBlobRemove = async (blobName: string) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const deleteBlobResponse = await blockBlobClient.delete();
    return deleteBlobResponse;
  } catch (error) {
    throw new createError(400, error.message);
  }
};

async function streamToString(readableStream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}



// import AWS, { S3 } from "aws-sdk";
// import createError from "http-errors";
// import { ERROR_MESSAGE } from "../../constants";

// const option =
//   process.env.NODE_ENV === "test"
//     ? {
//         accessKeyId: "S3RVER",
//         secretAccessKey: "S3RVER",
//         endpoint: `http://localhost:4568`,
//         sslEnabled: false,
//         s3ForcePathStyle: true,
//       }
//     : {
//         accessKeyId: process.env.TT_STORAGE_AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.TT_STORAGE_AWS_SECRET_ACCESS_KEY,
//       };

// const s3 = new AWS.S3(option);

// export const s3Put = (params: S3.Types.PutObjectRequest) =>
//   s3.upload(params).promise();

// export const s3Get = (params: S3.Types.GetObjectRequest) =>
//   s3
//     .getObject(params)
//     .promise()
//     .then((results) => {
//       if (results && results.Body) {
//         return JSON.parse(results.Body.toString());
//       }
//       throw new createError(400, ERROR_MESSAGE.DOCUMENT_NOT_FOUND);
//     })
//     .catch((err) => {
//       throw new createError(400, err.message);
//     });

// export const s3Remove = (params: S3.Types.DeleteObjectRequest) =>
//   s3.deleteObject(params).promise();