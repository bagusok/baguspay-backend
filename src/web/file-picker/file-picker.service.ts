import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class FilePickerService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,

        secretAccessKey: process.env.S3_ACCESS_SECRET,
      },
    });
  }

  async uploadFile(file: any) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });
    try {
      const result = await this.s3Client.send(command);

      if (result?.$metadata.httpStatusCode !== 200) {
        throw new BadRequestException("Can't upload file");
      }

      return result;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async deleteFile(body) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: body.id,
    });
    try {
      const result = await this.s3Client.send(command);
      if (result?.$metadata.httpStatusCode !== 204) {
        throw new BadRequestException("Can't delete file");
      }
      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    try {
      const result = await this.s3Client.send(command);
      if (!result) {
        return null;
      }

      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getAllFiles() {
    const command = new ListObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    try {
      const result = await this.s3Client.send(command);
      if (result?.$metadata.httpStatusCode !== 200) {
        return new BadRequestException("Can't upload file");
      }

      const newResult = result?.Contents.map((item) => {
        return {
          key: item.Key,
          url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${item.Key}`,
          size: item.Size,
          lastModified: item.LastModified,
        };
      });

      return newResult;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
