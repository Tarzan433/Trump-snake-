import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHighScoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get top high scores
  app.get("/api/high-scores", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const scores = await storage.getTopScores(limit);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch high scores" });
    }
  });

  // Add new high score
  app.post("/api/high-scores", async (req, res) => {
    try {
      const validatedData = insertHighScoreSchema.parse(req.body);
      const newScore = await storage.addHighScore(validatedData);
      res.json(newScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid score data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save high score" });
      }
    }
  });

  // Get player's best score
  app.get("/api/high-scores/player/:playerName", async (req, res) => {
    try {
      const { playerName } = req.params;
      const bestScore = await storage.getPlayerBestScore(playerName);
      res.json(bestScore || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player best score" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
