export interface DreamMissions {
  read: string;
  watch: string;
  ask: string;
  try: string;
}

export interface DreamSeedOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  isUnknown?: boolean;
  missions: DreamMissions;
}

export interface InterestOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  missions: DreamMissions;
}

export const DREAM_SEED_OPTIONS: DreamSeedOption[] = [
  {
    id: 'chef',
    label: '요리사',
    emoji: '👨‍🍳',
    color: '#F4A259',
    missions: {
      read: '음식이나 요리 그림책 1권 읽어 보기',
      watch: '어린이 요리 영상 1편 찾아보기',
      ask: '집에서 밥 해 주시는 분께 비법 물어보기',
      try: '가족과 샌드위치 만들어 보기',
    },
  },
  {
    id: 'scientist',
    label: '과학자',
    emoji: '🔬',
    color: '#3B82F6',
    missions: {
      read: '신기한 과학 동화책 1권 읽어 보기',
      watch: '재미있는 과학 실험 영상 1편 찾아보기',
      ask: '선생님이나 가족에게 궁금한 자연 현상 물어보기',
      try: '얼음 녹는 시간 재는 작은 실험 해 보기',
    },
  },
  {
    id: 'doctor',
    label: '의사',
    emoji: '🩺',
    color: '#2F7D62',
    missions: {
      read: '우리 몸을 알려 주는 책 1권 읽어 보기',
      watch: '병원에서 일하는 의사 선생님 영상 찾아보기',
      ask: '건강을 지키는 습관 가족에게 물어보기',
      try: '매일 손 씻기와 양치질 꼼꼼히 해 보기',
    },
  },
  {
    id: 'vet',
    label: '수의사',
    emoji: '🐾',
    color: '#E07A5F',
    missions: {
      read: '동물 친구 이야기 책 1권 읽어 보기',
      watch: '동물 병원에서 동물 돌보는 영상 찾아보기',
      ask: '동물을 키워 본 가족이나 친구에게 물어보기',
      try: '우리 동네 동물이나 식물 이름 찾아 적어 보기',
    },
  },
  {
    id: 'teacher',
    label: '선생님',
    emoji: '👩‍🏫',
    color: '#F6C445',
    missions: {
      read: '학교나 선생님 이야기 책 1권 읽어 보기',
      watch: '재미있게 가르치는 수업 영상 찾아보기',
      ask: '우리 반 선생님이나 가족의 어릴 적 꿈 물어보기',
      try: '동생이나 인형에게 내가 아는 것 설명해 보기',
    },
  },
  {
    id: 'athlete',
    label: '운동선수',
    emoji: '⚽',
    color: '#E04F5F',
    missions: {
      read: '멋진 스포츠 선수 이야기 책 읽어 보기',
      watch: '내가 좋아하는 운동 경기 하이라이트 찾아보기',
      ask: '가족이 좋아하는 운동이 무엇인지 물어보기',
      try: '하루 10분 줄넘기나 스트레칭 해 보기',
    },
  },
  {
    id: 'artist',
    label: '화가',
    emoji: '🎨',
    color: '#EC4899',
    missions: {
      read: '그림이 예쁜 그림책 1권 천천히 보기',
      watch: '쉬운 그림 그리기 영상 1편 따라 보기',
      ask: '가족이 가장 좋아하는 색깔 물어보기',
      try: '겨울 풍경이나 내 꿈을 도화지에 그려 보기',
    },
  },
  {
    id: 'youtuber',
    label: '유튜버',
    emoji: '🎬',
    color: '#EF4444',
    missions: {
      read: '말하기나 이야기 만들기 책 1권 읽어 보기',
      watch: '어린이를 위한 유익한 영상 1편 찾아보기',
      ask: '가족이 재미있게 본 영상이 뭔지 물어보기',
      try: '내가 좋아하는 장난감이나 책을 1분 동안 소개해 보기',
    },
  },
  {
    id: 'firefighter',
    label: '소방관',
    emoji: '🚒',
    color: '#EA580C',
    missions: {
      read: '불을 끄고 사람을 구하는 소방관 책 읽어 보기',
      watch: '소방차가 출동하고 훈련하는 영상 찾아보기',
      ask: '집에서 지킬 안전 약속 가족과 이야기해 보기',
      try: '우리 집 비상구와 소화기 위치 확인해 보기',
    },
  },
  {
    id: 'police',
    label: '경찰관',
    emoji: '👮',
    color: '#2563EB',
    missions: {
      read: '우리 동네를 지키는 경찰관 책 읽어 보기',
      watch: '교통안전을 알려 주는 영상 찾아보기',
      ask: '길을 잃었을 때 도움 청하는 방법 물어보기',
      try: '횡단보도 건너기 5가지 약속 실천해 보기',
    },
  },
  {
    id: 'programmer',
    label: '프로그래머',
    emoji: '💻',
    color: '#0D9488',
    missions: {
      read: '컴퓨터나 코딩 입문 동화책 읽어 보기',
      watch: '로봇이나 게임이 만들어지는 영상 찾아보기',
      ask: '가족이 자주 쓰는 편리한 앱이 뭔지 물어보기',
      try: '블록 코딩 놀이 한 판 해 보기',
    },
  },
  {
    id: 'architect',
    label: '건축가',
    emoji: '🏗️',
    color: '#D97706',
    missions: {
      read: '세계의 신기한 집과 건물 책 읽어 보기',
      watch: '멋진 집을 짓는 과정 영상 찾아보기',
      ask: '가족이 살고 싶은 집 모양 물어보기',
      try: '종이 상자나 블록으로 나만의 꿈의 집 만들어 보기',
    },
  },
  {
    id: 'unknown',
    label: '아직 잘 모르겠어요',
    emoji: '🌱',
    color: '#2F7D62',
    isUnknown: true,
    missions: {
      read: '내가 궁금한 주제의 책 1권 골라 읽기',
      watch: '새로운 직업이나 취미 소개 영상 찾아보기',
      ask: '가족의 어릴 적 꿈 이야기 물어보기',
      try: '방학 동안 새로운 놀이 1가지 도전해 보기',
    },
  },
];

