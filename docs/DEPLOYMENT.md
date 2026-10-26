# NATANA 배포 안내

## 준비물

- NATANA 저장소를 읽을 수 있는 GitHub 계정과 Vercel 계정
- 결제가 설정된 OpenAI API 프로젝트와 API 키 (ChatGPT 구독과 별도)
- Google Cloud 프로젝트 및 Google OAuth 클라이언트
- 로그인할 사람의 Google 계정 이메일 목록

비밀값은 채팅이나 GitHub에 올리지 마세요. 로컬에서는 `.env.local`, 배포에서는 Vercel 환경변수를 사용합니다. `.env.example`은 이름만 보여주는 예시입니다.

## 1. 로컬 실행

Node.js 22 이상에서 저장소 루트로 이동합니다.

```sh
npm ci
cp .env.example .env.local
openssl rand -base64 32
```

마지막 명령으로 생성된 값을 `.env.local`의 `NEXTAUTH_SECRET`에 입력합니다. 다른 비밀값도 직접 채웁니다. `NEXTAUTH_URL=http://localhost:3000`으로 둡니다. 아래 Google 설정에 로컬 콜백을 등록한 다음 실행합니다.

```sh
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. OpenAI와 로그인 설정이 비어 있으면 채팅을 사용할 수 없습니다. 인증 우회 모드는 없습니다.

## 2. Google 로그인 설정

콘솔 언어나 개편에 따라 버튼 표기가 다를 수 있습니다.

1. https://console.cloud.google.com 에 로그인합니다.
2. 상단 프로젝트 선택 → **새 프로젝트** → `NATANA` 입력 → **만들기**를 누르고 해당 프로젝트를 선택합니다.
3. 검색창에서 **Google Auth Platform**을 찾아 엽니다. 처음이면 **시작하기(Get started)**를 누릅니다.
4. **브랜딩(Branding)**에서 앱 이름, 지원 이메일, 개발자 연락 이메일을 설정합니다.
5. **대상(Audience)**을 설정합니다. 개인 Gmail이나 여러 조직의 계정이면 **외부(External)**를 선택합니다. **내부(Internal)**는 해당 Google Workspace 조직만 사용할 수 있습니다.
6. 외부 앱의 테스트 상태에서는 **테스트 사용자(Test users)**에 로그인할 계정을 추가합니다. 앱의 `ALLOWED_EMAILS`에도 별도로 넣어야 합니다. 실제 팀 운영 시 Google의 게시 상태·정책 요구를 확인합니다.
7. **클라이언트(Clients) → 클라이언트 만들기(Create client) → 웹 애플리케이션(Web application)**을 선택합니다.
8. 이름을 `NATANA Web`으로 입력합니다.
9. **승인된 리디렉션 URI(Authorized redirect URIs)**에 로컬 테스트용 `http://localhost:3000/api/auth/callback/google`을 추가합니다. 배포 후 실제 사이트의 `https://사이트주소/api/auth/callback/google`도 추가합니다. 경로·프로토콜까지 정확히 일치해야 합니다.
10. **만들기**를 누른 후 클라이언트 ID와 클라이언트 보안 비밀을 안전하게 보관합니다. 각각 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`에 사용합니다.

OAuth 클라이언트 ID는 일반 API 키와 다릅니다. Gmail API 활성화나 메일 읽기 권한은 필요하지 않습니다. Google이 확인한 이메일과 서버의 정확한 이메일 목록을 모두 통과해야 로그인됩니다.

## 3. OpenAI API 설정

1. https://platform.openai.com 에 로그인해 사용할 프로젝트를 선택합니다.
2. **Billing**에서 결제를 설정하고 **API keys → Create new secret key**로 서버용 키를 만듭니다.
3. 키는 `OPENAI_API_KEY`에 저장합니다. `NEXT_PUBLIC_` 접두어를 붙이지 않습니다.
4. 기본 모델은 `gpt-4.1-mini`입니다. 다른 Responses API 지원 모델을 쓰려면 `OPENAI_MODEL`을 변경합니다. 프로젝트의 모델 접근 권한도 확인합니다.
5. 프로젝트 사용량과 예산 알림을 설정합니다. 예산 알림이 반드시 사용을 차단하는 것은 아닙니다.

## 4. Vercel 배포

먼저 구현 코드와 `package-lock.json`, `agents/`를 GitHub에 커밋·푸시합니다. 비밀값은 포함하지 않습니다.

1. https://vercel.com 에서 **Sign Up / Log In → Continue with GitHub**를 선택합니다.
2. 대시보드 **Add New → Project**를 누릅니다.
3. `6ktqzqbmt6/NATANA` 옆 **Import**를 누릅니다. 안 보이면 GitHub App 연결 설정에서 해당 저장소 권한을 부여합니다.
4. Framework Preset은 **Next.js**, Root Directory는 저장소 루트 `./`로 둡니다. 빌드 명령은 `npm run build`입니다. Node.js는 지원되는 22 또는 24 버전을 사용합니다.
5. **Environment Variables**에서 아래 값을 추가합니다. 비밀값은 가능하면 Sensitive로 표시합니다. 초기에는 Production만 선택하고, Preview는 별도 테스트용 OAuth 클라이언트·주소·키를 구성할 때 활성화하는 편이 단순합니다.

| 이름 | 값 |
|---|---|
| `OPENAI_API_KEY` | OpenAI API 프로젝트 키 |
| `OPENAI_MODEL` | `gpt-4.1-mini` (생략 가능) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32`로 만든 무작위 값 |
| `NEXTAUTH_URL` | 실제 배포 주소, 예: `https://natana-example.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth 웹 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 보안 비밀 |
| `ALLOWED_EMAILS` | `person1@example.com,person2@example.com`처럼 실제 승인 이메일 |

6. 최초 배포 주소를 아직 모르면 먼저 다른 값을 등록해 **Deploy**합니다. 이때는 로그인 설정을 완료한 상태가 아닙니다.
7. 생성된 Production 주소를 확인하고 **프로젝트 → Settings → Environment Variables**에서 `NEXTAUTH_URL`을 그 주소로 추가·수정합니다. 콜백 경로는 이 변수에 넣지 않습니다.
8. Google Cloud의 해당 OAuth 클라이언트에 `https://실제주소/api/auth/callback/google`을 추가하고 **저장**합니다.
9. Vercel **Deployments → 최신 배포의 메뉴 → Redeploy**를 누릅니다. 환경변수 변경은 새 배포에 적용됩니다.
10. **Visit**로 사이트를 엽니다. 사용자 지정 도메인으로 바꾸면 `NEXTAUTH_URL`과 Google 콜백 주소도 함께 변경한 뒤 재배포합니다.

