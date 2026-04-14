export {
  normalizeAirconType,
  matchAirconTypeFromText,
  batchNormalizeAirconTypes,
  getKeywordsForType,
  getMappingCoverage,
  addCustomKeywords,
} from "./aircon-type-normalizer";

export type {
  NormalizationResult,
  BatchNormalizationResult,
} from "./aircon-type-normalizer";

export {
  normalizeCleaningType,
  matchCleaningTypeFromText,
  batchNormalizeCleaningTypes,
  getCleaningKeywordsForType,
  getCleaningMappingCoverage,
  addCleaningCustomKeywords,
} from "./cleaning-type-normalizer";

export type {
  CleaningTypeNormalizationResult,
  BatchCleaningTypeResult,
} from "./cleaning-type-normalizer";

export {
  normalizePrice,
  parseKoreanPrice,
  detectVatStatus,
  applyVat,
  isPriceInValidRange,
  batchNormalizePrices,
  parsePriceForEntry,
} from "./price-normalizer";

export type {
  PriceNormalizationResult,
  VatStatus,
  BatchPriceNormalizationResult,
} from "./price-normalizer";

export {
  normalizeRegion,
  matchRegionFromText,
  batchNormalizeRegions,
  getAliasesForDistrict,
  getRegionMappingCoverage,
  addRegionCustomAliases,
  normalizeRegionWithGyeonggiContext,
} from "./region-normalizer";

export type {
  RegionNormalizationResult,
  BatchRegionNormalizationResult,
} from "./region-normalizer";
