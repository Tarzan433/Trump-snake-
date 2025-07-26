import { users, highScores, type User, type InsertUser, type HighScore, type InsertHighScore } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // High score methods
  getTopScores(limit?: number): Promise<HighScore[]>;
  addHighScore(score: InsertHighScore): Promise<HighScore>;
  getPlayerBestScore(playerName: string): Promise<HighScore | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTopScores(limit: number = 10): Promise<HighScore[]> {
    const scores = await db
      .select()
      .from(highScores)
      .orderBy(desc(highScores.score))
      .limit(limit);
    return scores;
  }

  async addHighScore(insertScore: InsertHighScore): Promise<HighScore> {
    const [score] = await db
      .insert(highScores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getPlayerBestScore(playerName: string): Promise<HighScore | undefined> {
    const [score] = await db
      .select()
      .from(highScores)
      .where(eq(highScores.playerName, playerName))
      .orderBy(desc(highScores.score))
      .limit(1);
    return score || undefined;
  }
}

export const storage = new DatabaseStorage();
