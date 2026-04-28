import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/api/chat", async (req, res) => {
  try {
    console.log("hit /api/chat");
    console.log("body:", req.body);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const userMessage = req.body?.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Missing message" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
    });

    res.json({
      reply: response.text || "No response returned.",
    });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});