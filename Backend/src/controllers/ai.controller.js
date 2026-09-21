import { processChat } from "../services/gemini.service.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const { role, _id: userId } = req.user;

    // Validation
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: "History must be an array",
      });
    }

    // Role check — sirf 3 allowed roles
    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "AI access not available for this role",
      });
    }

    // Process karo
    const { reply, history: updatedHistory, toolsUsed } = await processChat({
      role,
      userId,
      message: message.trim(),
      history,
    });

    return res.status(200).json({
      success: true,
      reply,
      history: updatedHistory,
      toolsUsed,
      user: { id: userId, role },
    });

  } catch (error) {
    console.error("❌ AI Chat Error:", error);

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "AI rate limit reached. Thoda wait karke try karo.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "AI service failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};