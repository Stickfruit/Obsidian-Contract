import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

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
          ? "a shopkeeper/bartender working behind the counter inside a city venue"
          : npcRole === "civilian"
            ? "an ordinary city resident walking the streets at night"
            : npcRole === "target"
              ? "a powerful, arrogant syndicate boss overseeing illicit operations"
              : "a street security guard patrolling the district";

      const langName =
        language === "es"
          ? "Spanish"
          : language === "fr"
            ? "French"
            : language === "ja"
              ? "Japanese"
              : "English";

      const contextLines = (history || [])
        .slice(-6)
        .map((h) => `${h.sender === "player" ? "Stranger" : npcName}: ${h.text}`)
        .join("\n");

      const prompt = [
        `You are ${npcName || "City Resident"}, ${roleDescription} in ${zone || "Downtown"}.`,
        `Current city alert/wanted level: ${wantedLevel ?? 0} (0 means the stranger looks like a normal citizen; >0 means violence or gunfire was recently reported).`,
        `The stranger's currently visible gear: ${equippedWeapon || "unarmed"}.`,
        contextLines ? `Recent dialogue:\n${contextLines}` : "",
        `Stranger says: "${playerMessage.trim()}"`,
        `Reply naturally in ${langName} in 1 to 2 concise spoken sentences. Also set mood to "calm", "nervous", "hostile", or "flee".`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            `Stay strictly in character as a gritty, grounded open-world city NPC. Always reply in ${langName}. Keep replies punchy, spoken, and under 30 words.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              mood: { type: Type.STRING },
            },
          },
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim()) as {
        reply?: string;
        mood?: string;
      };

      res.json({
        reply: parsed.reply || "Keep moving, pal. Rough night out there.",
        mood: parsed.mood || "calm",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to generate NPC reply.";
      console.error("NPC chat error:", message);
      res.status(500).json({ error: message });
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
