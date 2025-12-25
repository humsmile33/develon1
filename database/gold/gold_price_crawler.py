import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
from datetime import datetime

def scrape_gold_prices():
    """
    코리아골드 사이트에서 금 시세 데이터를 크롤링합니다.
    """
    url = "https://www.koreagoldx.co.kr/price/gold"
    
    print("크롤링 시작...")
    print(f"URL: {url}")
    
    # Chrome 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 헤드리스 모드 (GUI 없이 실행)
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    driver = None
    try:
        # 웹드라이버 초기화
        print("Chrome 드라이버 초기화 중...")
        driver = webdriver.Chrome(options=chrome_options)
        
        # 페이지 로드
        print("페이지 로드 중...")
        driver.get(url)
        
        # 페이지가 완전히 로드될 때까지 대기
        print("데이터 로드 대기 중...")
        time.sleep(3)  # JavaScript 실행을 위한 대기
        
        # 테이블이 로드될 때까지 대기
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "example-table"))
            )
            print("테이블 로드 완료!")
        except:
            print("테이블 로드 시간 초과, 계속 진행...")
        
        # 추가 대기 (데이터 렌더링)
        time.sleep(2)
        
        # 데이터 추출
        data = []
        page_count = 0
        max_pages = 10  # 최대 10페이지까지 (각 페이지 약 13개, 100개 커버)
        
        while len(data) < 100 and page_count < max_pages:
            page_count += 1
            print(f"\n페이지 {page_count} 데이터 추출 중...")
            
            # 현재 페이지의 모든 행 찾기
            rows = driver.find_elements(By.CSS_SELECTOR, '#example-table .tabulator-row')
            print(f"  현재 페이지 행 개수: {len(rows)}")
            
            # 현재 페이지 데이터 추출
            for row in rows:
                try:
                    # 각 셀의 데이터 추출
                    cells = row.find_elements(By.CLASS_NAME, 'tabulator-cell')
                    
                    if len(cells) >= 5:
                        date_text = cells[0].text.strip()
                        s_pure_text = cells[1].text.strip().replace(',', '')
                        p_pure_text = cells[2].text.strip().replace(',', '')
                        p_18k_text = cells[3].text.strip().replace(',', '')
                        p_14k_text = cells[4].text.strip().replace(',', '')
                        
                        # 이미 수집된 날짜인지 확인 (중복 방지)
                        if not any(d['고시날짜'] == date_text for d in data):
                            data.append({
                                '고시날짜': date_text,
                                '내가_살때_순금_3.75g': s_pure_text,
                                '내가_팔때_순금_3.75g': p_pure_text,
                                '내가_팔때_18K_3.75g': p_18k_text,
                                '내가_팔때_14K_3.75g': p_14k_text
                            })
                            print(f"    [{len(data)}] {date_text}: 순금 {s_pure_text}원")
                        
                except Exception as e:
                    print(f"    행 파싱 중 오류: {e}")
                    continue
            
            # 100개 데이터가 모였으면 종료
            if len(data) >= 100:
                print(f"\n100개 데이터 수집 완료!")
                break
            
            # 다음 페이지로 이동
            print(f"  수집된 데이터: {len(data)}개")
            
            # Next 버튼 찾기
            try:
                next_button = driver.find_element(By.CSS_SELECTOR, 'button[data-page="next"]')
                
                # Next 버튼이 비활성화되어 있으면 종료
                if next_button.get_attribute('disabled'):
                    print(f"  Next 버튼 비활성화 - 마지막 페이지 도달")
                    break
                
                # Next 버튼 클릭
                driver.execute_script("arguments[0].click();", next_button)
                time.sleep(2)  # 페이지 로드 대기
                
            except Exception as e:
                print(f"  다음 페이지 이동 실패: {e}")
                break
        
        print(f"\n총 {len(data)}개 데이터 추출 완료!")
        
        # DataFrame 생성
        df = pd.DataFrame(data)
        
        if df.empty:
            print("추출된 데이터가 없습니다.")
            return None
        
        # 날짜 기준 중복 제거 (최신 데이터만 유지)
        df = df.drop_duplicates(subset=['고시날짜'], keep='first')
        
        # 최신 100일치만 유지
        df = df.head(100)
        print(f"최신 100일치 데이터 추출 완료: {len(df)}일")
        
        # 날짜 형식 변환 (YYYY.MM.DD -> YYYY-MM-DD)
        def parse_date(date_str):
            try:
                return datetime.strptime(date_str, '%Y.%m.%d').strftime('%Y-%m-%d')
            except:
                return date_str
        
        df['고시날짜'] = df['고시날짜'].apply(parse_date)
        
        # 숫자 형식 변환
        numeric_columns = ['내가_살때_순금_3.75g', '내가_팔때_순금_3.75g', '내가_팔때_18K_3.75g', '내가_팔때_14K_3.75g']
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # 최신순 정렬
        df = df.sort_values('고시날짜', ascending=False)
        
        return df
    
    except Exception as e:
        print(f"크롤링 오류: {e}")
        return None
    finally:
        # 드라이버 종료
        if driver:
            driver.quit()

def save_to_excel(df, filename='gold_prices.xlsx'):
    """
    DataFrame을 엑셀 파일로 저장합니다.
    """
    try:
        # 엑셀 파일로 저장
        df.to_excel(filename, index=False, engine='openpyxl')
        
        print(f"\n{'='*50}")
        print(f"저장 완료!")
        print(f"파일명: {filename}")
        print(f"총 데이터 개수: {len(df)}")
        print(f"{'='*50}\n")
        
        # 데이터 미리보기
        print("데이터 미리보기 (상위 5개):")
        print(df.head())
        
        return True
    
    except Exception as e:
        print(f"엑셀 저장 오류: {e}")
        return False

def save_to_csv(df, filename='gold_prices.csv'):
    """
    DataFrame을 CSV 파일로 저장합니다.
    """
    try:
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        
        print(f"\nCSV 파일 저장 완료: {filename}")
        return True
    
    except Exception as e:
        print(f"CSV 저장 오류: {e}")
        return False

def main():
    """
    메인 함수
    """
    print("="*50)
    print("금 시세 크롤링 스크립트 (Selenium)")
    print("="*50)
    print()
    
    # 크롤링 실행
    df = scrape_gold_prices()
    
    if df is not None and not df.empty:
        # 엑셀 파일로 저장
        save_to_excel(df, 'gold_prices.xlsx')
        
        # CSV 파일로도 저장
        save_to_csv(df, 'gold_prices.csv')
        
        print("\n크롤링 완료!")
    else:
        print("\n크롤링 실패: 데이터를 가져올 수 없습니다.")

if __name__ == "__main__":
    main()
