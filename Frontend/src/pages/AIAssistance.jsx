import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { askAI } from "../api/ai.api";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);



  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const { data } = await askAI(userMessage);
       
console.log("AI FRONTEND RESPONSE:", data);
console.log("AI ANSWER:", data.answer); 

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      console.error("AI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "AI service is currently unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-4xl flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          AI Health Assistant
        </h1>

        <p className="text-sm text-slate-500">
          Ask questions about your health or hospital services.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-3 h-12 w-12 text-blue-600" />

              <h2 className="text-lg font-semibold text-slate-800">
                How can I help you?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ask me anything about health or hospital services.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {msg.content}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>

                <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="mt-4 flex gap-3"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </form>
    </div>
  );
}