---
stepsCompleted:
  - "step-01-document-discovery"
  - "step-02-prd-analysis"
  - "step-03-epic-coverage-validation"
  - "step-04-ux-alignment"
  - "step-05-epic-quality-review"
  - "step-06-final-assessment"
reportDate: "2026-04-06"
project: "PreProduct"
selectedDocuments:
  prd: "_bmad-output/planning-artifacts/prd.md"
  architecture: "_bmad-output/planning-artifacts/architecture.md"
  epics: "_bmad-output/planning-artifacts/epics.md"
  ux: "_bmad-output/planning-artifacts/ux-design-specification.md"
---
# Implementation Readiness Assessment Report

**Date:** 2026-04-06  
**Project:** PreProduct

## Document Discovery

### PRD Files Found

**Whole Documents:**
- prd.md (29,146 bytes, modified: 2026-04-05 10:50 +09:00)
- prd-validation-report.md (15,444 bytes, modified: 2026-04-05 10:52 +09:00)

**Sharded Documents:**
- None (*prd*/index.md not found)

### Architecture Files Found

**Whole Documents:**
- architecture.md (24,100 bytes, modified: 2026-04-06 08:19 +09:00)

**Sharded Documents:**
- None (*architecture*/index.md not found)

### Epics & Stories Files Found

**Whole Documents:**
- epics.md (30,954 bytes, modified: 2026-04-06 08:47 +09:00)

**Sharded Documents:**
- None (*epic*/index.md not found)

### UX Design Files Found

**Whole Documents:**
- ux-design-specification.md (29,526 bytes, modified: 2026-04-05 19:28 +09:00)

**Sharded Documents:**
- None (*ux*/index.md not found)

### Discovery Issues

- No duplicate whole/sharded format conflicts found.
- No required document category is missing.

## PRD Analysis

### Functional Requirements

FR1: 사용자(목적 미정 포함)는 현재 문제/상황만으로 탐색을 시작할 수 있다.
FR2: 사용자는 탐색 중에 목표를 생성, 수정, 폐기할 수 있다.
FR3: 사용자는 자산 단위로 의향을 등록할 수 있다.
FR4: 사용자는 의향에 제약조건(예산, 기간, 혜택, 현금흐름 필요 등)을 추가, 수정할 수 있다.
FR5: 시스템은 사용자 의향 성숙도(`intent_maturity`)를 관리할 수 있다.
FR6: 시스템은 목표 신뢰도(`goal_confidence`)를 관리할 수 있다.
FR7: 시스템은 사용자 입력을 기반으로 행동 선택지(구매, 판매, 보류, 대안)를 제시할 수 있다.
FR8: 시스템은 각 선택지에 대해 설명 가능한 판단 근거를 제공할 수 있다.
FR9: 시스템은 판단 결과의 확신도/불확실성 정보를 제공할 수 있다.
FR10: 사용자는 판단 결과 이후 보류를 선택할 수 있다.
FR11: 시스템은 보류 후 재평가 경로를 제공할 수 있다.
FR12: 시스템은 시점/조건 변화에 따라 제시 선택지를 재정렬할 수 있다.
FR13: 사용자는 판매 확정 전에도 선의향을 공개할 수 있다.
FR14: 사용자는 공개된 의향을 업데이트할 수 있다.
FR15: 시스템은 의향 정보의 신선도/신뢰도를 관리할 수 있다.
FR16: 시스템은 자산 상태(소유/보유/판매/임대)를 기록하고 상태 전이를 추적할 수 있다.
FR17: 사용자는 처분 의도 유형(`disposal_intent_type`)을 지정할 수 있다.
FR18: 시스템은 시간 압박(`time_pressure`)과 유동성 필요(`liquidity_need`)를 반영해 판단을 지원할 수 있다.
FR19: 시스템은 시세/이벤트 변화 신호를 수집해 사용자 판단에 반영할 수 있다.
FR20: 시스템은 타이밍 민감 조건 충족 시 사용자에게 알림을 제공할 수 있다.
FR21: 사용자는 알림 기준을 설정, 수정할 수 있다.
FR22: 운영자는 핵심 지표와 가드레일 상태를 확인할 수 있다.
FR23: 운영자는 Go/Hold/Stop 판정 근거를 확인할 수 있다.
FR24: 운영/지원 담당자는 사용자 문의 건에 대한 판단 근거 로그를 조회할 수 있다.
FR25: 운영자는 저품질/정책위반 의향에 대해 노출 정책을 적용할 수 있다.
FR26: 시스템은 데이터 주체의 열람/정정/삭제 요청을 접수, 처리할 수 있다.
FR27: 시스템은 핵심 이벤트(판단 여정 전반)를 기록할 수 있다.
FR28: 시스템은 실험군/대조군을 구분해 성과를 비교할 수 있다.
FR29: 운영자는 핵심 지표와 가드레일을 주기적으로 리포트할 수 있다.
FR30: 시스템은 품질 저하(드리프트) 신호를 감지할 수 있다.
FR31: 시스템은 파트너별 API 접근 권한을 발급/관리할 수 있다.
FR32: 시스템은 파트너에게 익명/집계 신호를 제공할 수 있다.
FR33: 시스템은 API 사용량 제한(쿼터)을 적용할 수 있다.
FR34: 시스템은 API 오류 규약을 일관되게 제공할 수 있다.
FR35: 시스템은 파트너 접근/데이터 사용 이력을 감사할 수 있다.
FR36: 사용자는 자신의 탐색/판단 히스토리를 조회할 수 있다.
FR37: 사용자는 목표/의향 변경 이력을 기반으로 판단 회고를 할 수 있다.
FR38: 운영자는 서비스 모드를 기본 모드와 fallback 모드로 전환할 수 있다.
FR39: 운영자와 지원 담당자는 현재 적용 중인 서비스 모드 상태를 조회할 수 있다.
FR40: 시스템은 사용자별 실험군 할당을 일관되게 유지할 수 있다.

