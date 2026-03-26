import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { Notification } from "../models/notificationSchema.js";
import cloudinary from "cloudinary";
import { emitToUser } from "../server.js";

// ─── POST APPLICATION ────────────────────────────────────────────────────────
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(new ErrorHandler("Invalid file type. Please upload a PNG file.", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = { user: req.user._id, role: "Job Seeker" };

  if (!jobId) return next(new ErrorHandler("Job not found!", 404));
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) return next(new ErrorHandler("Job not found!", 404));

  const employerID = { user: jobDetails.postedBy, role: "Employer" };

  if (!name || !email || !coverLetter || !phone || !address || !resume) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const application = await Application.create({
    name, email, coverLetter, phone, address,
    applicantID, employerID,
    resume: { public_id: cloudinaryResponse.public_id, url: cloudinaryResponse.secure_url },
    jobId: jobDetails._id,
    jobTitle: jobDetails.title,
  });

  // Notify employer
  try {
    const notifForEmployer = await Notification.create({
      recipient: jobDetails.postedBy,
      sender: req.user._id,
      type: "APPLICATION_SUBMITTED",
      message: `${name} has applied for your job "${jobDetails.title}".`,
      meta: { jobId: jobDetails._id, jobTitle: jobDetails.title, applicationId: application._id, applicantName: name },
    });
    emitToUser(jobDetails.postedBy, notifForEmployer);

    const notifForSeeker = await Notification.create({
      recipient: req.user._id,
      sender: jobDetails.postedBy,
      type: "APPLICATION_SUBMITTED",
      message: `Your application for "${jobDetails.title}" has been submitted successfully.`,
      meta: { jobId: jobDetails._id, jobTitle: jobDetails.title, applicationId: application._id },
    });
    emitToUser(req.user._id, notifForSeeker);
  } catch (err) {
    console.error("Notification error (postApplication):", err.message);
  }

  res.status(200).json({ success: true, message: "Application Submitted!", application });
});

// ─── EMPLOYER GET ALL APPLICATIONS ───────────────────────────────────────────
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }
  const applications = await Application.find({ "employerID.user": req.user._id });
  res.status(200).json({ success: true, applications });
});

// ─── JOB SEEKER GET ALL APPLICATIONS ─────────────────────────────────────────
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  const applications = await Application.find({ "applicantID.user": req.user._id });
  res.status(200).json({ success: true, applications });
});

// ─── JOB SEEKER DELETE APPLICATION ───────────────────────────────────────────
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  const application = await Application.findById(req.params.id);
  if (!application) return next(new ErrorHandler("Application not found!", 404));
  await application.deleteOne();
  res.status(200).json({ success: true, message: "Application Deleted!" });
});

// ─── APPLICATION STATUS (ACCEPT / REJECT) ────────────────────────────────────
// Now: if accepting, also expects { date, time, meetLink } in body.
// The "accept" action = accept + schedule interview in one shot (your approach).
export const applicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, date, time, meetLink } = req.body;

  if (![0, 1].includes(status)) {
    return next(new ErrorHandler("Invalid status value. Must be 0 or 1.", 400));
  }

  const application = await Application.findById(id);
  if (!application) return next(new ErrorHandler("Application not found!", 404));

  // If accepting, interview fields are required
  if (status === 1 && (!date || !time || !meetLink)) {
    return next(new ErrorHandler("Please provide interview date, time, and meet link.", 400));
  }

  application.accepted = status;

  if (status === 1) {
    application.interview = {
      date,
      time,
      meetLink,
      scheduledAt: new Date(),
    };
  }

  await application.save();

  // Notify job seeker
  try {
    const job = application.jobId ? await Job.findById(application.jobId) : null;
    const jobTitle = job ? job.title : application.jobTitle || "a job";

    let notifType, notifMsg;
    if (status === 1) {
      notifType = "APPLICATION_ACCEPTED";
      notifMsg = `🎉 Your application for "${jobTitle}" was accepted! Interview scheduled on ${date} at ${time}. Meet link: ${meetLink}`;
    } else {
      notifType = "APPLICATION_REJECTED";
      notifMsg = `Your application for "${jobTitle}" has been rejected by the employer.`;
    }

    const notif = await Notification.create({
      recipient: application.applicantID.user,
      sender: req.user._id,
      type: notifType,
      message: notifMsg,
      meta: {
        applicationId: application._id,
        jobId: application.jobId,
        jobTitle,
        ...(status === 1 && { interviewDate: date, interviewTime: time, meetLink }),
      },
    });
    emitToUser(application.applicantID.user, notif);
  } catch (err) {
    console.error("Notification error (applicationStatus):", err.message);
  }

  res.status(200).json({ success: true, message: "Application status updated!", application });
});

// ─── SET FINAL VERDICT (selected / not_selected) ─────────────────────────────
export const setFinalVerdict = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Employer") {
    return next(new ErrorHandler("Only employers can set final verdict.", 403));
  }

  const { id } = req.params;
  const { verdict } = req.body; // "selected" | "not_selected"

  if (!["selected", "not_selected"].includes(verdict)) {
    return next(new ErrorHandler("Invalid verdict. Must be 'selected' or 'not_selected'.", 400));
  }

  const application = await Application.findById(id);
  if (!application) return next(new ErrorHandler("Application not found!", 404));

  if (application.accepted !== 1) {
    return next(new ErrorHandler("Interview must be scheduled before setting a final verdict.", 400));
  }

  application.finalVerdict = verdict;
  await application.save();

  // Notify job seeker
  try {
    const jobTitle = application.jobTitle || "a job";
    const msg =
      verdict === "selected"
        ? `🎊 Congratulations! You have been SELECTED for "${jobTitle}". The employer will contact you soon!`
        : `We regret to inform you that you were not selected for "${jobTitle}" after the interview.`;

    const notif = await Notification.create({
      recipient: application.applicantID.user,
      sender: req.user._id,
      type: "FINAL_VERDICT",
      message: msg,
      meta: { applicationId: application._id, jobId: application.jobId, jobTitle },
    });
    emitToUser(application.applicantID.user, notif);
  } catch (err) {
    console.error("Notification error (setFinalVerdict):", err.message);
  }

  res.status(200).json({ success: true, message: "Final verdict set!", application });
});