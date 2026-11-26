import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";

const ttsCache = new Map<string, string>();

let cachedAi: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return cachedAi;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    );
    res.json({ ok: true, ttsReady: hasKey, aiChatReady: hasKey });
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName, style } = req.body as {
        text?: string;
        voiceName?: string;
        style?: string;
      };

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        res.status(400).json({ error: "Missing text for speech synthesis." });
        return;
      }

      const safeVoice = voiceName || "Fenrir";
      const safeStyle = style || "Calm, cinematic delivery";
      const cacheKey = `${safeVoice}|${safeStyle}|${text.trim()}`;

      const hit = ttsCache.get(cacheKey);
      if (hit) {
        res.json({ audioBase64: hit, mimeType: "audio/wav", cached: true });
        return;
      }

      const ai = getGenAI();
      if (!ai) {
        res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server.",
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: safeStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: safeVoice },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        res.status(502).json({
          error: "TTS model returned no audio data.",
        });
        return;
      }

      ttsCache.set(cacheKey, base64Audio);
      res.json({
        audioBase64: base64Audio,
        mimeType: "audio/wav",
        cached: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to synthesize speech.";
      console.error("TTS error:", message);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/npc-chat", async (req, res) => {
    try {
      const {
        npcName,
        npcRole,
        zone,
        wantedLevel,
        equippedWeapon,
        language,
        playerMessage,
        history,
      } = req.body as {
        npcName?: string;
        npcRole?: string;
        zone?: string;
        wantedLevel?: number;
        equippedWeapon?: string;
        language?: string;
        playerMessage?: string;
        history?: Array<{ sender: string; text: string }>;
      };

      if (!playerMessage || typeof playerMessage !== "string") {
        res.status(400).json({ error: "Missing player message." });
        return;
      }

      const ai = getGenAI();
      if (!ai) {
        res.status(503).json({
          error: "GEMINI_API_KEY is not configured for NPC conversations.",
        });
        return;
      }

      const roleDescription =
        npcRole === "clerk"
          ? "shopkeeper/bartender"
          : npcRole === "civilian"
            ? "city resident"
            : npcRole === "target"
              ? "arrogant syndicate boss"
              : npcRole === "police"
                ? "police officer"
                : "street guard";

      const langName =
        language === "es"
          ? "Spanish"
          : language === "fr"
            ? "French"
            : language === "ja"
              ? "Japanese"
              : "English";

      const contextLines = (history || [])
        .slice(-3)
        .map((h) => `${h.sender === "player" ? "Player" : "NPC"}: ${h.text}`)
        .join("\n");

      const prompt = [
        `NPC: ${npcName || "Resident"} (${roleDescription}) in ${zone || "Downtown"}. Wanted=${wantedLevel ?? 0}, Gear=${equippedWeapon || "unarmed"}.`,
        contextLines ? `Recent:\n${contextLines}` : "",
        `Player: "${playerMessage.trim()}"`,
        `Output format: [mood] reply. Mood must be one of calm, nervous, hostile, flee. Reply in ${langName}, 1 short spoken sentence (<22 words).`,
      ]
        .filter(Boolean)
        .join("\n");

      const parseTaggedReply = (raw: string) => {
        const trimmed = raw.trim();
        const match = /^\[(calm|nervous|hostile|flee)\]\s*(.*)$/is.exec(trimmed);
        if (match) {
          return {
            mood: match[1].toLowerCase(),
            reply:
              match[2].trim() || "Keep moving, pal. Rough night out there.",
          };
        }
        return {
          mood: "calm",
          reply: trimmed || "Keep moving, pal. Rough night out there.",
        };
      };

      const wantStream = req.query.stream === "1";

      if (wantStream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        let fullText = "";
        const stream = await ai.models.generateContentStream({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: `Stay in character as a street-level open-world city NPC. Always start with [calm], [nervous], [hostile], or [flee], then 1 concise spoken sentence in ${langName}.`,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });

        for await (const chunk of stream) {
          const piece = chunk.text ?? "";
          if (!piece) continue;
          fullText += piece;
          const partial = parseTaggedReply(fullText);
          res.write(
            `data: ${JSON.stringify({
              partial: partial.reply,
              mood: partial.mood,
              done: false,
            })}\n\n`,
          );
        }

        const finalResult = parseTaggedReply(fullText);
        res.write(
          `data: ${JSON.stringify({
            reply: finalResult.reply,
            mood: finalResult.mood,
            done: true,
          })}\n\n`,
        );
        res.end();
        return;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          systemInstruction: `Stay in character as a street-level open-world city NPC. Always start with [calm], [nervous], [hostile], or [flee], then 1 concise spoken sentence in ${langName}.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const result = parseTaggedReply(response.text ?? "");
      res.json(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to generate NPC reply.";
      console.error("NPC chat error:", message);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: message });
      }
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      const indexHtml = path.join(distDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send("Build artifacts not found.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Obsidian Contract server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
