// 유틸리티 함수 모듈

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * 날짜시간 포맷팅 (한국어)
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 가격 포맷팅 (천 단위 콤마)
 */
function formatPrice(price) {
    if (!price) return '-';
    return new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * HTML 엔티티 이스케이프 (XSS 방지)
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '\u0026amp;')
        .replace(/</g, '\u0026lt;')
        .replace(/>/g, '\u0026gt;')
        .replace(/"/g, '\u0026quot;')
        .replace(/'/g, '\u0026#039;');
}

/**
 * 모든 유틸리티 함수 내보내기
 */
window.DatabaseUtils = {
    formatDate,
    formatDateTime,
    formatPrice,
    escapeHtml
};
