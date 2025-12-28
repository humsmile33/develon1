// ============================================
// 메인 애플리케이션
// ============================================

class ExcavatorComparator {
    constructor() {
        this.allExcavators = [];
        this.manufacturers = [];
        this.filteredExcavators = [];
        this.comparisonDock = new Set();
        this.currentFilters = {
            manufacturers: [],
            weightClasses: ['mini', 'small', 'compact'],
            minWeight: 0,
            maxWeight: 11000,
            searchKeyword: ''
        };
    }

    // 초기화
    async init() {
        await this.loadData();
        this.initUI();
        this.renderManufacturers();
        this.renderModels();
        this.updateTotalCount();
    }

    // 데이터 로드
    async loadData() {
        try {
            const [excavators, manufacturers] = await Promise.all([
                ExcavatorDB.getAllExcavators(),
                ExcavatorDB.getManufacturers()
            ]);
            
            this.allExcavators = excavators;
            this.filteredExcavators = excavators;
            this.manufacturers = manufacturers;
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            showToast('데이터 로드에 실패했습니다.');
        }
    }

    // UI 초기화
    initUI() {
        // 필터 이벤트
        document.getElementById('applyFilter').addEventListener('click', () => this.applyFilters());
        document.getElementById('resetFilter').addEventListener('click', () => this.resetFilters());
        
        // 중량 범위 슬라이더
        const minRange = document.getElementById('weightMinRange');
        const maxRange = document.getElementById('weightMaxRange');
        
        minRange.addEventListener('input', () => this.updateWeightRange());
        maxRange.addEventListener('input', () => this.updateWeightRange());
        
        // 검색 입력
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.searchKeyword = e.target.value;
        });

        // 단위 토글
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                UnitConverter.setUnitSystem(e.target.dataset.unit);
                this.renderModels();
            });
        });

        // 비교함 버튼
        document.getElementById('clearDock').addEventListener('click', () => this.clearDock());
        document.getElementById('compareBtn').addEventListener('click', () => this.showComparison());

        // 모달 닫기
        document.getElementById('closeComparisonModal').addEventListener('click', () => this.closeModal());
        document.getElementById('comparisonModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // 차이점만 보기
        document.getElementById('diffOnlyToggle').addEventListener('change', () => {
            this.renderComparisonTable();
        });

        // PDF 다운로드
        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadPDF());
        
        // 인쇄
        document.getElementById('printBtn').addEventListener('click', () => {
            window.print();
        });
    }

    // 제조사 필터 렌더링
    renderManufacturers() {
        const container = document.getElementById('manufacturerFilter');
        container.innerHTML = this.manufacturers.map(m => `
            <label class="checkbox-label">
                <input type="checkbox" value="${m.id}" checked>
                <span>${m.name}</span>
            </label>
        `).join('');
    }

    // 모델 렌더링
    renderModels() {
        const grid = document.getElementById('modelGrid');
        const countEl = document.getElementById('modelCount');
        
        if (this.filteredExcavators.length === 0) {
            grid.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p>조건에 맞는 모델이 없습니다.</p>
                </div>
            `;
            countEl.textContent = '(0개)';
            return;
        }

        grid.innerHTML = this.filteredExcavators.map(model => {
            const isSelected = this.comparisonDock.has(model.id);
            const manufacturerName = model.manufacturers?.name || 'Unknown';
            const weightClass = this.getWeightClass(model.operating_weight_kg);
            
            return `
                <div class="model-card ${isSelected ? 'selected' : ''}" data-id="${model.id}">
                    <div class="model-header">
                        <span class="manufacturer-badge">${manufacturerName}</span>
                        <span class="weight-class-badge">${weightClass}</span>
                    </div>
                    <div class="model-name">${model.model_name}</div>
                    <div class="spec-grid">
                        <div class="spec-item">
                            <span class="spec-label">운전 중량</span>
                            <span class="spec-value">${UnitConverter.formatWeight(model.operating_weight_kg)}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">엔진 출력</span>
                            <span class="spec-value">${UnitConverter.formatPower(model.engine_power_kw)}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">굴착 깊이</span>
                            <span class="spec-value">${UnitConverter.formatLength(model.digging_depth_mm)}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">버킷 용량</span>
                            <span class="spec-value">${UnitConverter.formatBucketCapacity(model.bucket_capacity_m3)}</span>
                        </div>
                    </div>
                    <button class="compare-btn ${isSelected ? 'added' : ''}" onclick="app.toggleComparison('${model.id}')">
                        <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
                        ${isSelected ? '비교함에 추가됨' : '비교함에 추가'}
                    </button>
                </div>
            `;
        }).join('');

        countEl.textContent = `(${this.filteredExcavators.length}개)`;

        // 카드 클릭 이벤트
        grid.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('compare-btn')) {
                    const id = card.dataset.id;
                    this.toggleComparison(id);
                }
            });
        });
    }

    // 체급 레이블 가져오기
    getWeightClass(weight) {
        if (weight <= 2000) return '미니';
        if (weight <= 6000) return '소형';
        return '중소형';
    }

    // 중량 범위 업데이트
    updateWeightRange() {
        const minRange = document.getElementById('weightMinRange');
        const maxRange = document.getElementById('weightMaxRange');
        const display = document.getElementById('weightRangeValue');
        
        let min = parseInt(minRange.value);
        let max = parseInt(maxRange.value);
        
        // 최소값이 최대값보다 크면 교환
        if (min > max) {
            [min, max] = [max, min];
        }
        
        display.textContent = `${min.toLocaleString()} - ${max.toLocaleString()} kg`;
    }

    // 필터 적용
    async applyFilters() {
        // 제조사 필터
        const manufacturerCheckboxes = document.querySelectorAll('#manufacturerFilter input[type="checkbox"]:checked');
        this.currentFilters.manufacturers = Array.from(manufacturerCheckboxes).map(cb => cb.value);
        
        // 체급 필터
        const classCheckboxes = document.querySelectorAll('#weightClassFilter input[type="checkbox"]:checked');
        this.currentFilters.weightClasses = Array.from(classCheckboxes).map(cb => cb.value);
        
        // 중량 범위
        const minRange = document.getElementById('weightMinRange');
        const maxRange = document.getElementById('weightMaxRange');
        let min = parseInt(minRange.value);
        let max = parseInt(maxRange.value);
        if (min > max) [min, max] = [max, min];
        this.currentFilters.minWeight = min;
        this.currentFilters.maxWeight = max;
        
        // 데이터 필터링
        this.filteredExcavators = this.allExcavators.filter(model => {
            // 제조사 필터
            if (this.currentFilters.manufacturers.length > 0 && 
                !this.currentFilters.manufacturers.includes(model.manufacturer_id)) {
                return false;
            }
            
            // 체급 필터
            const weight = model.operating_weight_kg;
            const modelClass = weight <= 2000 ? 'mini' : weight <= 6000 ? 'small' : 'compact';
            if (this.currentFilters.weightClasses.length > 0 && 
                !this.currentFilters.weightClasses.includes(modelClass)) {
                return false;
            }
            
            // 중량 범위 필터
            if (weight < this.currentFilters.minWeight || weight > this.currentFilters.maxWeight) {
                return false;
            }
            
            // 검색 키워드
            if (this.currentFilters.searchKeyword) {
                const keyword = this.currentFilters.searchKeyword.toLowerCase();
                const manufacturerName = model.manufacturers?.name?.toLowerCase() || '';
                if (!model.model_name.toLowerCase().includes(keyword) && 
                    !manufacturerName.includes(keyword)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderModels();
        showToast(`필터가 적용되었습니다 (${this.filteredExcavators.length}개 모델)`);
    }

    // 필터 초기화
    resetFilters() {
        // 제조사 필터 초기화
        document.querySelectorAll('#manufacturerFilter input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        
        // 체급 필터 초기화
        document.querySelectorAll('#weightClassFilter input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        
        // 중량 범위 초기화
        document.getElementById('weightMinRange').value = 0;
        document.getElementById('weightMaxRange').value = 11000;
        document.getElementById('weightRangeValue').textContent = '0 - 11,000 kg';
        
        // 검색 초기화
        document.getElementById('searchInput').value = '';
        this.currentFilters.searchKeyword = '';
        
        // 필터 초기화
        this.currentFilters = {
            manufacturers: [],
            weightClasses: ['mini', 'small', 'compact'],
            minWeight: 0,
            maxWeight: 11000,
            searchKeyword: ''
        };
        
        // 전체 모델 표시
        this.filteredExcavators = this.allExcavators;
        this.renderModels();
        showToast('필터가 초기화되었습니다.');
    }

    // 비교함에 추가/제거
    toggleComparison(id) {
        if (this.comparisonDock.has(id)) {
            this.comparisonDock.delete(id);
            showToast('비교함에서 제거되었습니다.');
        } else {
            if (this.comparisonDock.size >= APP_CONFIG.maxComparisonItems) {
                showToast(`최대 ${APP_CONFIG.maxComparisonItems}개까지만 비교할 수 있습니다.`);
                return;
            }
            this.comparisonDock.add(id);
            showToast('비교함에 추가되었습니다.');
        }
        
        this.updateDock();
        this.renderModels();
    }

    // 비교함 업데이트
    updateDock() {
        const dock = document.getElementById('comparisonDock');
        const dockItems = document.getElementById('dockItems');
        const dockCount = document.getElementById('dockCount');
        const compareBtn = document.getElementById('compareBtn');
        
        dockCount.textContent = `${this.comparisonDock.size}/${APP_CONFIG.maxComparisonItems}`;
        
        if (this.comparisonDock.size === 0) {
            dock.classList.remove('visible');
            compareBtn.disabled = true;
            return;
        }
        
        dock.classList.add('visible');
        compareBtn.disabled = this.comparisonDock.size < 2;
        
        // 선택된 모델 가져오기
        const selectedModels = this.allExcavators.filter(m => this.comparisonDock.has(m.id));
        
        dockItems.innerHTML = selectedModels.map(model => `
            <div class="dock-item">
                <button class="dock-item-remove" onclick="app.removeComparison('${model.id}')">&times;</button>
                <div class="dock-item-info">${model.model_name}</div>
                <div class="dock-item-manufacturer">${model.manufacturers?.name || ''}</div>
            </div>
        `).join('');
    }

    // 비교함에서 제거
    removeComparison(id) {
        this.comparisonDock.delete(id);
        this.updateDock();
        this.renderModels();
    }

    // 비교함 비우기
    clearDock() {
        this.comparisonDock.clear();
        this.updateDock();
        this.renderModels();
        showToast('비교함이 비워졌습니다.');
    }

    // 비교 모달 표시
    async showComparison() {
        if (this.comparisonDock.size < 2) {
            showToast('최소 2개 모델을 선택해주세요.');
            return;
        }
        
        const selectedIds = Array.from(this.comparisonDock);
        const models = await ExcavatorDB.getExcavatorsByIds(selectedIds);
        
        this.currentComparisonModels = models;
        this.renderComparisonTable();
        
        document.getElementById('comparisonModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // 비교 테이블 렌더링
    renderComparisonTable() {
        const content = document.getElementById('comparisonContent');
        const diffOnly = document.getElementById('diffOnlyToggle').checked;
        const models = this.currentComparisonModels;
        
        // 비교할 제원 정의
        const specs = [
            { category: 'General', items: [
                { name: '운전 중량', value: 'operating_weight_kg', type: 'MASS', format: 'formatWeight' },
                { name: '체급', value: 'weight_class', type: 'TEXT' }
            ]},
            { category: 'Dimensions', items: [
                { name: '전폭', value: 'overall_width_mm', type: 'LENGTH', format: 'formatLength' },
                { name: '전고', value: 'overall_height_mm', type: 'LENGTH', format: 'formatLength' },
                { name: '최대 굴착 깊이', value: 'digging_depth_mm', type: 'LENGTH', format: 'formatLength' },
                { name: '후방 선회 반경', value: 'tail_swing_radius_mm', type: 'LENGTH', format: 'formatLength' }
            ]},
            { category: 'Performance', items: [
                { name: '엔진 출력', value: 'engine_power_kw', type: 'POWER', format: 'formatPower' },
                { name: '버킷 용량', value: 'bucket_capacity_m3', type: 'VOLUME', format: 'formatBucketCapacity' }
            ]},
            { category: 'Fuel & Hydraulics', items: [
                { name: '연료 탱크 용량', value: 'fuel_tank_capacity_l', type: 'VOLUME', format: 'formatFuelCapacity' }
            ]}
        ];

        let html = `
            <div class="comparison-table-wrapper">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>제원</th>
                            ${models.map(m => `
                                <th class="model-header-cell">
                                    <div class="model-info">
                                        <img src="https://via.placeholder.com/200x150?text=${encodeURIComponent(m.model_name)}" 
                                             alt="${m.model_name}" 
                                             class="model-image">
                                        <div style="font-weight: 700; margin-bottom: 5px;">${m.model_name}</div>
                                        <div style="font-size: 0.85rem; color: var(--text-sub);">${m.manufacturers?.name || ''}</div>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        // 각 카테고리별 제원 렌더링
        specs.forEach(category => {
            html += `<tr><td class="spec-category" colspan="${models.length + 1}">${category.category}</td></tr>`;
            
            category.items.forEach(spec => {
                // 차이점만 보기 체크
                if (diffOnly) {
                    const values = models.map(m => m[spec.value]);
                    const allSame = values.every(v => v === values[0]);
                    if (allSame) return;
                }
                
                html += `<tr>`;
                html += `<td class="spec-name">${spec.name}</td>`;
                
                models.forEach(m => {
                    let valueDisplay = '-';
                    
                    if (spec.type === 'TEXT') {
                        if (spec.value === 'weight_class') {
                            valueDisplay = this.getWeightClass(m.operating_weight_kg);
                        }
                    } else {
                        const value = m[spec.value];
                        if (spec.format && UnitConverter[spec.format]) {
                            valueDisplay = UnitConverter[spec.format](value);
                        }
                    }
                    
                    html += `<td class="spec-value">${valueDisplay}</td>`;
                });
                
                html += `</tr>`;
            });
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    }

    // 모달 닫기
    closeModal() {
        document.getElementById('comparisonModal').classList.remove('open');
        document.body.style.overflow = '';
    }

    // PDF 다운로드
    downloadPDF() {
        const element = document.getElementById('comparisonContent');
        const opt = {
            margin: 10,
            filename: 'excavator-comparison.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save();
        showToast('PDF가 다운로드되었습니다.');
    }

    // 전체 모델 수 업데이트
    updateTotalCount() {
        const totalEl = document.getElementById('totalModels');
        totalEl.textContent = this.allExcavators.length;
    }
}

// 토스트 메시지 표시
function showToast(message) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 애플리케이션 초기화
const app = new ExcavatorComparator();

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
