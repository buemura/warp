import { bigint, bigserial, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const fileMetadata = pgTable("file_metadata", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  short_id: text("short_id").notNull().unique(),
  original_filename: text("original_filename").notNull(),
  stored_filename: text("stored_filename").notNull(),
  content_type: text("content_type").notNull(),
  file_size: bigint("file_size", { mode: "number" }).notNull(),
  password_hash: text("password_hash"),
  max_access_count: integer("max_access_count"),
  access_count: integer("access_count").notNull().default(0),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  ip_address: text("ip_address"),
  removed_at: timestamp("removed_at", { withTimezone: true }),
});
