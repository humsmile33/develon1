// 금시세 기능 모듈

/**
 * 금시세 데이터 로드
 */
async function loadGoldPrices() {
    const tbody = document.getElementById('goldPriceTableBody');
    const sortSelect = document.getElementById('sortSelect');
    const periodSelect = document.getElementById('periodSelect');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-state">
                <div class="loading-spinner"></div>
                <p>데이터를 불러오는 중...</p>
            </td>
        </tr>
    `;

    try {
        // 금시계 데이터 조회 (gold_prices 테이블)
        let query = window.SUPABASE_CLIENT
            .from('gold_prices')
            .select('*')
            .order('date', { ascending: false });

        // 기간 필터링
        if (periodSelect) {
            const period = periodSelect.value;
            if (period !== 'all') {
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - parseInt(period));
                query = query.gte('date', daysAgo.toISOString().split('T')[0]);
            }
        }

        const { data: goldPrices, error } = await query;

        if (error) {
            console.error('금시세 데이터 로드 오류:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-icon">⚠️</div>
                        <p>데이터 로드 실패: ${error.message}</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">테이블이 아직 생성되지 않았을 수 있습니다.</p>
                    </td>
                </tr>
            `;
            return;
        }

        // 정렬 적용
        if (sortSelect) {
            const sortBy = sortSelect.value;
            if (sortBy === 'date_asc') {
                goldPrices.sort((a, b) => new Date(a.date) - new Date(b.date));
            } else if (sortBy === 'price_desc') {
                goldPrices.sort((a, b) => b.sell_pure_375g - a.sell_pure_375g);
            } else if (sortBy === 'price_asc') {
                goldPrices.sort((a, b) => a.sell_pure_375g - b.sell_pure_375g);
            }
        }

        // 통계 업데이트
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        if (goldPrices && goldPrices.length > 0) {
            const latestDate = goldPrices[0].date;
            if (lastUpdateTime) {
                lastUpdateTime.textContent = `마지막 업데이트: ${window.DatabaseUtils.formatDateTime(latestDate)}`;
            }

            // 테이블 렌더링
            tbody.innerHTML = goldPrices.map(price => `
                <tr>
                    <td>${window.DatabaseUtils.formatDate(price.date)}</td>
                    <td>${window.DatabaseUtils.formatPrice(price.buy_pure_375g)}</td>
                    <td>${window.DatabaseUtils.formatPrice(price.sell_pure_375g)}</td>
                    <td>${window.DatabaseUtils.formatPrice(price.sell_18k_375g)}</td>
                    <td>${window.DatabaseUtils.formatPrice(price.sell_14k_375g)}</td>
                </tr>
            `).join('');
        } else {
            if (lastUpdateTime) {
                lastUpdateTime.textContent = '마지막 업데이트: -';
            }

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-icon">📊</div>
                        <p>아직 데이터가 없습니다.</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">크롤링이 실행되면 데이터가 자동으로 추가됩니다.</p>
                    </td>
                </tr>
            `;
        }
    } catch (e) {
        console.error('예상치 못한 오류:', e);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
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
window.loadGoldPrices = loadGoldPrices;
