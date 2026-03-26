import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { Notification } from "../models/notificationSchema.js";
import cloudinary from "cloudinary";
import { emitToUser } from "../server.js";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }
  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  // --- Notify the Employer that someone applied ---
  try {
    const notifForEmployer = await Notification.create({
      recipient: jobDetails.postedBy,
      sender: req.user._id,
      type: "APPLICATION_SUBMITTED",
      message: `${name} has applied for your job "${jobDetails.title}".`,
      meta: {
        jobId: jobDetails._id,
        jobTitle: jobDetails.title,
        applicationId: application._id,
        applicantName: name,
      },
    });
    emitToUser(jobDetails.postedBy, notifForEmployer);

    // --- Also notify the Job Seeker that their application was submitted ---
    const notifForSeeker = await Notification.create({
      recipient: req.user._id,
      sender: jobDetails.postedBy,
      type: "APPLICATION_SUBMITTED",
      message: `Your application for "${jobDetails.title}" has been submitted successfully.`,
      meta: {
        jobId: jobDetails._id,
        jobTitle: jobDetails.title,
        applicationId: application._id,
      },
    });
    emitToUser(req.user._id, notifForSeeker);
  } catch (err) {
    console.error("Notification error (postApplication):", err.message);
  }

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

export const applicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (![0, 1].includes(status)) {
    return next(new ErrorHandler("Invalid status value. Must be 0 or 1.", 400));
  }

  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  application.accepted = status;
  await application.save();

  // --- Notify the Job Seeker about acceptance or rejection ---
  try {
    const isAccepted = status === 1;
    const type = isAccepted ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED";
    const message = isAccepted
      ? `Congratulations! Your application for "${application.meta?.jobTitle || "a job"}" has been accepted.`
      : `Your application has been rejected by the employer.`;

    // Fetch the job title for a better message
    const job = application.meta?.jobId
      ? await Job.findById(application.meta.jobId)
      : null;

    const notif = await Notification.create({
      recipient: application.applicantID.user,
      sender: req.user._id,
      type,
      message: isAccepted
        ? `Congratulations! Your application for "${job ? job.title : "a job"}" has been ACCEPTED. The employer will contact you soon.`
        : `Your application for "${job ? job.title : "a job"}" has been REJECTED.`,
      meta: {
        applicationId: application._id,
        jobId: job ? job._id : undefined,
        jobTitle: job ? job.title : undefined,
      },
    });
    emitToUser(application.applicantID.user, notif);
  } catch (err) {
    console.error("Notification error (applicationStatus):", err.message);
  }

  res.status(200).json({
    success: true,
    message: "Application status updated!",
    application,
  });
});