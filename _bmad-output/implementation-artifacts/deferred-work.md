# Deferred Work

- 2026-04-06: preproduct/playwright.config.ts 에서 channel="chrome" 고정으로 Chrome 미설치 환경 실패 가능성. Git 자동화 스토리 범위 외 이슈로 defer.
- 2026-04-06: preproduct/src/infra/mapper/case-mapper.ts 입력 방어(null/undefined/array) 보강 필요. Git 자동화 스토리 범위 외 이슈로 defer.

## Deferred from: code review of 1-4-ci-cd-계약검증-성능예산-baseline-구축.md (2026-04-06)
- AC6/AC7 Branch Protection Required checks 강제는 저장소 플랜/정책 제약으로 코드 diff만으로 해결 불가 [preproduct/.github/workflows/ci.yml:1]


## Deferred from: code review of 1-4-ci-cd-계약검증-성능예산-baseline-구축.md (2026-04-06)
- 파일락(.lock) stale 복구 부재/`os.tmpdir()` 기반 비영속 상태 저장 리스크는 현 Story 1.4 범위를 넘어서는 운영 설계 이슈 [preproduct/src/domain/intent/intent-shared-state.ts:38]

## Deferred from: code review of 1-4-ci-cd-계약검증-성능예산-baseline-구축.md (2026-04-06)
- idempotency key lock이 프로세스 로컬 메모리라 멀티 인스턴스 환경에서 동일 키 경합을 완전히 막지 못하는 운영 리스크 [preproduct/src/domain/intent/idempotency-key-lock.ts:1]


## Deferred from: code review of 1-2-프리리스팅-조회-및-수정.md (2026-04-08)
- 전역 in-memory draft 저장소의 세션 혼합/축출 정책 한계 (preproduct/src/domain/listing/listing-draft-service.ts:16) — 현재 변경으로 도입된 이슈가 아니라 기존 아키텍처 제약으로 defer.

