import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-35-turbo";

// ✅ GET endpoint for health check
app.get("/", (req, res) => {
  res.send("👋 Welcome to the Azure OpenAI Chat Server!");
});

// ✅ POST /chat for chat requests
app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: messages || [{ role: "user", content: "Hello!" }],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          "api-key": AZURE_OPENAI_API_KEY || "",
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message;
    res.json(reply);
  } catch (error: any) {
    console.error("Azure OpenAI error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from Azure OpenAI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Azure OpenAI Server running at http://localhost:${PORT}`);
});
