// Backend/src/ai/tools/doctor/implementations/schedule.js
import Schedule from "../../../../models/Schedule.model.js";

export const getMySchedule = async ({ filter = "today" }, { userId }) => {
  const now = new Date();
  const query = { doctorId: userId };

  if (filter === "today") {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    query.date = { $gte: start, $lte: end };
  } else if (filter === "week") {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    query.date = { $gte: start, $lte: end };
  }

  const schedules = await Schedule.find(query).sort({ date: 1 }).lean();

  return {
    count: schedules.length,
    schedules: schedules.map((s) => ({
      id: s._id.toString(),
      date: s.date,
      slots: s.slots || [],
      notes: s.notes,
    })),
  };
};