배포마다 바뀌는 Preview 주소를 운영 로그인 주소로 사용하지 마세요. Production의 고정 주소를 사용합니다. Vercel은 파일 추적 설정을 통해 `agents/*.md`를 채팅 함수에 포함합니다.

## 5. 실제 계정으로 최종 점검

- 로그아웃 상태에서 `/` 접근 시 로그인 페이지로 이동하는지 확인합니다.
- 승인된 Google 계정으로 로그인해 7개 역할 각각에 질문합니다.
- 승인하지 않은 Google 계정은 거부되는지 확인합니다. Google 테스트 사용자 제한과 앱 자체 이메일 제한은 별개입니다.
- 다른 역할로 바꾸면 대화가 분리되고, 돌아오면 기존 대화가 유지되는지 확인합니다.
- 새 대화 버튼이 선택 역할만 초기화하는지 확인합니다. 새로고침하면 모든 대화가 사라지는 것이 현재 사양입니다.
- 로그아웃 후 채팅 API를 이용할 수 없는지 확인합니다.
- OpenAI 사용량 화면에서 요청 비용을 확인합니다.

## 운영 범위와 한계

- 로그인은 NextAuth의 Google OAuth, 암호화된 JWT 쿠키를 사용합니다. 세션 만료는 8시간입니다. 서버가 매 요청마다 이메일 목록을 재검사하며, 목록 변경 후에는 재배포가 필요합니다.
- 브라우저에 API 키·시스템 프롬프트·OAuth 비밀을 보내지 않습니다. 역할 지침은 서버에서 읽습니다.
- 대화 DB, 파일 업로드, 웹 검색, 이미지 생성, 예약 작업은 포함하지 않습니다. 대화는 현재 탭의 메모리에만 있으며, 역할별로 최대 10회 질문·답변을 이어갈 수 있습니다. 역할 간 대화는 자동 공유되지 않습니다.
- 질문은 최대 12,000자, 대화 합계 40,000자, 요청 본문 180,000바이트, 답변은 최대 2,400 출력 토큰입니다. 답변이 잘리면 안내합니다.
- 서버 인스턴스당 사용자별 분당 10회 제한과 브라우저 내 중복 전송 방지가 있습니다. Vercel 인스턴스 간 공유 제한은 아니므로 엄격한 비용 상한이 필요하면 Redis 등 공유 저장소 기반 제한을 추가해야 합니다.
- 답변 생성 시 대화는 OpenAI에 전달됩니다. Responses API의 `store: false`를 설정하지만, 이는 OpenAI의 모든 보관 정책을 해제하는 설정이 아닙니다. 민감한 원가·개인정보 입력 전 조직의 처리 정책과 API 데이터 정책을 확인하세요.
- 규제 검토 결과와 AI의 계산·주장은 사람이 확인해야 합니다. 이 버전은 최신 웹 근거를 자동 조회하지 않습니다.

## 문제 해결

- **로그인 버튼 비활성화**: `NEXTAUTH_SECRET`, Google ID/비밀, `ALLOWED_EMAILS`를 확인하고 재배포합니다.
- **redirect_uri_mismatch**: Google에 등록한 콜백과 `NEXTAUTH_URL`의 주소가 정확히 맞는지 확인합니다.
- **접근 거부**: 올바른 Google 계정을 선택했는지, `ALLOWED_EMAILS`와 Google 테스트 사용자 목록을 확인합니다. 이메일 별칭은 별도 주소로 취급합니다.
- **허용되지 않은 요청**: 브라우저의 사이트 주소와 `NEXTAUTH_URL`을 맞춥니다.
- **AI 연결 설정 오류**: API 키, 결제, 모델 ID·접근 권한을 확인하고 재배포합니다. 키를 오류 화면에 붙여 넣지 않습니다.
- **AI 사용 한도 오류**: OpenAI 프로젝트 사용 한도·결제 또는 짧은 시간의 요청 수를 확인합니다.
