import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { specializations } from './specialization.schema';

export const clients = pgTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number'),
  country: text('country').notNull(),
  state: text('state').notNull(),
  company: text('company'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Many-to-many junction table for client specializations
export const clientSpecializations = pgTable(
  'client_specializations',
  {
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    specializationId: text('specialization_id')
      .notNull()
      .references(() => specializations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.clientId, table.specializationId] })]
);

// Relations
export const clientRelations = relations(clients, ({ one, many }) => ({
  user: one(user, {
    fields: [clients.userId],
    references: [user.id],
  }),
  specializations: many(clientSpecializations),
}));

export const clientSpecializationsRelations = relations(clientSpecializations, ({ one }) => ({
  client: one(clients, {
    fields: [clientSpecializations.clientId],
    references: [clients.id],
  }),
  specialization: one(specializations, {
    fields: [clientSpecializations.specializationId],
    references: [specializations.id],
  }),
}));
