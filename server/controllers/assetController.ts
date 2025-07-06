import { Request, Response } from 'express';
import Asset from '../models/Asset';
import awsService from '../services/awsService';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
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

// @desc    Upload asset
// @route   POST /api/assets/upload
// @access  Private
export const uploadAsset = async (req: Request, res: Response) => {
  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { type } = req.body;
      if (!type || !['avatar', 'audio', 'video', 'script'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid asset type'
        });
      }

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const extension = req.file.originalname.split('.').pop();
        const fileName = `${type}_${timestamp}.${extension}`;

        // Upload to S3
        const fileUrl = await awsService.uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype,
          `assets/${type}s`
        );

        // Save asset metadata to database
        const asset = await Asset.create({
          userId: req.user?._id,
          type,
          fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          usedIn: []
        });

        res.status(201).json({
          success: true,
          asset
        });
      } catch (uploadError) {
        console.error('Asset Upload Error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload asset'
        });
      }
    });
  } catch (error) {
    console.error('Upload Asset Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process upload'
    });
  }
};

// @desc    Get user's assets
// @route   GET /api/assets
// @access  Private
export const getUserAssets = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const filter: any = { userId: req.user?._id };
    if (type) filter.type = type;

    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    console.error('Get User Assets Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets'
    });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
export const getAsset = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if user owns the asset
    if (asset.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this asset'
      });
    }

    res.status(200).json({
      success: true,
      asset
    });
  } catch (error) {
    console.error('Get Asset Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset'
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if user owns the asset
    if (asset.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this asset'
      });
    }

    // Delete from S3
    try {
      const fileKey = asset.fileUrl.split('/').slice(-2).join('/'); // Extract key from URL
      await awsService.deleteFile(fileKey);
    } catch (s3Error) {
      console.error('S3 Delete Error:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await Asset.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete Asset Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset'
    });
  }
};

// @desc    Update asset usage
// @route   PUT /api/assets/:id/usage
// @access  Private
export const updateAssetUsage = async (req: Request, res: Response) => {
  try {
    const { usedIn } = req.body;
    const assetId = req.params.id;

    const asset = await Asset.findById(assetId);
    if (!asset || asset.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    asset.usedIn = usedIn;
    await asset.save();

    res.status(200).json({
      success: true,
      asset
    });
  } catch (error) {
    console.error('Update Asset Usage Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset usage'
    });
  }
};