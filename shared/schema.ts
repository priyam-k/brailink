import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  editedText: text("edited_text").notNull(),
  status: text("status").notNull().default("pending"),
  isProcessed: boolean("is_processed").notNull().default(false),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  sourceText: true,
  editedText: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
