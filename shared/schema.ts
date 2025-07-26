import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const highScores = pgTable("high_scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  gameTime: integer("game_time").notNull(), // in seconds
  snakeLength: integer("snake_length").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHighScoreSchema = createInsertSchema(highScores).pick({
  playerName: true,
  score: true,
  gameTime: true,
  snakeLength: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type HighScore = typeof highScores.$inferSelect;
export type InsertHighScore = z.infer<typeof insertHighScoreSchema>;
