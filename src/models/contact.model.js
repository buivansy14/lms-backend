import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên người liên hệ là bắt buộc'],
      trim: true,
      minLength: [2, 'Tên phải có ít nhất 2 ký tự'],
      maxLength: [100, 'Tên không được quá 100 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Email không hợp lệ',
      ],
    },
    message: {
      type: String,
      required: [true, 'Nội dung tin nhắn là bắt buộc'],
      trim: true,
      minLength: [3, 'Nội dung tin nhắn phải có ít nhất 3 ký tự'],
      maxLength: [2000, 'Nội dung tin nhắn không được quá 2000 ký tự'],
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'REPLIED'],
      default: 'UNREAD',
    },
  },
  {
    timestamps: true,
  }
);

const Contact = model('Contact', contactSchema);

export default Contact;
