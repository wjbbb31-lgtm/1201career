const ADJECTIVES = [
  '용감한',
  '반짝이는',
  '씩씩한',
  '다정한',
  '명랑한',
  '호기심 많은',
  '따뜻한',
  '재빠른',
  '지혜로운',
  '웃음 가득한',
  '씩씩한',
  '포근한',
];

const ANIMALS = [
  '펭귄',
  '북극곰',
  '수달',
  '눈여우',
  '하프물범',
  '순록',
  '올빼미',
  '토끼',
  '다람쥐',
  '고래',
];

export function generateNickname(previous?: string): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num = Math.floor(Math.random() * 90) + 10; // 10 ~ 99
    const candidate = `${adj} ${animal} ${num}`;
    if (candidate !== previous) {
      return candidate;
    }
  }
  return `반짝이는 펭귄 ${Math.floor(Math.random() * 90) + 10}`;
}
