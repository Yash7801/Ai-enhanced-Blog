import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          { 
            parts: [ 
              { text: text } 
            ] 
          }
        ]
      }
    );

    const suggestion =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ suggestion });
  } catch (err) {
    console.log("GEMINI ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "AI suggestion error" });
  }
});

export default router;
