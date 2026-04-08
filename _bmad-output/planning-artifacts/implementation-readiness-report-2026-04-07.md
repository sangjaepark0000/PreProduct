---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
selectedDocuments:
  prd: C:\Users\atima\Projects\PreProduct\_bmad-output\planning-artifacts\prd.md
  architecture: C:\Users\atima\Projects\PreProduct\_bmad-output\planning-artifacts\architecture.md
  epics: C:\Users\atima\Projects\PreProduct\_bmad-output\planning-artifacts\epics.md
  ux: C:\Users\atima\Projects\PreProduct\_bmad-output\planning-artifacts\ux-design-specification-2026-04-07-revision.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-04-07
**Project:** PreProduct

## Document Discovery

### Selected Baseline Documents

- PRD: `prd.md` (2026-04-07 15:02:04)
- Architecture: `architecture.md` (2026-04-07 18:43:35)
- Epics: `epics.md` (2026-04-07 19:12:13)
- UX: `ux-design-specification-2026-04-07-revision.md` (2026-04-07 16:12:07)

### Inventory Summary

- PRD whole files found: 4
- Architecture whole files found: 2
- Epics whole files found: 2
- UX whole files found: 3
- Sharded folders found: 0

### Issues

- Whole/Sharded format duplicate: None
- Version multiplicity: Baseline fixed by latest-modified rule

## PRD Analysis

### Functional Requirements

FR1: 판매 사용자는 상품을 등록할 수 있다.
FR2: 판매 사용자는 등록된 상품 정보를 수정할 수 있다.
FR3: 판매 사용자는 등록된 상품을 조회할 수 있다.
FR4: 판매 사용자는 판매 확정 전 프리리스팅 상태로 상품을 저장할 수 있다.
FR5: 판매 사용자는 프리리스팅 상태를 업데이트할 수 있다.
FR6: 시스템은 프리리스팅의 생성/수정 시점을 기록할 수 있다.
FR7: 판매 사용자는 프리리스팅을 언제든 업데이트할 수 있다.
FR8: 판매 사용자는 상품 사진을 업로드해 정보 초안 생성을 요청할 수 있다.
FR9: 시스템은 사진 기반 상품 정보 초안(제목/카테고리/핵심 스펙)을 제시할 수 있다.
FR10: 판매 사용자는 AI가 제시한 정보 초안을 수정/확정할 수 있다.
FR11: 시스템은 추천가를 제시할 수 있다.
FR12: 판매 사용자는 추천가를 수용하거나 수동 가격으로 확정할 수 있다.
FR13: 시스템은 AI 결과의 신뢰도/확신도 라벨을 표시할 수 있다.
FR14: 시스템은 AI 판독 실패 시 수동 입력 경로를 제공할 수 있다.
FR15: 판매 사용자는 AI 실패 상황에서도 등록 플로우를 완료할 수 있다.
FR16: 시스템은 필수 필드(제목, 카테고리, 핵심 스펙 1개 이상, 가격) 충족 여부를 검증할 수 있다.
FR17: 시스템은 저장 실패/검증 실패 시 재시도 가능한 상태를 제공할 수 있다.
FR18: 판매 사용자는 자동 가격조정 규칙을 설정할 수 있다.
FR19: 시스템은 설정된 규칙에 따라 가격조정을 적용할 수 있다.
FR20: 시스템은 가격 변경 사유를 기록할 수 있다.
FR21: 판매 사용자는 가격 변경 이력을 확인할 수 있다.
FR22: 시스템은 `listing.created.v1` 이벤트를 기록할 수 있다.
FR23: 시스템은 `ai.extraction.reviewed.v1` 이벤트를 기록할 수 있다.
FR24: 시스템은 `pricing.suggestion.accepted.v1` 이벤트를 기록할 수 있다.
FR25: 시스템은 `pricing.auto_adjust.applied.v1` 이벤트를 기록할 수 있다.
FR26: 운영자는 핵심 지표(완료율, 7일 업데이트율, 필수 필드 완성률)를 확인할 수 있다.
FR27: 운영자는 계측 가드레일(중복/누락/fallback 상태)을 확인할 수 있다.
FR28: 운영자는 Go/Hold/Stop&Reframe 판정 상태를 기록/관리할 수 있다.
FR29: 사용자는 정책/신뢰 관련 안내 페이지에 접근할 수 있다.
FR30: 시스템은 정책/안내 표시 실패가 핵심 등록/수정 플로우를 차단하지 않도록 동작할 수 있다.
FR31: 운영자는 비핵심 기능을 feature flag로 비활성화할 수 있다.
FR32: 시스템은 후속 유동성 인사이트 확장을 위한 최소 신호(업데이트 시점, 가격변경 사유)를 수집할 수 있다.
FR33: 구매자는 프리리스팅 상품을 탐색할 수 있다. (Deferred-P2)
FR34: 구매자는 관심 신호(찜/관심등록)를 남길 수 있다. (Deferred-P2)
FR35: 시스템은 관심 신호를 판매자 업데이트 우선순위에 반영할 수 있다. (Deferred-P2)

