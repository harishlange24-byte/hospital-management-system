import { useState } from "react";
import { askAI } from "../../api/ai.api";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      const response = await askAI(message);

      setAnswer(response.data.answer);
    } catch (error) {
      console.error("AI Error:", error);

      setAnswer(
        error.response?.data?.message ||
          "AI service is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        AI Health Assistant
      </h1>

      <p className="text-gray-600 mb-6">
        Ask questions about health, reports, appointments, or hospital services.
      </p>

      <form onSubmit={handleAskAI} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          rows={4}
          className="w-full border rounded-lg p-3 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      {answer && (
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold mb-2">
            AI Response
          </h2>

          <p className="whitespace-pre-wrap text-gray-700">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;