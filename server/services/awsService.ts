import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

class AWSService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME || 'lexora-assets';
  }

  // Create multer upload middleware for S3
  createUploadMiddleware(folder: string = 'uploads') {
    return multer({
      storage: multerS3({
        s3: s3Client as any,
        bucket: this.bucketName,
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const extension = file.originalname.split('.').pop();
          cb(null, `${folder}/${uniqueSuffix}.${extension}`);
        }
      }),
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow images, videos, and audio files
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/avi',
          'video/mov',
          'audio/mp3',
          'audio/wav',
          'audio/mpeg'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'));
        }
      }
    });
  }

  // Upload file directly to S3
  async uploadFile(file: Buffer, fileName: string, mimeType: string, folder: string = 'uploads'): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `${folder}/${fileName}`,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read'
      });

      await s3Client.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${folder}/${fileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Delete file from S3
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  // Get signed URL for private files
  async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  // List files in a folder
  async listFiles(folder: string): Promise<any[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folder + '/'
      });

      const result = await s3Client.send(command);
      return result.Contents || [];
    } catch (error) {
      console.error('S3 List Error:', error);
      throw new Error('Failed to list files from S3');
    }
  }
}

export default new AWSService();