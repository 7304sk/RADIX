/************************************

    RADIX
    - Native Javascript functions
    author: shoalwave

    Version : 4.0.0

************************************/
/**
 * 本体クラス
 * @typedef radix
 * @type class
 * @property {object}   option         オプション値を格納
 * @property {object}   modalParts     モーダルウィンドウ機能で生成しているエレメントノードたち
 * @property {boolean}  navOpen        ナビゲーション開閉を実行する関数
 * @property {function} init           ページロード時に実行する関数
 * @property {function} toggleNav      ナビゲーション開閉を実行する関数
 * @property {function} smoothScroll   スムーススクロールを実行する関数
 * @property {function} modalResize    モーダルウィンドウの拡縮をする関数
 * @property {function} floatRound     浮動小数点数の文字列変換関数
 * @property {function} floatCeil      浮動小数点数の文字列変換関数
 * @property {function} floatFloor     浮動小数点数の文字列変換関数
 * @property {function} preventScroll  ページ全体の縦方向スクロール禁止を操作する関数
 * @property {function} getEasing      イージング関数を取得する関数
 */
class radix {
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
                minload: 200
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
            svg: {
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
                inherit: false,
                min: 0
            },
            modal: {
                active: true,
                selector: '.radix-modal',
                color: 'black',
                resizeDuration: 300,
                resizeEasing: 'easeInOutBack',
                fit: true,
                magnifier: true,
                enlargeText: '拡大',
                shrinkText: '縮小'
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
    }
    events = {
        beforeScroll: new CustomEvent('beforeScroll'),
        afterScroll: new CustomEvent('afterScroll'),
        beforeNavOpen: new CustomEvent('beforeNavOpen'),
        afterNavOpen: new CustomEvent('afterNavOpen'),
        beforeNavClose: new CustomEvent('beforeNavClose'),
        afterNavClose: new CustomEvent('afterNavClose'),
        beforeModalOpen: new CustomEvent('beforeModalOpen'),
        afterModalOpen: new CustomEvent('afterModalOpen'),
        beforeModalClose: new CustomEvent('beforeModalClose'),
        afterModalClose: new CustomEvent('afterModalClose'),
    }
    /**
     * DOMロード時に実行し初期化する関数
     */
    navOpen = false;
    modalOpen = false;
    init() {
        const self = this;
        self.DOM_ROOTS = document.querySelectorAll('html,body');
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
        // SVG insert
        if (self.option.svg.active) {
            self.svg = {};
            { // hamburger Menu
                let hmbgr = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                let hmbgrLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                let hmbgrLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                let hmbgrLine3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hmbgr.setAttribute('viewBox', '0 0 50 50');
                hmbgr.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                hmbgr.classList.add('rdx-svg-hamburger');
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
                self.svg.hamburger = hmbgr;
            }
            { // angle top
                let agl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                agl.classList.add('rdx-icon-angletop');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                agl.setAttribute('viewBox', '0 0 100 100');
                agl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '50,19 97,66 84,79 50,45 16,79 3,66');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'none');
                agl.appendChild(polygon);
                self.svg.angleTop = agl;
            }
            { // angle right
                let agl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                agl.classList.add('rdx-icon-angleright');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                agl.setAttribute('viewBox', '0 0 100 100');
                agl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '81,50 34,97 21,84 55,50 21,16 34,3');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'none');
                agl.appendChild(polygon);
                self.svg.angleRight = agl;
            }
            { // angle bottom
                let agl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                agl.classList.add('rdx-icon-anglebottom');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                agl.setAttribute('viewBox', '0 0 100 100');
                agl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '50,81 97,34 84,21 50,55 16,21 3,34');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'none');
                agl.appendChild(polygon);
                self.svg.angleBottom = agl;
            }
            { // angle left
                let agl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                agl.classList.add('rdx-icon-angleleft');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                agl.setAttribute('viewBox', '0 0 100 100');
                agl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '19,50 66,97 79,84 45,50 79,16 66,3');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'none');
                agl.appendChild(polygon);
                self.svg.angleLeft = agl;
            }
            { // arrow LR
                let out = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                out.classList.add('rdx-icon-arrowlr');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                out.setAttribute('viewBox', '0 0 100 100');
                out.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '10 50, 35 20, 35 42, 65 42, 65 20, 90 50, 65 80, 65 58, 35 58, 35 80');
                polygon.setAttribute('stroke-linejoin', 'round');
                polygon.setAttribute('stroke-width', '5');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'currentColor');
                out.appendChild(polygon);
                self.svg.arrowLR = out;
            }
            { // arrow TB
                let out = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                out.classList.add('rdx-icon-arrowtb');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                out.setAttribute('viewBox', '0 0 100 100');
                out.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '50 10, 20 35, 42 35, 42 65, 20 65, 50 90, 80 65, 58 65, 58 35, 80 35');
                polygon.setAttribute('stroke-linejoin', 'round');
                polygon.setAttribute('stroke-width', '5');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'currentColor');
                out.appendChild(polygon);
                self.svg.arrowTB = out;
            }
            { // cross
                let out = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                out.classList.add('rdx-icon-cross');
                let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                out.setAttribute('viewBox', '0 0 100 100');
                out.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                polygon.setAttribute('points', '17,2 50,35 83,2 97,16 64,49 97,82 82,97 49,64 16,97 2,83 35,50 2,17');
                polygon.setAttribute('fill', 'currentColor');
                polygon.setAttribute('stroke', 'none');
                out.appendChild(polygon);
                self.svg.cross = out;
            }
            // svg insert
            let icons = document.querySelectorAll('.rdx-icons');
            if (icons) {
                icons.forEach(icon => {
                    let innerText = icon.innerText;
                    if (Object.keys(self.option.svg).includes(innerText)) {
                        icon.innerHTML = '';
                        icon.appendChild(self.svg[innerText].cloneNode(true));
                    }
                });
            }
        }
        // Toggle menu
        if (self.option.toggleNav.active && self.option.toggleNav.trigger !== '' && self.option.toggleNav.target !== '') {
            self.navOpen = false;
            let toggleTrigger = document.querySelectorAll(self.option.toggleNav.trigger);
            toggleTrigger.forEach(t => {
                t.addEventListener('click', () => { self.toggleNav(); });
            });
        }
        // drag scroll
        if (self.option.dragScroll.active && self.option.dragScroll.selector !== '') {
            let dragScrollWrapper = document.querySelectorAll(self.option.dragScroll.selector);
            if (dragScrollWrapper.length > 0) {
                let downEvent = (elm, event) => {
                    elm.setAttribute('rdx-drag-scroll-on', true);
                    elm.setAttribute('rdx-drag-scroll-scrolled-x', elm.scrollLeft);
                    elm.setAttribute('rdx-drag-scroll-scrolled-y', elm.scrollTop);
                    elm.setAttribute('rdx-drag-scroll-click-x', event.clientX);
                    elm.setAttribute('rdx-drag-scroll-click-y', event.clientY);
                };
                let moveEvent = event => {
                    let target = document.querySelector('[rdx-drag-scroll-on="true"]');
                    if (target !== null) {
                        event.preventDefault();
                        target.scrollLeft = Number(target.getAttribute('rdx-drag-scroll-scrolled-x')) + Number(target.getAttribute('rdx-drag-scroll-click-x')) - event.clientX;
                        target.scrollTop = Number(target.getAttribute('rdx-drag-scroll-scrolled-y')) + Number(target.getAttribute('rdx-drag-scroll-click-y')) - event.clientY;
                    }
                };
                let upEvent = () => {
                    dragScrollWrapper.forEach(e => {
                        e.setAttribute('rdx-drag-scroll-on', false);
                    });
                };
                let toggleHint = () => {
                    let target = document.querySelector('[rdx-drag-scroll-on="true"]');
                    if (target !== null) {
                        let thisHint = target.querySelector('.rdx-scroll-hint');
                        if (thisHint !== null && (target.scrollLeft > 0 || target.scrollWidth === target.clientWidth)) {
                            thisHint.classList.add('hide');
                        }
                    }
                };

                let scrollHint = document.createElement('div');
                scrollHint.classList.add('rdx-scroll-hint');
                scrollHint.appendChild(self.svg.arrowLR.cloneNode(true));
                document.addEventListener('mousemove', toggleHint, false);
                document.addEventListener('touchmove', toggleHint, false);

                dragScrollWrapper.forEach(e => {
                    e.style.overflow = 'auto';
                    e.style.position = 'relative';
                    e.addEventListener('mousedown', v => {
                        downEvent(e, v)
                    }, false);
                    e.addEventListener('touchstart', () => {
                        e.setAttribute('rdx-drag-scroll-on', true);
                    }, false);
                    e.addEventListener('touchend', () => {
                        e.setAttribute('rdx-drag-scroll-on', false);
                    }, false);
                    if (e.scrollWidth > e.clientWidth) {
                        e.style.cursor = 'move';
                        if (self.option.dragScroll.hint) {
                            e.appendChild(scrollHint.cloneNode(true));
                        }
                    }
                });
                document.addEventListener('mousemove', v => {
                    moveEvent(v);
                }, false);
                document.addEventListener('mouseup', upEvent, false);
            }
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
        // modal
        if (self.option.modal.active) {
            let modals = document.querySelectorAll(self.option.modal.selector);
            if (modals.length > 0) {
                self.modalParts = {
                    viewport: document.createElement('div'),
                    area: document.createElement('div'),
                    wrapper: document.createElement('div'),
                    content: document.createElement('div'),
                    closeButton: self.svg.cross.cloneNode(true),
                    toggles: document.createElement('div'),
                    magnifier: document.createElement('div'),
                    enlarge: document.createElement('div'),
                    shrink: document.createElement('div'),
                    scaleDisp: document.createElement('div'),
                    scale: self.option.modal.defaultScale,
                    scaleStep: [0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
                    size: {
                        width: 0,
                        height: 0
                    },
                    speed: self.option.modal.resizeSpeed,
                    easing: self.option.modal.resizeEasing
                }
                self.modalParts.viewport.classList.add('rdx-modal-viewport');
                self.modalParts.viewport.classList.add(self.option.modal.color);
                self.modalParts.area.classList.add('rdx-modal-area');
                self.modalParts.wrapper.classList.add('rdx-modal-wrapper');
                self.modalParts.content.classList.add('rdx-modal-content');
                self.modalParts.toggles.classList.add('rdx-modal-toggles');
                self.modalParts.viewport.appendChild(self.modalParts.toggles);
                self.modalParts.viewport.appendChild(self.modalParts.area);
                self.modalParts.area.appendChild(self.modalParts.wrapper);
                self.modalParts.wrapper.appendChild(self.modalParts.content);
                self.modalParts.magnifier.classList.add('rdx-modal-magnifier');
                self.modalParts.enlarge.classList.add('rdx-modal-enlarge');
                self.modalParts.enlarge.innerHTML = self.option.modal.enlargeText;
                self.modalParts.shrink.classList.add('rdx-modal-shrink');
                self.modalParts.shrink.innerHTML = self.option.modal.shrinkText;
                self.modalParts.scaleDisp.classList.add('rdx-modal-scale');
                self.modalParts.toggles.appendChild(self.modalParts.magnifier);
                self.modalParts.magnifier.appendChild(self.modalParts.scaleDisp);
                self.modalParts.magnifier.appendChild(self.modalParts.enlarge);
                self.modalParts.magnifier.appendChild(self.modalParts.shrink);
                self.modalParts.closeButton.classList.add('rdx-modal-close');
                self.modalParts.toggles.appendChild(self.modalParts.closeButton);
                document.body.appendChild(self.modalParts.viewport);

                let aftScale = 1;
                self.modalParts.enlarge.addEventListener('click', event => {
                    event.preventDefault();
                    aftScale = self.modalParts.scale;
                    if (self.modalParts.scale < 1) {
                        aftScale = self.modalParts.scale + 0.2;
                    } else if (self.modalParts.scale < 5) {
                        aftScale = self.modalParts.scale + 0.5;
                    }
                    if (aftScale > 5) aftScale = 5;
                    self.modalResize(aftScale);
                    self.modalParts.scale = aftScale;
                });
                self.modalParts.shrink.addEventListener('click', event => {
                    event.preventDefault();
                    aftScale = self.modalParts.scale;
                    if (self.modalParts.scale > 1) {
                        aftScale = self.modalParts.scale - 0.5;
                    } else if (self.modalParts.scale > 0.21) {
                        aftScale = self.modalParts.scale - 0.2;
                    }
                    if (aftScale < 0.2) aftScale = 0.2;
                    self.modalResize(aftScale);
                    self.modalParts.scale = aftScale;
                });

                modals.forEach(modal => {
                    let targets = document.querySelectorAll(modal.dataset.modalTarget);
                    if (targets) {
                        targets.forEach(target => {
                            target.classList.add('rdx-modal-source');
                        });
                    }
                    if (modal.dataset.modalTarget === null) {
                        modal.classList.add('rdx-modal-source');
                        targets = [modal];
                    }
                    modal.addEventListener('click', event => {
                        event.preventDefault();
                        let scale = modal.dataset.modalScale === null ? null : modal.dataset.modalScale;
                        self.modalOpen(targets, modal.dataset.modalDuration, modal.dataset.modalEasing, scale);
                        let innerModals = self.modalParts.content.querySelectorAll(self.option.modal.selector);
                        innerModals.forEach(innerModal => {
                            innerModal.addEventListener('click', v => {
                                v.preventDefault();
                                let innerTarget = innerModal.dataset.modalTarget === null ? [modal] : document.querySelectorAll(innerModal.dataset.modalTarget);
                                scale = innerModal.dataset.modalScale === null ? null : innerModal.dataset.modalScale;
                                self.modalOpen(innerTarget, innerModal.dataset.modalDuration, innerModal.dataset.modalEasing, scale);
                            });
                        });
                    });
                });

                self.modalParts.viewport.addEventListener('click', event => {
                    let clicked = event.target;
                    if (!clicked.classList.contains('rdx-modal-item')) {
                        if (clicked.closest('.rdx-modal-content') === null && clicked.closest('.rdx-modal-toggles') === null) {
                            self.modalClose();
                        }
                    }
                }, false);
                self.modalParts.closeButton.addEventListener('click', self.modalClose(), false);
            }
        }
        // scroll appear
        if (self.option.scrollAppear.active) {
            const appearItems = document.querySelectorAll(self.option.scrollAppear.selector);
            if (appearItems.length > 0) {
                window.addEventListener('scroll', () => {
                    let windowHeight = window.innerHeight;
                    appearItems.forEach(appearItem => {
                        let resetFlg = appearItem.dataset.appearReset === null ? self.option.scrollAppear.reset : appearItem.dataset.appearReset;
                        let activeClass = appearItem.dataset.appearClass === null ? self.option.scrollAppear.class : appearItem.dataset.appearClass;
                        let modeNum = appearItem.dataset.appearFixed === null ? null : appearItem.dataset.appearFixed;
                        let delay = appearItem.dataset.appearDelay === null ? self.option.scrollAppear.delay : appearItem.dataset.appearDelay;

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
        // preload display
        if (self.option.preload.active && self.option.preload.selector.length > 0) {
            let preloader = document.querySelector(self.option.preload.selector);
            window.addEventListener('load', () => {
                if (preloader) {
                    setTimeout(() => {
                        preloader.classList.add('hide');
                    }, self.option.preload.minload);
                }
            });
        }
    };
    /**
     * スムーススクロール
     * @param {object} scrollPos スクロールの始点・終点を格納した連想配列
     */
    smoothScroll(scrollFrom, scrollTo, uniqueDuration, uniqueEasing) {
        const self = this;
        scrollTo = scrollTo < 0 ? 0 : scrollTo;
        const changeVal = scrollTo - scrollFrom;
        const duration = uniqueDuration === null ? self.option.smoothScroll.duration : uniqueDuration;
        const easingName = uniqueEasing === null ? self.option.smoothScroll.easing : uniqueEasing;
        const easing = self.getEasing(easingName);
        let cnt = 0;
        let timer = null;

        self.dispatchEvent(self.events.beforeScroll);

        let moveAnimate = () => {
            cnt++;
            let elapsedTime = cnt * self.option.timeFrame;
            let pos = easing(elapsedTime, scrollFrom, changeVal, duration);
            window.scrollTo(0, pos);
            if (elapsedTime > duration) {
                window.scrollTo(0, scrollTo);
                clearInterval(timer);
                self.dispatchEvent(self.events.afterScroll);
            }
        }
        timer = setInterval(moveAnimate, self.option.timeFrame);
    };
    /**
     * ページスクロールのオンオフ
     * @param {boolean} mode 禁止する（true）、禁止しない（false）
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
     * @param {boolean | string} mode 開ける(false)か閉じる(true)か
     */
    toggleNav(mode) {
        const self = this;
        let toggleTrigger = document.querySelectorAll(self.option.toggleNav.trigger);
        let toggleTarget = document.querySelectorAll(self.option.toggleNav.target);

        if (mode === undefined) {
            if (self.navOpen) {
                self.dispatchEvent(self.events.beforeNavClose);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(false);
                }
                self.navOpen = false;
                toggleTrigger.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                self.dispatchEvent(self.events.afterNavClose);
            } else {
                self.dispatchEvent(self.events.beforeNavOpen);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(true);
                }
                self.navOpen = true;
                toggleTrigger.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                self.dispatchEvent(self.events.afterNavOpen);
            }
        } else {
            if (mode === true || mode === 'close') {
                self.dispatchEvent(self.events.beforeNavClose);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(false);
                }
                self.navOpen = false;
                toggleTrigger.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.remove(self.option.toggleNav.class);
                });
                self.dispatchEvent(self.events.afterNavClose);
            } else if (mode === false || mode === 'open') {
                self.dispatchEvent(self.events.beforeNavOpen);
                if (self.option.toggleNav.preventScroll) {
                    self.preventScroll(true);
                }
                self.navOpen = true;
                toggleTrigger.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                toggleTarget.forEach(t => {
                        t.classList.add(self.option.toggleNav.class);
                });
                self.dispatchEvent(self.events.afterNavOpen);
            }
        }
    };
    modalOpen(targets, duration, easing, scale) {
        const self = this;
        self.dispatchEvent(self.events.beforeModalOpen);

        self.modalParts.content.innerHTML = '';
        targets.forEach(target => {
                let modalClone = target.cloneNode(true);
                modalClone.classList.remove(self.option.modal.selector);
                modalClone.classList.remove('rdx-modal-source');
                modalClone.classList.add('rdx-modal-item');
                self.modalParts.content.appendChild(modalClone);
        });
        self.preventScroll(true);

        self.modalParts.magnifier.style.display = self.option.modal.magnifier ? 'flex' : 'none';
        self.modalParts.duration = duration === null ? self.option.modal.resizeDuration : duration;
        self.modalParts.easing = easing === null ? self.option.modal.resizeEasing : easing;
        self.modalParts.size = {
            width: self.modalParts.content.offsetWidth,
            height: self.modalParts.content.offsetHeight
        };
        self.modalParts.scale = 1;
        if (scale !== null) {
            self.modalParts.scale = self.floatRound(scale, 1);
        } else if (self.option.modal.fit === true) {
            let areaHeight = self.modalParts.area.clientHeight;
            let areaWidth = self.modalParts.area.clientWidth;
            self.modalParts.scale = self.modalParts.scaleStep[0];
            for (let i = 0; i < self.modalParts.scaleStep.length; i++) {
                if (self.modalParts.size.width * self.modalParts.scaleStep[i] > areaWidth || self.modalParts.size.height * self.modalParts.scaleStep[i] > areaHeight) break;
                self.modalParts.scale = self.modalParts.scaleStep[i];
            }
        }

        self.modalParts.content.style.transform = 'scale(' + self.modalParts.scale + ')';
        self.modalParts.wrapper.style.height = 'min(' + self.floatCeil(self.modalParts.size.height * self.modalParts.scale, 0) + 'px, 100%)';
        self.modalParts.wrapper.style.width = 'min(' + self.floatCeil(self.modalParts.size.width * self.modalParts.scale, 0) + 'px, 100%)';
        self.modalParts.viewport.classList.add('active');
        self.modalParts.scaleDisp.innerHTML = self.modalParts.scale + 'x';

        self.modalOpen = true;
        self.dispatchEvent(self.events.beforeModalOpen);
    };
    modalClose() {
        const self = this;
        self.dispatchEvent(self.events.beforeModalClose);
        self.modalParts.viewport.classList.remove('active');
        self.modalParts.content.innerHTML = '';
        self.preventScroll(false);
        self.modalParts.content.style = '';
        self.modalParts.wrapper.style = '';
        self.modalOpen = false;
        self.dispatchEvent(self.events.afterModalClose);
    };
    /**
     * モーダルウィンドウの拡縮
     * @param {number} aftScale 操作後の倍率
     */
    modalResize(aftScale) {
        const self = this;
        let duration = self.option.modal.resizeSpeed;
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

        let resizeAnimate = () => {
            cnt++;
            let elapsedTime = cnt * frame;
            let nowWidth = easing(elapsedTime, befWidth, difWidth, duration);
            let nowHeight = easing(elapsedTime, befHeight, difHeight, duration);
            let nowScale = easing(elapsedTime, befScale, difScale, duration);
            self.modalParts.content.style.transform = 'scale(' + nowScale + ')';
            self.modalParts.wrapper.style.width = 'min(' + nowWidth + 'px, 100%)';
            self.modalParts.wrapper.style.height = 'min(' + nowHeight + 'px, 100%)';
            if (elapsedTime > duration) {
                self.modalParts.content.style.transform = 'scale(' + self.floatRound(aftScale, 1) + ')';
                self.modalParts.wrapper.style.height = 'min(' + self.floatCeil(aftHeight, 0) + 'px, 100%)';
                self.modalParts.wrapper.style.width = 'min(' + self.floatCeil(aftWidth, 0) + 'px, 100%)';
                self.modalParts.scaleDisp.innerHTML = self.floatRound(aftScale, 1) + 'x';
                clearInterval(timer);
            }
        }
        if (difScale != 0) {
            timer = setInterval(resizeAnimate, frame);
        }
    };
    /**
     * 型の判定
     * @param {operand} obj 判定したいもの
     * @return {string} obj の型名
     */
    typeJudge(obj) {
        return toString.call(obj).slice(8, -1).toLowerCase();
    };
    /**
     * 少数の桁変換
     * @param {number} x 対象となる少数
     * @param {number} digit 切り上げる小数点
     * @return {string} フィックスされた少数文字列
     */
    floatRound(num, _digit) {
        let digit = _digit === undefined ? 2 : Number.parseInt(_digit);
        let fix = 10 ** digit;
        let res = Math.round(num * fix) / fix;
        return res.toFixed(digit);
    };
    floatCeil(num, _digit) {
        let digit = _digit === undefined ? 2 : Number.parseInt(_digit);
        let fix = 10 ** digit;
        let res = Math.ceil(num * fix) / fix;
        return res.toFixed(digit);
    };
    floatFloor(num, _digit) {
        let digit = _digit === undefined ? 2 : Number.parseInt(_digit);
        let fix = 10 ** digit;
        let res = Math.floor(num * fix) / fix;
        return res.toFixed(digit);
    };
    /*
     * Robert Penner’s Easing Functions
     * http://robertpenner.com/easing/
     * https://easings.net/
     *
     * Open source under the MIT License and the 3-Clause BSD License.
     *
     * Copyright © 2001 Robert Penner
     */
    /**
     * イージング関数を取得する関数
     * @param {string} easingName イージング関数の名称
     * @return {function} イージング関数
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