/************************************

    RADIX
    - Version : 4.0.0

    Copyright 2021 shoalwave and other contributors.
    Released under the MIT License.
    https://github.com/7304sk/RADIX/blob/main/LICENSE.txt

************************************/
/**
 * 本体クラス
 * @typedef radix
 * @type class
 * @property {object}   option         オプション値を格納
 * @property {object}   modalParts     モーダルウィンドウ機能で生成しているエレメントノードたち
 * @property {object}   events         各操作に対して発火しているイベントフックたち
 * @property {object}   icons          SVGアイコンの全ノード
 * @property {boolean}  isMobile       モバイル端末（タッチ操作可能）か否か
 * @property {boolean}  navState       ナビゲーションの開閉状態
 * @property {boolean}  modalState     モーダルウィンドウの開閉状態
 * @property {boolean}  windowLoaded   HTML内の要素をブラウザが読み込み完了したか
 * @property {boolean}  initialized    init() 関数の実行が完了したか
 * @property {function} init           radixの初期化を行う関数
 * @property {function} toggleNav      ナビゲーション開閉を実行する関数
 * @property {function} smoothScroll   スムーススクロールを実行する関数
 * @property {function} replaceIcon    SVGアイコンにエレメントを置換する関数
 * @property {function} dragDown       ドラッグスクロールのマウスダウン
 * @property {function} dragMove       ドラッグスクロールのマウスムーブ
 * @property {function} dragUp         ドラッグスクロールのマウスアップ
 * @property {function} modalOpen      モーダルウィンドウを開く関数
 * @property {function} modalClose     モーダルウィンドウを閉じる関数
 * @property {function} modalResize    モーダルウィンドウの拡縮をする関数
 * @property {function} floatRound     浮動小数点数の文字列変換関数
 * @property {function} floatCeil      浮動小数点数の文字列変換関数
 * @property {function} floatFloor     浮動小数点数の文字列変換関数
 * @property {function} preventScroll  ページ全体の縦方向スクロール禁止を操作する関数
 * @property {function} getEasing      イージング関数を取得する関数
 */
