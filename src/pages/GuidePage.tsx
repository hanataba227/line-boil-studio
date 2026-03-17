import { Link } from 'react-router-dom'
import { BookOpen, SlidersHorizontal, Palette, Code2, MessageSquarePlus } from 'lucide-react'

export default function GuidePage() {
  const basePath = import.meta.env.BASE_URL

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="홈으로 돌아가기"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#6C63FF' }}
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 5 C 8 3, 16 9, 19 7" />
              <path d="M5 10 C 8 8, 16 14, 19 12" />
              <path d="M5 15 C 8 13, 16 19, 19 17" />
              <path d="M5 20 C 8 18, 16 24, 19 22" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight" style={{ color: '#1A1A1A' }}>
            Line Boil Studio
          </h1>
        </Link>
        <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          사용법
        </span>

        <div className="ml-auto">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-gray-100"
            style={{ color: '#6C63FF' }}
          >
            <span>메인으로</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {/* 섹션 1: 앱 소개 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" style={{ color: '#6C63FF' }} />
            <h2 className="text-xl font-bold">소개</h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p>
              이미지 한 장을 업로드하면 Line Boil(선 떨림) 효과를 적용한 GIF를 자동으로
              생성해 주는 웹 도구입니다.
            </p>
          </div>

          {/* 예시 이미지 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-200">
                입력 이미지
              </div>
              <img
                src={`${basePath}example_input.jpg`}
                alt="Line Boil 효과 적용 전 원본 이미지"
                className="w-full h-auto"
              />
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-200">
                출력 GIF
              </div>
              <img
                src={`${basePath}example_output.gif`}
                alt="Line Boil 효과가 적용된 출력 GIF"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* 섹션 2: 파라미터 설명 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5" style={{ color: '#6C63FF' }} />
            <h2 className="text-xl font-bold">파라미터 설명</h2>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-semibold border-b border-gray-200 whitespace-nowrap">파라미터</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200 whitespace-nowrap">범위</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">설명</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">낮을 때</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">높을 때</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">프레임 수</td>
                  <td className="px-3 py-2 whitespace-nowrap">2–12</td>
                  <td className="px-3 py-2">GIF를 구성하는 정지 프레임의 수</td>
                  <td className="px-3 py-2">변화가 적고 파일이 가벼움</td>
                  <td className="px-3 py-2">움직임이 풍부하고 파일이 커짐</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">FPS</td>
                  <td className="px-3 py-2 whitespace-nowrap">1–24</td>
                  <td className="px-3 py-2">초당 표시되는 프레임 수 (재생 속도)</td>
                  <td className="px-3 py-2">느리고 끊기는 느낌</td>
                  <td className="px-3 py-2">빠르고 부드러운 떨림</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">변형 강도</td>
                  <td className="px-3 py-2 whitespace-nowrap">0.1–5.0</td>
                  <td className="px-3 py-2">픽셀이 최대 몇 px 이동하는지 결정</td>
                  <td className="px-3 py-2">미세한 떨림, 원본과 유사</td>
                  <td className="px-3 py-2">크게 흔들리는 왜곡 효과</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">변형 규모 (Scale)</td>
                  <td className="px-3 py-2 whitespace-nowrap">4–64</td>
                  <td className="px-3 py-2">변위 노이즈의 공간적 크기</td>
                  <td className="px-3 py-2">자글자글한 세밀한 노이즈</td>
                  <td className="px-3 py-2">넓고 부드러운 덩어리 변형</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">블러 강도 (Blur)</td>
                  <td className="px-3 py-2 whitespace-nowrap">0.01–0.20</td>
                  <td className="px-3 py-2">변위 노이즈에 적용하는 가우시안 블러 비율</td>
                  <td className="px-3 py-2">경계가 날카롭고 거친 변형</td>
                  <td className="px-3 py-2">변형 경계가 매끄럽게 이어짐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 섹션 3: 프리셋 기본값 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5" style={{ color: '#6C63FF' }} />
            <h2 className="text-xl font-bold">프리셋 기본값</h2>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">프리셋</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">프레임 수</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">FPS</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">변형 강도</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">변형 규모</th>
                  <th className="px-3 py-2 font-semibold border-b border-gray-200">블러 강도</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Subtle</td>
                  <td className="px-3 py-2">3</td>
                  <td className="px-3 py-2">8</td>
                  <td className="px-3 py-2">1.0</td>
                  <td className="px-3 py-2">32</td>
                  <td className="px-3 py-2">0.02</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Soft</td>
                  <td className="px-3 py-2">3</td>
                  <td className="px-3 py-2">8</td>
                  <td className="px-3 py-2">1.0</td>
                  <td className="px-3 py-2">32</td>
                  <td className="px-3 py-2">0.10</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Bold</td>
                  <td className="px-3 py-2">3</td>
                  <td className="px-3 py-2">8</td>
                  <td className="px-3 py-2">2.0</td>
                  <td className="px-3 py-2">16</td>
                  <td className="px-3 py-2">0.10</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            <span className="font-medium" style={{ color: '#6C63FF' }}>Tip</span>{' '}
            선화/스케치에는 Subtle, 채색 일러스트에는 Soft, 강조 효과에는 Bold를 시작점으로 삼아보세요.
          </div>
        </section>

        {/* 하단: GitHub + 건의함 */}
        <section className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <a
            href="https://github.com/hanataba227/line-boil-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Code2 className="w-5 h-5 shrink-0" style={{ color: '#6C63FF' }} />
            <div>
              <div className="text-sm font-medium">GitHub</div>
              <div className="text-xs text-gray-500">소스 코드 및 프로젝트</div>
            </div>
          </a>
          <a
            href="https://forms.gle/KSacKqNWgkF7i1RVA"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5 shrink-0" style={{ color: '#6C63FF' }} />
            <div>
              <div className="text-sm font-medium">건의함</div>
              <div className="text-xs text-gray-500">건의사항 및 오류 제보</div>
            </div>
          </a>
        </section>
      </main>
    </div>
  )
}
