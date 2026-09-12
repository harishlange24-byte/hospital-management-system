const OLLAMA_URL = "http://localhost:11434/api/generate";

export const generateAIReponse = async (prompt) => {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "gemma3:1b",
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    console.log("OLLAMA RESPONSE:", data);

    return data.response;
  } catch (error) {
    console.error("AI Service Error:", error);

    throw new Error("AI service is currently unavailable");
  }
};