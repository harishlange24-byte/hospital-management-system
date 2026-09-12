import { generateAIReponse } from "../services/ai.service.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is Required",
      });
    }

    const prompt = `
You are a helpful hospital information assistant.

Answer the user's question clearly and simply.

Important:
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not replace a doctor.
- If the question requires medical diagnosis or treatment, advise the user to consult a qualified doctor.

User question:
${message}
`;

    const answer = await generateAIReponse(prompt);

    console.log("FINAL AI ANSWER:", answer);

    return res.status(200).json({
      success: true,
      answer,
    });
  } catch (err) {
    console.error("AI Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "AI service error",
    });
  }
};