Total FRs: 40

### Non-Functional Requirements

NFR1: 핵심 여정(랜딩 -> 의향 입력 시작 -> 판단 카드 노출) 주요 액션 응답시간은 주간 p95 기준 2초 이내여야 한다.
NFR2: 판단 카드 첫 노출 시간은 주간 p95 기준 3초 이내여야 한다.
NFR3: 타이밍 알림 이벤트(조건 충족/시세 급변)는 이벤트 발생 후 5분 이내 전달률 95% 이상을 유지해야 한다.
NFR4: 성능 저하 시 fallback 모드에서도 핵심 여정은 유지 가능해야 한다. (주간 합성 모니터링 기준 핵심 여정 성공률 >= 95%)
NFR5: 사용자/의향 데이터는 전송 구간 및 저장 구간 모두 보호되어야 한다. (전송 TLS 1.2 이상, 저장 AES-256 이상, 월 1회 검증 리포트)
NFR6: 파트너 API는 인증된 주체만 접근 가능해야 하며 권한 범위 외 요청은 차단되어야 한다. (인증 실패/권한 오류 401/403 분리 로깅, 일별 차단 누락률 0%)
NFR7: 데이터 사용 목적, 수집 항목, 제공 범위는 사용자에게 확인 가능해야 한다. (정책 화면 3클릭 이내 접근, 주간 표본 점검 100% 통과)
NFR8: 데이터 주체 요청(열람/정정/삭제)은 정의된 SLA 내 처리 상태 추적이 가능해야 한다.
NFR9: 운영자/파트너 주요 행위는 감사 가능한 로그로 남아야 한다. (핵심 행위 로그 적재율 99.9% 이상, 보존기간 365일 이상)
NFR10: 서비스는 목적 달성에 필요한 최소 데이터만 수집, 보관해야 한다. (분기별 데이터 최소수집 리뷰 1회, 불필요 필드 0건 목표)
NFR11: 기준 부하(초기 예상 동시 사용자 및 요청량) 대비 3배 부하에서도 핵심 여정 성능 기준(NFR1~NFR3)을 유지해야 한다.
NFR12: 사용자/의향 데이터 증가 시 핵심 조회/판단 흐름의 성능 저하가 급격히 발생하지 않아야 한다. (데이터 2배 증가 시 p95 응답시간 증가율 <= 25%)
NFR13: 파트너 연동은 파일럿(1~2개)에서 시작해 단계적으로 확장 가능한 구조여야 한다.
NFR14: 웹 경험은 WCAG AA 수준을 충족해야 한다.
NFR15: 핵심 여정은 키보드만으로 수행 가능해야 한다. (핵심 여정 3개 시나리오 키보드 전용 통과율 100%, 주간 회귀 점검)
NFR16: 입력 오류/상태 변화/알림 정보는 보조기술 사용자에게 인지 가능해야 한다. (스크린리더 점검 체크리스트 항목 100% 충족)
NFR17: 파트너 API는 버전 관리가 가능해야 하며 하위호환/변경 공지 정책을 가져야 한다. (하위호환 유지기간 최소 90일, 사전 공지 최소 30일)
NFR18: API 오류 응답은 일관된 규약과 복구 가능한 안내를 포함해야 한다. (표준 오류 스키마 준수율 100%, 복구 가이드 포함율 100%)
NFR19: 파트너 쿼터/레이트 제한은 정책 기반으로 적용되고 관측 가능해야 한다. (정책 적용률 100%, 초과 이벤트 관측 지연 <= 1분)
NFR20: 시스템은 기본/fallback 모드 상태를 운영자가 확인 가능해야 한다. (운영 콘솔 상태 반영 지연 <= 30초)
NFR21: 실험군/대조군 할당은 사용자 단위로 일관되게 유지되어야 한다. (재방문 사용자 할당 일치율 >= 99.5%)
NFR22: 드리프트/가드레일 이탈 시 관찰-제한-롤백 절차를 실행 가능한 상태로 유지해야 한다. (분기별 모의훈련 1회, 절차 실행 성공률 100%)
NFR23: 장애 발생 시 핵심 데이터(의향/판단/이력)의 무결성과 복구 가능성이 보장되어야 한다. (RPO <= 15분, RTO <= 60분, 월 1회 복구 리허설)

