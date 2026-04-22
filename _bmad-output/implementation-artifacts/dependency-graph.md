# Story Dependency Graph
_Last updated: 2026-04-22T14:15:59.1605442+09:00_

## Stories

| Story | Epic | Title | Sprint Status | Issue | PR | PR Status | Dependencies | Ready to Work |
|-------|------|-------|--------------|-------|----|-----------|--------------|---------------|
| 1.1 | 1 | 프리리스팅 생성 및 임시저장 | done | #2 | #7 | merged | none | ✅ Yes (done) |
| 1.2 | 1 | 프리리스팅 조회 및 수정 | done | #3 | #8 | merged | 1.1 | ✅ Yes (done) |
| 1.3 | 1 | 필수 필드 검증 및 재시도 복구 | done | #4 | #9 | merged | 1.1 | ✅ Yes (done) |
| 1.4 | 1 | 1분 등록 플로우 기본 UX 및 접근성 적용 | done | #5 | #10 | merged | 1.2, 1.3 | ✅ Yes (done) |
| 2.1 | 2 | PhotoUploader 기반 이미지 업로드와 AI 초안 요청 | done | #11 | #25 | merged | none | ✅ Yes (done) |
| 2.2 | 2 | ExtractionFieldEditor 기반 초안 검토/수정/확정 | done | #12 | #27 | merged | 2.1 | ✅ Yes (done) |
| 2.3 | 2 | PriceSuggestionCard 기반 추천가 수용/수정 확정 | done | #13 | #28 | merged | 2.2 | ✅ Yes (done) |
| 2.4 | 2 | AI 실패/저신뢰 1탭 수동 fallback 완주 | done | #14 | #26 | merged | 2.1 | ✅ Yes (done) |
| 3.1 | 3 | 자동 가격조정 규칙 설정 | done | #15 | #29 | merged | none | ✅ Yes (done) |
| 3.2 | 3 | 규칙 기반 자동 가격조정 실행 및 사유 기록 | done | #16 | #30 | merged | 3.1 | ✅ Yes (done) |
| 3.3 | 3 | 가격 변경 이력 조회 및 최소 신호 수집 | backlog | #17 | — | — | 3.2 | ✅ Yes |
| 4.1 | 4 | MVP 핵심 이벤트 4종 계측 | backlog | #18 | — | — | 2.3, 3.2 | ❌ No (epic 3 not complete) |
| 4.2 | 4 | KPI 및 가드레일 모니터링 화면 | backlog | #19 | — | — | 4.1 | ❌ No (epic 3 not complete) |
| 4.3 | 4 | Go/Hold/Stop 판정 및 Feature Flag 운영 | backlog | #20 | — | — | 4.2 | ❌ No (epic 3 not complete) |
| 4.4 | 4 | 정책·신뢰 안내 접근성과 비차단 처리 | backlog | #21 | — | — | none | ❌ No (epic 3 not complete) |
| 5.1 | 5 | 프리리스팅 탐색 화면 제공 (Deferred-P2) | backlog | #22 | — | — | none | ❌ No (epic 4 not complete) |
| 5.2 | 5 | 관심 신호(찜/관심등록) 남기기 (Deferred-P2) | backlog | #23 | — | — | 5.1 | ❌ No (epic 4 not complete) |
| 5.3 | 5 | 관심 신호 기반 판매자 업데이트 우선순위 반영 (Deferred-P2) | backlog | #24 | — | — | 5.2 | ❌ No (epic 4 not complete) |

## Dependency Chains

- **1.2** depends on: 1.1
- **1.3** depends on: 1.1
- **1.4** depends on: 1.2, 1.3
- **2.2** depends on: 2.1
- **2.3** depends on: 2.2
- **2.4** depends on: 2.1
- **3.2** depends on: 3.1
- **3.3** depends on: 3.2
- **4.1** depends on: 2.3, 3.2
- **4.2** depends on: 4.1
- **4.3** depends on: 4.2
- **5.2** depends on: 5.1
- **5.3** depends on: 5.2

## Notes

Dependency mapping favors parallel work only where the story acceptance criteria are independent and lower epic gates are satisfied. Stories 2.1, 2.2, 2.3, and 2.4 are merged via PRs #25, #27, #28, and #26, so Epic 2 is complete. Story 3.1 merged via PR #29 and Story 3.2 merged via PR #30, making Story 3.3 the next ready backlog story. Epic 4 depends on event sources from earlier epics, with Story 4.4 functionally independent inside the epic but still blocked by lower-epic completion rules. Epic 5 remains deferred and blocked until Epic 4 is complete.
