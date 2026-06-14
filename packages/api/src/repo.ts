import {
  addListingNote,
  type ClaimResult,
  claimListing,
  createUserWithIdentity,
  createViewing,
  type Db,
  findUserByIdentity,
  getPortalListingDetail,
  isGroupMember,
  keepListingPrivate,
  type ListingNoteRow,
  listMyListings,
  listNotesForUserListing,
  listSavedListingsForUser,
  listViewingsForUser,
  type MyListingCard,
  type PortalListingDetail,
  publishListing,
  type SavedListingCard,
  saveListing,
  type UserRow,
  unsaveListing,
  updateListingFields,
  updateRentalMonthlyRent,
  type ViewingCard,
  type ViewingRow,
} from "@line-robot/db";

// The DB seam for the handler. DB is a real seam (named alongside LLM/LINE in the project rules), so a
// port here is justified — and it's what lets the handler unit-test against a fake db with no Postgres.
// Every member is just the matching @line-robot/db public-barrel function with its leading `db` bound;
// the handler reads/writes the catalog ONLY through this (never a deep import of schema.ts or another
// package's internals). `realRepo(db)` is the production binding.
export interface Repo {
  findUserByIdentity(provider: "line", subject: string): Promise<UserRow | undefined>;
  createLineUser(displayName: string, subject: string): Promise<UserRow>;
  getPortalListingDetail(id: string): Promise<PortalListingDetail | undefined>;
  isGroupMember(groupId: string | null, userId: string): Promise<boolean>;
  listMyListings(userId: string): Promise<MyListingCard[]>;
  claimListing(listingId: string, userId: string): Promise<ClaimResult>;
  publishListing(listingId: string, userId: string, consentVersion: string): Promise<void>;
  keepListingPrivate(listingId: string): Promise<void>;
  updateListingFields(id: string, patch: Record<string, unknown>): Promise<void>;
  updateRentalMonthlyRent(id: string, monthlyRent: number): Promise<void>;
  listSavedListingsForUser(userId: string): Promise<SavedListingCard[]>;
  saveListing(listingId: string, userId: string): Promise<void>;
  unsaveListing(listingId: string, userId: string): Promise<void>;
  listViewingsForUser(
    userId: string,
    now: Date,
  ): Promise<{ upcoming: ViewingCard[]; past: ViewingCard[] }>;
  createViewing(listingId: string, userId: string, scheduledAt: Date): Promise<ViewingRow>;
  listNotesForUserListing(listingId: string, userId: string): Promise<ListingNoteRow[]>;
  addListingNote(listingId: string, userId: string, body: string): Promise<ListingNoteRow>;
}

/** Bind every repo function to a live `Db` handle (the production {@link Repo}). */
export function realRepo(db: Db): Repo {
  return {
    findUserByIdentity: (provider, subject) => findUserByIdentity(db, provider, subject),
    createLineUser: (displayName, subject) =>
      createUserWithIdentity(
        db,
        { displayName },
        { provider: "line", providerSubject: subject, verifiedAt: new Date() },
      ),
    getPortalListingDetail: (id) => getPortalListingDetail(db, id),
    isGroupMember: (groupId, userId) => isGroupMember(db, groupId, userId),
    listMyListings: (userId) => listMyListings(db, userId),
    claimListing: (listingId, userId) => claimListing(db, listingId, userId),
    publishListing: (listingId, userId, consentVersion) =>
      publishListing(db, listingId, userId, consentVersion),
    keepListingPrivate: (listingId) => keepListingPrivate(db, listingId),
    updateListingFields: (id, patch) => updateListingFields(db, id, patch),
    updateRentalMonthlyRent: (id, monthlyRent) => updateRentalMonthlyRent(db, id, monthlyRent),
    listSavedListingsForUser: (userId) => listSavedListingsForUser(db, userId),
    saveListing: (listingId, userId) => saveListing(db, listingId, userId),
    unsaveListing: (listingId, userId) => unsaveListing(db, listingId, userId),
    listViewingsForUser: (userId, now) => listViewingsForUser(db, userId, now),
    createViewing: (listingId, userId, scheduledAt) =>
      createViewing(db, listingId, userId, scheduledAt),
    listNotesForUserListing: (listingId, userId) => listNotesForUserListing(db, listingId, userId),
    addListingNote: (listingId, userId, body) => addListingNote(db, listingId, userId, body),
  };
}
