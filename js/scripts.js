(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        $.fn.ElementParallexMove = function (options) {
          var defaults = {
            maxScaleRate: 1.5,
            Speed: 0.1,
            RateX: 0.05,
            RateY: 0.05,
            animateDuration: 2000, //ms
            animateTimingfunction: 'cubic-bezier(0.18, 0.69, 0.07, 1.01)',
            directionX: 'reverse',
            directionY: 'reverse',
          };
          var settings = (this.options = $.extend({}, defaults, options));
          var __this = this;
          var $this = $(this),
            $Container = $('header');

          var throttleOn = false;
          var actionLock = false;
          var throttleTimer = 50;

          __this.animate = function (e) {
            var client_x = e.clientX - $(window).width() / 2,
              client_y = e.clientY - $(window).height() / 2;

            $.each($this, function (i, item) {
              var _$this = $(item);
              var _speedratex = _$this.data('speedratex') || settings.RateX,
                _speedratey = _$this.data('speedratey') || settings.RateY,
                directionX =
                  _$this.data('parallexdirectionx') || settings.directionX,
                directionY =
                  _$this.data('parallexdirectiony') || settings.directionY,
                _directionIndexX = directionX == 'normal' ? 1 : -1,
                _directionIndexY = directionY == 'normal' ? 1 : -1;

              _$this.css({});

              _$this.css({
                '-webkit-transform':
                  'translate(' +
                  (directionX == 'none'
                    ? 0
                    : client_x * _speedratex * _directionIndexX + 'px') +
                  ',' +
                  (directionY == 'none'
                    ? 0
                    : client_y * _speedratey * _directionIndexY + 'px') +
                  ')',
                transform:
                  'translate(' +
                  (directionX == 'none'
                    ? 0
                    : client_x * _speedratex * _directionIndexX + 'px') +
                  ',' +
                  (directionY == 'none'
                    ? 0
                    : client_y * _speedratey * _directionIndexY + 'px') +
                  ')',
              });
            });
          };

          __this.throttle = function (e) {
            if (throttleOn) {
              actionLock = true;
            }
            if (!actionLock) {
              throttleOn = true;
              setTimeout(function () {
                throttleOn = false;
              }, throttleTimer);
              __this.animate(e);
            }
            actionLock = false;
          };

          $(window).mousemove(function (e) {
            __this.throttle(e);
          });
        };

        $.fn.getQS = function (target) {
          var url = location.href;

          if (url.indexOf('?') != -1) {
            var wording = '';
            var ary = url.split('?')[1].split('&');
            for (i = 0; i <= ary.length - 1; i++) {
              if (ary[i].split('=')[0] == target) {
                wording = ary[i].split('=')[1];
              }
            }
          }

          return wording;
        };

        function isIE() {
          const ua = window.navigator.userAgent;
          const msie = ua.indexOf('MSIE ');
          const trident = ua.indexOf('Trident/');

          return msie > 0 || trident > 0;
        }

        $(function () {
          let pathname = location.pathname.split('/');
          pathname = pathname[pathname.length - 1];

          switch (pathname) {
            case '':
            case 'index.html':
              return initCard();
            case 'form.html':
              return initForm();
            case 'card.html':
              return initStaticCard();
            default:
              return;
          }
        });

        function initCard() {
          const content = decodeURIComponent(
            $(document).getQS('content') || ''
          );
          const name = decodeURIComponent($(document).getQS('name') || '');
          const previewMode = $(document).getQS('previewMode') === 'true' || '';

          const data = {
            content: content,
            name: name,
            previewMode: previewMode,
          };

          $('.card-content').text(content);
          $('.card-name').text(name);

          fitStage();
          $(window).on('resize', fitStage);

          fitCardText();
          // 網路字型載入後字寬會改變，再量一次
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(fitCardText);
          }

          initAnimation();

          sendEmail(data);
        }

        // 依視窗大小等比縮放 1920x1080 舞台（完整顯示，不裁切）
        function fitStage() {
          const scale = Math.min(
            window.innerWidth / 1920,
            window.innerHeight / 1080
          );
          document.documentElement.style.setProperty('--stage-scale', scale);
        }

        // 賀詞放在 1920x1080 舞台座標內，跟著舞台等比縮放，
        // 所以每個解析度的排版都一樣。文字太長時縮小字級，
        // 讓整塊（賀詞＋署名＋按鈕）維持在「新春快樂」下方、不超出畫面。
        // 量的是排版尺寸（不受 transform 縮放影響），結果與視窗大小無關。
        const CARD_MAX_HEIGHT = 200; // 設計稿 y=763 ~ 963
        const CARD_FONT_MAX = 30;
        const CARD_FONT_MIN = 16;
        function fitCardText() {
          const card = document.querySelector('.card-html');
          if (!card) return;
          let size = CARD_FONT_MAX;
          const apply = () => {
            card.style.fontSize = size + 'px';
            card.style.lineHeight = Math.round(size * 1.67) + 'px';
          };
          apply();
          while (card.offsetHeight > CARD_MAX_HEIGHT && size > CARD_FONT_MIN) {
            size -= 1;
            apply();
          }
        }

        // 光芒：由 8 道線段組成，每道從中心往外長出、再從中心端收回（像煙火綻放）
        const RAY_ANGLES = [-22, 23, 68, 113, 158, 203, 248, 293];
        const RAY_START = 82; // 線段靠中心端的 x（viewBox 150x150，中心 75）
        const RAY_END = 136; // 線段尖端 x
        function buildFirework(el, index) {
          const NS = 'http://www.w3.org/2000/svg';
          const make = (tag, attrs, parent) => {
            const node = document.createElementNS(NS, tag);
            Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
            if (parent) parent.appendChild(node);
            return node;
          };
          const id = 'fw' + index;
          const svg = make('svg', { viewBox: '0 0 150 150' });
          const defs = make('defs', {}, svg);
          const grad = make(
            'linearGradient',
            {
              id: id + 'g',
              x1: RAY_START,
              y1: 0,
              x2: RAY_END,
              y2: 0,
              gradientUnits: 'userSpaceOnUse',
            },
            defs
          );
          [
            [0, '#f7d27c', 0.35],
            [0.5, '#fbe58c', 0.85],
            [1, '#fef59a', 1],
          ].forEach(([offset, color, opacity]) =>
            make(
              'stop',
              { offset, 'stop-color': color, 'stop-opacity': opacity },
              grad
            )
          );
          const blur = make(
            'filter',
            { id: id + 'f', x: '-10%', y: '-10%', width: '120%', height: '120%' },
            defs
          );
          make('feGaussianBlur', { stdDeviation: 0.5 }, blur);

          const group = make('g', { filter: `url(#${id}f)` }, svg);
          const clips = RAY_ANGLES.map((angle, k) => {
            // 每道光芒用一個矩形遮罩控制「露出的那一段」
            const clip = make(
              'clipPath',
              { id: `${id}c${k}`, clipPathUnits: 'userSpaceOnUse' },
              defs
            );
            const rect = make(
              'rect',
              { x: RAY_START, y: 70, width: 0, height: 10 },
              clip
            );
            const ray = make(
              'g',
              { transform: `rotate(${angle} 75 75)` },
              group
            );
            make(
              'path',
              {
                d: 'M82 75.6 L132.5 77.6 A2.6 2.6 0 0 0 132.5 72.4 L82 74.4 Z',
                fill: `url(#${id}g)`,
                'clip-path': `url(#${id}c${k})`,
              },
              ray
            );
            return rect;
          });
          el.appendChild(svg);
          return clips;
        }

        function startFirework(el, index) {
          const rects = buildFirework(el, index);
          const length = RAY_END - RAY_START;
          const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: gsap.utils.random(0.8, 1.8),
            // 每個光芒錯開開始時間
            delay: index * 0.45 + gsap.utils.random(0, 0.3),
          });
          // 從中心往外長出
          tl.fromTo(
            rects,
            { attr: { x: RAY_START, width: 0 } },
            {
              attr: { width: length },
              duration: 0.9,
              ease: 'power3.out',
              stagger: { each: 0.04, from: 'random' },
            }
          );
          // 整體微微擴散
          tl.fromTo(
            el,
            { scale: 0.85, opacity: 1 },
            { scale: 1.08, duration: 1.8, ease: 'power1.out' },
            0
          );
          // 中心端往尖端收回、淡出
          tl.to(
            rects,
            {
              attr: { x: RAY_END, width: 0 },
              duration: 0.7,
              ease: 'power2.in',
              stagger: { each: 0.04, from: 'random' },
            },
            1.3
          );
          tl.to(el, { opacity: 0.4, duration: 0.7, ease: 'power1.in' }, '<');
        }

        // 啟用動畫
        async function initAnimation() {
          // 動畫動作序列
          const animations = [];

          // 篩選出有 JSON 檔案的物件加載 lottie
          // $('.lottie[data-json]').each(function () {
          // 	let _this = $(this)
          // 	animations.push(
          // 		loadLottieAnimation(
          // 			_this.attr('id'),
          // 			`./json/${_this.data('json')}.json`
          // 		)
          // 	)
          // })

          // 待 lottie 都加載完後增加 Parallex
          // animations.push(addParallexWrap())

          // 使用 Promise.all 等待所有動畫 + 增加 Parallex 皆載入完成
          const results = await Promise.all(animations);

          // 全部動畫都載入後，將所有 .lottie 檔案 opacity 設定為 1
          $('.index').addClass('loaded');

          // 2026 賀卡進場動畫
          const kv = gsap.timeline({
            paused: true,
            delay: 0.5,
          });

          // 設定初始狀態 ------------------------------------------------
          // 1. 花：微微旋轉進場，支點設在花枝根部
          gsap.set('.flower_top', {
            opacity: 0,
            rotation: -12,
            scale: 0.92,
            transformOrigin: '22% 0%',
          });
          gsap.set('.flower_left', {
            opacity: 0,
            rotation: -14,
            scale: 0.92,
            transformOrigin: '0% 15%',
          });
          gsap.set('.flower_right', {
            opacity: 0,
            rotation: 14,
            scale: 0.92,
            transformOrigin: '85% 100%',
          });

          // 2. 羊 → 雲 → 人 → 上方閃爍光
          gsap.set('.goat', {
            opacity: 0,
            x: 150,
            scale: 0.95,
            transformOrigin: 'center center',
          });
          gsap.set('.cloud_01, .cloud_03', { opacity: 0, x: 80 });
          gsap.set('.cloud_02', { opacity: 0, x: -80 });
          gsap.set('.person', {
            opacity: 0,
            x: -150,
            y: 150,
            scale: 0.9,
            rotation: -10,
            transformOrigin: 'center bottom',
          });
          gsap.set('.light', { transformOrigin: 'center center' });
          gsap.set('.star', {
            opacity: 0,
            scale: 0,
            transformOrigin: 'center center',
          });

          // 3. 四個字「新春快樂」與賀詞
          gsap.set('.slogan', { opacity: 0, scale: 0.8 });
          gsap.set('.card-html', { opacity: 0, y: 30 });

          // 4. 燈籠從左右兩側晃進來（擺動支點在吊繩頂端），
          //    中國結從上方微微降下
          gsap.set('.lantern', { opacity: 0 });
          gsap.set('.lantern_left', {
            transformOrigin: '30.5% 0%',
            x: -260,
            rotation: 28,
          });
          gsap.set('.lantern_right', {
            transformOrigin: '74.3% 0%',
            x: 260,
            rotation: -28,
          });
          gsap.set('.knot', {
            opacity: 0,
            y: -70,
            rotation: 0,
            transformOrigin: '50% 0%',
          });

          // 時間軸（秒），各段互相重疊 ------------------------------------
          const T_FLOWER = 0;
          const T_GOAT = 0.7;
          const T_CLOUD = 1.3;
          const T_PERSON = 1.8;
          const T_SPARKLE = 2.6;
          const T_SLOGAN = 3.0;
          const T_CARD = 3.7;
          const T_LANTERN = 4.0;
          const T_KNOT = 4.6;

          // 1. 花微微轉進來
          kv.to(
            '.flower_top, .flower_left, .flower_right',
            {
              opacity: 1,
              rotation: 0,
              scale: 1,
              duration: 1.3,
              stagger: 0.12,
              ease: 'power2.out',
              onComplete: () => {
                // 之後隨風微微晃動，三枝節奏錯開
                gsap.to('.flower_top', {
                  rotation: 2,
                  duration: 2.5,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
                gsap.fromTo(
                  '.flower_left',
                  { rotation: 0 },
                  {
                    rotation: 1.5,
                    duration: 2.8,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                  }
                );
                gsap.fromTo(
                  '.flower_right',
                  { rotation: 0 },
                  {
                    rotation: -1.5,
                    duration: 3.2,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                  }
                );
              },
            },
            T_FLOWER
          );

          // 2-1. 羊
          kv.to(
            '.goat',
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 1.2,
              ease: 'power2.out',
              onComplete: () => {
                // 慢慢上下浮動
                gsap.to('.goat, .star1', {
                  y: -35,
                  duration: 3.5,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            T_GOAT
          );

          // 2-2. 雲
          kv.to(
            '.cloud',
            {
              opacity: 1,
              x: 0,
              duration: 1,
              stagger: 0.15,
              ease: 'power2.out',
              onComplete: () => {
                // 雲朵持續左右飄動，帶一點上下浮動
                gsap.to('.cloud_01', {
                  x: 25,
                  y: -6,
                  duration: 2.8,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
                gsap.to('.cloud_02', {
                  x: -30,
                  y: 5,
                  duration: 3.2,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
                gsap.to('.cloud_03, .star3', {
                  x: 35,
                  y: -8,
                  duration: 3.6,
                  delay: 0.4,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            T_CLOUD
          );

          // 2-3. 人
          kv.to(
            '.person',
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 1.3,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to('.person, .star2', {
                  y: -20,
                  duration: 2,
                  delay: 0.5,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });

                // 持續左下右上的微微晃動
                gsap.to('.person_image', {
                  rotation: '+=6',
                  duration: 2,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            T_PERSON
          );

          // 2-4. 上方閃爍光：光芒像煙火一樣從中心長出線段（各自錯開、無限重複），
          //      四角閃光星跳出後一閃一閃
          kv.call(
            () => {
              document
                .querySelectorAll('.light')
                .forEach((light, index) => startFirework(light, index));
            },
            null,
            T_SPARKLE
          );
          kv.to(
            '.star',
            {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              stagger: 0.2,
              ease: 'back.out(2)',
              onComplete: () => {
                document.querySelectorAll('.star').forEach((star) => {
                  gsap.to(star, {
                    scale: 0.35,
                    opacity: 0.3,
                    duration: gsap.utils.random(0.6, 1.1),
                    delay: gsap.utils.random(0, 1.5),
                    repeatDelay: gsap.utils.random(0.3, 1.2),
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                  });
                });
              },
            },
            T_SPARKLE
          );

          // 3. 四個字依序出現，之後輪流微微閃動
          kv.to(
            '.slogan',
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              stagger: 0.2,
              ease: 'power2.out',
              onComplete: () => {
                const slogans = document.querySelectorAll('.slogan');
                slogans.forEach((slogan, index) => {
                  gsap.to(slogan, {
                    opacity: 0.8,
                    duration: 0.4,
                    delay: index * 0.15,
                    ease: 'power2.inOut',
                    repeat: -1,
                    yoyo: true,
                    repeatDelay: (slogans.length - 1) * 0.2,
                  });
                });
              },
            },
            T_SLOGAN
          );

          kv.to(
            '.card-html',
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
            },
            T_CARD
          );

          // 4. 燈籠從左、右兩側晃進來，回彈後持續微微擺動
          kv.to(
            '.lantern',
            {
              opacity: 1,
              x: 0,
              duration: 1,
              stagger: 0.15,
              ease: 'power2.out',
            },
            T_LANTERN
          );
          kv.to(
            '.lantern',
            {
              rotation: 0,
              duration: 2,
              stagger: 0.15,
              ease: 'elastic.out(1.1, 0.35)',
              onComplete: () => {
                gsap.fromTo(
                  '.lantern_left',
                  { rotation: 0 },
                  {
                    rotation: 2.5,
                    duration: 2.2,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                  }
                );
                gsap.fromTo(
                  '.lantern_right',
                  { rotation: 0 },
                  {
                    rotation: -2.5,
                    duration: 2.5,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                  }
                );
              },
            },
            T_LANTERN
          );

          // 中國結從上方微微降下，再開始微微晃動
          kv.to(
            '.knot',
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              stagger: 0.15,
              ease: 'back.out(1.4)',
              onComplete: () => {
                gsap.fromTo(
                  '.knot',
                  { rotation: 0 },
                  {
                    rotation: 3,
                    duration: 1.8,
                    stagger: 0.4,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                  }
                );
              },
            },
            T_KNOT
          );

          kv.play();
          // 進場動畫
          // gsap.to(cloudperson, {
          //   opacity: 1,
          //   x: 0,
          //   scale: 1,
          //   duration: 1.5,
          //   ease: "power2.out",
          //   delay: delay / 1000, // 轉換為秒
          //   onComplete: () => {
          //     // 進場動畫完成後，開始上下緩慢晃動
          //     gsap.to(cloudperson, {
          //       y: -15, // 向上移動 15px
          //       duration: 2,
          //       ease: "sine.inOut",
          //       repeat: -1, // 無限循環
          //       yoyo: true, // 來回移動
          //     });
          //   },
          // });
        }

        // 載入 Lottie 動畫
        // async function loadLottieAnimation(id, animationDataUrl) {
        // 	return new Promise((resolve, reject) => {
        // 		const container = document.getElementById(id)
        // 		const loop = $(container).data('loop') || false

        // 		const animation = lottie.loadAnimation({
        // 			container,              // 動畫要放置的 DOM 元素
        // 			renderer: 'svg',       // 動畫渲染方式（svg、canvas、html）
        // 			loop,                  // 是否循環播放
        // 			autoplay: false,       // 初始不播放，等待全部載入完再撥放
        // 			path: animationDataUrl, // 動畫的 JSON 檔案路徑
        // 		});

        // 		// 當動畫載入成功時
        // 		animation.addEventListener('data_ready', () => {
        // 			resolve(animation);  // 通知動畫已載入
        // 		});

        // 		// 當動畫載入失敗時
        // 		animation.addEventListener('error', (e) => {
        // 			reject(e);  // 通知動畫載入失敗
        // 		});
        // 	});
        // }

        // 增加 Parallex 外殼
        // async function addParallexWrap() {
        // 	return new Promise((resolve) => {
        // 		const parallexEle = $('.lottie:not(.no-parallex)')
        // 		if (!isIE()) {
        // 			parallexEle.each(function () {
        // 				const _this = $(this)
        // 				const transDuration = _this.data('transition-duration') || 0.5
        // 				const parallexdirectiony = _this.data('parallexdirectiony') || 'reverse'
        // 				const parallexdirectionx = _this.data('parallexdirectionx') || 'reverse'
        // 				_this.wrap(`<div class="parallex" data-parallexdirectionx="${parallexdirectionx}" data-parallexdirectiony="${parallexdirectiony}"></div>`)
        // 				_this.parent()
        // 					.css({
        // 						'transition-duration': transDuration + 's',
        // 					})
        // 					.ElementParallexMove()
        // 			})
        // 		}
        // 		resolve(true)
        // 	});
        // }

        function initForm() {
          $('.form-cta input').on('click', function (event) {
            const name = $('#name').val();
            const content = $('#content').val().replace(/\n\r?/g, '%0A');
            location.href =
              './?name=' + name + '&content=' + content + '&previewMode=true';
          });
        }

        function sendEmail(data) {
          const content = data.content;
          const name = data.name;
          const previewMode = data.previewMode;
          const $send = $('.send');

          if (previewMode) {
            $send
              .find('.send-link')
              .attr(
                'href',
                './card.html' + location.search.split('&previewMode')[0]
              );
          } else {
            $send.hide();
          }
        }

        function initStaticCard() {
          var path = document.location.pathname;
          var dir = path.substring(path.indexOf('/'), path.lastIndexOf('/'));
          console.log({
            path: path,
            dir: dir,
          });
          $('.card-link').attr(
            'href',
            location.origin + dir + '/' + location.search
          );
        }
      },
      {},
    ],
  },
  {},
  [1]
);

//# sourceMappingURL=scripts.js.map
