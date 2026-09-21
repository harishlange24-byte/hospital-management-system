// const OLLAMA_URL = "http://localhost:11434/api/generate";

// export const generateAIReponse = async (prompt) => {
//   try {
//     const response = await fetch(OLLAMA_URL, {
//       method: "POST",

//       headers: {
//         "Content-Type": "application/json",
//       },

//       body: JSON.stringify({
//         model: "gemma3:1b",
//         prompt,
//         stream: false,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Ollama error: ${response.status}`);
//     }

//     const data = await response.json();

//     console.log("OLLAMA RESPONSE:", data);

//     return data.response;
//   } catch (error) {
//     console.error("AI Service Error:", error);

//     throw new Error("AI service is currently unavailable");
//   }
// };

// Backend/src/services/gemini.service.js
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "../ai/prompts/index.js";
import { getRoleTools } from "../ai/tools/index.js";
import dotenv from "dotenv";
dotenv.config();
// Initialize new SDK
const ai = new GoogleGenAI({vertexai: false, apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = "gemini-3.6-flash"; // ✅ Sahi naam
const MAX_TOOL_ITERATIONS = 5;

/**
 * Main chat processor with role-based tools
 */
export const processChat = async ({ role, userId, message, history = [] }) => {
  try {
    // 1. Role-specific setup
    const systemPrompt = getSystemPrompt(role);
    const { functions, implementations } = getRoleTools(role);

    // 2. Build contents (new SDK format)
    const contents = [
      ...history.map((h) => ({
        role: h.role === "model" ? "model" : "user",
        parts: h.parts,
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // 3. Build config
    const config = {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    };

    // Attach tools only if available for this role
    if (functions.length > 0) {
      config.tools = [{ functionDeclarations: functions }];
    }

    // 4. First call to Gemini
    let response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config,
    });

    // 5. Function calling loop
    let iterations = 0;
    while (
      response.functionCalls &&
      response.functionCalls.length > 0 &&
      iterations < MAX_TOOL_ITERATIONS
    ) {
      iterations++;

      // Add model's function-call turn to contents
      contents.push({
        role: "model",
        parts: response.candidates[0].content.parts,
      });

      // Execute each function call
      const functionResponseParts = [];

      for (const call of response.functionCalls) {
        const { name, args } = call;
        const impl = implementations[name];

        let result;
        if (!impl) {
          result = { error: `Tool "${name}" not available for role "${role}"` };
        } else {
          try {
            console.log(`🔧 Tool called: ${name}`, args);
            result = await impl(args, { userId, role });
          } catch (err) {
            console.error(`❌ Tool ${name} failed:`, err);
            result = { error: err.message || "Tool execution failed" };
          }
        }

        functionResponseParts.push({
          functionResponse: {
            name,
            response: { result },
          },
        });
      }

      // ⚠️ IMPORTANT: role "user" use karo (NOT "function")
      contents.push({
        role: "user",
        parts: functionResponseParts,
      });

      // Ask Gemini to interpret tool results
      response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config,
      });
    }

    // 6. Extract final text
    const reply = response.text;

    // 7. Build updated history for frontend
    const updatedHistory = [
      ...history,
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: reply }] },
    ];

    return {
      reply,
      history: updatedHistory,
      toolsUsed: iterations > 0,
    };
  } catch (error) {
    console.error("❌ processChat error:", error);
    throw error;
  }
};