import mongoose from 'mongoose';

const marketplaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: { type: String },
    description: { type: String },
    version: { type: String },
    size: { type: String },
    typeFile: { type: String },
    price: { type: Number, default: 0 },
    demoUrl: { type: String },
    downloadUrl: { type: String },
    installationGuide: { type: String },
    image: { type: String },
    images: [{ type: String }],
    tags: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    downloads: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Marketplace', marketplaceSchema);
