// Backend/src/ai/tools/admin/implementations/notifications.js
import Notification from "../../../../models/Notification.model.js";
import Patient from "../../../../models/Patient.model.js";
import Doctor from "../../../../models/Doctor.model.js";

export const sendBroadcastNotification = async (
  { audience, title, message },
  { userId }
) => {
  // Audience → recipient list
  let recipients = [];

  if (audience === "all_patients") {
    const patients = await Patient.find().select("_id").lean();
    recipients = patients.map((p) => ({ userId: p._id, role: "patient" }));
  } else if (audience === "all_doctors") {
    const doctors = await Doctor.find().select("_id").lean();
    recipients = doctors.map((d) => ({ userId: d._id, role: "doctor" }));
  } else if (audience === "all") {
    const [patients, doctors] = await Promise.all([
      Patient.find().select("_id").lean(),
      Doctor.find().select("_id").lean(),
    ]);
    recipients = [
      ...patients.map((p) => ({ userId: p._id, role: "patient" })),
      ...doctors.map((d) => ({ userId: d._id, role: "doctor" })),
    ];
  }

  if (recipients.length === 0) {
    return { error: "No recipients found for this audience" };
  }

  // Bulk insert notifications
  const docs = recipients.map((r) => ({
    userId: r.userId,
    role: r.role,
    title,
    message,
    type: "broadcast",
    sentBy: userId,
    read: false,
    createdAt: new Date(),
  }));

  await Notification.insertMany(docs);

  return {
    success: true,
    audience,
    recipientCount: recipients.length,
    title,
    message,
    message2: "Broadcast sent successfully.",
  };
};