Total FRs: 35

### Non-Functional Requirements

NFR1: 핵심 사용자 액션(등록 시작, 저장, 수정)은 p95 2초 이내 응답해야 한다.
NFR2: 핵심 여정(진입 -> 프리리스팅 저장) 성공률은 주간 기준 95% 이상을 유지해야 한다.
NFR3: 유동성 인사이트 계산 실패가 핵심 등록/수정 플로우 지연 또는 차단을 유발하면 안 된다.
NFR4: 사용자/거래 데이터 보호 통제는 전송 및 저장 구간 모두 적용되어야 하며 월 1회 점검 리포트로 검증 가능해야 한다.
NFR5: 운영자 기능은 권한 기반 접근 제어가 적용되어야 하며 권한 외 요청은 차단되어야 한다.
NFR6: 주요 운영 행위(판정 변경, 기능 플래그 변경) 감사로그 적재율은 99.9% 이상이어야 한다.
NFR7: 초기 기준 부하 정의 문서에 명시된 기준 대비 3배 부하에서도 핵심 액션 성능 기준(p95 2초)을 유지해야 한다.
NFR8: 데이터 증가 시 핵심 조회/수정 플로우 성능 저하가 급격히 발생하면 안 된다.
NFR9: 사용자 웹 경험은 WCAG AA 기준을 충족해야 한다.
NFR10: 핵심 플로우(사진 업로드, 필드 입력, 저장)는 키보드 기반 조작이 가능해야 한다.
NFR11: 오류/상태 변경은 보조기술 사용자에게 인지 가능한 형태로 제공되어야 한다.
NFR12: 내부 이벤트 스키마는 버전 관리되어야 하며 의미 변경 시 버전 증분 원칙을 따라야 한다.
NFR13: 외부 연동 확장 시 기존 핵심 플로우 호환성을 유지할 수 있어야 한다.
NFR14: 계측 품질 기준으로 이벤트 중복률 1% 미만, 필수 이벤트 누락률 2% 미만을 유지해야 한다.
NFR15: 판독 실패 수동입력 fallback E2E 통과율은 100%를 유지해야 한다.
NFR16: 가드레일 위반 감지 후 운영 상태 반영 지연은 30초 이내여야 한다.

Total NFRs: 16

### Additional Requirements

- 컴플라이언스: 데이터 주체 요청(열람/정정/삭제) 처리 절차와 SLA 정의 및 상태 추적 필요
- 컴플라이언스: 정책/신고/분쟁/개인정보 안내 화면 3클릭 이내 접근
- 기술 제약: SEO 페이지와 앱 셸 간 도메인 로직 중복 구현 금지
- 기술 제약: 정책 표시 계층 실패가 등록 차단으로 이어지지 않도록 격리
- 통합 제약: MVP 단계 외부 파트너 API 연동 제외, 내부 플로우 완결 우선
- 버저닝 요구: 이벤트 스키마 의미 변경 시 버전 증분
- 운영 규칙: Week 1-2 baseline, Week 3-8 공식 판정
- 운영 가드레일: 중복률<1%, 누락률<2%, fallback E2E 100% 미달 시 자동 Hold

