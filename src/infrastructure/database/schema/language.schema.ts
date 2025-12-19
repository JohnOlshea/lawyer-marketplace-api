import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

// ============================================================================
// LANGUAGES TABLE - Master data for supported languages
// ============================================================================
export const languages = pgTable("languages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Language name in English
  name: text("name").notNull().unique(),  // e.g., "English", "Spanish", "French"
  
  // ISO 639-1 language code
  code: text("code").notNull().unique(),  // e.g., "en", "es", "fr"
  
  // Native name of the language
  nativeName: text("native_name"),        // e.g., "Español", "Français"
  
  // Whether this language is active on the platform
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;