class Radix {
    /**
     * コンストラクタ
     * @constructor
     */
    constructor(option, mode) {
        const defOption = {
            timeFrame: 10,
            preload: {
                active: false,
                selector: '',
                class: 'hide',
                delay: 200,
                preventScroll: false
            },
            smoothScroll: {
                active: true,
                duration: 600,
                easing: 'easeInOutExpo'
            },
            autoTargetBlank: {
                active: true
            },
            toggleNav: {
                active: false,
                trigger: '',
                target: '',
                class: 'opened',
                preventScroll: false
            },
            icons: {
                active: true,
                selector: '.radix-icon'
            },
            dragScroll: {
                active: true,
                selector: '.radix-drag',
                hint: true
            },
            flexFix: {
                active: true,
                selector: '.radix-flexfix',
                inherit: true,
                min: 0
            },
            modal: {
                active: true,
                selector: '.radix-modal',
                color: 'white',
                resizeDuration: 300,
                resizeEasing: 'easeInOutBack',
                scaleStep: [0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
                fit: true,
                drag: true,
                magnify: true
            },
            scrollAppear: {
                active: true,
                selector: '.radix-appear',
                delay: 200,
                reset: true,
                class: 'active'
            }
        }
        const argFlg = this.typeJudge(option) == 'object' ? true : false;
        Object.keys(defOption).forEach(key => {
            if (mode === false && key != 'timeFrame') {
                defOption[key].active = false;
            }
            if (argFlg) {
                Object.assign(defOption[key], option[key]);
            }
        });
        this.option = defOption;
        // インスタンス変数
        this.navState = false;
        this.modalState = false;
        this.initialized = false;
        this.windowLoaded = false;
        this.isMobile = typeof window.ontouchstart === "undefined" ? false : true;
    }
    events = {
        beforeInitialize: new CustomEvent('_radixInit'),
        afterInitialize: new CustomEvent('radixInit_'),
        beforeScroll: new CustomEvent('_radixScroll'),
        afterScroll: new CustomEvent('radixScroll_'),
        beforeNavOpen: new CustomEvent('_radixNavOpen'),
        afterNavOpen: new CustomEvent('radixNavOpen_'),
        beforeNavClose: new CustomEvent('_radixNavClose'),
        afterNavClose: new CustomEvent('radixNavClose_'),
        beforeModalOpen: new CustomEvent('_radixModalOpen'),
        afterModalOpen: new CustomEvent('radixModalOpen_'),
        beforeModalClose: new CustomEvent('_radixModalClose'),
        afterModalClose: new CustomEvent('radixModalClose_'),
    }
    /**
     * DOMロード時に実行し初期化する関数
     */
    init() {
        const self = this;
        self.DOM_ROOTS = document.querySelectorAll('html,body');
        new Promise(resolve => {
            // Speed 0
            document.dispatchEvent(self.events.beforeInitialize);
            resolve();
        }).then(() => {
            // Speed 1
            return new Promise(resolve => {
                // preload display
                if (self.option.preload.preventScroll) self.preventScroll(true);
                let preloader = self.option.preload.selector.length > 0 ? document.querySelectorAll(self.option.preload.selector) : [];
                window.addEventListener('load', () => {
                    self.windowLoaded = true;
                    if (self.option.preload.active && preloader && self.initialized) {
                        setTimeout(() => {
                            if (self.option.preload.preventScroll) self.preventScroll(false);
                            preloader.forEach(pl => {
                                pl.classList.add(self.option.preload.class);
                            });
                        }, self.option.preload.delay);
                    }
                });
                document.addEventListener('radixInit_', () => {
                    self.initialized = true;
                    if (self.option.preload.active && preloader.length > 0 && self.windowLoaded) {
                        setTimeout(() => {
                            if (self.option.preload.preventScroll) self.preventScroll(false);
                            preloader.forEach(pl => {
                                pl.classList.add(self.option.preload.class);
                            });
                        }, self.option.preload.delay);
                    }
                });
                // SVG insert
                if (self.option.icons.active) {
                    const iconSources = {
                        cross: {
                            viewbox: '0 0 100 100',
                            path: 'M 2 17 L 17 2 L 50 35 L 83 2 L 98 17 L 65 50 L 98 83 L 83 98 L 50 65 L 17 98 L 2 83 L 35 50 L 2 17 Z',
                            fill: true,
                            stroke: 0,
                            linejoin: 'miter',
                            linecap: 'butt'
                        },
                        angle_top: {
                            viewbox: '0 0 100 100',
                            path: 'M 50 19 L 97 66 L 84 79 L 50 45 L 16 79 L 3 66 L 50 19 Z',
                            fill: true,
                            stroke: 0
                        },
                        angle_right: {
                            viewbox: '0 0 100 100',
                            path: 'M 81 50 L 34 97 L 21 84 L 55 50 L 21 16 L 34 3 L 81 50 Z',
                            fill: true,
                            stroke: 0
                        },
                        angle_bottom: {
                            viewbox: '0 0 100 100',
                            path: 'M 50 81 L 97 34 L 84 21 L 50 55 L 16 21 L 3 34 L 50 81 Z',
                            fill: true,
                            stroke: 0
                        },
                        angle_left: {
                            viewbox: '0 0 100 100',
                            path: 'M 19 50 L 66 3 L 79 16 L 45 50 L 79 84 L 66 97 L 19 50 Z',
                            fill: true,
                            stroke: 0
                        },
                        arrow_lr: {
                            viewbox: '0 0 100 100',
                            path: 'M 10 50 L 35 20 L 35 42 L 65 42 L 65 20 L 90 50 L 65 80 L 65 58 L 35 58 L 35 80 L 10 50 Z',
                            fill: true,
                            stroke: 0
                        },
                        arrow_tb: {
                            viewbox: '0 0 100 100',
                            path: 'M 50 10 L 80 35 L 58 35 L 58 65 L 80 65 L 50 90 L 20 65 L 42 65 L 42 35 L 20 35 L 50 10 Z',
                            fill: true,
                            stroke: 0
                        },
                        magnifying_glass: {
                            viewbox: '0 0 500 500',
                            path: 'M 120 195 C 120 92.896 202.896 10 305 10 C 407.104 10 490 92.896 490 195 C 490 297.104 407.104 380 305 380 C 202.896 380 120 297.104 120 195 Z  M 180 195 C 179.99 186.52 180.85 178.06 182.55 169.75 C 184.18 161.76 186.61 153.94 189.8 146.42 C 196.1 131.55 205.21 118.05 216.64 106.64 C 228.05 95.21 241.55 86.1 256.42 79.8 C 263.94 76.61 271.76 74.18 279.76 72.54 C 288.07 70.85 296.52 69.99 305 70 C 313.48 69.99 321.93 70.85 330.24 72.54 C 338.24 74.18 346.06 76.61 353.58 79.8 C 368.45 86.1 381.95 95.21 393.36 106.64 C 404.79 118.05 413.9 131.55 420.2 146.42 C 423.39 153.94 425.82 161.76 427.46 169.76 C 429.15 178.07 430.01 186.52 430 195 C 430.01 203.48 429.15 211.93 427.46 220.24 C 425.82 228.24 423.39 236.06 420.2 243.58 C 413.9 258.45 404.79 271.95 393.36 283.36 C 381.95 294.79 368.45 303.9 353.58 310.2 C 346.06 313.39 338.24 315.82 330.24 317.46 C 321.93 319.15 313.48 320.01 305 320 C 296.52 320.01 288.07 319.15 279.76 317.46 C 271.76 315.82 263.94 313.39 256.42 310.2 C 241.55 303.9 228.05 294.79 216.64 283.36 C 205.21 271.95 196.1 258.45 189.8 243.58 C 186.61 236.06 184.18 228.24 182.54 220.24 C 180.85 211.93 179.99 203.48 180 195 Z  M 13 490 L 13 413.148 L 126.148 300 L 203 376.852 L 89.852 490 L 13 490 Z',
                            fill: true,
                            fillRule: "evenodd",
                            stroke: 0
                        },
                        zoom_in: {
                            viewbox: '0 0 500 500',
                            path: 'M 120 195 C 120 92.896 202.896 10 305 10 C 407.104 10 490 92.896 490 195 C 490 297.104 407.104 380 305 380 C 202.896 380 120 297.104 120 195 Z  M 180 195 C 179.99 186.52 180.85 178.06 182.55 169.75 C 184.18 161.76 186.61 153.94 189.8 146.42 C 196.1 131.55 205.21 118.05 216.64 106.64 C 228.05 95.21 241.55 86.1 256.42 79.8 C 263.94 76.61 271.76 74.18 279.76 72.54 C 288.07 70.85 296.52 69.99 305 70 C 313.48 69.99 321.93 70.85 330.24 72.54 C 338.24 74.18 346.06 76.61 353.58 79.8 C 368.45 86.1 381.95 95.21 393.36 106.64 C 404.79 118.05 413.9 131.55 420.2 146.42 C 423.39 153.94 425.82 161.76 427.46 169.76 C 429.15 178.07 430.01 186.52 430 195 C 430.01 203.48 429.15 211.93 427.46 220.24 C 425.82 228.24 423.39 236.06 420.2 243.58 C 413.9 258.45 404.79 271.95 393.36 283.36 C 381.95 294.79 368.45 303.9 353.58 310.2 C 346.06 313.39 338.24 315.82 330.24 317.46 C 321.93 319.15 313.48 320.01 305 320 C 296.52 320.01 288.07 319.15 279.76 317.46 C 271.76 315.82 263.94 313.39 256.42 310.2 C 241.55 303.9 228.05 294.79 216.64 283.36 C 205.21 271.95 196.1 258.45 189.8 243.58 C 186.61 236.06 184.18 228.24 182.54 220.24 C 180.85 211.93 179.99 203.48 180 195 Z  M 13 490 L 13 413.148 L 126.148 300 L 203 376.852 L 89.852 490 L 13 490 Z  M 205 160 L 270 160 L 270 95 L 340 95 L 340 160 L 405 160 L 405 230 L 340 230 L 340 295 L 270 295 L 270 230 L 205 230 L 205 160 Z',
                            fill: true,
                            fillRule: "evenodd",
                            stroke: 0
                        },
                        zoom_out: {
                            viewbox: '0 0 500 500',
                            path: 'M 120 195 C 120 92.896 202.896 10 305 10 C 407.104 10 490 92.896 490 195 C 490 297.104 407.104 380 305 380 C 202.896 380 120 297.104 120 195 Z  M 180 195 C 179.99 186.52 180.85 178.06 182.55 169.75 C 184.18 161.76 186.61 153.94 189.8 146.42 C 196.1 131.55 205.21 118.05 216.64 106.64 C 228.05 95.21 241.55 86.1 256.42 79.8 C 263.94 76.61 271.76 74.18 279.76 72.54 C 288.07 70.85 296.52 69.99 305 70 C 313.48 69.99 321.93 70.85 330.24 72.54 C 338.24 74.18 346.06 76.61 353.58 79.8 C 368.45 86.1 381.95 95.21 393.36 106.64 C 404.79 118.05 413.9 131.55 420.2 146.42 C 423.39 153.94 425.82 161.76 427.46 169.76 C 429.15 178.07 430.01 186.52 430 195 C 430.01 203.48 429.15 211.93 427.46 220.24 C 425.82 228.24 423.39 236.06 420.2 243.58 C 413.9 258.45 404.79 271.95 393.36 283.36 C 381.95 294.79 368.45 303.9 353.58 310.2 C 346.06 313.39 338.24 315.82 330.24 317.46 C 321.93 319.15 313.48 320.01 305 320 C 296.52 320.01 288.07 319.15 279.76 317.46 C 271.76 315.82 263.94 313.39 256.42 310.2 C 241.55 303.9 228.05 294.79 216.64 283.36 C 205.21 271.95 196.1 258.45 189.8 243.58 C 186.61 236.06 184.18 228.24 182.54 220.24 C 180.85 211.93 179.99 203.48 180 195 Z  M 13 490 L 13 413.148 L 126.148 300 L 203 376.852 L 89.852 490 L 13 490 Z  M 205 160 L 405 160 L 405 230 L 205 230 L 205 160 Z',
                            fill: true,
                            fillRule: "evenodd",
                            stroke: 0
                        }
                    };
                    self.icons = {};
                    Object.keys(iconSources).forEach(iconName => {
                        let iconData = iconSources[iconName];
                        let svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svgIcon.setAttribute('viewBox', iconData.viewbox);
                        svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        svgIcon.classList.add('radix-icon');
                        svgIcon.classList.add('rdx-icon-'+iconName);
                        let iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        iconPath.setAttribute('d', iconData.path);
                        if (iconData.fill) {
                            iconPath.setAttribute('fill', 'currentColor');
                            if (iconData.fillRule !== undefined) iconPath.setAttribute('fill-rule', iconData.fillRule);
                        } else {
                            iconPath.setAttribute('fill', 'none');
                        }
                        if (iconData.stroke === 0) {
                            iconPath.setAttribute('stroke', 'none');
                        } else {
                            iconPath.setAttribute('stroke', 'currentColor');
                            iconPath.setAttribute('stroke-linejoin', iconData.linejoin);
                            iconPath.setAttribute('stroke-linecap', iconData.linecap);
                        }
                        iconPath.setAttribute('stroke', 'none');
                        svgIcon.appendChild(iconPath);
                        self.icons[iconName] = svgIcon;
                    });
                    // hamburger Menu
                    let hmbgr = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    let hmbgrLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    let hmbgrLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    let hmbgrLine3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    hmbgr.setAttribute('viewBox', '0 0 50 50');
                    hmbgr.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    hmbgr.classList.add('radix-icon');
                    hmbgr.classList.add('rdx-icon-hamburger');
                    hmbgrLine1.setAttribute('x1', 5);
                    hmbgrLine1.setAttribute('y1', 13);
                    hmbgrLine1.setAttribute('x2', 45);
                    hmbgrLine1.setAttribute('y2', 13);
                    hmbgrLine1.classList.add('bar1');
                    hmbgrLine2.setAttribute('x1', 5);
                    hmbgrLine2.setAttribute('y1', 25);
                    hmbgrLine2.setAttribute('x2', 45);
                    hmbgrLine2.setAttribute('y2', 25);
                    hmbgrLine2.classList.add('bar2');
                    hmbgrLine3.setAttribute('x1', 5);
                    hmbgrLine3.setAttribute('y1', 37);
                    hmbgrLine3.setAttribute('x2', 45);
                    hmbgrLine3.setAttribute('y2', 37);
                    hmbgrLine3.classList.add('bar3');
                    hmbgr.appendChild(hmbgrLine1);
                    hmbgr.appendChild(hmbgrLine2);
                    hmbgr.appendChild(hmbgrLine3);
                    self.icons.hamburger = hmbgr;
                    // svg insert
                    let iconCalls = document.querySelectorAll(self.option.icons.selector);
                    if (iconCalls) {
                        iconCalls.forEach(iconCall => {
                            let innerText = iconCall.textContent;
                            self.replaceIcon(iconCall, innerText);
                        });
                    }
                }
                resolve();
            });
        }).then(() => {
            // Speed 2
            return new Promise(resolve => {
                // Smooth scroll and Auto fill target blank
                if (self.option.smoothScroll.active || self.option.autoTargetBlank.active) {
                    const links = document.querySelectorAll('a');
                    let scrollFrom = null;
                    let scrollTo = null;
                    links.forEach(link => {
                        if (!link.hasAttribute('href') || link.getAttribute('href').length == 0) {
                            link.setAttribute('href', '#');
                        }
                        let linkHref = link.getAttribute('href');
                        // Smooth scroll
                        if (self.option.smoothScroll.active) {
                            let firstLetter = linkHref.substring(0, 1);
                            let hrefTarget = linkHref.substring(1);
                            if (firstLetter === '#') {
                                link.addEventListener('click', event => {
                                    event.preventDefault();
                                    const target = hrefTarget.length > 0 ? document.getElementById(hrefTarget) : document.body;
                                    const uniqueEasing = link.dataset.scrollEasing;
                                    const uniqueDuration = link.dataset.scrollDuration;
                                    scrollFrom = window.scrollY;
                                    scrollTo = window.scrollY + target.getBoundingClientRect().top;
                                    self.smoothScroll(scrollFrom, scrollTo, uniqueDuration, uniqueEasing);
                                });
                            }
                        }
                        // Auto fill target blank
                        if (self.option.autoTargetBlank.active) {
                            let host = null;
                            if (linkHref.match(/.+\.pdf$/)) {
                                link.setAttribute('target', '_blank');
                                link.classList.add('rdx-pdf');
                            } else if (linkHref.match(/^http/)) {
                                host = window.location.hostname;
                                if (host === '' || linkHref.indexOf(host) < 0) {
                                    link.setAttribute('target', '_blank');
                                    link.classList.add('rdx-extlink');
                                }
                            }
                        }
                    });
                }
                // Toggle menu
                if (self.option.toggleNav.active && self.option.toggleNav.trigger !== '' && self.option.toggleNav.target !== '') {
                    self.navState = false;
                    let toggleTrigger = document.querySelectorAll(self.option.toggleNav.trigger);
                    toggleTrigger.forEach(t => {
                        t.addEventListener('click', () => { self.toggleNav(); });
                    });
                }
                // drag scroll
                if (self.option.dragScroll.active && self.option.dragScroll.selector !== '') {
                    let dragScrollWrapper = Array.from(document.querySelectorAll(self.option.dragScroll.selector));
                    let toggleHint = () => {
                        let target = document.querySelector('[rdx-drag-on="true"]');
                        if (target !== null) {
                            let thisHint = target.querySelector('.rdx-drag-hint');
                            if (thisHint !== null && (target.scrollLeft > 0 || target.scrollWidth === target.clientWidth)) {
                                thisHint.classList.add('hide');
                            }
                        }
                    };
                    let scrollHint = document.createElement('div');
                    scrollHint.classList.add('rdx-drag-hint');
                    let scrollHintInner = document.createElement('div');
                    scrollHintInner.classList.add('rdx-drag-hint-inner');
                    scrollHint.appendChild(scrollHintInner);
                    scrollHintInner.innerHTML = '<div class="rdx-drag-hint-text">DRAG</div>';
                    scrollHintInner.prepend(self.icons.arrow_lr.cloneNode(true));

                    if (dragScrollWrapper.length > 0) {
                        dragScrollWrapper.forEach(e => {
                            e.style.overflow = 'auto';
                            e.style.position = 'relative';
                            e.addEventListener('mousedown', v => { self.dragDown(e, v) }, false);
                            if (e.scrollWidth > e.clientWidth && self.option.dragScroll.hint) e.appendChild(scrollHint.cloneNode(true));
                        });
                    }
                    document.addEventListener('touchmove', toggleHint, false);
                    document.addEventListener('mousemove', v => { toggleHint; self.dragMove(v) }, false);
                    document.addEventListener('mouseup', v => { self.dragUp(v) }, false);
                }
                // flex fix
                if (self.option.flexFix.active) {
                    let flexFix = document.querySelectorAll(self.option.flexFix.selector);
                    if (flexFix.length > 0) {
                        let inherit = self.option.flexFix.inherit;
                        flexFix.forEach(e => {
                            let childArr = Array.from(e.children);
                            let dummyChild = childArr[0].cloneNode(inherit);
                            dummyChild.classList.add('rdx-dummy-item');
                            let count = self.option.flexFix.min > childArr.length ? self.option.flexFix.min: childArr.length;
                            for (let i = 0; i < count; i++) {
                                let dummyClone = dummyChild.cloneNode(inherit);
                                e.appendChild(dummyClone);
                            }
                        });
                    }
                }
                // scroll appear
                if (self.option.scrollAppear.active) {
                    const appearItems = document.querySelectorAll(self.option.scrollAppear.selector);
                    if (appearItems.length > 0) {
                        appearItems.forEach(item => {
                            item.classList.add('rdx-scroll-appear');
                        });
                        window.addEventListener('scroll', () => {
                            let windowHeight = window.innerHeight;
                            appearItems.forEach(appearItem => {
                                let resetFlg = appearItem.hasAttribute('data-appear-reset') ? appearItem.dataset.appearReset : self.option.scrollAppear.reset;
                                let activeClass = appearItem.hasAttribute('data-appear-class') ?  appearItem.dataset.appearClass : self.option.scrollAppear.class;
                                let delay = appearItem.hasAttribute('data-appear-delay') ? appearItem.dataset.appearDelay : self.option.scrollAppear.delay;
                                let modeNum = appearItem.hasAttribute('data-appear-fixed') ? appearItem.dataset.appearFixed : null;

                                if (modeNum === null) {
                                    let itemRect = appearItem.getBoundingClientRect();
                                    let itemHeight = appearItem.offsetHeight;
                                    if (itemRect.top < windowHeight * .9 && itemRect.top + itemHeight > windowHeight * .1) {
                                        setTimeout(() => {
                                            appearItem.classList.add(activeClass);
                                        }, delay);
                                    } else if (resetFlg) {
                                        setTimeout(() => {
                                            appearItem.classList.remove(activeClass);
                                        }, delay);
                                    }
                                } else {
                                    if (window.pageYOffset > modeNum) {
                                        setTimeout(() => {
                                            appearItem.classList.add(activeClass);
                                        }, delay);
                                    } else if (resetFlg) {
                                        setTimeout(() => {
                                            appearItem.classList.remove(activeClass);
                                        }, delay);
                                    }
                                }
                            });
                        });
                    }
                }
                resolve();
            });
        }).then(() => {
            // Speed 3
            return new Promise(resolve => {
                // modal
                if (self.option.modal.active) {
                    let modals = document.querySelectorAll(self.option.modal.selector);
                    if (modals.length > 0) {
                        self.modalParts = {
                            viewport: document.createElement('div'),
                            area: document.createElement('div'),
                            wrapper: document.createElement('div'),
                            frame: document.createElement('div'),
                            content: document.createElement('div'),
                            closeButton: self.icons.cross.cloneNode(true),
                            toggles: document.createElement('div'),
                            magnifier: document.createElement('div'),
                            magnify: self.option.modal.magnify,
                            enlarge: self.icons.zoom_in.cloneNode(true),
                            shrink: self.icons.zoom_out.cloneNode(true),
                            scaleDisp: document.createElement('div'),
                            scaleSelector: document.createElement('ul'),
                            scale: self.option.modal.defaultScale,
                            size: {
                                width: 0,
                                height: 0
                            },
                            color: self.option.modal.color,
                            drag: self.option.modal.drag,
                            fit: self.option.modal.fit,
                            duration: self.option.modal.resizeDuration,
                            easing: self.option.modal.resizeEasing
                        }
                        self.modalParts.viewport.classList.add('rdx-modal-viewport');
                        self.modalParts.viewport.classList.add(self.modalParts.color);
                        self.modalParts.area.classList.add('rdx-modal-area');
                        self.modalParts.wrapper.classList.add('rdx-modal-wrapper');
                        self.modalParts.content.classList.add('rdx-modal-content');
                        self.modalParts.frame.classList.add('rdx-modal-frame');
                        self.modalParts.toggles.classList.add('rdx-modal-toggles');
                        self.modalParts.viewport.appendChild(self.modalParts.toggles);
                        self.modalParts.viewport.appendChild(self.modalParts.area);
                        self.modalParts.area.appendChild(self.modalParts.wrapper);
                        self.modalParts.wrapper.appendChild(self.modalParts.frame);
                        self.modalParts.frame.appendChild(self.modalParts.content);
                        self.modalParts.magnifier.classList.add('rdx-modal-magnifier');
                        self.modalParts.enlarge.classList.add('rdx-modal-enlarge');
                        self.modalParts.shrink.classList.add('rdx-modal-shrink');
                        self.modalParts.scaleDisp.classList.add('rdx-modal-scale');
                        self.modalParts.toggles.appendChild(self.modalParts.magnifier);
                        self.modalParts.magnifier.appendChild(self.modalParts.scaleDisp);
                        self.modalParts.magnifier.appendChild(self.modalParts.enlarge);
                        self.modalParts.magnifier.appendChild(self.modalParts.shrink);
                        self.modalParts.closeButton.classList.add('rdx-modal-close');
                        self.modalParts.toggles.appendChild(self.modalParts.closeButton);
                        self.modalParts.scaleSelector.classList.add('rdx-modal-scaler');
                        self.modalParts.magnifier.appendChild(self.modalParts.scaleSelector);
                        document.body.appendChild(self.modalParts.viewport);

                        self.modalParts.scaleDisp.addEventListener('click', event => {
                            event.preventDefault();
                            let i = self.option.modal.scaleStep.indexOf(self.modalParts.scale);
                            self.modalParts.scaleSelector.scrollTop = 40 * i;
                            self.modalParts.scaleSelector.classList.add('active');
                        });
                        self.option.modal.scaleStep.forEach(scale => {
                            let scaleItem = document.createElement('li');
                            scaleItem.innerHTML = self.floatRound(scale, 1) + 'x';
                            scaleItem.dataset.scale = scale;
                            self.modalParts.scaleSelector.appendChild(scaleItem);
                            scaleItem.addEventListener('click', event => {
                                event.preventDefault();
                                self.modalResize(scaleItem.dataset.scale);
                                self.modalParts.scale = scale;
                            });
                        });
                        self.modalParts.enlarge.addEventListener('click', event => {
                            event.preventDefault();
                            let i = self.option.modal.scaleStep.indexOf(self.modalParts.scale);
                            let aftScale = i < self.option.modal.scaleStep.length - 1 ? self.option.modal.scaleStep[i+1] : self.option.modal.scaleStep[i];
                            self.modalResize(aftScale);
                            self.modalParts.scale = aftScale;
                        });
                        self.modalParts.shrink.addEventListener('click', event => {
                            event.preventDefault();
                            let i = self.option.modal.scaleStep.indexOf(self.modalParts.scale);
                            let aftScale = i > 0 ? self.option.modal.scaleStep[i-1] : self.option.modal.scaleStep[i];
                            self.modalResize(aftScale);
                            self.modalParts.scale = aftScale;
                        });
                        modals.forEach(modal => {
                            let targets = [];
                            if (modal.hasAttribute('data-modal-target')) {
                                targets = document.querySelectorAll(modal.dataset.modalTarget);
                                if (targets) {
                                    targets.forEach(target => {
                                        target.classList.add('rdx-modal-source');
                                    });
                                }
                            } else {
                                targets = [modal];
                                modal.classList.add('rdx-modal-source');
                            }
                            modal.addEventListener('click', event => {
                                event.preventDefault();
                                let duration = modal.hasAttribute('data-modal-duration') ? modal.dataset.modalDuration : null;
                                let easing = modal.hasAttribute('data-modal-easing') ? modal.dataset.modalEasing : null;
                                let scale = modal.hasAttribute('data-modal-scale') ? modal.dataset.modalScale : null;
                                let drag = modal.hasAttribute('data-modal-drag') ? modal.dataset.modalDrag : null;
                                let magnify = modal.hasAttribute('data-modal-magnify') ? modal.dataset.modalMagnify : null;
                                let fit = modal.hasAttribute('data-modal-fit') ? modal.dataset.modalFit : null;
                                let color = modal.hasAttribute('data-modal-color') ? modal.dataset.modalColor : null;
                                self.modalOpen(targets, color, duration, easing, scale, drag, magnify, fit);
                            });
                        });
                        self.modalParts.viewport.addEventListener('mouseup', event => {
                            let clicked = event.target;
                            if (!clicked.classList.contains('rdx-modal-item')) {
                                if (clicked.closest('.rdx-modal-content') === null && clicked.closest('.rdx-modal-toggles') === null) {
                                    self.modalClose();
                                }
                            }
                        }, false);
                        self.modalParts.closeButton.addEventListener('click', () => {self.modalClose()}, false);
                    }
                }
                resolve();
            });
        }).then(() => {
            // Speed 4
            document.dispatchEvent(self.events.afterInitialize);
        });
    };
    /**
     * スムーススクロール
     * @param {float}  scrollFrom    スクロールの始点
     * @param {float}  scrollTo      スクロールの終点
     * @param {int}    duration      スクロールにかける時間（ミリ秒）
     * @param {string} easingName    スクロールアニメーションのイージング
     */
    smoothScroll(scrollFrom, scrollTo, duration, easingName) {
        const self = this;
        scrollTo = scrollTo < 0 ? 0 : scrollTo;
        const changeVal = scrollTo - scrollFrom;
        duration = duration === undefined ? self.option.smoothScroll.duration : duration;
        easingName = easingName === undefined ? self.option.smoothScroll.easing : easingName;
        let easing = self.getEasing(easingName);
        let cnt = 0;
        let timer = null;

        document.dispatchEvent(self.events.beforeScroll);

        let moveAnimate = () => {
            cnt++;
            let elapsedTime = cnt * self.option.timeFrame;
            let pos = easing(elapsedTime, scrollFrom, changeVal, duration);
            window.scrollTo(0, pos);
            if (elapsedTime > duration) {
                window.scrollTo(0, scrollTo);
                clearInterval(timer);
                document.dispatchEvent(self.events.afterScroll);
            }
        }
        timer = setInterval(moveAnimate, self.option.timeFrame);
    };
    /**
     * ページスクロールのオンオフ
     * @param {boolean} mode    禁止する（true）、禁止しない（false）
     */
    preventScroll(mode) {
        this.DOM_ROOTS.forEach(e => {
            if (mode) {
                e.style.overflowY = 'hidden';
            } else {
                e.style.overflowY = 'auto';
            }
        });
    };
    /**
     * ナビゲーション開閉
     * @param {boolean | string} mode    開ける(false)か閉じる(true)か
     */
    toggleNav(mode) {
        const self = this;
        let toggleTrigger = document.querySelectorAll(self.option.toggleNav.trigger);
        let toggleTarget = document.querySelectorAll(self.option.toggleNav.target);

        if (mode === undefined) {
            if (self.navState) {
                document.dispatchEvent(self.events.beforeNavClose);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(false);
                }
                self.navState = false;
                toggleTrigger.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                document.dispatchEvent(self.events.afterNavClose);
            } else {
                document.dispatchEvent(self.events.beforeNavOpen);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(true);
                }
                self.navState = true;
                toggleTrigger.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                document.dispatchEvent(self.events.afterNavOpen);
            }
        } else {
            if (mode === true || mode === 'close') {
                document.dispatchEvent(self.events.beforeNavClose);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(false);
                }
                self.navState = false;
                toggleTrigger.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                document.dispatchEvent(self.events.afterNavClose);
            } else if (mode === false || mode === 'open') {
                document.dispatchEvent(self.events.beforeNavOpen);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(true);
                }
                self.navState = true;
                toggleTrigger.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                document.dispatchEvent(self.events.afterNavOpen);
            }
        }
    };
    /**
     * SVG iconに置き換える
     * @param {element} icon    SVGに置き換える対象
     */
    replaceIcon(target, icon) {
        const self = this;
        icon = icon === undefined ? target.innerText : icon;
        if (Object.keys(self.icons).includes(icon)) {
            target.replaceWith(self.icons[icon].cloneNode(true));
        } else {
            console.log('' + icon + ' is not icon name.');
        }
    };
    /**
     * ドラッグスクロールのマウスダウンイベント
     * @param {elemnt} e    スクロール領域のエレメント
     * @param {event}  v    マウスダウンイベント
     */
    dragDown(e, v) {
        if(!self.isMobile) {
            e.style.cursor = 'move';
            e.setAttribute('rdx-drag-on', true);
            e.setAttribute('rdx-drag-scrolled-x', e.scrollLeft);
            e.setAttribute('rdx-drag-scrolled-y', e.scrollTop);
            e.setAttribute('rdx-drag-click-x', v.clientX);
            e.setAttribute('rdx-drag-click-y', v.clientY);
        }
    };
    /**
     * ドラッグスクロールのマウスムーブイベント
     * @param {event} v    マウスムーブイベント
     */
    dragMove(v) {
        let target = document.querySelector('[rdx-drag-on="true"]');
        if (target !== null) {
            v.preventDefault();
            target.scrollLeft = Number(target.getAttribute('rdx-drag-scrolled-x')) + Number(target.getAttribute('rdx-drag-click-x')) - v.clientX;
            target.scrollTop = Number(target.getAttribute('rdx-drag-scrolled-y')) + Number(target.getAttribute('rdx-drag-click-y')) - v.clientY;
        }
    };
    /**
     * ドラッグスクロールのマウスアップイベント
     * @param {event} v    マウスアップイベント
     */
    dragUp(v) {
        v.preventDefault();
        v.stopImmediatePropagation();
        let target = document.querySelector('[rdx-drag-on="true"]');
        if (target) {
            target.style.cursor = '';
            target.setAttribute('rdx-drag-on', false);
        }
    };
    /**
     * モーダルを開く
     * @param {array}  targets     開く対象のエレメントの配列
     * @param {int}    duration    拡縮にかける時間
     * @param {string} easing      拡縮アニメーションのイージング
     * @param {float}  scale       開いたときの拡大率
     */
    modalOpen(targets, color, duration, easing, scale, drag, magnify, fit) {
        const self = this;
        if (self.modalState) return;
        new Promise(resolve => {
            document.dispatchEvent(self.events.beforeModalOpen);
            resolve();
        }).then(() => {
            return new Promise(resolve => {
                self.modalParts.content.innerHTML = '';
                self.modalParts.color = color !== null ? color : self.option.modal.color;
                self.modalParts.magnify = magnify !== null ? magnify : self.option.modal.magnify;
                self.modalParts.drag = drag !== null ? drag : self.option.modal.drag;
                self.modalParts.fit = fit !== null ? fit : self.option.modal.fit;
                self.modalParts.duration = duration === undefined ? self.option.modal.resizeDuration : duration;
                self.modalParts.easing = easing === undefined ? self.option.modal.resizeEasing : easing;
                self.preventScroll(true);
                resolve();
            });
        }).then(() => {
            return new Promise(resolve => {
                targets.forEach(target => {
                    let modalClone = target.cloneNode(true);
                    modalClone.classList.remove('rdx-modal-source');
                    modalClone.classList.add('rdx-modal-item');
                    self.modalParts.content.appendChild(modalClone);
                });
                resolve();
            });
        }).then(() => {
            return new Promise(resolve => {
                self.modalParts.magnifier.style.display = self.modalParts.magnify ? 'flex' : 'none';
                self.modalParts.size = {
                    width: self.modalParts.content.offsetWidth,
                    height: self.modalParts.content.offsetHeight
                };
                resolve();
            });
        }).then(() => {
            return new Promise(resolve => {
                self.modalParts.scale = 1;
                if (scale !== null) {
                    self.modalParts.scale = self.floatRound(scale, 1);
                } else if (self.modalParts.fit == true) {
                    let areaHeight = self.modalParts.area.clientHeight;
                    let areaWidth = self.modalParts.area.clientWidth;
                    self.modalParts.scale = self.option.modal.scaleStep[0];
                    for (let i = 0; i < self.option.modal.scaleStep.length; i++) {
                        if (self.modalParts.size.width * self.option.modal.scaleStep[i] > areaWidth || self.modalParts.size.height * self.option.modal.scaleStep[i] > areaHeight) break;
                        self.modalParts.scale = self.option.modal.scaleStep[i];
                    }
                }
                const modalDrag = v => { self.dragDown(self.modalParts.wrapper, v) };
                if (self.modalParts.drag) {
                    self.modalParts.wrapper.addEventListener('mousedown', modalDrag, false);
                } else {
                    self.modalParts.wrapper.removeEventListener('mousedown', modalDrag, false);
                }
                resolve();
            });
        }).then(() => {
            return new Promise(resolve => {
                self.modalParts.content.style.transform = 'scale(' + self.modalParts.scale + ')';
                self.modalParts.wrapper.style.height = 'min(' + self.floatCeil(self.modalParts.size.height * self.modalParts.scale, 0) + 'px, 100%)';
                self.modalParts.wrapper.style.width = 'min(' + self.floatCeil(self.modalParts.size.width * self.modalParts.scale, 0) + 'px, 100%)';
                self.modalParts.scaleDisp.innerHTML = self.floatRound(self.modalParts.scale, 1) + 'x';
                self.modalParts.frame.style.height = self.floatCeil(self.modalParts.size.height * self.modalParts.scale, 0) + 'px';
                self.modalParts.frame.style.width = self.floatCeil(self.modalParts.size.width * self.modalParts.scale, 0) + 'px';
                self.modalParts.viewport.classList.add('active');
                self.modalState = true;
                resolve();
            });
        }).then(() => {
            document.dispatchEvent(self.events.beforeModalOpen);
        });
    };
    /**
     * モーダルを閉じる
     */
    modalClose() {
        const self = this;
        if (!self.modalState) return;
        if (self.modalParts.wrapper.getAttribute('rdx-drag-on') === 'true') return;
        new Promise(resolve => {
                document.dispatchEvent(self.events.beforeModalClose);
                resolve();
        }).then(() => {
            return new Promise(resolve => {
                self.modalParts.scaleSelector.classList.remove('active');
                self.modalParts.viewport.classList.remove('active');
                self.modalParts.content.innerHTML = '';
                self.preventScroll(false);
                self.modalParts.content.style = '';
                self.modalParts.frame.style = '';
                self.modalParts.wrapper.style = '';
                self.modalState = false;
                resolve();
            });
        }).then(() => {
            document.dispatchEvent(self.events.afterModalClose);
        });
    };
    /**
     * モーダルウィンドウの拡縮
     * @param {float} aftScale    操作後の倍率
     */
    modalResize(aftScale) {
        const self = this;
        if (!self.modalState) return;
        let duration = self.option.modal.resizeDuration;
        let frame = self.option.timeFrame;
        let cnt = 0;
        let timer = null;
        let easing = self.getEasing(self.option.modal.resizeEasing);
        let befScale = self.modalParts.scale;
        let befWidth = self.modalParts.size.width * befScale;
        let befHeight = self.modalParts.size.height * befScale;
        aftScale = self.floatRound(aftScale, 1);
        let aftWidth = self.modalParts.size.width * aftScale;
        let aftHeight = self.modalParts.size.height * aftScale;
        let difScale = aftScale - befScale;
        let difWidth = self.modalParts.size.width * difScale;
        let difHeight = self.modalParts.size.height * difScale;

        self.modalParts.scaleDisp.innerHTML = self.floatRound(aftScale, 1) + 'x';
        self.modalParts.scaleSelector.classList.remove('active');

        let resizeAnimate = () => {
            cnt++;
            let elapsedTime = cnt * frame;
            let nowWidth = easing(elapsedTime, befWidth, difWidth, duration);
            let nowHeight = easing(elapsedTime, befHeight, difHeight, duration);
            let nowScale = easing(elapsedTime, befScale, difScale, duration);
            self.modalParts.content.style.transform = 'scale(' + nowScale + ')';
            self.modalParts.wrapper.style.width = 'min(' + nowWidth + 'px, 100%)';
            self.modalParts.wrapper.style.height = 'min(' + nowHeight + 'px, 100%)';
            self.modalParts.frame.style.height = nowHeight + 'px';
            self.modalParts.frame.style.width = nowWidth + 'px';
            if (elapsedTime > duration) {
                self.modalParts.content.style.transform = 'scale(' + self.floatRound(aftScale, 1) + ')';
                self.modalParts.wrapper.style.height = 'min(' + self.floatCeil(aftHeight, 0) + 'px, 100%)';
                self.modalParts.wrapper.style.width = 'min(' + self.floatCeil(aftWidth, 0) + 'px, 100%)';
                self.modalParts.frame.style.height = self.floatCeil(aftHeight, 0) + 'px';
                self.modalParts.frame.style.width = self.floatCeil(aftWidth, 0) + 'px';
                clearInterval(timer);
            }
        }
        if (difScale != 0) {
            timer = setInterval(resizeAnimate, frame);
        }
    };
    /**
     * 型の判定
     * @param {operand} obj    判定したいもの
     * @return {string}        型名
     */
    typeJudge(obj) {
        return toString.call(obj).slice(8, -1).toLowerCase();
    };
    /**
     * 少数の桁変換
     * @param {float}   x        対象となる少数
     * @param {int}     digit    切り上げる小数点
     * @return {string}          フィックスされた少数文字列
     */
    floatRound(num, digit) {
        digit = digit === undefined ? 2 : Number.parseInt(digit);
        let fix = 10 ** digit;
        let res = Math.round(num * fix) / fix;
        return res.toFixed(digit);
    };
    floatCeil(num, digit) {
        digit = digit === undefined ? 2 : Number.parseInt(digit);
        let fix = 10 ** digit;
        let res = Math.ceil(num * fix) / fix;
        return res.toFixed(digit);
    };
    floatFloor(num, digit) {
        digit = digit === undefined ? 2 : Number.parseInt(digit);
        let fix = 10 ** digit;
        let res = Math.floor(num * fix) / fix;
        return res.toFixed(digit);
    };
    /**
     * イージング関数を取得する関数
     * @param {string}    easingName    イージング関数の名称
     * @return {function}               イージング関数
     */
    getEasing(easingName) {
        let ease;
        if (easingName == 'ease') {
            easingName = 'easeInOutCirc';
        } else if (easingName == 'ease-in' || easingName == 'easeIn') {
            easingName = 'easeInQuad';
        } else if (easingName == 'ease-out' || easingName == 'easeOut') {
            easingName = 'easeOutQuad';
        } else if (easingName == 'ease-in-out' || easingName == 'easeInOut') {
            easingName = 'easeInOutQuad';
        }
        switch (easingName) {
            case 'linear':
                ease = function (t, b, c, d) {
                    return c * t / d + b;
                };
                break;
            case 'easeInSine':
                ease = function (t, b, c, d) {
                    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                };
                break;
            case 'easeOutSine':
                ease = function (t, b, c, d) {
                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                };
                break;
            case 'easeInOutSine':
                ease = function (t, b, c, d) {
                    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                };
                break;
            case 'easeInQuad':
                ease = function (t, b, c, d) {
                    return c * (t /= d) * t + b;
                };
                break;
            case 'easeOutQuad':
                ease = function (t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                };
                break;
            case 'easeInOutQuad':
                ease = function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                };
                break;
            case 'easeInCubic':
                ease = function (t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                };
                break;
            case 'easeOutCubic':
                ease = function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t + 1) + b;
                };
                break;
            case 'easeInOutCubic':
                ease = function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t + 2) + b;
                };
                break;
            case 'easeInQuart':
                ease = function (t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                };
                break;
            case 'easeOutQuart':
                ease = function (t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                };
                break;
            case 'easeInOutQuart':
                ease = function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                };
                break;
            case 'easeInQuint':
                ease = function (t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                };
                break;
            case 'easeOutQuint':
                ease = function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                };
                break;
            case 'easeInOutQuint':
                ease = function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                };
                break;
            case 'easeInExpo':
                ease = function (t, b, c, d) {
                    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                };
                break;
            case 'easeOutExpo':
                ease = function (t, b, c, d) {
                    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
                };
                break;
            case 'easeInOutExpo':
                ease = function (t, b, c, d) {
                    if (t == 0) return b;
                    if (t == d) return b + c;
                    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
                };
                break;
            case 'easeInCirc':
                ease = function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
                };
                break;
            case 'easeOutCirc':
                ease = function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
                };
                break;
            case 'easeInOutCirc':
                ease = function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
                };
                break;
            case 'easeInElastic':
                ease = function (t, b, c, d) {
                    var s = 1.70158;
                    var p = 0;
                    var a = c;
                    if (t == 0) return b;
                    if ((t /= d) == 1) return b + c;
                    if (!p) p = d * .3;
                    if (a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                };
                break;
            case 'easeOutElastic':
                ease = function (t, b, c, d) {
                    var s = 1.70158;
                    var p = 0;
                    var a = c;
                    if (t == 0) return b;
                    if ((t /= d) == 1) return b + c;
                    if (!p) p = d * .3;
                    if (a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
                };
                break;
            case 'easeInOutElastic':
                ease = function (t, b, c, d) {
                    var s = 1.70158;
                    var p = 0;
                    var a = c;
                    if (t == 0) return b;
                    if ((t /= d / 2) == 2) return b + c;
                    if (!p) p = d * (.3 * 1.5);
                    if (a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
                };
                break;
            case 'easeInBack':
                ease = function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c * (t /= d) * t * ((s + 1) * t - s) + b;
                };
                break;
            case 'easeOutBack':
                ease = function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                };
                break;
            case 'easeInOutBack':
                ease = function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
                };
                break;
            case 'easeInBounce':
                ease = function (t, b, c, d) {
                    t = d - t;
                    if ((t /= d) < (1 / 2.75)) {
                        return c - c * (7.5625 * t * t) + b;
                    } else if (t < (2 / 2.75)) {
                        return c - c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                    } else if (t < (2.5 / 2.75)) {
                        return c - c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                    } else {
                        return c - c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                    }
                };
                break;
            case 'easeOutBounce':
                ease = function (t, b, c, d) {
                    if ((t /= d) < (1 / 2.75)) {
                        return c * (7.5625 * t * t) + b;
                    } else if (t < (2 / 2.75)) {
                        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                    } else if (t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                    } else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                    }
                };
                break;
            case 'easeInOutBounce':
                ease = function (t, b, c, d) {
                    if (t < d / 2) {
                        t = d - t * 2;
                        if ((t /= d) < (1 / 2.75)) {
                            return c * .5 - c * (7.5625 * t * t) * .5 + b;
                        } else if (t < (2 / 2.75)) {
                            return c * .5 - c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) * .5 + b;
                        } else if (t < (2.5 / 2.75)) {
                            return c * .5 - c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) * .5 + b;
                        } else {
                            return c * .5 - c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) * .5 + b;
                        }
                    } else {
                        t = t * 2 - d;
                        if ((t /= d) < (1 / 2.75)) {
                            return c * (7.5625 * t * t) * .5 + c * .5 + b;
                        } else if (t < (2 / 2.75)) {
                            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) * .5 + c * .5 + b;
                        } else if (t < (2.5 / 2.75)) {
                            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) * .5 + c * .5 + b;
                        } else {
                            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) * .5 + c * .5 + b;
                        }
                    }
                };
                break;
        }
        return ease;
    };
}