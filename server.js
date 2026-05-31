import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { config } from "dotenv";

config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

app.post("/api/messages", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log("Réponse Anthropic :", JSON.stringify(data, null, 2));
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Proxy Anthropic démarré sur http://localhost:3001");
});