Total NFRs: 23

### Additional Requirements

- 규제/정책: 개인정보/행동로그/의향데이터 동의, 보관, 삭제 정책 및 데이터 주체 요청 SLA 필요
- 기술 제약: 설명 가능한 판단 결과, 상태값 일관성(intent_maturity, goal_confidence), 계측 무결성, 의사결정 재현성 필요
- 통합 요구: 파트너 API 인증/쿼터/버전/오류 규약, 익명/집계 신호 중심 제공, 파트너 온보딩 게이트 필요
- 운영 리스크 대응: 저품질 의향, 추천 오해, 데이터 오남용, 품질 드리프트 대응 절차(관찰-제한-롤백) 필요
- 웹앱 제약: Hybrid 구조(SEO + 앱셸 SPA), WCAG AA, 브라우저 매트릭스, 핵심 플로우 품질 게이트 필요

### PRD Completeness Assessment

- PRD는 기능/비기능 요구사항이 명시적으로 구조화되어 있고 수치 기준이 포함되어 있어 요구사항 추적의 기반이 충분합니다.
- FR(40개), NFR(23개), 추가 제약/통합/리스크 정책까지 포함되어 구현 준비도 검증 입력으로 사용 가능합니다.
- 다음 단계에서 필요한 핵심 검증은 각 FR/NFR이 epics.md의 스토리/수용기준/작업 항목으로 누락 없이 매핑되는지 확인하는 것입니다.

## Epic Coverage Validation

### Epic FR Coverage Extracted

