import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  // The user who receives this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The user who triggered the notification (optional)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: [
      "NEW_JOB_POSTED",        // Sent to all Job Seekers when a new job is posted
      "APPLICATION_SUBMITTED", // Sent to Employer when someone applies
      "APPLICATION_ACCEPTED",  // Sent to Job Seeker when their application is accepted
      "APPLICATION_REJECTED",  // Sent to Job Seeker when their application is rejected
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Extra context (jobId, applicationId etc.) for linking
  meta: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    jobTitle: { type: String },
    applicantName: { type: String },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model("Notification", notificationSchema);