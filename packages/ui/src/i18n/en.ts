import type { th } from "./th.ts";

/** English catalog — must cover exactly the Thai key set (compile-time check). */
export const en: Record<keyof typeof th, string> = {
  "listing.priceAsking": "Asking price",
  "listing.priceMonthly": "Rent/month",
  "listing.negotiable": "Negotiable",
  "listing.pricePerWah": "THB/sq.wah",
  "listing.pricePerSqm": "THB/sqm",
  "listing.photos": "{count} photos",
  "listing.updated": "Updated {date}",
  "listing.postedBy": "Posted by {name}",
  "listing.deedSection": "Title deed",
  "listing.landArea": "Land area",
  "listing.floorArea": "Floor area",
  "listing.bedrooms": "{count} bed",
  "listing.bathrooms": "{count} bath",

  "badge.available": "Available",
  "badge.reserved": "Reserved",
  "badge.urgent": "Urgent sale",
  "badge.verified": "Verified",
  "badge.ownerDirect": "Owner direct",
  "badge.npa": "Bank NPA",
  "badge.deedUnverified": "Deed unverified",
  "badge.forRent": "For rent",
  "badge.forSale": "For sale",

  "cta.chatLine": "Chat on LINE",
  "cta.call": "Call",
  "cta.viewDetail": "View details",
  "cta.share": "Share",

  "filter.all": "All",
  "filter.newVsResale": "New/Resale",
  "filter.npa": "Bank NPA",
  "filter.petFriendly": "Pet friendly",
  "filter.deedType": "Deed type",
  "filter.priceRange": "Price range",
  "filter.clear": "Clear filters",

  "empty.title": "No listings found",
  "empty.why": "Nothing matches your current filters",
  "empty.next": "Try clearing filters or widening the price range",
  "error.title": "Couldn't load data",
  "error.why": "A temporary connection problem",
  "error.retry": "Retry",
};
