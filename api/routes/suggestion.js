import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({ suggestion: "" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Continue this blog naturally:\n\n${text}`
              }
            ]
          }
        ]
      }
    );

    const suggestion =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ suggestion });
  } catch (err) {
    console.error("GEMINI ERROR:", err.response?.data || err.message);

    // Do NOT break UI
    res.status(200).json({ suggestion: "" });
  }
});

export default router;
