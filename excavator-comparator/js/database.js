// ============================================
// 데이터베이스 관리 모듈
// ============================================

const ExcavatorDB = {
    // 제조사 목록 가져오기
    async getManufacturers() {
        try {
            const { data, error } = await supabase
                .from('manufacturers')
                .select('*')
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('제조사 데이터 로드 오류:', error);
            return [];
        }
    },

    // 모든 굴착기 모델 가져오기
    async getAllExcavators() {
        try {
            const { data, error } = await supabase
                .from('excavators')
                .select(`
                    *,
                    manufacturers (
                        id,
                        name,
                        name_ko,
                        home_url
                    )
                `)
                .order('operating_weight_kg');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('굴착기 데이터 로드 오류:', error);
            return [];
        }
    },

    // 필터링된 굴착기 모델 가져오기
    async getFilteredExcavators(filters) {
        try {
            let query = supabase
                .from('excavators')
                .select(`
                    *,
                    manufacturers (
                        id,
                        name,
                        name_ko
                    )
                `);

            // 제조사 필터
            if (filters.manufacturers && filters.manufacturers.length > 0) {
                query = query.in('manufacturer_id', filters.manufacturers);
            }

            // 체급 필터
            if (filters.weightClasses && filters.weightClasses.length > 0) {
                const classFilters = filters.weightClasses.map(cls => {
                    const range = APP_CONFIG.weightClasses[cls];
                    return `and(operating_weight_kg.gte.${range.min},operating_weight_kg.lte.${range.max})`;
                });
                query = query.or(classFilters.join(','));
            }

            // 중량 범위 필터
            if (filters.minWeight !== undefined) {
                query = query.gte('operating_weight_kg', filters.minWeight);
            }
            if (filters.maxWeight !== undefined) {
                query = query.lte('operating_weight_kg', filters.maxWeight);
            }

            // 모델명 검색
            if (filters.searchKeyword) {
                query = query.ilike('model_name', `%${filters.searchKeyword}%`);
            }

            query = query.order('operating_weight_kg');

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('필터링된 굴착기 데이터 로드 오류:', error);
            return [];
        }
    },

    // ID로 굴착기 모델 가져오기
    async getExcavatorById(id) {
        try {
            const { data, error } = await supabase
                .from('excavators')
                .select(`
                    *,
                    manufacturers (
                        id,
                        name,
                        name_ko,
                        home_url
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('굴착기 상세 데이터 로드 오류:', error);
            return null;
        }
    },

    // 여러 ID로 굴착기 모델 가져오기
    async getExcavatorsByIds(ids) {
        try {
            const { data, error } = await supabase
                .from('excavators')
                .select(`
                    *,
                    manufacturers (
                        id,
                        name,
                        name_ko
                    )
                `)
                .in('id', ids);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('굴착기 복수 데이터 로드 오류:', error);
            return [];
        }
    },

    // 전체 모델 수 가져오기
    async getTotalModelCount() {
        try {
            const { count, error } = await supabase
                .from('excavators')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('모델 수 로드 오류:', error);
            return 0;
        }
    }
};
