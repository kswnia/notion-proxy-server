// server.mjs

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000; // Always use dynamic PORT for Render

app.use(cors());
app.use(express.json());

// Handle POST to /notion
app.post("/notion", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Missing title or content" });
    }

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: {
            title: [
              {
                text: { content: title },
              },
            ],
          },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    const data = await notionResponse.json();
    res.status(notionResponse.status).json(data);
  } catch (error) {
    console.error("Error proxying to Notion:", error);
    res.status(500).json({ error: "Internal Proxy Error" });
  }
});

// Proper binding for Render (MUST bind 0.0.0.0)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});
