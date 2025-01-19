import mongoose, { Schema } from 'mongoose';

/**
 * @userCourseProgressSchema - Mongoose schema for Course.
 */
const userCourseProgressSchema = new Schema(
  {
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
    lecturesProgress: [
      {
        lectureId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        locked: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

const UserCourseProgress = mongoose.model(
  'UserCourseProgress',
  userCourseProgressSchema
);
export default UserCourseProgress;
