import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Check if the API key is set
if(!OPENAI_API_KEY) {console.error("OPENAI_API_KEY is not set in environment variables"); 
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  const { messages } = req.body;
  
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are a calendar assistant.
        You can:
        - answer questions about events
        - add events to the calendar
        - delete events from the calendar
        
        When the user wants to add an event, respond ONLY with a raw JSON object. No markdown, not extra text.
        You MUST always include both startTime and endTime. If the user does not specify an endTime, set it to 1 hour after the startTime.
        
        Add event(all fields required):
        {
          "action": "add",
          "title": "Event name:"
          date: "YYYY-MM-DD",
          startTime: "HH:MM",
          endTime: "HH:MM"
        }
        When the user wants to delete an event, respond ONLY with a raw JSON object. No markdown, no extra text. Respond ONLY with:
        {
        "action": "delete",
        "title": "Event name:"
        }
        For all other messages, respond in plain text.
      
        Events:
        ${JSON.stringify(events, null, 2)}
        
        User: ${message}`
      }),
    });

      const data = await response.json();

      let reply = "No response from OpenAI";
      if (data.output_text) {
        reply = data.output_text;
      }
      else if (data.output && Array.isArray(data.output)) {
        const texts = data.output.flatMap (o => o.content || [])
        .filter(c => c.type === "output_text")
        .map(c => c.text);
        if (texts.length)
          reply = texts.join("\n");
      }

      res.json({ reply });

  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    res.status(500).json({ error: "Error communicating with OpenAI API" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});