### PRD Completeness Assessment

PRD는 FR/NFR 및 운영/정책/제약 요구를 명시적으로 포함하고 있으며, 구현 추적 가능성은 높은 편이다. 다만 Deferred-P2(FR33-FR35)가 같은 목록에 포함되어 있어 MVP 범위 검증 시 별도 태깅 관리가 필요하다.

## Epic Coverage Validation

### Coverage Matrix

| FR Number | PRD Requirement | Epic Coverage | Status |
| --------- | --------------- | ------------- | ------ |
| FR1 | 판매 사용자는 상품을 등록할 수 있다. | Epic 1 | ✓ Covered |
| FR2 | 판매 사용자는 등록된 상품 정보를 수정할 수 있다. | Epic 1 | ✓ Covered |
| FR3 | 판매 사용자는 등록된 상품을 조회할 수 있다. | Epic 1 | ✓ Covered |
| FR4 | 판매 사용자는 판매 확정 전 프리리스팅 상태로 상품을 저장할 수 있다. | Epic 1 | ✓ Covered |
| FR5 | 판매 사용자는 프리리스팅 상태를 업데이트할 수 있다. | Epic 1 | ✓ Covered |
| FR6 | 시스템은 프리리스팅의 생성/수정 시점을 기록할 수 있다. | Epic 1 | ✓ Covered |
| FR7 | 판매 사용자는 프리리스팅을 언제든 업데이트할 수 있다. | Epic 1 | ✓ Covered |
| FR8 | 판매 사용자는 상품 사진을 업로드해 정보 초안 생성을 요청할 수 있다. | Epic 2 | ✓ Covered |
| FR9 | 시스템은 사진 기반 상품 정보 초안(제목/카테고리/핵심 스펙)을 제시할 수 있다. | Epic 2 | ✓ Covered |
| FR10 | 판매 사용자는 AI가 제시한 정보 초안을 수정/확정할 수 있다. | Epic 2 | ✓ Covered |
| FR11 | 시스템은 추천가를 제시할 수 있다. | Epic 2 | ✓ Covered |
| FR12 | 판매 사용자는 추천가를 수용하거나 수동 가격으로 확정할 수 있다. | Epic 2 | ✓ Covered |
| FR13 | 시스템은 AI 결과의 신뢰도/확신도 라벨을 표시할 수 있다. | Epic 2 | ✓ Covered |
| FR14 | 시스템은 AI 판독 실패 시 수동 입력 경로를 제공할 수 있다. | Epic 2 | ✓ Covered |
| FR15 | 판매 사용자는 AI 실패 상황에서도 등록 플로우를 완료할 수 있다. | Epic 2 | ✓ Covered |
| FR16 | 시스템은 필수 필드 충족 여부를 검증할 수 있다. | Epic 1 | ✓ Covered |
| FR17 | 시스템은 저장 실패/검증 실패 시 재시도 가능한 상태를 제공할 수 있다. | Epic 1 | ✓ Covered |
| FR18 | 판매 사용자는 자동 가격조정 규칙을 설정할 수 있다. | Epic 3 | ✓ Covered |
| FR19 | 시스템은 설정된 규칙에 따라 가격조정을 적용할 수 있다. | Epic 3 | ✓ Covered |
| FR20 | 시스템은 가격 변경 사유를 기록할 수 있다. | Epic 3 | ✓ Covered |
| FR21 | 판매 사용자는 가격 변경 이력을 확인할 수 있다. | Epic 3 | ✓ Covered |
| FR22 | 시스템은 listing.created.v1 이벤트를 기록할 수 있다. | Epic 4 | ✓ Covered |
| FR23 | 시스템은 ai.extraction.reviewed.v1 이벤트를 기록할 수 있다. | Epic 4 | ✓ Covered |
| FR24 | 시스템은 pricing.suggestion.accepted.v1 이벤트를 기록할 수 있다. | Epic 4 | ✓ Covered |
| FR25 | 시스템은 pricing.auto_adjust.applied.v1 이벤트를 기록할 수 있다. | Epic 4 (및 Epic 3 story 3.2) | ✓ Covered |
| FR26 | 운영자는 핵심 지표를 확인할 수 있다. | Epic 4 | ✓ Covered |
| FR27 | 운영자는 계측 가드레일을 확인할 수 있다. | Epic 4 | ✓ Covered |
| FR28 | 운영자는 Go/Hold/Stop&Reframe 판정 상태를 기록/관리할 수 있다. | Epic 4 | ✓ Covered |
| FR29 | 사용자는 정책/신뢰 관련 안내 페이지에 접근할 수 있다. | Epic 4 | ✓ Covered |
| FR30 | 시스템은 정책 표시 실패가 핵심 플로우를 차단하지 않도록 동작할 수 있다. | Epic 4 | ✓ Covered |
| FR31 | 운영자는 비핵심 기능을 feature flag로 비활성화할 수 있다. | Epic 4 | ✓ Covered |
| FR32 | 시스템은 후속 유동성 인사이트 확장을 위한 최소 신호를 수집할 수 있다. | Epic 3 | ✓ Covered |
| FR33 | 구매자는 프리리스팅 상품을 탐색할 수 있다. | Epic 5 (Deferred-P2) | ✓ Covered |
| FR34 | 구매자는 관심 신호를 남길 수 있다. | Epic 5 (Deferred-P2) | ✓ Covered |
| FR35 | 시스템은 관심 신호를 판매자 업데이트 우선순위에 반영할 수 있다. | Epic 5 (Deferred-P2) | ✓ Covered |

