export class RetryableCreateListingError extends Error {
  constructor(message = "매물 저장을 잠시 완료하지 못했습니다.", options?: ErrorOptions) {
    super(message, options);
    this.name = "RetryableCreateListingError";
  }
}

export class RetryableUpdateListingStatusError extends Error {
  constructor(
    message = "상태 저장을 잠시 완료하지 못했습니다.",
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "RetryableUpdateListingStatusError";
  }
}
