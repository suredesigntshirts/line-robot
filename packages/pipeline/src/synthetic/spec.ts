import type { Amenity, DealType, PropertyType, TitleDeedType, Urgency } from "@line-robot/domain";

/**
 * Ground-truth listing spec (§5.1: generated backwards). Every field here is
 * known truth; the generator renders a chat transcript from it, so expected
 * extraction needs no hand-labeling.
 */
export interface ListingSpec {
  /** Stable id — keys the eval case and the seed fixture. */
  id: string;
  dealType: DealType;
  propertyType: PropertyType;
  titleDeedType: TitleDeedType;
  /** Sale price in THB, or monthly rent for dealType=rent. */
  priceThb: number;
  urgency: Urgency;
  province: string;
  amphoe: string;
  tambon: string;
  /** FIELD-06: CNX listings carry a landmark/soi reference. */
  landmark: string;
  lat: number;
  lon: number;
  landRai?: number;
  landNgan?: number;
  landWah?: number;
  floorAreaSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: Amenity[];
  /** Number of photos the poster intends to send. */
  photoCount: number;
  ownerName: string;
  phone: string;
}
