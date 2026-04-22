export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

type AiRequestMeta = {
  clientRequestId: string;
  idempotencyKey: string;
  requestVersion: number;
};

type AiSuccessDraft = {
  title: string;
  category: string;
  keySpecifications: string[];
  confidence: number;
  fallbackRecommended: boolean;
};

export function createDeferred<T = void>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function readMultipartField(body: string, fieldName: string): string {
  const match = body.match(
    new RegExp(`name="${fieldName}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`)
  );

  if (!match?.[1]) {
    throw new Error(`Missing multipart field: ${fieldName}`);
  }

  return match[1];
}

export function readAiRequestMeta(body: string): AiRequestMeta {
  return {
    clientRequestId: readMultipartField(body, "clientRequestId"),
    idempotencyKey: readMultipartField(body, "idempotencyKey"),
    requestVersion: Number(readMultipartField(body, "requestVersion"))
  };
}

export function buildAiSuccessBody(
  meta: AiRequestMeta,
  requestId: string,
  draftOverrides: Partial<AiSuccessDraft> = {}
) {
  return JSON.stringify({
    data: {
      status: "requesting",
      clientRequestId: meta.clientRequestId,
      idempotencyKey: meta.idempotencyKey,
      requestVersion: meta.requestVersion,
      draft: {
        title: "AI가 만든 제목",
        category: "노트북",
        keySpecifications: ["M3", "16GB RAM"],
        confidence: 0.82,
        fallbackRecommended: false,
        ...draftOverrides
      }
    },
    meta: {
      requestId
    }
  });
}

export function buildLowConfidenceAiSuccessBody(
  meta: AiRequestMeta,
  requestId: string
) {
  return JSON.stringify({
    data: {
      status: "requesting",
      clientRequestId: meta.clientRequestId,
      idempotencyKey: meta.idempotencyKey,
      requestVersion: meta.requestVersion,
      draft: {
        title: "신뢰 낮은 AI 제목",
        category: "노트북",
        keySpecifications: ["AI 추정 스펙"],
        confidence: 0.31,
        fallbackRecommended: true
      }
    },
    meta: {
      requestId
    }
  });
}

export function buildAiTimeoutErrorBody(requestId: string) {
  return JSON.stringify({
    error: {
      code: "AI_TIMEOUT",
      message: "AI 초안 생성 시간이 초과되었습니다.",
      requestId,
      details: {
        recoveryGuide: "수동 입력으로 계속 진행할 수 있습니다.",
        retryable: true
      }
    }
  });
}
