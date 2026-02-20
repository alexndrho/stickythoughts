import 'server-only';

import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.CLOUDFLARE_R2_BUCKET_REGION,
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
  },
});

export const uploadFile = async ({ params }: { params: PutObjectCommandInput }) => {
  if (!process.env.CLOUDFLARE_R2_ENDPOINT_ACCESS) {
    throw new Error('CLOUDFLARE_R2_ENDPOINT_ACCESS is not defined');
  }

  await s3Client.send(new PutObjectCommand(params));
  return process.env.CLOUDFLARE_R2_ENDPOINT_ACCESS + '/' + params.Key;
};

export const deleteFile = async ({ params }: { params: DeleteObjectCommandInput }) => {
  if (!process.env.CLOUDFLARE_R2_ENDPOINT_ACCESS) {
    throw new Error('CLOUDFLARE_R2_ENDPOINT_ACCESS is not defined');
  }

  return await s3Client.send(
    new DeleteObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key,
    }),
  );
};

export const isUrlStorage = (url: string) => {
  if (!process.env.CLOUDFLARE_R2_ENDPOINT_ACCESS) {
    throw new Error('CLOUDFLARE_R2_ENDPOINT_ACCESS is not defined');
  }

  return url.startsWith(process.env.CLOUDFLARE_R2_ENDPOINT_ACCESS);
};
