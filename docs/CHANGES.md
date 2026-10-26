# NATANA Brand Studio 변경 요약

README만 있던 저장소에 7개 전문 역할과 대화할 수 있는 팀 전용 웹서비스를 추가했습니다.

## 주요 기능

- Next.js App Router 기반 한국어 웹서비스 및 반응형 화면
- 시장·트렌드 리서치, 브랜드 전략, 상품 기획, 규제·표시 검토, 크리에이티브·디자인, 마케팅·콘텐츠, 손익·재고 분석 선택
- 기존 역할 지침을 서버에서 읽어 적용하는 OpenAI Responses API 채팅
- Google이 확인한 이메일과 관리자 승인 목록을 모두 확인하는 로그인
- 로그인 페이지와 채팅 API의 서버 측 접근 제어 및 승인 목록 재검사
- 역할별 대화 분리, 추천 질문, 응답 대기 중단, 새 대화 확인, 오류 시 질문 복원
- 서버 전용 API 키, 입력 크기·대화 길이 검증, 요청 출처 확인, 인스턴스별 요청 빈도 제한

## 검토할 파일

| 내용 | 파일 |
|---|---|
| 설치·실행 | [README](../README.md) |
| 화면 | [데스크톱](screenshots/studio-desktop.png), [모바일](screenshots/studio-mobile.png), [로그인](screenshots/login.png) |
| 역할 지침 | [에이전트 안내](../agents/README.md) |
| 로그인·접근 제어 | [auth.ts](../src/lib/auth.ts), [access.ts](../src/lib/access.ts) |
| 채팅 요청 처리 | [route.ts](../src/app/api/chat/route.ts) |
| 채팅 화면 | [studio.tsx](../src/components/studio.tsx) |
| 환경변수 이름 | [.env.example](../.env.example) |
| Google·Vercel 설정 | [버튼별 배포 안내](DEPLOYMENT.md) |
| 검증 결과와 한계 | [검증 기록](VALIDATION.md) |

## 검증

잠금 파일 기반 설치, 프로덕션 빌드, 타입 검사, 테스트 16개가 통과했습니다. Chromium에서 인증된 테스트 세션과 모의 AI 응답으로 화면 및 접근 제어를 점검했습니다. 프로덕션 의존성 보안 검사에서 알려진 취약점은 발견되지 않았습니다.

## 반영 후 필요한 설정

Vercel에서 OpenAI API 키, Google OAuth 클라이언트, 인증 비밀, 사이트 주소, 승인 이메일을 등록하고 Google의 콜백 주소를 설정해야 합니다. 실제 Google OAuth 로그인, OpenAI 응답 및 Vercel 배포는 아직 검증하지 않았습니다.

대화는 현재 탭의 메모리에만 유지되어 새로고침하면 초기화됩니다. 웹 검색, 이미지 생성, 파일 업로드, 대화 DB, 예약 실행은 이번 범위에 포함하지 않습니다. 요청 빈도 제한은 인스턴스별이며 전체 배포에 공유되는 비용 상한은 아닙니다.
