// Font awesome のCSS疑似要素への使用を許可
window.FontAwesomeConfig = { searchPseudoElements: true };

window.addEventListener('DOMContentLoaded', () => {
    // Radix js の初期化、追加スクリプト
    const radix = new Radix({
        toggleNav: {
            active: false,
            trigger: '',
            target: '',
            preventScroll: false
        }
    });
    document.addEventListener('radixInit_', () => {
        // 追加のスクリプトはこの中に記述する
    });
    radix.init();
});