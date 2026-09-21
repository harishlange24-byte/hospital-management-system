// backend/src/ai/tools/patient/implementations/doctors.js
import Doctor from "../../../../models/Doctor.model.js";
import Schedule from "../../../../models/Schedule.model.js";
import Appointment from "../../../../models/Appointment.model.js";

export const listDoctors = async ({ specialization } = {}) => {
  const query = {};
  if (specialization) query.specialization = { $regex: specialization, $options: "i" };

  const doctors = await Doctor.find(query)
    .select("name specialization consultationFee")
    .limit(20)
    .lean();

  return {
    count: doctors.length,
    doctors: doctors.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      specialization: d.specialization,
      fee: d.consultationFee,
    })),
  };
};

export const getAvailableSlots = async ({ doctorName, date }) => {
  const doctor = await Doctor.findOne({ name: { $regex: doctorName, $options: "i" } }).lean();
  if (!doctor) return { error: `Doctor "${doctorName}" not found` };

  const booked = await Appointment.find({
    doctorId: doctor._id,
    date: {
      $gte: new Date(date + "T00:00:00"),
      $lt: new Date(date + "T23:59:59"),
    },
    status: { $ne: "cancelled" },
  }).select("time").lean();

  const bookedTimes = booked.map((b) => b.time);

  // Tera Schedule model kaisa hai? Agar `day` + `slots` hai to ye chalega.
  // Agar weekly format alag hai to bata, adjust karta hun.
  const schedule = await Schedule.findOne({
    doctorId: doctor._id,
    date: {
      $gte: new Date(date + "T00:00:00"),
      $lt: new Date(date + "T23:59:59"),
    },
  }).lean();

  if (!schedule || !schedule.slots) {
    return {
      doctor: doctor.name,
      date,
      availableSlots: [],
      message: "Doctor is not available on this date",
    };
  }

  const available = schedule.slots.filter((s) => !bookedTimes.includes(s));

  return {
    doctorId: doctor._id.toString(),
    doctor: doctor.name,
    date,
    availableSlots: available,
  };
};