// Font awesome のCSS疑似要素への許可
window.FontAwesomeConfig = {
    searchPseudoElements: true
};

// Radix js の初期化、追加スクリプト
window.addEventListener('DOMContentLoaded', () => {
    let myRadix = new radix({
        toggleNav: {
            active: false,
            trigger: '',
            target: '',
            preventScroll: false
        }
    });
    myRadix.init();
});
