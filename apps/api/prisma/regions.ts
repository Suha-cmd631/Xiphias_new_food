// Region → countries mapping (ISO-3166 alpha-2). Every country we ship to belongs to exactly one region.
export const REGIONS = [
  { code: "IN", name: "India", currency: "INR", gateway: "jiopay", taxMode: "inclusive", freeShippingAbove: 999, defaultCountry: "IN", priceList: "IN-INR" },
  { code: "EU", name: "Europe", currency: "EUR", gateway: "stripe", taxMode: "dap", freeShippingAbove: 120, defaultCountry: "DE", priceList: "EU-EUR" },
  { code: "UK", name: "United Kingdom", currency: "GBP", gateway: "stripe", taxMode: "dap", freeShippingAbove: 100, defaultCountry: "GB", priceList: "UK-GBP" },
  { code: "US", name: "United States", currency: "USD", gateway: "stripe", taxMode: "exclusive", freeShippingAbove: 120, defaultCountry: "US", priceList: "US-USD" },
  { code: "CA", name: "Canada", currency: "CAD", gateway: "stripe", taxMode: "dap", freeShippingAbove: 160, defaultCountry: "CA", priceList: "CA-CAD" },
  { code: "ME", name: "Middle East", currency: "AED", gateway: "stripe", taxMode: "dap", freeShippingAbove: 450, defaultCountry: "AE", priceList: "ME-AED" },
  { code: "ROW", name: "Rest of world", currency: "USD", gateway: "stripe", taxMode: "dap", freeShippingAbove: 150, defaultCountry: "AU", priceList: "ROW-USD" },
] as const;

export const COUNTRIES: Record<string, [string, string]> = {
  IN: ["India", "IN"],
  // EU-27 + CH, NO
  AT: ["Austria", "EU"], BE: ["Belgium", "EU"], BG: ["Bulgaria", "EU"], HR: ["Croatia", "EU"], CY: ["Cyprus", "EU"],
  CZ: ["Czechia", "EU"], DK: ["Denmark", "EU"], EE: ["Estonia", "EU"], FI: ["Finland", "EU"], FR: ["France", "EU"],
  DE: ["Germany", "EU"], GR: ["Greece", "EU"], HU: ["Hungary", "EU"], IE: ["Ireland", "EU"], IT: ["Italy", "EU"],
  LV: ["Latvia", "EU"], LT: ["Lithuania", "EU"], LU: ["Luxembourg", "EU"], MT: ["Malta", "EU"], NL: ["Netherlands", "EU"],
  PL: ["Poland", "EU"], PT: ["Portugal", "EU"], RO: ["Romania", "EU"], SK: ["Slovakia", "EU"], SI: ["Slovenia", "EU"],
  ES: ["Spain", "EU"], SE: ["Sweden", "EU"], CH: ["Switzerland", "EU"], NO: ["Norway", "EU"],
  GB: ["United Kingdom", "UK"],
  US: ["United States", "US"],
  CA: ["Canada", "CA"],
  AE: ["United Arab Emirates", "ME"], SA: ["Saudi Arabia", "ME"], QA: ["Qatar", "ME"], KW: ["Kuwait", "ME"], BH: ["Bahrain", "ME"], OM: ["Oman", "ME"],
  AU: ["Australia", "ROW"], NZ: ["New Zealand", "ROW"], SG: ["Singapore", "ROW"], MY: ["Malaysia", "ROW"], JP: ["Japan", "ROW"],
  KR: ["South Korea", "ROW"], HK: ["Hong Kong", "ROW"], ZA: ["South Africa", "ROW"], MX: ["Mexico", "ROW"], BR: ["Brazil", "ROW"],
  LK: ["Sri Lanka", "ROW"], NP: ["Nepal", "ROW"], BD: ["Bangladesh", "ROW"], TH: ["Thailand", "ROW"], ID: ["Indonesia", "ROW"],
  PH: ["Philippines", "ROW"], VN: ["Vietnam", "ROW"], IL: ["Israel", "ROW"], TR: ["Türkiye", "ROW"], EG: ["Egypt", "ROW"],
  KE: ["Kenya", "ROW"], NG: ["Nigeria", "ROW"], MU: ["Mauritius", "ROW"], AR: ["Argentina", "ROW"], CL: ["Chile", "ROW"],
};

// Draft landed-price factors: INR → regional currency. Admin edits the real price lists later.
export const FX_FROM_INR: Record<string, number> = { INR: 1, EUR: 1 / 95, GBP: 1 / 108, USD: 1 / 84, CAD: 1 / 61, AED: 1 / 22.9 };
export const LANDED_FACTOR = 1.6;

export const SHIPPING_RULES = [
  { region: "IN", name: "Standard delivery", carrier: "Shiprocket", base: 79, perKg: 20, eta: [3, 6], freeAbove: 999, sort: 0 },
  { region: "IN", name: "Express delivery", carrier: "Shiprocket", base: 149, perKg: 30, eta: [1, 3], freeAbove: null, sort: 1 },
  { region: "IN", name: "Pick up in store (Koramangala)", carrier: "Pickup", base: 0, perKg: 0, eta: [0, 1], freeAbove: null, sort: 2 },
  { region: "EU", name: "DHL Express", carrier: "DHL Express", base: 24.9, perKg: 6, eta: [4, 7], freeAbove: 120, sort: 0 },
  { region: "UK", name: "DHL Express", carrier: "DHL Express", base: 19.9, perKg: 5, eta: [4, 7], freeAbove: 100, sort: 0 },
  { region: "US", name: "DHL Express", carrier: "DHL Express", base: 29.9, perKg: 7, eta: [5, 8], freeAbove: 120, sort: 0 },
  { region: "CA", name: "DHL Express", carrier: "DHL Express", base: 34.9, perKg: 8, eta: [5, 9], freeAbove: 160, sort: 0 },
  { region: "ME", name: "Aramex / DHL", carrier: "Shiprocket X", base: 89, perKg: 18, eta: [3, 6], freeAbove: 450, sort: 0 },
  { region: "ROW", name: "DHL Express", carrier: "DHL Express", base: 34.9, perKg: 9, eta: [6, 12], freeAbove: 150, sort: 0 },
];
