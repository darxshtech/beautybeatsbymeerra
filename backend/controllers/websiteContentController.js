const WebsiteContent = require('../models/WebsiteContent');
const cloudinary = require('../utils/cloudinary');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'beauty_beats_content' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * @desc    Get all website content
 * @route   GET /api/website-content
 * @access  Public
 */
exports.getContent = async (req, res, next) => {
  try {
    const { branch, type, isActive } = req.query;
    const filter = {};
    
    if (branch) {
      if (branch === 'SALON') {
        filter.branch = { $in: ['SALON', 'BOTH'] };
      } else if (branch === 'CLINIC') {
        filter.branch = { $in: ['CLINIC', 'BOTH'] };
      } else {
        filter.branch = branch;
      }
    }
    
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const content = await WebsiteContent.find(filter).sort('order');
    res.status(200).json({ success: true, count: content.length, data: content });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new website content
 * @route   POST /api/website-content
 * @access  Private/Admin
 */
exports.createContent = async (req, res, next) => {
  try {
    const { title, subtitle, type, branch, order, isActive } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const content = await WebsiteContent.create({
      title,
      subtitle,
      type,
      branch,
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      imageUrl
    });

    res.status(201).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update website content
 * @route   PUT /api/website-content/:id
 * @access  Private/Admin
 */
exports.updateContent = async (req, res, next) => {
  try {
    let content = await WebsiteContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const { title, subtitle, type, branch, order, isActive } = req.body;
    let imageUrl = content.imageUrl;

    if (req.file) {
      // Option: delete old image from Cloudinary here if desired
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    content = await WebsiteContent.findByIdAndUpdate(req.params.id, {
      title,
      subtitle,
      type,
      branch,
      order: order ? parseInt(order) : content.order,
      isActive: isActive !== undefined ? isActive === 'true' : content.isActive,
      imageUrl
    }, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete website content
 * @route   DELETE /api/website-content/:id
 * @access  Private/Admin
 */
exports.deleteContent = async (req, res, next) => {
  try {
    const content = await WebsiteContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Extract public_id from imageUrl and delete from Cloudinary
    const parts = content.imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    
    try {
      await cloudinary.uploader.destroy(`beauty_beats_content/${publicId}`);
    } catch(e) {
      console.log('Error deleting from cloudinary', e);
    }

    await content.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
