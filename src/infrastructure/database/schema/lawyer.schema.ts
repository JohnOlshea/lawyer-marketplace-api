import { pgTable, text, timestamp, pgEnum, integer, primaryKey, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { specializations } from "./specialization.schema";
import { languages } from "./language.schema";

// Application status - tracks admin review status
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",      // Submitted, awaiting admin review
  "approved",     // Verified by admin, lawyer can access full platform
  "rejected",     // Application denied
  "revision",     // Admin requested changes
]);

// Onboarding step - tracks user progress through registration
export const onboardingStepEnum = pgEnum("onboarding_step", [
  "basic_info",          // Step 1: Name, email, phone, country
  "credentials",         // Step 2: Bar admission, education, documents
  "specializations",     // Step 3: Practice areas, languages
  "submitted",           // Step 4: Review and submit (awaiting admin approval)
]);

// Document type for lawyer verification
export const documentTypeEnum = pgEnum("document_type", [
  "bar_certificate",     // Bar admission certificate
  "law_degree",          // Law school diploma
  "professional_id",     // Professional license/ID
  "other",               // Additional certifications
]);

// Specialization type - main vs secondary practice areas
export const specializationTypeEnum = pgEnum("specialization_type", [
  "primary",             // Main practice area (up to 5)
  "secondary",           // Secondary practice area (up to 3)
]);

// ============================================================================
// LAWYERS TABLE - Core lawyer profile information
// ============================================================================
export const lawyers = pgTable("lawyers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Foreign key to Better-Auth user table (1:1 relationship)
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Basic Information (Step 1)
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  country: text("country").notNull(),
  
  // Professional Credentials (Step 2)
  barLicenseNumber: text("bar_license_number"),
  barAssociation: text("bar_association"),              // e.g., "New York State Bar"
  yearOfBarAdmission: integer("year_of_bar_admission"), // Calculated experience from this
  
  // Education (Step 2)
  lawSchool: text("law_school"),                        // e.g., "Harvard Law School"
  graduationYear: integer("graduation_year"),
  
  // Current Practice (Step 2)
  currentFirm: text("current_firm"),                    // Optional - can be solo practitioner
  
  // Onboarding & Application Status
  onboardingStep: onboardingStepEnum("onboarding_step")
    .default("basic_info")
    .notNull(),
  
  applicationStatus: applicationStatusEnum("application_status")
    .default("pending")
    .notNull(),
  
  // Admin review notes (visible to admins only)
  reviewNotes: text("review_notes"),
  
  // Profile completion flag
  profileCompleted: boolean("profile_completed").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// LAWYER DOCUMENTS - Uploaded verification files
// ============================================================================
export const lawyerDocuments = pgTable("lawyer_documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  lawyerId: text("lawyer_id")
    .notNull()
    .references(() => lawyers.id, { onDelete: "cascade" }),
  
  type: documentTypeEnum("type").notNull(),
  
  // Cloudinary file information
  url: text("url").notNull(),                    // Full URL to access the file
  publicId: text("public_id").notNull(),         // Cloudinary public ID (for deletion)
  originalName: text("original_name"),           // Original filename from upload
  fileSize: integer("file_size"),                // File size in bytes
  mimeType: text("mime_type"),                   // e.g., "application/pdf"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// LAWYER SPECIALIZATIONS - Many-to-Many with type distinction
// ============================================================================
export const lawyerSpecializations = pgTable(
  "lawyer_specializations",
  {
    lawyerId: text("lawyer_id")
      .notNull()
      .references(() => lawyers.id, { onDelete: "cascade" }),
    
    specializationId: text("specialization_id")
      .notNull()
      .references(() => specializations.id, { onDelete: "cascade" }),
    
    // Distinguish between primary and secondary specializations
    type: specializationTypeEnum("type").notNull(),
    
    // Years of experience in this specific practice area
    yearsOfExperience: integer("years_of_experience").notNull().default(0),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.lawyerId, table.specializationId] }),
  ]
);

// ============================================================================
// LAWYER LANGUAGES - Many-to-Many
// ============================================================================
export const lawyerLanguages = pgTable(
  "lawyer_languages",
  {
    lawyerId: text("lawyer_id")
      .notNull()
      .references(() => lawyers.id, { onDelete: "cascade" }),
    
    languageId: text("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    
    // Proficiency level (optional for future enhancement)
    proficiency: text("proficiency"),  // e.g., "native", "fluent", "conversational"
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.lawyerId, table.languageId] }),
  ]
);

// ============================================================================
// RELATIONS
// ============================================================================
export const lawyerRelations = relations(lawyers, ({ one, many }) => ({
  user: one(user, {
    fields: [lawyers.userId],
    references: [user.id],
  }),
  documents: many(lawyerDocuments),
  specializations: many(lawyerSpecializations),
  languages: many(lawyerLanguages),
}));

export const lawyerDocumentsRelations = relations(lawyerDocuments, ({ one }) => ({
  lawyer: one(lawyers, {
    fields: [lawyerDocuments.lawyerId],
    references: [lawyers.id],
  }),
}));

export const lawyerSpecializationsRelations = relations(
  lawyerSpecializations,
  ({ one }) => ({
    lawyer: one(lawyers, {
      fields: [lawyerSpecializations.lawyerId],
      references: [lawyers.id],
    }),
    specialization: one(specializations, {
      fields: [lawyerSpecializations.specializationId],
      references: [specializations.id],
    }),
  })
);

export const lawyerLanguagesRelations = relations(
  lawyerLanguages,
  ({ one }) => ({
    lawyer: one(lawyers, {
      fields: [lawyerLanguages.lawyerId],
      references: [lawyers.id],
    }),
    language: one(languages, {
      fields: [lawyerLanguages.languageId],
      references: [languages.id],
    }),
  })
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Lawyer = typeof lawyers.$inferSelect;
export type NewLawyer = typeof lawyers.$inferInsert;

export type LawyerDocument = typeof lawyerDocuments.$inferSelect;
export type NewLawyerDocument = typeof lawyerDocuments.$inferInsert;

export type LawyerSpecialization = typeof lawyerSpecializations.$inferSelect;
export type NewLawyerSpecialization = typeof lawyerSpecializations.$inferInsert;

export type LawyerLanguage = typeof lawyerLanguages.$inferSelect;
export type NewLawyerLanguage = typeof lawyerLanguages.$inferInsert;