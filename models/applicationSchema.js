import mongoose from "mongoose";
import validator from "validator";

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  coverLetter: {
    type: String,
    required: [true, "Please provide a cover letter!"],
  },
  phone: {
    type: Number,
    required: [true, "Please enter your Phone Number!"],
  },
  address: {
    type: String,
    required: [true, "Please enter your Address!"],
  },
  resume: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  applicantID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, enum: ["Job Seeker"], required: true },
  },
  employerID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, enum: ["Employer"], required: true },
  },
  // -1 = pending, 0 = rejected, 1 = accepted (interview scheduled)
  accepted: {
    type: Number,
    default: -1,
  },
  // Populated when employer accepts and schedules interview
  interview: {
    date: { type: String, default: null },       // e.g. "2026-04-10"
    time: { type: String, default: null },       // e.g. "14:30"
    meetLink: { type: String, default: null },   // Google Meet / Zoom URL
    scheduledAt: { type: Date, default: null },  // server timestamp
  },
  // Set by employer after interview: "selected" | "not_selected" | null
  finalVerdict: {
    type: String,
    enum: ["selected", "not_selected", null],
    default: null,
  },
  // Store jobId + jobTitle so status lookups don't need a join
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    default: null,
  },
  jobTitle: {
    type: String,
    default: null,
  },
});

export const Application = mongoose.model("Application", applicationSchema);