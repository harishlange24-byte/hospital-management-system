import api from "./axios";

export const askAI=(message)=>{
    return api.post("api/ai/chat",{
        message,
    });
}