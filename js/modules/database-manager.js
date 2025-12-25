// 데이터베이스 관리 모듈
// 카드 로드, 렌더링, 선택, 삭제 기능

// 전역 변수
let currentDatabase = null;
let databaseList = [];

/**
 * 데이터베이스 카드 로드
 */
async function loadDatabaseCards() {
    try {
        const { data: databases, error } = await window.SUPABASE_CLIENT
            .from('databases')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('데이터베이스 목록 로드 오류:', error);
            return;
        }

        databaseList = databases || [];
        renderDatabaseCards(databaseList);

        // 첫 번째 데이터베이스 자동 선택
        if (databaseList.length > 0 && !currentDatabase) {
            selectDatabase(databaseList[0]);
        }
    } catch (e) {
        console.error('예상치 못한 오류:', e);
    }
}

/**
 * 데이터베이스 카드 렌더링
 */
function renderDatabaseCards(databases) {
    const grid = document.getElementById('databaseGrid');
    if (!grid) return;

    grid.innerHTML = databases.map(db => `
        <div class="database-card ${currentDatabase && currentDatabase.id === db.id ? 'selected' : ''}" 
             data-id="${db.id}" onclick="selectDatabaseById(${db.id})">
            <button class="delete-btn" onclick="event.stopPropagation(); deleteDatabase(${db.id})">🗑️</button>
            <div class="database-icon">${db.icon}</div>
            <h3 class="database-name">${db.name}</h3>
            <p class="database-description">${db.description}</p>
            <div class="database-stats">
                <div class="stat-item">
                    <span class="stat-value" id="recordCount_${db.id}">-</span>
                    <span class="stat-label">총 레코드</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">-</span>
                    <span class="stat-label">상태</span>
                </div>
            </div>
        </div>
    `).join('');

    // 각 데이터베이스의 레코드 수 로드
    databases.forEach(db => loadRecordCount(db));
}

/**
 * 레코드 수 로드
 */
async function loadRecordCount(db) {
    try {
        if (db.table_name === 'gold_prices') {
            const { count } = await window.SUPABASE_CLIENT
                .from('gold_prices')
                .select('*', { count: 'exact', head: true });
            document.getElementById(`recordCount_${db.id}`).textContent = (count || 0).toLocaleString();
        } else if (db.table_name === 'celebrities') {
            const { count } = await window.SUPABASE_CLIENT
                .from('celebrities')
                .select('*', { count: 'exact', head: true });
            document.getElementById(`recordCount_${db.id}`).textContent = (count || 0).toLocaleString();
        }
    } catch (e) {
        console.error('레코드 수 로드 오류:', e);
    }
}

/**
 * 데이터베이스 ID로 선택
 */
function selectDatabaseById(id) {
    const db = databaseList.find(d => d.id === id);
    if (db) {
        selectDatabase(db);
    }
}

/**
 * 데이터베이스 선택
 */
function selectDatabase(db) {
    currentDatabase = db;

    // 카드 선택 표시
    document.querySelectorAll('.database-card').forEach(card => {
        card.classList.remove('selected');
        if (parseInt(card.dataset.id) === db.id) {
            card.classList.add('selected');
        }
    });

    // 상세 섹션 표시
    const detailSection = document.getElementById('detailSection');
    if (detailSection) {
        detailSection.style.display = 'block';
    }

    // 상세 정보 업데이트
    const detailIcon = document.getElementById('detailIcon');
    const detailTitle = document.getElementById('detailTitle');
    if (detailIcon && detailTitle) {
        detailIcon.textContent = db.icon;
        detailTitle.textContent = db.name;
    }

    // 데이터베이스 유형에 따라 내용 렌더링
    const goldPriceContent = document.getElementById('goldPriceContent');
    const celebritiesContent = document.getElementById('celebritiesContent');
    const otherDatabaseContent = document.getElementById('otherDatabaseContent');

    if (goldPriceContent) goldPriceContent.style.display = 'none';
    if (celebritiesContent) celebritiesContent.style.display = 'none';
    if (otherDatabaseContent) otherDatabaseContent.style.display = 'none';

    if (db.table_name === 'gold_prices' && goldPriceContent) {
        goldPriceContent.style.display = 'block';
        if (window.loadGoldPrices) window.loadGoldPrices();
    } else if (db.table_name === 'celebrities' && celebritiesContent) {
        celebritiesContent.style.display = 'block';
        if (window.loadCelebrities) window.loadCelebrities();
    } else if (otherDatabaseContent) {
        otherDatabaseContent.style.display = 'block';
    }

    // 스크롤 이동
    if (detailSection) {
        detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * 데이터베이스 삭제
 */
async function deleteDatabase(id) {
    if (!confirm('정말로 이 데이터베이스를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const { error } = await window.SUPABASE_CLIENT
            .from('databases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('데이터베이스 삭제 오류:', error);
            alert('삭제 실패: ' + error.message);
            return;
        }

        // 카드 다시 렌더링
        await loadDatabaseCards();

        // 선택된 데이터베이스가 삭제되었으면 상세 섹션 숨김
        if (currentDatabase && currentDatabase.id === id) {
            currentDatabase = null;
            const detailSection = document.getElementById('detailSection');
            if (detailSection) {
                detailSection.style.display = 'none';
            }
        }

        alert('데이터베이스가 삭제되었습니다.');
    } catch (e) {
        console.error('예상치 못한 오류:', e);
        alert('오류가 발생했습니다.');
    }
}

/**
 * 모든 함수 내보내기
 */
window.DatabaseManager = {
    loadDatabaseCards,
    renderDatabaseCards,
    selectDatabaseById,
    selectDatabase,
    deleteDatabase,
    getCurrentDatabase: () => currentDatabase,
    getDatabaseList: () => databaseList
};
