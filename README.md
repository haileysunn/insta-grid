# 🎨 Insta Grid - 인스타그램 피드 분할기

3장이 하나로 이어지는 인스타그램 피드 이미지를 쉽게 만들 수 있는 웹 도구입니다.

## ✨ 주요 기능

- 📸 이미지를 3장으로 자동 분할
- 🎯 자르기 기준점 선택 (상단/중앙/하단/좌측/우측)
- 📱 인스타그램 피드 비율 자동 조정 (3:4 → 4:5)
- 👀 실시간 피드 미리보기
- 💾 개별/전체 다운로드

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📦 배포

### Cloudflare Pages
1. GitHub 저장소 연결
2. Build command: `npm run build`
3. Build output: `dist`

### Vercel
1. GitHub 저장소 연결
2. Framework Preset: Vite
3. 자동 배포!

## 🛠️ 기술 스택

- React 18
- Vite
- Tailwind CSS
- Lucide React (아이콘)

## 📝 사용 방법

1. 이미지 업로드
2. 자르기 기준점 선택
3. "3장으로 분할하기" 클릭
4. 다운로드
5. 인스타그램에 **3 → 2 → 1** 순서로 업로드

## 📄 라이선스

MIT