export const INTEREST_SEED_OPTIONS: InterestOption[] = [
  {
    id: 'interest-drawing',
    label: '그림 그리기',
    emoji: '🎨',
    color: '#EC4899',
    missions: {
      read: '예쁜 그림책 1권 골라 읽어 보기',
      watch: '동물이나 캐릭터 쉽게 그리는 영상 보기',
      ask: '가족의 좋아하는 색깔 물어보고 그려 주기',
      try: '겨울방학 나만의 그림 일기 1장 그려 보기',
    },
  },
  {
    id: 'interest-animals',
    label: '동물 친구',
    emoji: '🐾',
    color: '#E07A5F',
    missions: {
      read: '귀여운 동물 이야기 책 1권 읽어 보기',
      watch: '신기한 동물들의 겨울나기 영상 찾아보기',
      ask: '가족이 좋아하는 동물과 이유 물어보기',
      try: '좋아하는 동물 특징 3가지 찾아보기',
    },
  },
  {
    id: 'interest-sports',
    label: '신나는 운동',
    emoji: '⚽',
    color: '#E04F5F',
    missions: {
      read: '몸이 튼튼해지는 운동 그림책 읽어 보기',
      watch: '신나는 체조나 줄넘기 영상 찾아보기',
      ask: '가족과 함께 할 수 있는 운동 물어보기',
      try: '매일 아침 기지개 쭉 켜고 10분 몸 움직이기',
    },
  },
  {
    id: 'interest-making',
    label: '손으로 만들기',
    emoji: '🛠️',
    color: '#F4A259',
    missions: {
      read: '만들기나 발명 이야기 책 1권 읽어 보기',
      watch: '종이접기나 재활용품 만들기 영상 보기',
      ask: '집에서 안 쓰는 상자로 만들 것 의논하기',
      try: '종이나 블록으로 나만의 작품 1개 만들어 보기',
    },
  },
  {
    id: 'interest-music',
    label: '즐거운 음악',
    emoji: '🎵',
    color: '#3B82F6',
    missions: {
      read: '노래와 악기 이야기 동화책 읽어 보기',
      watch: '멋진 악기 연주나 합창 영상 찾아보기',
      ask: '가족이 좋아하는 노래 1곡 물어보기',
      try: '좋아하는 노래에 맞춰 박수 치며 따라 불러 보기',
    },
  },
  {
    id: 'interest-books',
    label: '재미있는 책',
    emoji: '📚',
    color: '#2F7D62',
    missions: {
      read: '도서관이나 집에서 새 책 1권 골라 읽기',
      watch: '동화책을 재미있게 읽어 주는 영상 보기',
      ask: '가족이 어릴 때 좋아했던 책 물어보기',
      try: '가장 재미있었던 장면 가족에게 들려주기',
    },
  },
];

export interface SnowmanQuestion {
  id: string;
  snowmanIndex: number;
  title: string;
  question: string;
  x: number;
  z: number;
  choices: { id: string; label: string; emoji: string }[];
}

