import { listingPricePolicy } from "@/domain/listing/listing";
import {
  pricingSuggestionSchema,
  type PricingSuggestion,
  type PricingSuggestionBasis
} from "@/shared/contracts/pricing-suggestion";

export const pricingPolicy = listingPricePolicy;

type BuildPricingBasisInput = {
  title: string;
  category: string;
  keySpecificationsText: string;
};

export type PriceValidationResult =
  | {
      ok: true;
      priceKrw: number;
    }
  | {
      ok: false;
      message: string;
      recoveryGuide: string;
    };

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function fnv1a64(input: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = (1n << 64n) - 1n;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= BigInt(input.charCodeAt(index));
    hash = (hash * prime) & mask;
  }

  return hash.toString(16).padStart(16, "0");
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

export function parseKeySpecificationsText(value: string): string[] {
  return value
    .split(/\r?\n/u)
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

export function buildPricingSuggestionBasis(
  input: BuildPricingBasisInput
): PricingSuggestionBasis {
  const basisWithoutRevision = {
    title: normalizeText(input.title),
    category: normalizeText(input.category),
    keySpecifications: parseKeySpecificationsText(input.keySpecificationsText)
  };

  return {
    ...basisWithoutRevision,
    basisRevision: `basis-${fnv1a64(stableStringify(basisWithoutRevision))}`
  };
}

function roundToStep(priceKrw: number): number {
  return Math.max(
    pricingPolicy.stepKrw,
    Math.round(priceKrw / pricingPolicy.stepKrw) * pricingPolicy.stepKrw
  );
}

export function buildPricingSuggestion(
  basis: PricingSuggestionBasis
): PricingSuggestion | null {
  if (!basis.title || !basis.category || basis.keySpecifications.length === 0) {
    return null;
  }

  const joinedBasis = `${basis.title} ${basis.category} ${basis.keySpecifications.join(
    " "
  )}`.toLowerCase();
  let basePriceKrw = 280_000;

  if (/노트북|맥북|macbook|m3|m4/u.test(joinedBasis)) {
    basePriceKrw = 1_240_000;
  } else if (/카메라|camera|셔터|렌즈/u.test(joinedBasis)) {
    basePriceKrw = 880_000;
  } else if (/게임|콘솔|playstation|switch|ps5/u.test(joinedBasis)) {
    basePriceKrw = 420_000;
  } else if (/휴대폰|스마트폰|iphone|아이폰/u.test(joinedBasis)) {
    basePriceKrw = 720_000;
  }

  const suggestedPriceKrw = roundToStep(basePriceKrw);
  const minPriceKrw = Math.max(
    pricingPolicy.minPriceKrw,
    roundToStep(suggestedPriceKrw * 0.9)
  );
  const maxPriceKrw = Math.min(
    pricingPolicy.maxPriceKrw,
    roundToStep(suggestedPriceKrw * 1.1)
  );
  const confidence = basis.keySpecifications.length >= 2 ? 0.74 : 0.48;
  const rationale =
    confidence >= 0.6
      ? `${basis.category}와 핵심 스펙 ${basis.keySpecifications.length}개를 기준으로 산출했습니다.`
      : "근거가 부족해 수동 가격 확인을 우선 권장합니다.";

  return pricingSuggestionSchema.parse({
    suggestedPriceKrw,
    minPriceKrw,
    maxPriceKrw,
    confidence,
    rationale,
    basis
  });
}

export function normalizePriceInput(value: string): string {
  return value.replace(/,/gu, "").trim();
}

export function validatePriceInput(value: string): PriceValidationResult {
  const normalized = normalizePriceInput(value);

  if (!normalized) {
    return {
      ok: false,
      message: "가격을 입력해 주세요.",
      recoveryGuide: "1원 이상, 1,000원 단위의 숫자로 입력해 주세요."
    };
  }

  if (!/^\d+$/u.test(normalized)) {
    return {
      ok: false,
      message: "가격은 숫자만 입력해 주세요.",
      recoveryGuide: "쉼표나 문자를 제외하고 숫자로만 다시 입력해 주세요."
    };
  }

  const priceKrw = Number.parseInt(normalized, 10);

  if (priceKrw < pricingPolicy.minPriceKrw) {
    return {
      ok: false,
      message: "가격 범위를 확인해 주세요.",
      recoveryGuide: "1원 이상, 1,000원 단위로 다시 입력해 주세요."
    };
  }

  if (priceKrw > pricingPolicy.maxPriceKrw) {
    return {
      ok: false,
      message: "가격 범위를 확인해 주세요.",
      recoveryGuide: `1원 이상, 1,000원 단위로 입력하고 최대 ${pricingPolicy.maxPriceKrw.toLocaleString(
        "ko-KR"
      )}원 이하로 다시 입력해 주세요.`
    };
  }

  if (priceKrw % pricingPolicy.stepKrw !== 0) {
    return {
      ok: false,
      message: "가격 단위를 확인해 주세요.",
      recoveryGuide: "1원 이상, 1,000원 단위로 다시 입력해 주세요."
    };
  }

  return {
    ok: true,
    priceKrw
  };
}
