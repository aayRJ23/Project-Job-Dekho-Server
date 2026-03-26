import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Notification } from "../models/notificationSchema.js";

// GET all notifications for the logged-in user (newest first)
export const getMyNotifications = catchAsyncErrors(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50); // Cap at 50 for performance

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
  });
});

// PATCH mark a single notification as read
export const markOneRead = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user._id, // Security: only owner can mark
  });

  if (!notification) {
    return next(new ErrorHandler("Notification not found!", 404));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read.",
  });
});

// PATCH mark all notifications as read for the logged-in user
export const markAllRead = catchAsyncErrors(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});