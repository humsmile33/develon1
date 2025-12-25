// 키큰 유명인 기능 모듈

/**
 * 키큰 유명인 데이터 로드
 */
async function loadCelebrities() {
    const tbody = document.getElementById('celebritiesTableBody');
    const sortSelect = document.getElementById('celebritySortSelect');
    const occupationFilter = document.getElementById('occupationFilter');
    const heightFilter = document.getElementById('heightFilter');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="loading-state">
                <div class="loading-spinner"></div>
                <p>데이터를 불러오는 중...</p>
            </td>
        </tr>
    `;

    try {
        // 키큰 유명인 데이터 조회 (celebrities 테이블)
        let query = window.SUPABASE_CLIENT
            .from('celebrities')
            .select('*');

        const { data: celebrities, error } = await query;

        if (error) {
            console.error('키큰 유명인 데이터 로드 오류:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-icon">⚠️</div>
                        <p>데이터 로드 실패: ${error.message}</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">테이블이 아직 생성되지 않았을 수 있습니다.</p>
                    </td>
                </tr>
            `;
            return;
        }

        // 필터링 적용
        let filteredData = [...celebrities];

        // 직업 필터링
        if (occupationFilter) {
            const occupation = occupationFilter.value;
            if (occupation !== 'all') {
                filteredData = filteredData.filter(c => c.occupation && c.occupation.includes(occupation));
            }
        }

        // 키 필터링
        if (heightFilter) {
            const height = heightFilter.value;
            if (height !== 'all') {
                if (height === '190') {
                    filteredData = filteredData.filter(c => c.height_cm >= 190);
                } else {
                    filteredData = filteredData.filter(c => c.height_cm === parseInt(height));
                }
            }
        }

        // 정렬 적용
        if (sortSelect) {
            const sortBy = sortSelect.value;
            if (sortBy === 'height_desc') {
                filteredData.sort((a, b) => b.height_cm - a.height_cm);
            } else if (sortBy === 'height_asc') {
                filteredData.sort((a, b) => a.height_cm - b.height_cm);
            } else if (sortBy === 'name_asc') {
                filteredData.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'age_asc') {
                filteredData.sort((a, b) => (a.birth_year || 9999) - (b.birth_year || 9999));
            }
        }

        // 통계 업데이트
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        if (filteredData && filteredData.length > 0) {
            const currentYear = new Date().getFullYear();
            const validBirthYears = filteredData.filter(c => c.birth_year).map(c => c.birth_year);
            
            if (validBirthYears.length > 0) {
                const oldestYear = Math.min(...validBirthYears);
                const youngestYear = Math.max(...validBirthYears);
                if (lastUpdateTime) {
                    lastUpdateTime.textContent = 
                        `총 ${filteredData.length}명 | 연령대: ${currentYear - youngestYear}세~${currentYear - oldestYear}세`;
                }
            } else {
                if (lastUpdateTime) {
                    lastUpdateTime.textContent = `총 ${filteredData.length}명`;
                }
            }

            // 테이블 렌더링
            tbody.innerHTML = filteredData.map(celebrity => {
                const age = celebrity.birth_year ? (currentYear - celebrity.birth_year) : '-';
                return `
                    <tr>
                        <td style="font-weight: 500;">${celebrity.name}</td>
                        <td>${celebrity.occupation || '-'}</td>
                        <td>${celebrity.birth_year || '-'}</td>
                        <td>${age}</td>
                        <td style="font-weight: 600; color: var(--primary-color);">${celebrity.height_cm}</td>
                        <td>${celebrity.gender}</td>
                    </tr>
                `;
            }).join('');
        } else {
            if (lastUpdateTime) {
                lastUpdateTime.textContent = '총 0명';
            }

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-icon">👤</div>
                        <p>검색 조건에 맞는 데이터가 없습니다.</p>
                    </td>
                </tr>
            `;
        }
    } catch (e) {
        console.error('예상치 못한 오류:', e);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-icon">❌</div>
                    <p>오류가 발생했습니다.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">${e.message}</p>
                </td>
            </tr>
        `;
    }
}

/**
 * 함수 내보내기
 */
window.loadCelebrities = loadCelebrities;
