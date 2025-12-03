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

          initAnimation();

          sendEmail(data);
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

          // cloudperson 進場動畫

          const kv = gsap.timeline({
            paused: true,
            delay: 0.5,
          });

          // 設定初始狀態
          gsap.set('.slogan', {
            opacity: 0,
            scale: 0.8,
          });

          gsap.set('.wave', {
            opacity: 0,
            x: 100,
            y: 50,
          });

          gsap.set(' .flower1-1, .flower1-2, .flower1-3, .flower2', {
            opacity: 0,
            scale: 0.8,
          });

          gsap.set('.light1, .light2', {
            opacity: 0,
            x: -10,
            y: -30,
            transformOrigin: 'center top',
          });

          gsap.set('.cloud2', {
            opacity: 0,
            x: 20,
          });

          gsap.set('.cloud1', {
            opacity: 0,
            x: -20,
          });

          gsap.set('.person', {
            opacity: 0,
            x: -150,
            y: 150,
            scale: 0.9,
            rotation: -10,
            transformOrigin: 'center bottom',
          });

          kv.to('.slogan', {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.3,
            stagger: 0.3,
            ease: 'power2.out',
            onComplete: () => {
              // 輪流微微閃動效果
              const slogans = document.querySelectorAll('.slogan');
              slogans.forEach((slogan, index) => {
                gsap.to(slogan, {
                  opacity: 0.6,
                  duration: 0.4,
                  delay: index * 0.15,
                  ease: 'power2.inOut',
                  repeat: -1,
                  yoyo: true,
                  repeatDelay: (slogans.length - 1) * 0.2,
                });
              });
            },
          });

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
                gsap.to('.person', {
                  y: -100,
                  duration: 2,
                  delay: 0.5,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });

                // 持續左下右上的微微晃動
                gsap.to('.person_image', {
                  rotation: '+=15',
                  duration: 2,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            '-=0.7'
          );

          kv.to(
            '.wave',
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to('.wave', {
                  x: -100,
                  y: 50,
                  duration: 2.5,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            '-=0.5'
          );

          kv.to(
            '.flower2',
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                // 持續轉動
                const rotationTimeline2 = gsap.timeline({
                  repeat: -1,
                  repeatRefresh: true,
                });
                rotationTimeline2.to('.flower2', {
                  rotation: '+=360',
                  duration: 4,
                  ease: 'none',
                });
                // 微微放大縮小
                gsap.to('.flower2', {
                  scale: 1.1,
                  duration: 2,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            '-=0.5'
          );

          kv.to(
            '.flower1-1, .flower1-2, .flower1-3',
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              stagger: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                // 持續轉動 - 分別轉不同方向
                const rotationTimeline = gsap.timeline({
                  repeat: -1,
                  repeatRefresh: true,
                });
                rotationTimeline.to('.flower1-1', {
                  rotation: '+=360',
                  duration: 4,
                  ease: 'none',
                });
                rotationTimeline.to(
                  '.flower1-2',
                  {
                    rotation: '-=360',
                    duration: 4,
                    ease: 'none',
                  },
                  0
                );
                rotationTimeline.to(
                  '.flower1-3',
                  {
                    rotation: '+=360',
                    duration: 4,
                    ease: 'none',
                  },
                  0
                );
                // 微微放大縮小
                gsap.to('.flower1-1, .flower1-2, .flower1-3', {
                  scale: 1.1,
                  duration: 2,
                  stagger: 0.2,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            '-=1'
          );

          kv.to(
            '.cloud1, .cloud2',
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to('.cloud1', {
                  x: -30,
                  duration: 2,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });

                gsap.to('.cloud2', {
                  x: 30,
                  duration: 2,
                  delay: 0.5,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                });
              },
            },
            '-=0.5'
          );

          kv.to(".light1, .light2", {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
              // 持續左右晃動，像風吹一樣同方向，帶有反彈效果
              gsap.to(".light1, .light2", {
                x: -15,
                rotation: -5,
                duration: 2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
              });
            },
          }, '-=0.5');

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
