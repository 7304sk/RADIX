window.addEventListener('DOMContentLoaded', () => {
    // Radix js の初期化、追加スクリプト
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