FR1: Covered in Epic 1 - 목적 불명확 상태에서도 탐색 시작
FR2: Covered in Epic 1 - 탐색 중 목표 생성/수정/폐기
FR3: Covered in Epic 1 - 자산 단위 의향 등록
FR4: Covered in Epic 1 - 의향 제약조건 관리
FR5: Covered in Epic 1 - intent_maturity 상태 관리
FR6: Covered in Epic 1 - goal_confidence 상태 관리
FR7: Covered in Epic 2 - 행동 선택지 제시
FR8: Covered in Epic 2 - 설명 가능한 판단 근거 제공
FR9: Covered in Epic 2 - 확신도/불확실성 제공
FR10: Covered in Epic 3 - 보류 선택 지원
FR11: Covered in Epic 3 - 보류 후 재평가 경로 제공
FR12: Covered in Epic 2 - 시점/조건 변화 기반 재정렬
FR13: Covered in Epic 1 - 선의향 공개
FR14: Covered in Epic 1 - 공개 의향 업데이트
FR15: Covered in Epic 2 - 의향 신선도/신뢰도 관리
FR16: Covered in Epic 2 - 자산 상태 및 전이 추적
FR17: Covered in Epic 1 - 처분 의도 유형 지정
FR18: Covered in Epic 1 - 시간압박/유동성 필요 반영
FR19: Covered in Epic 4 - 시세/이벤트 신호 반영
FR20: Covered in Epic 4 - 타이밍 조건 알림 제공
FR21: Covered in Epic 4 - 알림 기준 설정/수정
FR22: Covered in Epic 5 - 핵심지표/가드레일 조회
FR23: Covered in Epic 5 - Go/Hold/Stop 근거 조회
FR24: Covered in Epic 5 - 문의 대응용 판단 근거 로그 조회
FR25: Covered in Epic 5 - 저품질/위반 의향 노출 정책 적용
FR26: Covered in Epic 5 - 열람/정정/삭제 요청 처리
FR27: Covered in Epic 6 - 핵심 이벤트 기록
FR28: Covered in Epic 6 - 실험군/대조군 성과 비교
FR29: Covered in Epic 6 - 주기적 리포트 생성
FR30: Covered in Epic 6 - 품질 드리프트 감지
FR31: Covered in Epic 7 - 파트너 API 접근 권한 관리
FR32: Covered in Epic 7 - 익명/집계 신호 제공
FR33: Covered in Epic 7 - 파트너 쿼터 적용
FR34: Covered in Epic 7 - API 오류 규약 제공
FR35: Covered in Epic 7 - 파트너 접근/사용 감사
FR36: Covered in Epic 3 - 탐색/판단 히스토리 조회
FR37: Covered in Epic 3 - 목표/의향 변경 이력 기반 회고
FR38: Covered in Epic 5 - 기본/fallback 모드 전환
FR39: Covered in Epic 5 - 현재 서비스 모드 상태 조회
FR40: Covered in Epic 6 - 사용자별 실험군 할당 일관성 유지

Total FRs in epics: 40

### Coverage Matrix