### Missing Requirements

- PRD의 FR1-FR35는 Epics 문서의 FR Coverage Map 및 Epic별 FR 목록에서 모두 매핑됨.
- 미커버리지 FR 없음.
- Epics 문서에만 존재하는 추가 FR 없음.

### Coverage Statistics

- Total PRD FRs: 35
- FRs covered in epics: 35
- Coverage percentage: 100%



## UX Alignment Assessment

### UX Document Status

- Found: `ux-design-specification-2026-04-07-revision.md`

### Alignment Issues

- PRD의 핵심 UX 요구(1분 등록, AI 수정 가능, 실패 시 1탭 fallback, WCAG AA, 44x44 타깃)와 UX 문서는 정합함.
- Architecture의 CA-02에서 확정한 MVP 컴포넌트(`PhotoUploader`, `ExtractionFieldEditor`, `PriceSuggestionCard`, `ListingSummarySubmitBar`)와 UX 문서 컴포넌트 정의가 정합함.
- PRD의 정책 3클릭 접근/비차단 원칙은 UX 문서에서 방향성으로 반영되나, 화면별 체크리스트(어느 화면에서 몇 클릭인지)까지는 아직 명시되지 않음.

### Warnings

- 경고(중간): UX는 정합하지만, 정책 접근성(3클릭)과 비차단 동작을 검증 가능한 UI 테스트 케이스로 분해한 명시 섹션이 부족함.

## Epic Quality Review

### Best-Practice Validation Findings

#### 🔴 Critical Violations

- 없음

#### 🟠 Major Issues

- Story 1.1의 사용자 서술이 기술 역할 중심(`As a 개발 팀 구성원`)으로 작성되어, 사용자 가치 중심 스토리 원칙과 충돌 가능성이 있음.
- 다수 스토리의 AC가 happy path 중심이며, 실패/오류/권한거부/경계값(예: 빈 업로드, 잘못된 가격 규칙, 이벤트 중복) 조건이 충분히 명시되지 않음.
- Epic 3 Story 3.2와 Epic 4 Story 4.1이 FR25를 중복 포함하여 책임 경계가 모호함(가격조정 실행 vs 계측 책임 분리 필요).

