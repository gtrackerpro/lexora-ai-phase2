import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const s3 = new AWS.S3();

class AWSService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME || 'lexora-assets';
  }

  // Create multer upload middleware for S3
  createUploadMiddleware(folder: string = 'uploads') {
    return multer({
      storage: multerS3({
        s3: s3,
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
      const params = {
        Bucket: this.bucketName,
        Key: `${folder}/${fileName}`,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read'
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Delete file from S3
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey
      };

      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  // Get signed URL for private files
  getSignedUrl(fileKey: string, expiresIn: number = 3600): string {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: expiresIn
    };

    return s3.getSignedUrl('getObject', params);
  }

  // List files in a folder
  async listFiles(folder: string): Promise<AWS.S3.Object[]> {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: folder + '/'
      };

      const result = await s3.listObjectsV2(params).promise();
      return result.Contents || [];
    } catch (error) {
      console.error('S3 List Error:', error);
      throw new Error('Failed to list files from S3');
    }
  }
}

export default new AWSService();