| FR Number | PRD Requirement | Epic Coverage | Status |
| --------- | --------------- | ------------- | ------ |
| FR1 | 사용자(목적 미정 포함)는 현재 문제/상황만으로 탐색을 시작할 수 있다. | Epic 1 - 목적 불명확 상태에서도 탐색 시작 | ✓ Covered |
| FR2 | 사용자는 탐색 중에 목표를 생성, 수정, 폐기할 수 있다. | Epic 1 - 탐색 중 목표 생성/수정/폐기 | ✓ Covered |
| FR3 | 사용자는 자산 단위로 의향을 등록할 수 있다. | Epic 1 - 자산 단위 의향 등록 | ✓ Covered |
| FR4 | 사용자는 의향에 제약조건(예산, 기간, 혜택, 현금흐름 필요 등)을 추가, 수정할 수 있다. | Epic 1 - 의향 제약조건 관리 | ✓ Covered |
| FR5 | 시스템은 사용자 의향 성숙도(`intent_maturity`)를 관리할 수 있다. | Epic 1 - intent_maturity 상태 관리 | ✓ Covered |
| FR6 | 시스템은 목표 신뢰도(`goal_confidence`)를 관리할 수 있다. | Epic 1 - goal_confidence 상태 관리 | ✓ Covered |
| FR7 | 시스템은 사용자 입력을 기반으로 행동 선택지(구매, 판매, 보류, 대안)를 제시할 수 있다. | Epic 2 - 행동 선택지 제시 | ✓ Covered |
| FR8 | 시스템은 각 선택지에 대해 설명 가능한 판단 근거를 제공할 수 있다. | Epic 2 - 설명 가능한 판단 근거 제공 | ✓ Covered |
| FR9 | 시스템은 판단 결과의 확신도/불확실성 정보를 제공할 수 있다. | Epic 2 - 확신도/불확실성 제공 | ✓ Covered |
| FR10 | 사용자는 판단 결과 이후 보류를 선택할 수 있다. | Epic 3 - 보류 선택 지원 | ✓ Covered |
| FR11 | 시스템은 보류 후 재평가 경로를 제공할 수 있다. | Epic 3 - 보류 후 재평가 경로 제공 | ✓ Covered |
| FR12 | 시스템은 시점/조건 변화에 따라 제시 선택지를 재정렬할 수 있다. | Epic 2 - 시점/조건 변화 기반 재정렬 | ✓ Covered |
| FR13 | 사용자는 판매 확정 전에도 선의향을 공개할 수 있다. | Epic 1 - 선의향 공개 | ✓ Covered |
| FR14 | 사용자는 공개된 의향을 업데이트할 수 있다. | Epic 1 - 공개 의향 업데이트 | ✓ Covered |
| FR15 | 시스템은 의향 정보의 신선도/신뢰도를 관리할 수 있다. | Epic 2 - 의향 신선도/신뢰도 관리 | ✓ Covered |
| FR16 | 시스템은 자산 상태(소유/보유/판매/임대)를 기록하고 상태 전이를 추적할 수 있다. | Epic 2 - 자산 상태 및 전이 추적 | ✓ Covered |
| FR17 | 사용자는 처분 의도 유형(`disposal_intent_type`)을 지정할 수 있다. | Epic 1 - 처분 의도 유형 지정 | ✓ Covered |
| FR18 | 시스템은 시간 압박(`time_pressure`)과 유동성 필요(`liquidity_need`)를 반영해 판단을 지원할 수 있다. | Epic 1 - 시간압박/유동성 필요 반영 | ✓ Covered |
| FR19 | 시스템은 시세/이벤트 변화 신호를 수집해 사용자 판단에 반영할 수 있다. | Epic 4 - 시세/이벤트 신호 반영 | ✓ Covered |
| FR20 | 시스템은 타이밍 민감 조건 충족 시 사용자에게 알림을 제공할 수 있다. | Epic 4 - 타이밍 조건 알림 제공 | ✓ Covered |
| FR21 | 사용자는 알림 기준을 설정, 수정할 수 있다. | Epic 4 - 알림 기준 설정/수정 | ✓ Covered |
| FR22 | 운영자는 핵심 지표와 가드레일 상태를 확인할 수 있다. | Epic 5 - 핵심지표/가드레일 조회 | ✓ Covered |
| FR23 | 운영자는 Go/Hold/Stop 판정 근거를 확인할 수 있다. | Epic 5 - Go/Hold/Stop 근거 조회 | ✓ Covered |
| FR24 | 운영/지원 담당자는 사용자 문의 건에 대한 판단 근거 로그를 조회할 수 있다. | Epic 5 - 문의 대응용 판단 근거 로그 조회 | ✓ Covered |
| FR25 | 운영자는 저품질/정책위반 의향에 대해 노출 정책을 적용할 수 있다. | Epic 5 - 저품질/위반 의향 노출 정책 적용 | ✓ Covered |
| FR26 | 시스템은 데이터 주체의 열람/정정/삭제 요청을 접수, 처리할 수 있다. | Epic 5 - 열람/정정/삭제 요청 처리 | ✓ Covered |
| FR27 | 시스템은 핵심 이벤트(판단 여정 전반)를 기록할 수 있다. | Epic 6 - 핵심 이벤트 기록 | ✓ Covered |
| FR28 | 시스템은 실험군/대조군을 구분해 성과를 비교할 수 있다. | Epic 6 - 실험군/대조군 성과 비교 | ✓ Covered |
| FR29 | 운영자는 핵심 지표와 가드레일을 주기적으로 리포트할 수 있다. | Epic 6 - 주기적 리포트 생성 | ✓ Covered |
| FR30 | 시스템은 품질 저하(드리프트) 신호를 감지할 수 있다. | Epic 6 - 품질 드리프트 감지 | ✓ Covered |
| FR31 | 시스템은 파트너별 API 접근 권한을 발급/관리할 수 있다. | Epic 7 - 파트너 API 접근 권한 관리 | ✓ Covered |
| FR32 | 시스템은 파트너에게 익명/집계 신호를 제공할 수 있다. | Epic 7 - 익명/집계 신호 제공 | ✓ Covered |
| FR33 | 시스템은 API 사용량 제한(쿼터)을 적용할 수 있다. | Epic 7 - 파트너 쿼터 적용 | ✓ Covered |
| FR34 | 시스템은 API 오류 규약을 일관되게 제공할 수 있다. | Epic 7 - API 오류 규약 제공 | ✓ Covered |
| FR35 | 시스템은 파트너 접근/데이터 사용 이력을 감사할 수 있다. | Epic 7 - 파트너 접근/사용 감사 | ✓ Covered |
| FR36 | 사용자는 자신의 탐색/판단 히스토리를 조회할 수 있다. | Epic 3 - 탐색/판단 히스토리 조회 | ✓ Covered |
| FR37 | 사용자는 목표/의향 변경 이력을 기반으로 판단 회고를 할 수 있다. | Epic 3 - 목표/의향 변경 이력 기반 회고 | ✓ Covered |
| FR38 | 운영자는 서비스 모드를 기본 모드와 fallback 모드로 전환할 수 있다. | Epic 5 - 기본/fallback 모드 전환 | ✓ Covered |
| FR39 | 운영자와 지원 담당자는 현재 적용 중인 서비스 모드 상태를 조회할 수 있다. | Epic 5 - 현재 서비스 모드 상태 조회 | ✓ Covered |
| FR40 | 시스템은 사용자별 실험군 할당을 일관되게 유지할 수 있다. | Epic 6 - 사용자별 실험군 할당 일관성 유지 | ✓ Covered |