#### 🟡 Minor Concerns

- 일부 스토리의 "독립 완료" 정의가 암묵적이다. 예: Story 1.2는 조회/수정이 가능하려면 최소 생성 데이터 전제 조건이 필요하므로 fixture/seed 기준 명시가 있으면 더 안전함.
- Deferred-P2 스토리는 활성화 조건을 명시했으나, PR 템플릿/DoD에서 Scope Tag 강제 규칙 연결이 문서 내 직접 추적되지 않음.

### Compliance Checklist Result

- [x] Epic delivers user value
- [x] Epic can function independently
- [x] Stories appropriately sized (대체로 적정)
- [ ] No forward/implicit dependency risk (암묵 의존 일부 존재)
- [x] Database/entities created when needed (직접 위반 서술 없음)
- [ ] Acceptance criteria sufficiently complete (오류/경계값 보강 필요)
- [x] Traceability to FRs maintained

### Actionable Remediation

1. Story 1.1을 "프로젝트 초기화 결과가 사용자 등록 가치로 연결되는 준비 스토리"로 재서술하고, 기술 작업 상세는 태스크로 분리한다.
2. Story 2.1/2.3/3.2/4.1 AC에 실패/경계/중복 방지/권한 오류 케이스를 Given/When/Then으로 추가한다.
3. FR25 책임을 Epic 3(도메인 이벤트 발생)과 Epic 4(계측 검증/모니터링)로 분리해 RACI를 명시한다.

## Summary and Recommendations

### Overall Readiness Status

NEEDS WORK

### Critical Issues Requiring Immediate Action

- 치명 결함은 없지만, 스토리 AC의 오류/경계값 누락으로 구현-테스트 간 해석 차이가 발생할 가능성이 높다.
- FR25 중복 책임 경계를 정리하지 않으면 Epic 3/4 구현 충돌 위험이 있다.

### Recommended Next Steps

1. Epic 문서에서 Story 1.1/2.1/2.3/3.2/4.1 AC를 보강하고, 오류/경계/권한 시나리오를 명시한다.
2. FR25 책임 분리(발생 vs 관측)를 Epic 설명과 Story 수용기준에 명문화한다.
3. 정책 3클릭 접근/비차단 원칙을 UX 테스트 체크리스트 및 E2E 시나리오로 구체화한다.

### Remediation Tracking Update (2026-04-07)

- [x] Story 1.1/2.1/2.3/3.2/4.1 AC 보강 완료
  - 반영 위치: `epics.md`
- [x] FR25 책임 분리(발생 vs 관측/무결성/경보) 문서 정합화 완료
  - 반영 위치: `epics.md`, `prd.md`, `architecture.md`
- [x] 정책 3클릭/비차단/fallback 회귀 검증 항목 구체화 완료
  - 반영 위치: `ux-design-specification-2026-04-07-revision.md`

### Post-Remediation Readiness Verdict (Supersedes Above Snapshot)

- 주의: 본 문서의 `Overall Readiness Status: NEEDS WORK`는 보정 전 스냅샷 평가 결과다.
- 최종 판정(보정 반영 후): `READY FOR DEVELOPMENT (docs scope)`
- 판정 근거:
  - 대상 스토리 AC 보강 완료(오류/경계/권한/중복)
  - FR25 책임 경계 문서 정합화 완료(PRD/Epics/Architecture)
  - 정책 3클릭/비차단/fallback E2E 체크리스트 명시 완료

### Final Note

이번 점검에서 구조적 치명 이슈는 없었고, 품질/테스트 명확성 중심의 개선 이슈가 확인되었다. 핵심 보완 후 구현 착수 시 리스크를 크게 줄일 수 있다.

_Assessor: Winston (System Architect Persona)_  
_Assessment Date: 2026-04-07_

