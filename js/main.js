// 메인 진입점
// 모든 모듈을 로드하고 이벤트 리스너를 설정

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Database 페이지 초기화 중...');
    
    // 데이터베이스 카드 로드
    if (window.DatabaseManager) {
        window.DatabaseManager.loadDatabaseCards();
    }
    
    // 이벤트 리스너 설정
    setupEventListeners();
});

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 금시세 관련 이벤트
    setupGoldPriceEventListeners();
    
    // 키큰 유명인 관련 이벤트
    setupCelebrityEventListeners();
    
    // 모달 관련 이벤트
    setupModalEventListeners();
}

/**
 * 금시세 이벤트 리스너 설정
 */
function setupGoldPriceEventListeners() {
    const sortSelect = document.getElementById('sortSelect');
    const periodSelect = document.getElementById('periodSelect');
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (window.loadGoldPrices) window.loadGoldPrices();
        });
    }
    
    if (periodSelect) {
        periodSelect.addEventListener('change', () => {
            if (window.loadGoldPrices) window.loadGoldPrices();
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (window.loadGoldPrices) window.loadGoldPrices();
        });
    }
}

/**
 * 키큰 유명인 이벤트 리스너 설정
 */
function setupCelebrityEventListeners() {
    const celebritySortSelect = document.getElementById('celebritySortSelect');
    const occupationFilter = document.getElementById('occupationFilter');
    const heightFilter = document.getElementById('heightFilter');
    const celebrityRefreshBtn = document.getElementById('celebrityRefreshBtn');
    
    if (celebritySortSelect) {
        celebritySortSelect.addEventListener('change', () => {
            if (window.loadCelebrities) window.loadCelebrities();
        });
    }
    
    if (occupationFilter) {
        occupationFilter.addEventListener('change', () => {
            if (window.loadCelebrities) window.loadCelebrities();
        });
    }
    
    if (heightFilter) {
        heightFilter.addEventListener('change', () => {
            if (window.loadCelebrities) window.loadCelebrities();
        });
    }
    
    if (celebrityRefreshBtn) {
        celebrityRefreshBtn.addEventListener('click', () => {
            if (window.loadCelebrities) window.loadCelebrities();
        });
    }
}

/**
 * 모달 관련 이벤트 리스너 설정
 */
function setupModalEventListeners() {
    const modal = document.getElementById('addModal');
    const addDatabaseBtn = document.getElementById('addDatabaseBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addDatabaseForm = document.getElementById('addDatabaseForm');
    const iconSelector = document.getElementById('iconSelector');
    const selectedIconInput = document.getElementById('selectedIcon');
    
    // 모달 열기
    if (addDatabaseBtn && modal) {
        addDatabaseBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    // 모달 닫기 (취소 버튼)
    if (cancelBtn && modal && addDatabaseForm) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            addDatabaseForm.reset();
            resetIconSelection(iconSelector, selectedIconInput);
        });
    }
    
    // 모달 닫기 (배경 클릭)
    if (modal && addDatabaseForm) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                addDatabaseForm.reset();
                resetIconSelection(iconSelector, selectedIconInput);
            }
        });
    }
    
    // 아이콘 선택
    if (iconSelector && selectedIconInput) {
        iconSelector.addEventListener('click', (e) => {
            const iconOption = e.target.closest('.icon-option');
            if (iconOption) {
                resetIconSelection(iconSelector, selectedIconInput);
                iconOption.classList.add('selected');
                selectedIconInput.value = iconOption.dataset.icon;
            }
        });
    }
    
    // 데이터베이스 추가
    if (addDatabaseForm && iconSelector && selectedIconInput) {
        addDatabaseForm.addEventListener('submit', (e) => {
            handleAddDatabase(e, iconSelector, selectedIconInput);
        });
    }
}

/**
 * 아이콘 선택 초기화
 */
function resetIconSelection(iconSelector, selectedIconInput) {
    if (!iconSelector || !selectedIconInput) return;
    
    iconSelector.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    selectedIconInput.value = '📊';
}

/**
 * 데이터베이스 추가 처리
 */
async function handleAddDatabase(event, iconSelector, selectedIconInput) {
    event.preventDefault();
    
    const name = document.getElementById('databaseName').value;
    const description = document.getElementById('databaseDescription').value;
    const icon = selectedIconInput.value;
    const tableName = document.getElementById('tableName').value;
    const modal = document.getElementById('addModal');
    const addDatabaseForm = document.getElementById('addDatabaseForm');
    
    try {
        // 최대 display_order 가져오기
        const { data: existingDbs } = await window.SUPABASE_CLIENT
            .from('databases')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);

        const nextOrder = existingDbs && existingDbs.length > 0 
            ? existingDbs[0].display_order + 1 
            : 1;

        // 데이터베이스 추가
        const { error } = await window.SUPABASE_CLIENT
            .from('databases')
            .insert({
                name,
                description,
                icon,
                table_name: tableName,
                display_order: nextOrder
            });

        if (error) {
            console.error('데이터베이스 추가 오류:', error);
            alert('추가 실패: ' + error.message);
            return;
        }

        // 모달 닫기
        modal.classList.remove('active');
        addDatabaseForm.reset();
        resetIconSelection(iconSelector, selectedIconInput);

        // 카드 다시 렌더링
        if (window.DatabaseManager) {
            await window.DatabaseManager.loadDatabaseCards();
        }

        alert('데이터베이스가 추가되었습니다.');
    } catch (e) {
        console.error('예상치 못한 오류:', e);
        alert('오류가 발생했습니다.');
    }
}
