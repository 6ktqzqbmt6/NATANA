# NATANA
화장품 브랜드 론칭. 20대 겨냥 색조 제조. 기초는 이미 제작 단계. 연매출 5-8천 억인 의약품 유통 회사의 자회사.


## NATANA Brand Studio

7개 전문 역할을 선택해 대화하는 Next.js 웹서비스입니다. Google이 확인한 이메일 중 `ALLOWED_EMAILS`에 지정한 사용자만 접근할 수 있습니다. API 키는 서버 전용입니다.

### 시작하기

Node.js 22 이상이 필요합니다.

```sh
npm ci
cp .env.example .env.local
# .env.local에 Google OAuth, 승인 이메일, 인증 비밀, OpenAI 키를 입력하세요.
npm run dev
```

[변경 요약과 화면 보기](docs/CHANGES.md) · [Google 로그인 설정과 Vercel 배포: 버튼별 안내](docs/DEPLOYMENT.md)

### 검증

```sh
npm test
npm run build
npm run typecheck
```

### 구성

- `src/components/studio.tsx`: 반응형 역할 선택·채팅 화면
- `src/lib/auth.ts`: Google OAuth와 승인 이메일 접근 제어
- `src/app/api/chat/route.ts`: 인증·입력 검증·서버 전용 OpenAI Responses API 호출
- `agents/*.md`: 서버에서 읽는 7개 역할 지침
- `.env.example`: 필요한 설정 이름 (비밀값 없음)

대화는 역할별로 현재 탭의 메모리에만 유지하며 새로고침하면 초기화됩니다. 웹 검색·이미지 생성·파일 업로드는 포함하지 않습니다. 아직 배포되거나 실제 계정의 연결이 완료된 상태를 의미하지 않습니다.
