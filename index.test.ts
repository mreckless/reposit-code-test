import {
  getAverageRentForRegion,
  getMonthlyRentPerTenantForProperty,
  getPropertyIdsWithInvalidPostcodes,
  getPropertyStatus,
} from "./index";
import { PropertyStatus } from "./types";

test("getAverageRentForRegion returns correctly", () => {
  expect(getAverageRentForRegion("ENGLAND")).toBeGreaterThanOrEqual(0);
});

test("getMonthlyRentPerTenantForProperty throws error if property not found", () => {
  expect(() => getMonthlyRentPerTenantForProperty("123")).toThrow(
    "Property not found"
  );
});

test("getMonthlyRentPerTenantForProperty throws error if no tenants", () => {
  expect(() => getMonthlyRentPerTenantForProperty("p_1029")).toThrow(
    "Property has no tenants"
  );
});

test("getMonthlyRentPerTenantForProperty returns correctly if the curreny is pence", () => {
  expect(
    getMonthlyRentPerTenantForProperty("p_1002", "pence")
  ).toBeGreaterThanOrEqual(0);
});

test("getMonthlyRentPerTenantForProperty returns correctly if the curreny is pound", () => {
  expect(
    getMonthlyRentPerTenantForProperty("p_1002", "pound")
  ).toBeGreaterThanOrEqual(0);
});

test("getInvalidPostcodes returns a list of invalid postcodes", () => {
  expect(getPropertyIdsWithInvalidPostcodes().length).toBeGreaterThan(0);
});

test("getInvalidPostcodes returns a list that includes the id of a property wwith an invalid postcode", () => {
  expect(getPropertyIdsWithInvalidPostcodes()).toContain("p_1100");
});

test("getInvalidPostcodes returns a list that does not include the id of a property wwith an valid postcode", () => {
  expect(getPropertyIdsWithInvalidPostcodes()).not.toContain("p_1054");
});

test("getPropertyStatus throws error if property not found", () => {
  expect(() => getPropertyStatus("123")).toThrow("Property not found");
});

test("getPropertyStatus return correctly if no tenants", () => {
  expect(getPropertyStatus("p_1029")).toBe<PropertyStatus>("PROPERTY_VACANT");
});

test("getPropertyStatus return correctly if the current date is after the tenancy end date", () => {
  jest.setSystemTime(new Date("2024-01-01"));
  expect(getPropertyStatus("p_1035")).toBe<PropertyStatus>("PROPERTY_OVERDUE");
});

test("getPropertyStatus return correctly if the number of tenants is less than capacity and the end date has no been reached", () => {
  expect(getPropertyStatus("p_1032")).toBe<PropertyStatus>("PARTIALLY_VACANT");
});

test("getPropertyStatus return correctly if the number of tenants is equal to the capacity and the end date has no been reached", () => {
  expect(getPropertyStatus("p_1004")).toBe<PropertyStatus>("PROPERTY_ACTIVE");
});