### Missing Requirements

#### Critical Missing FRs

없음. 모든 PRD FR이 에픽 커버리지 맵에 매핑됨.

#### FRs in Epics but not in PRD

없음

### Coverage Statistics

- Total PRD FRs: 40
- FRs covered in epics: 40
- Coverage percentage: 100%


## UX Alignment Assessment

### UX Document Status

- Found: _bmad-output/planning-artifacts/ux-design-specification.md (whole document)

### Alignment Issues

- 경미한 용어 정합성 이슈: UX 액션 모델은 진행/보류/알림/드랍 중심인데, PRD FR7은 구매/판매/보류/대안 표현을 사용함. 스토리/화면/계측에서 용어 매핑 표준이 필요함.
- 이벤트 정합성 이슈: UX 여정에는 
ext_step_selected, preference_reason_logged, candidate_compared, 	radeoff_reviewed 등이 제시되지만, PRD의 핵심 이벤트 정의(11종)와 1:1 매핑 표가 문서 간에 명시되어 있지 않음.
- UI 라이브러리 기준의 추적성 이슈: UX는 MUI 기반을 명시하지만, 아키텍처 문서는 스타일링 전략을 선언 수준으로만 다뤄 컴포넌트/토큰 표준의 구현 책임(위치, 테스트 규칙)이 스토리 AC까지 완전 연결되어 있지 않음.

### Warnings

- 심각한 불일치는 발견되지 않았고, Architecture는 Hybrid 웹/접근성/WCAG AA/성능 게이트로 UX 요구를 전반적으로 수용함.
- 단, 위 3개 정합성 항목을 Story 수준 AC/DoD에 명문화하지 않으면 구현 단계에서 용어 및 계측 드리프트가 발생할 가능성이 있음.


## Epic Quality Review

### 🔴 Critical Violations

- 없음.

### 🟠 Major Issues

- Story 1.1(초기 템플릿 구축)은 필수 선행 스토리지만, 사용자 가치가 직접 표현되지 않은 기술 부트스트랩 성격이 강함.
  - 영향: 에픽/스토리 추적 시 사용자 가치 중심 원칙이 약화될 수 있음.
  - 권고: Story 1.1 AC에 "개발자가 첫 사용자 여정 스토리를 바로 구현/검증 가능한 실행 환경 확보"를 명시해 사용자 가치 연결을 강화.

- 다수 스토리 AC가 오류/예외 경로를 충분히 포함하지 않음.
  - 예: Story 2.1, 4.1, 4.2, 6.2, 7.2는 유효한 요청 중심 happy path가 강하고, 실패 시 사용자/운영 관점 기대 동작이 약함.
  - 영향: 구현 후 품질 편차 및 테스트 누락 위험 증가.
  - 권고: 각 스토리에 최소 1개 이상 오류 시나리오(권한 오류, 외부 신호 지연, 계약 위반, 타임아웃) AC 추가.

