---
baseline_commit: 'NO_VCS'
title: 'IR NEEDS WORK 보강: 스토리 AC/FR25 경계/정책 검증 정합화'
type: 'feature'
created: '2026-04-07'
status: 'done'
context:
  - '_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md'
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** IR(2026-04-07)에서 Story 1.1/2.1/2.3/3.2/4.1 AC가 happy path 중심이라 오류/경계/권한/중복 처리 검증 기준이 부족하고, FR25(`pricing.auto_adjust.applied.v1`) 책임이 Epic 3/4에 중복 서술되어 구현·테스트 경계 충돌 위험이 있다.

**Approach:** `epics.md`, `prd.md`, `architecture.md`, UX 개정본을 동시 정합화해 대상 스토리 AC를 Given/When/Then으로 보강하고, FR25를 Epic 3(발생)·Epic 4(관측/무결성/경보)로 분리하며, 3클릭/비차단/fallback 요구를 체크리스트+E2E로 고정한다.

## Boundaries & Constraints

**Always:** 대상은 문서 정합화(1.1/2.1/2.3/3.2/4.1 중심)로 제한; AC는 Given/When/Then; FR/이벤트 명칭 유지; 가드레일(중복률<1%, 누락률<2%, fallback E2E 100%) 유지.

**Ask First:** 스토리 번호 재배치, FR 추가/삭제, MVP 범위 변경, 정책 원칙(3클릭/비차단) 변경이 필요한 경우.

**Never:** 신규 기능 범위 확장 금지; 구현 방법 오버스펙 금지; FR25 책임 중복 재도입 금지; 정책 표시 실패를 핵심 플로우 차단 허용으로 해석 금지.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| STORY_AC_HARDENING | `epics.md` 대상 스토리 편집 | 오류/경계/권한/중복 AC가 GWT로 추가된다 | 충돌 AC는 더 엄격한 단일 문구로 정규화 |
| FR25_BOUNDARY | Epic 3/4 책임 경계 명시 | Epic 3=발생, Epic 4=관측/무결성/경보로 일치 | 문서 간 용어 불일치 시 RACI 용어로 통일 |
| POLICY_VALIDATION | UX 정책 검증 항목 보강 | 3클릭/비차단/fallback 회귀가 체크리스트+E2E로 명시 | 누락 화면은 항목 추가 후 추적 가능하게 기록 |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/epics.md` -- Story 1.1/2.1/2.3/3.2/4.1 AC 보강 및 FR25 경계 반영
- `_bmad-output/planning-artifacts/prd.md` -- FR25 책임 분리 주석 및 Hold 연결 문구 반영
- `_bmad-output/planning-artifacts/architecture.md` -- 이벤트 책임 경계(RACI)와 경보 소유자 문구 정합화
- `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md` -- 3클릭/비차단/fallback 체크리스트·E2E 기준 반영
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md` -- 권고사항 반영 추적 링크/상태 업데이트

## Tasks & Acceptance

**Execution:**
- [x] `_bmad-output/planning-artifacts/epics.md` -- Story 1.1/2.1/2.3/3.2/4.1 AC를 실패/경계/권한/중복 포함 GWT로 보강, Story 3.2의 FR25 중복 책임 제거
- [x] `_bmad-output/planning-artifacts/prd.md` -- FR25를 Epic 3(발생)/Epic 4(관측·무결성·경보)로 분리 주석화
- [x] `_bmad-output/planning-artifacts/architecture.md` -- FR25 RACI 및 dedupe/누락 지표 책임 경계 명문화
- [x] `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md` -- 3클릭 접근, 비차단, fallback 1탭 회귀 E2E 항목 추가
- [x] `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md` -- 보정 완료 상태 추적 업데이트

**Acceptance Criteria:**
- Given 수정 완료 상태에서, when Story 1.1/2.1/2.3/3.2/4.1을 검토하면, then 각 스토리에 실패/경계/권한/중복 기준 AC가 존재한다.
- Given PRD/Epics/Architecture를 대조하면, when FR25 책임을 확인할 때, then Epic 3은 발생 책임만, Epic 4는 관측/무결성/경보 책임만 가진다.
- Given UX 개정 문서를 검토하면, when 정책 관련 항목을 확인할 때, then 3클릭/비차단/fallback 회귀 E2E 기준이 명시된다.
- Given 가드레일 요구를 검색하면, when 관련 문구를 비교할 때, then 중복률<1%, 누락률<2%, fallback E2E 100% 기준이 충돌 없이 유지된다.

## Spec Change Log

## Verification

**Commands:**
- `rg -n "Story 1\.1|Story 2\.1|Story 2\.3|Story 3\.2|Story 4\.1|FR25|pricing\.auto_adjust\.applied\.v1|Given|When|Then" _bmad-output/planning-artifacts/epics.md _bmad-output/planning-artifacts/prd.md _bmad-output/planning-artifacts/architecture.md` -- expected: 대상 스토리/FR25/GWT 조회
- `rg -n "3클릭|비차단|fallback|E2E|중복률|누락률" _bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md _bmad-output/planning-artifacts/prd.md` -- expected: 정책/비차단/fallback/가드레일 조회




## Suggested Review Order

**Entry Point: 스토리 AC 강화 중심선**

- 대상 스토리 5개 변경의 의도와 범위를 한 번에 파악.
  [`epics.md:165`](../planning-artifacts/epics.md#L165)

- 업로드 실패/타임아웃 이후 fallback 역전 방지 규칙 확인.
  [`epics.md:260`](../planning-artifacts/epics.md#L260)

- 가격 확정 시 stale 추천가 차단 규칙 확인.
  [`epics.md:316`](../planning-artifacts/epics.md#L316)

- 자동조정 재시도 원자성(run key) 보강 확인.
  [`epics.md:379`](../planning-artifacts/epics.md#L379)

- 이벤트 지연/순서 역전의 집계 처리 규칙 확인.
  [`epics.md:434`](../planning-artifacts/epics.md#L434)

**FR25 책임 경계와 운영 의미 정렬**

- FR25 책임 분리와 비차단 규칙을 PRD 기준선에서 확인.
  [`prd.md:415`](../planning-artifacts/prd.md#L415)

- 계약 소유(스키마/호환성) 책임 문구 반영 확인.
  [`prd.md:418`](../planning-artifacts/prd.md#L418)

- Hold가 운영 판정 규칙임을 아키텍처에서 재확인.
  [`architecture.md:129`](../planning-artifacts/architecture.md#L129)

**정책 접근/비차단 검증 가능성**

- 정책 허브 범위 정의와 3클릭 체크 항목 확인.
  [`ux-design-specification-2026-04-07-revision.md:398`](../planning-artifacts/ux-design-specification-2026-04-07-revision.md#L398)

**상태 추적 및 최종 판정**

- IR 보정 반영 추적과 supersede 판정 문구 확인.
  [`implementation-readiness-report-2026-04-07.md:245`](../planning-artifacts/implementation-readiness-report-2026-04-07.md#L245)

