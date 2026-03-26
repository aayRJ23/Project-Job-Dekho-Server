import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: [
      "NEW_JOB_POSTED",
      "APPLICATION_SUBMITTED",
      "APPLICATION_ACCEPTED",    // accepted + interview scheduled
      "APPLICATION_REJECTED",
      "INTERVIEW_SCHEDULED",     // explicit interview schedule notification
      "FINAL_VERDICT",           // selected / not selected
    ],
    required: true,
  },
  message: { type: String, required: true },
  meta: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    jobTitle: { type: String },
    applicantName: { type: String },
    interviewDate: { type: String },
    interviewTime: { type: String },
    meetLink: { type: String },
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model("Notification", notificationSchema);