- Greenfield 초기 운영 스토리(예: CI/CD 품질 게이트 초기화, 환경 검증 자동화)가 Epic/Story 단에서 독립 스토리로 명시되지 않음.
  - 영향: 구현 초기에 품질 게이트가 지연 적용될 가능성.
  - 권고: Epic 1 또는 공통 운영 Epic에 "CI baseline + contract/perf gate" 스토리 추가.

### 🟡 Minor Concerns

- 용어 혼용: 드랍(UX) vs 대안/구매/판매(PRD FR7) 표현이 스토리 전반에 혼재.
  - 권고: Story/AC 상단에 공통 용어 사전(UX Action -> FR Action 매핑) 추가.

- AC의 정량 조건 일관성이 일부 부족함.
  - 예: "즉시", "최신" 같은 표현이 수치로 통일되지 않은 항목 존재.
  - 권고: NFR 수치(p95, SLA, 지연 기준)와 연결한 수용 기준 문구로 통일.

### Best Practices Compliance Checklist

- [x] Epic delivers user value
- [x] Epic can function independently
- [x] Stories appropriately sized
- [x] No forward dependencies detected
- [x] Database tables created when needed (no upfront all-table anti-pattern observed)
- [ ] Clear acceptance criteria (일부 스토리 오류/경계 시나리오 보강 필요)
- [x] Traceability to FRs maintained

### Dependency Analysis Summary

- 에픽 간 선행 구조(E1 -> E2 -> E3 ... -> E7)는 자연스럽고, Epic N이 Epic N+1을 요구하는 순방향 의존성은 발견되지 않음.
- 스토리 내부도 미래 스토리 선참조 문구("Story X.Y 완료 후")가 명시적으로 발견되지 않음.

### Remediation Recommendations

1. Story 1.1을 "기술 스캐폴드"가 아닌 "첫 사용자 가치 전달을 가능하게 하는 기반"으로 재서술.
2. Story 2.1/4.1/4.2/6.2/7.2에 실패/예외 AC를 추가하고 테스트 케이스와 1:1 매핑.
3. Greenfield 필수 운영 스토리(CI/CD + 계약검증 + 성능예산)를 Epic 1 early story로 승격.
4. 용어 매핑 표(Action taxonomy)를 pics.md 상단에 추가.


## Summary and Recommendations

### Overall Readiness Status

NEEDS WORK

### Critical Issues Requiring Immediate Action

- 치명(Critical) 결함은 없음.
- 다만 구현 시작 전에 반드시 보완해야 할 주요 이슈:
  - UX/PRD/Story 용어 매핑 부재 (구매/판매/대안 vs 진행/드랍)
  - UX 여정 이벤트와 PRD 핵심 이벤트(11종) 간 공식 1:1 매핑 표 부재
  - 주요 스토리 AC의 실패/예외 경로 부족 (Story 2.1, 4.1, 4.2, 6.2, 7.2)
  - Greenfield 초기 품질 게이트(CI/CD, contract/perf baseline) 스토리 미명시

### Recommended Next Steps

1. pics.md 상단에 Action Taxonomy(UX 액션 -> FR 액션) 및 이벤트 매핑 표를 추가한다.
2. Story 2.1/4.1/4.2/6.2/7.2의 AC에 오류/예외/권한/타임아웃 시나리오를 최소 1개 이상씩 보강한다.
3. Epic 1 초기 스토리로 CI/CD + 계약검증 + 성능예산 baseline 구축 스토리를 추가한다.
4. Story 1.1의 가치 진술을 "첫 사용자 여정 구현 가능 상태"로 재정의해 사용자 가치 추적성을 확보한다.

### Final Note

이번 평가에서는 총 8개 이슈(주요 3, 경미 5)를 3개 범주(UX 정합성, Epic/Story 품질, 구현 준비 운영 기준)에서 확인했다.
치명 결함은 없지만, 주요 이슈를 반영한 뒤 구현에 진입하는 것이 재작업 리스크를 줄인다.

**Assessor:** Codex (PM/SM readiness workflow)
**Assessment Date:** 2026-04-06


