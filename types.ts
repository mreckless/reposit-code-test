export type Region = "N.IRELAND" | "WALES" | "ENGLAND" | "SCOTLAND";

export interface Property {
  id: string;
  address: string;
  postcode: string;
  monthlyRentPence: number;
  region: Region;
  capacity: number;
  tenancyEndDate: Date;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
}

export type PropertyStatus =
  | "PROPERTY_VACANT"
  | "PARTIALLY_VACANT"
  | "PROPERTY_ACTIVE"
  | "PROPERTY_OVERDUE";
