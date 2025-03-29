import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { Property, PropertyStatus, Region, Tenant } from "./types";

const POSTCODE_REGEX =
  /^(([A-Z][A-HJ-Y]?\d[A-Z\d]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?\d[A-Z]{2}|BFPO ?\d{1,4}|(KY\d|MSR|VG|AI)[ -]?\d{4}|[A-Z]{2} ?\d{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/gi;

const propertiesCsvFilePath = path.resolve(
  __dirname,
  "files/properties-september-2024.csv"
);
const propertiesFileContent = fs.readFileSync(propertiesCsvFilePath, {
  encoding: "utf-8",
});
export const properties: Property[] = parse(propertiesFileContent, {
  delimiter: ",",
  columns: true,
  cast: (value, context) => {
    if (context.column === "monthlyRentPence") {
      return Number(value);
    }
    if (context.column === "tenancyEndDate") {
      return new Date(value);
    }
    return value;
  },
});

const tenantsCsvFilePath = path.resolve(
  __dirname,
  "files/tenants-september-2024.csv"
);
const tenantsFileContent = fs.readFileSync(tenantsCsvFilePath, {
  encoding: "utf-8",
});
export const tenants: Tenant[] = parse(tenantsFileContent, {
  delimiter: ",",
  columns: true,
});

export const getAverageRentForRegion = (region: Region): number => {
  let numberOfPropertiesInRegion = 0;
  const totalRentInRegion = properties.reduce((total, property) => {
    if (property.region === region) {
      numberOfPropertiesInRegion += 1;
      return total + property.monthlyRentPence;
    }
    return total;
  }, 0);

  return Math.ceil(totalRentInRegion / numberOfPropertiesInRegion);
};

export const getMonthlyRentPerTenantForProperty = (
  propertyId: string,
  currency: "pence" | "pound" = "pence"
): number => {
  const property = properties.find((property) => property.id === propertyId);
  if (!property) {
    throw new Error("Property not found");
  }

  const numberOfTenants = tenants.filter(
    (tenant) => tenant.propertyId === propertyId
  ).length;
  if (!numberOfTenants) {
    throw new Error("Property has no tenants");
  }

  const monthlyRentPerTenant = property.monthlyRentPence / numberOfTenants;

  return currency === "pence"
    ? monthlyRentPerTenant
    : monthlyRentPerTenant / 100;
};

export const getPropertyIdsWithInvalidPostcodes = (): string[] => {
  return properties.reduce((current: string[], property) => {
    if (!POSTCODE_REGEX.test(property.postcode)) {
      current.push(property.id);
    }
    return current;
  }, []);
};

export const getPropertyStatus = (propertyId: string): PropertyStatus => {
  const property = properties.find((property) => property.id === propertyId);
  if (!property) {
    throw new Error("Property not found");
  }

  const numberOfTenants = tenants.filter(
    (tenant) => tenant.propertyId === propertyId
  ).length;

  if (!numberOfTenants) {
    return "PROPERTY_VACANT";
  }

  if (new Date() >= property.tenancyEndDate) {
    return "PROPERTY_OVERDUE";
  }

  if (numberOfTenants < property.capacity) {
    return "PARTIALLY_VACANT";
  }

  return "PROPERTY_ACTIVE";
};

// Edit below

console.log("Average rent for England:", getAverageRentForRegion("ENGLAND"));
console.log(
  "Average rent for N.Ireland:",
  getAverageRentForRegion("N.IRELAND")
);
console.log("Average rent for Scotland:", getAverageRentForRegion("SCOTLAND"));
console.log("Average rent for Wales:", getAverageRentForRegion("WALES"));

console.log(
  "Monthly rent per tenant in pence:",
  getMonthlyRentPerTenantForProperty("p_1002")
);
console.log(
  "Monthly rent per tenant in pounds:",
  getMonthlyRentPerTenantForProperty("p_1002", "pound")
);

console.log(
  "Property ids with invalid postcodes: ",
  getPropertyIdsWithInvalidPostcodes()
);

console.log("Property status:", getPropertyStatus("p_1002"));