export const SNOWMAN_QUESTIONS: SnowmanQuestion[] = [
  {
    id: 'like',
    snowmanIndex: 0,
    title: '첫 번째 눈사람',
    question: '나는 무엇을 좋아할까?',
    x: 8.2,
    z: 6.2,
    choices: [
      { id: 'draw', label: '그림 그리기·만들기', emoji: '🎨' },
      { id: 'move', label: '뛰어놀기·운동하기', emoji: '⚽' },
      { id: 'cook', label: '맛있는 음식 만들기', emoji: '🍳' },
      { id: 'animal', label: '동물·자연 돌보기', emoji: '🐾' },
      { id: 'read', label: '책 읽기·이야기 짓기', emoji: '📚' },
      { id: 'music', label: '노래·춤·악기 놀이', emoji: '🎵' },
    ],
  },
  {
    id: 'curious',
    snowmanIndex: 1,
    title: '두 번째 눈사람',
    question: '나는 무엇이 궁금할까?',
    x: -8.2,
    z: 2.2,
    choices: [
      { id: 'science', label: '우주와 과학의 비밀', emoji: '🔭' },
      { id: 'body', label: '우리 몸과 건강 지키는 법', emoji: '🩺' },
      { id: 'tech', label: '로봇과 게임 만드는 법', emoji: '🤖' },
      { id: 'build', label: '튼튼하고 멋진 건물', emoji: '🏛️' },
      { id: 'help', label: '사람들을 돕고 지키는 일', emoji: '🚒' },
      { id: 'world', label: '세상의 여러 나라와 문화', emoji: '🌍' },
    ],
  },
  {
    id: 'good-at',
    snowmanIndex: 2,
    title: '세 번째 눈사람',
    question: '나는 무엇을 잘할까?',
    x: -1.2,
    z: -10.6,
    choices: [
      { id: 'listen', label: '친구 이야기를 잘 들어줘요', emoji: '👂' },
      { id: 'patient', label: '어려워도 끝까지 해내요', emoji: '💪' },
      { id: 'idea', label: '새로운 생각을 잘 떠올려요', emoji: '💡' },
      { id: 'hands', label: '손으로 꼼꼼하게 잘 만들어요', emoji: '✂️' },
      { id: 'speak', label: '씩씩하게 내 생각을 말해요', emoji: '🎤' },
      { id: 'puzzle', label: '문제를 차근차근 잘 풀어요', emoji: '🧩' },
    ],
  },
];

export interface OxQuizQuestion {
  id: number;
  statement: string;
  answer: 'O' | 'X';
  explanation: string;
}

export const OX_QUIZ_QUESTIONS: OxQuizQuestion[] = [
  {
    id: 1,
    statement: '소방관은 남자만 할 수 있어요.',
    answer: 'X',
    explanation: '여자도 남자도 용감하고 멋진 소방관이 될 수 있어요!',
  },
  {
    id: 2,
    statement: '간호사는 여자만 할 수 있어요.',
    answer: 'X',
    explanation: '성별과 상관없이 누구나 아픈 사람을 돌보는 간호사가 될 수 있어요!',
  },
  {
    id: 3,
    statement: '좋아하고 노력하면 누구나 꿈을 꿀 수 있어요.',
    answer: 'O',
    explanation: '맞아요! 내가 좋아하고 꾸준히 노력하면 어떤 꿈이든 꿀 수 있어요.',
  },
  {
    id: 4,
    statement: '지금 못 하는 건 앞으로도 영원히 못 해요.',
    answer: 'X',
    explanation: '지금 서툴러도 연습하고 배우면 조금씩 더 잘하게 돼요!',
  },
  {
    id: 5,
    statement: '실수를 하면 새로운 걸 배울 수 있어요.',
    answer: 'O',
    explanation: '맞아요! 실수는 우리가 더 멋지게 자랄 수 있게 도와주는 선생님이에요.',
  },
];

export interface GiftCategory {
  id: keyof DreamMissions;
  label: string;
  emoji: string;
  color: string;
  ribbonColor: string;
  x: number;
  z: number;
}

export const GIFT_CATEGORIES: GiftCategory[] = [
  {
    id: 'read',
    label: '읽어 보기',
    emoji: '📚',
    color: '#3B82F6',
    ribbonColor: '#F6C445',
    x: -3.8,
    z: 2.2,
  },
  {
    id: 'watch',
    label: '찾아보기',
    emoji: '🎬',
    color: '#E04F5F',
    ribbonColor: '#F6F8FC',
    x: 3.8,
    z: 2.2,
  },
  {
    id: 'ask',
    label: '물어보기',
    emoji: '🎤',
    color: '#2F7D62',
    ribbonColor: '#F4A259',
    x: -3.6,
    z: -2.6,
  },
  {
    id: 'try',
    label: '해 보기',
    emoji: '✋',
    color: '#F4A259',
    ribbonColor: '#1E2A4A',
    x: 3.6,
    z: -2.6,
  },
];

export const FREQUENCY_OPTIONS = [
  { id: 'week-1', label: '일주일에 1번', desc: '부담 없이 가볍게 시작해요' },
  { id: 'week-2', label: '일주일에 2번', desc: '꾸준히 재미를 느껴 봐요' },
  { id: 'week-3', label: '일주일에 3번', desc: '조금씩 실력이 쑥쑥 자라요' },
];

export const PLEDGE_OPTIONS = [
  '나는 아직 연습하는 중이야!',
  '작은 걸음도 소중해!',
  '포기하지 않을 거야!',
  '매일 조금씩 자랄 거야!',
];
