# 🎨 Line Boil Studio

<table>
  <tr>
    <td align="center"><img src="public/example_input.jpg" width="360" alt="원본 이미지"></td>
    <td align="center"><img src="public/example_output.gif" width="360" alt="Line Boil GIF"></td>
  </tr>
  <tr>
    <th align="center">원본 이미지</th>
    <th align="center">Line Boil GIF</th>
  </tr>
</table>

이미지 한 장을 업로드하면 **Line Boil(선 떨림)** 효과를 적용한 GIF를 자동으로 생성해 주는 웹 도구입니다.
모든 이미지 처리가 브라우저에서 수행되어 서버에 이미지가 전송되지 않습니다.

---

## ✨ 주요 기능

- PNG / JPG 이미지 업로드 → Line Boil GIF 즉시 생성
- 3가지 빌트인 프리셋 (Subtle · Soft · Bold) + 커스텀 프리셋 생성/저장/이름 변경
- 미니 슬라이더로 프리셋 파라미터 직접 조정
- 원본 해상도 유지 옵션 제공(옵션 미적용시 300 DPI 출력 크기 자동 환산)
- 생성된 GIF 미리보기 및 다운로드

---

## 🌐 바로 사용하기

**[hanataba227.github.io/line-boil-studio](https://hanataba227.github.io/line-boil-studio/)**

---

## 🎛️ 파라미터 설명

| 파라미터              | 범위        | 설명                                      | 낮을 때                   | 높을 때                       |
| --------------------- | ----------- | ----------------------------------------- | ------------------------- | ----------------------------- |
| **프레임 수**         | 2 – 12      | GIF를 구성하는 정지 프레임의 수           | 변화가 적고 파일이 가벼움 | 움직임이 풍부하고 파일이 커짐 |
| **FPS**               | 1 – 24      | 초당 표시되는 프레임 수 (재생 속도)       | 느리고 끊기는 느낌        | 빠르고 부드러운 떨림          |
| **변형 강도**         | 0.1 – 5.0   | 픽셀이 최대 몇 px 이동하는지 결정         | 미세한 떨림, 원본과 유사  | 크게 흔들리는 왜곡 효과       |
| **변형 규모 (Scale)** | 4 – 64      | 변위 노이즈의 공간적 크기                 | 자글자글한 세밀한 노이즈  | 넓고 부드러운 덩어리 변형     |
| **블러 강도 (Blur)**  | 0.01 – 0.20 | 변위 노이즈에 적용하는 가우시안 블러 비율 | 경계가 날카롭고 거친 변형 | 변형 경계가 매끄럽게 이어짐   |

### 프리셋 기본값

| 프리셋            | 프레임 수 | FPS | 변형 강도 | 변형 규모 | 블러 강도 |
| ----------------- | --------- | --- | --------- | --------- | --------- |
| Preset 1 — Subtle | 3         | 8   | 1.0       | 32        | 0.02      |
| Preset 2 — Soft   | 3         | 8   | 1.0       | 32        | 0.10      |
| Preset 3 — Bold   | 3         | 8   | 2.0       | 16        | 0.10      |

> **추천:** 선화·스케치에는 Subtle, 채색 일러스트에는 Soft, 강조 효과에는 Bold를 시작점으로 삼아보세요.

---

## 🗂️ 프로젝트 구조

```
line-boil-studio/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── src/
│   ├── App.tsx                # 메인 앱 컴포넌트
│   ├── main.tsx               # 엔트리 포인트
│   ├── components/
│   │   ├── Sidebar.tsx        # 프리셋 선택/생성/저장/이름 변경
│   │   ├── ParameterSliders.tsx # 5종 파라미터 슬라이더
│   │   ├── ImageUploader.tsx  # 드래그앤드롭 업로드
│   │   ├── GifPreview.tsx     # GIF 결과 미리보기
│   │   └── OutputControls.tsx # 생성/다운로드 버튼
│   ├── engine/
│   │   ├── displacement.ts    # 변위 맵 생성
│   │   ├── gaussian-blur.ts   # 가우시안 블러
│   │   ├── remap.ts           # 픽셀 리매핑
│   │   └── gif-encoder.ts     # GIF 인코딩
│   ├── constants/
│   │   └── presets.ts
│   └── utils/
│       └── dpi.ts
└── .github/workflows/
    └── deploy.yml             # GitHub Pages 자동 배포
```

---

## 🛠️ 기술 스택

| 라이브러리                                    | 용도                             |
| --------------------------------------------- | -------------------------------- |
| [React 18](https://react.dev)                 | UI 프레임워크                    |
| [Vite](https://vite.dev)                      | 빌드 도구                        |
| [TypeScript](https://www.typescriptlang.org)  | 타입 안전성                      |
| [Tailwind CSS](https://tailwindcss.com)       | 스타일링                         |
| [Radix UI](https://www.radix-ui.com)          | 슬라이더 · 토스트 등 UI 컴포넌트 |
| [gif.js](https://jnordberg.github.io/gif.js/) | 클라이언트 사이드 GIF 인코딩     |
| [GitHub Pages](https://pages.github.com)      | 정적 호스팅                      |

---

## 📄 라이선스

MIT
