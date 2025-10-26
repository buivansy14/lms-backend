import mongoose, { Schema } from 'mongoose';

const translationSchema = new Schema({
  key: { type: String, required: true, unique: true },
  translations: {
    en: { type: String },
    vi: { type: String },
    jp: { type: String },
  },
});

const Translation = mongoose.model('Translation', translationSchema);

export default Translation;
