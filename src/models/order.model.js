import mongoose, { Schema } from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    bank_brand_name: { type: String, required: true },
    account_number: { type: String, required: true },
    transaction_date: { type: Date, required: true },
    amount_out: { type: String, required: true },
    amount_in: { type: String, required: true },
    accumulated: { type: String },
    transaction_content: { type: String, required: true },
    reference_number: { type: String },
    code: { type: String, default: null },
    sub_account: { type: String },
    bank_account_id: { type: String },
    transaction_id: { type: String, required: true },
    order_id: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
