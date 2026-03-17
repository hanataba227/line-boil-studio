import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GuidePage from '../GuidePage'

function renderGuidePage() {
  return render(
    <MemoryRouter>
      <GuidePage />
    </MemoryRouter>
  )
}

describe('GuidePage', () => {
  it('3개 섹션 헤딩이 모두 표시된다 (소개, 파라미터 설명, 프리셋 기본값)', () => {
    renderGuidePage()

    expect(screen.getByText('소개')).toBeInTheDocument()
    expect(screen.getByText('파라미터 설명')).toBeInTheDocument()
    expect(screen.getByText('프리셋 기본값')).toBeInTheDocument()
  })

  it('소개 텍스트에 "Line Boil" 문자열이 포함된다', () => {
    renderGuidePage()

    // 헤더 타이틀과 소개 문단 모두 Line Boil을 포함
    const elements = screen.getAllByText(/Line Boil/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('파라미터 테이블에 5개 파라미터가 모두 포함된다', () => {
    renderGuidePage()

    // 파라미터 설명 테이블의 <td> 셀을 기준으로 확인 (프레임 수는 두 테이블에 모두 존재하므로 getAllByText 사용)
    const frameCountElements = screen.getAllByText('프레임 수')
    expect(frameCountElements.length).toBeGreaterThanOrEqual(1)

    const fpsElements = screen.getAllByText('FPS')
    expect(fpsElements.length).toBeGreaterThanOrEqual(1)

    const strengthElements = screen.getAllByText('변형 강도')
    expect(strengthElements.length).toBeGreaterThanOrEqual(1)

    // "변형 규모"와 "블러 강도"도 두 테이블에 존재하므로 getAllByText 사용
    const scaleElements = screen.getAllByText(/변형 규모/)
    expect(scaleElements.length).toBeGreaterThanOrEqual(1)

    const blurElements = screen.getAllByText(/블러 강도/)
    expect(blurElements.length).toBeGreaterThanOrEqual(1)
  })

  it('프리셋 테이블에 3개 프리셋(Subtle, Soft, Bold)이 모두 포함된다', () => {
    renderGuidePage()

    // 프리셋 테이블의 행들 (PresetPanel 버튼과 구분하기 위해 role=cell 기준)
    const cells = screen.getAllByRole('cell')
    const cellTexts = cells.map((cell) => cell.textContent)

    expect(cellTexts).toContain('Subtle')
    expect(cellTexts).toContain('Soft')
    expect(cellTexts).toContain('Bold')
  })

  it('추천 팁(Tip) 텍스트가 표시된다', () => {
    renderGuidePage()

    expect(screen.getByText('Tip')).toBeInTheDocument()
    // Tip 다음에 이어지는 추천 문구 확인
    expect(screen.getByText(/선화\/스케치에는 Subtle/)).toBeInTheDocument()
  })

  it('홈으로 돌아가는 링크(to="/")가 있다', () => {
    renderGuidePage()

    const homeLink = screen.getByRole('link', { name: /홈으로 돌아가기/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('입력 이미지와 출력 GIF 예시 이미지가 렌더링된다', () => {
    renderGuidePage()

    const inputImage = screen.getByAltText(/Line Boil 효과 적용 전 원본 이미지/i)
    expect(inputImage).toBeInTheDocument()

    const outputImage = screen.getByAltText(/Line Boil 효과가 적용된 출력 GIF/i)
    expect(outputImage).toBeInTheDocument()
  })

  it('"입력 이미지"와 "출력 GIF" 라벨이 표시된다', () => {
    renderGuidePage()

    expect(screen.getByText('입력 이미지')).toBeInTheDocument()
    expect(screen.getByText('출력 GIF')).toBeInTheDocument()
  })
})
