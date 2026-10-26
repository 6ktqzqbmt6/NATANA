export const agents = [
  { id: "market-trends", name: "시장·트렌드 리서치", short: "시장 리서치", mark: "01", tag: "RESEARCH", description: "고객의 변화에서 브랜드의 기회를 발견합니다.", starters: ["국내 20대 립 제품의 경쟁 구도와 조사할 항목을 정리해줘.", "색조 브랜드 고객 인터뷰 질문 10개를 만들어줘."] },
  { id: "brand-strategy", name: "브랜드 전략", short: "브랜드 전략", mark: "02", tag: "STRATEGY", description: "NATANA가 선택받아야 하는 이유를 설계합니다.", starters: ["NATANA의 포지셔닝을 3가지 방향으로 제안해줘.", "20대 고객을 위한 브랜드 톤과 핵심 메시지를 정리해줘."] },
  { id: "product-planning", name: "상품 기획", short: "상품 기획", mark: "03", tag: "PRODUCT", description: "고객의 니즈를 구체적인 제품 기획으로 연결합니다.", starters: ["첫 색조 라인업을 위한 제품 기획서 틀을 만들어줘.", "립 제품 개발 시 제조사에 확인할 질문을 정리해줘."] },
  { id: "regulatory-labeling", name: "화장품 규제·표시 검토", short: "규제·표시 검토", mark: "04", tag: "REGULATORY", description: "제품과 메시지에 필요한 근거를 점검합니다.", starters: ["국내 화장품 패키지 표시 검토에 필요한 자료를 정리해줘.", "미백 광고 문구를 검토하려면 어떤 증빙이 필요해?"] },
  { id: "creative-design", name: "크리에이티브·디자인", short: "크리에이티브", mark: "05", tag: "CREATIVE", description: "브랜드의 생각을 일관된 시각 언어로 풀어냅니다.", starters: ["20대 타깃 색조 패키지 콘셉트를 3가지 제안해줘.", "NATANA 브랜드 촬영을 위한 크리에이티브 브리프를 작성해줘."] },
  { id: "marketing-content", name: "마케팅·콘텐츠", short: "마케팅·콘텐츠", mark: "06", tag: "MARKETING", description: "브랜드와 고객이 만나는 순간을 기획합니다.", starters: ["출시 전 4주 인스타그램 콘텐츠 캘린더를 만들어줘.", "신제품 캠페인의 목표와 측정 지표를 제안해줘."] },
  { id: "profit-inventory", name: "손익·재고 분석", short: "손익·재고 분석", mark: "07", tag: "OPERATIONS", description: "숫자를 바탕으로 지속 가능한 성장을 계획합니다.", starters: ["채널별 손익을 계산하는 데 필요한 데이터와 계산식을 정리해줘.", "첫 발주량을 정할 때 확인할 재고·수요 가정을 알려줘."] },
] as const;
export type AgentId = typeof agents[number]["id"];
export const agentIds = agents.map((agent) => agent.id) as [AgentId, ...AgentId[]];
