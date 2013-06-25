(function($) {

    /** @namespace YouTube videos */
    var youtube = (function() {

        // YouTube player references
        var players = [];

        // YouTube players count
        var count = 0;

        /** Save referrence to YouTube player */
        function ready(event) {
            players.push(event.target);
        }

        /** On state change trigger event on document object */
        function stateChange(event) {
            var state = (event.data == YT.PlayerState.PLAYING);
            $(document).trigger('youtubePlayerStateChange', state);
        }

        /**
         * Replace placeholder with video URL stored in attribute data-youtube with embedded video
         *
         * @param {String|Object} placeholder Selector or element object
         */
        function embed(placeholder) {
            var $placeholder = $(placeholder);
            var playerId = 'youtubePlayer' + count++;
            var videoId = youtube.parse($placeholder.data('youtube'));
            $placeholder.attr('id', playerId);
            new YT.Player(playerId, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    rel: 0,
                    wmode: 'transparent'
                },
                events: {
                    onReady: ready,
                    onStateChange: stateChange
                }
            });
        }

        /** @scope youtube */
        return {

            /**
             * Get video id from YouTube video URL
             *
             * @param   {String} url Video url
             *
             * @returns {String}     Video id
             */
            parse: function(url) {
                var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                var match = url.match(regExp);
                if (match && match[7].length == 11)
                    return match[7];
                else
                    throw 'youtube.parse: "Incorrect URL' + (url ? '(' + url + ')' : '') + '"';
            },

            /** Get player instances */
            get: function() {
                return players;
            },

            /** YouTube videos initialization */
            init: function() {
                var $players = $('[data-youtube]');
                if (!$players.length)
                    return;

                // Embed videos
                onYouTubeIframeAPIReady = function() {
                    $players.each(function() {
                        embed(this);
                    });
                };

                // Load youtube video API
                $('script:first').before('<script src="//www.youtube.com/iframe_api" />');
            }
        };
    })();

    /** @namespace Vimeo videos */
    var vimeo = (function() {

        // Vimeo player references
        var players = [];

        // Vimeo players count
        var count = 0;

        /**
         * Set events and save referrence to Vimeo player
         *
         * @param {Object} player Vimeo player object
         */
        function ready(player) {
            player.addEvent('play', function() {
                stateChange(true);
            });
            player.addEvent('pause', function() {
                stateChange(false);
            });
            player.addEvent('finish', function() {
                stateChange(false);
            });
            players.push(player);
        }

        /**
         * On state change trigger event on document object
         *
         * @param {Boolean} state Current video state
         */
        function stateChange(state) {
            $(document).trigger('vimeoPlayerStateChange', state);
        }

        /**
         * Replace placeholder with video URL stored in attribute data-vimeo with embedded video
         *
         * @param {String|Object} placeholder Selector or element object
         */
        function embed(placeholder) {
            var $placeholder = $(placeholder);
            var playerId = 'vimeoPlayer' + count++;
            var videoId = vimeo.parse($placeholder.data('vimeo'));
            $placeholder.attr('id', playerId);
            var $player = $('<iframe />').attr({
                src: 'http://player.vimeo.com/video/' + videoId + '?api=1&player_id=' + playerId,
                id: playerId,
                width: '100%',
                height: '100%',
                frameborder: 0,
                webkitAllowFullScreen: 'webkitAllowFullScreen',
                mozallowfullscreen: 'mozallowfullscreen',
                allowFullScreen: 'allowFullScreen'
            });
            $placeholder.replaceWith($player);
            var player = $f($player[0]);
            player.addEvent('ready', function() {
                ready(player);
            });
        }

        /** @scope vimeo */
        return {

            /**
             * Get video id from Vimeo video URL
             *
             * @param   {String} url Video url
             *
             * @returns {String}     Video id
             */
            parse: function(url) {
                var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
                var match = regExp.exec(url);
                if (match && !isNaN(match[5]))
                    return match[5];
                else
                    throw 'vimeo.parse: "Incorrect URL' + (url ? '(' + url + ')' : '') + '"';
            },

            /** Get player instances */
            get: function() {
                return players;
            },

            /** Vimeo initialization */
            init: function() {
                var $players = $('[data-vimeo]');
                if ($players.length)
                    $.getScript('http://a.vimeocdn.com/js/froogaloop2.min.js', function() {
                        $players.each(function() {
                            embed(this);
                        });
                    });
            }
        };
    })();

    // Wait for DOM to load
    $(function() {

        /**
         * @namespace Utility functions
         * @name      utils
         */
        var utils = {};

        /**
         * Execute callback and add it to resize event
         *
         * @param {Function} callback
         */
        utils.resize = function(callback) {
            callback();
            $(window).on('resize', callback);
        },

        /** @namespace Media queries */
        utils.layout = (function() {
            var $window = $(window);

            // Callbacks list
            var callbacks = [];

            // Steps on which callbacks will be called
            var steps = [320, 480, 768, 1024, 1280, 1440];

            /**
             * Round width to step
             *
             * @param {Number} width
             *
             * @returns Step
             */
            function step(width) {
                for (var n = 0; n < steps.length; n++)
                    if (width <= steps[n])
                        return steps[n];
                return Number.MAX_VALUE;
            }

            // Last step
            var last = step($window.width());

            // On each step call all callbacks
            utils.resize(function() {
                var current = step($window.width());
                if (current != last) {
                    last = current;
                    for (var n = 0; n < callbacks.length; n++)
                        callbacks[n](current);
                }
            });

            /** @scope utils.layout */
            return {

                /** Return current step */
                width: function() {
                    return last;
                },

                /**
                 * Register callback
                 *
                 * @param {Function} callback
                 */
                change: function(callback) {
                    callback(last);
                    callbacks.push(callback);
                }
            };
        })();

        /**
         * @namespace Continuous scrolling
         * @name      scroll
         */
        utils.scroll = {};

        /**
         * Scroll element content
         *
         * @param {String|Object}  element  Element to scroll(selector or element object)
         * @param {Number}         [x=0]    Horizontal direction
         * @param {Number}         [y=0]    Vertical direction
         * @param {Number}         speed    Scroll speed
         */
         utils.scroll.start = function(element, x, y, speed) {
            var $element = $(element);
            x = x || 0;
            y = y || 0;

            /**
             * Check whether the content is scrolled to top
             *
             * returns {Boolean}
             */
            function top() {
                return !$element.scrollTop();
            }

            /**
             * Check whether the content is scrolled to bottom
             *
             * returns {Boolean}
             */
            function bottom() {
                return $element.scrollTop() + $element.outerHeight() >= $element.prop('scrollHeight');
            }

            /**
             * Check whether the content is scrolled to left
             *
             * returns {Boolean}
             */
            function left() {
                return !$element.scrollLeft();
            }

            /**
             * Check whether the content is scrolled to right
             *
             * returns {Boolean}
             */
            function right() {
                return $element.scrollLeft() + $element.outerWidth() >= $element.prop('scrollWidth');
            }

            // Stop scrolling
            if (x < 0 && left() || x > 0 && right() || y < 0 && top() || y > 0 && bottom())
                utils.scroll.stop($element);

            // Start scrolling
            else {
                var interval = setInterval(function() {
                    $element
                        .scrollTop($element.scrollTop() + y)
                        .scrollLeft($element.scrollLeft() + x);
                    if ((x && (left() || right())) || (y && (top() || bottom())))
                        utils.scroll.stop($element);
                }, speed);
                $element.data('utils.scroll', interval);
            }
        };

        /**
         * Stop scrolling
         *
         * @param {String|Object} element Selector or element object
         */
        utils.scroll.stop = function(element) {
            var $element = $(element);
            clearInterval($element.data('utils.scroll'));
            $element.data('utils.scroll', null);
        };

        /**
         * Calculate scrollbar size
         *
         * @returns {Number}
         */
        utils.scrollbarSize = function() {
            var $inner = $('<p />').css({
                width: '100%',
                height: 200
            });
            var $outer = $('<div />')
                .css({
                    visibility: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 200,
                    height: 150,
                    overflow: 'hidden'
                })
                .append($inner)
                .appendTo('body');
            var width1 = $inner[0].offsetWidth;
            $outer.css('overflow', 'scroll');
            var width2 = $inner[0].offsetWidth;
            if (width1 == width2)
                 width2 = $outer[0].clientWidth;
            $outer.remove();
            return width1 - width2;
        };

        /**
         * Hide scrollbars
         *
         * @param {String|Object} element Selector or element object
         */
        utils.removeScrollbars = function(element) {
            var scrollbar = utils.scrollbarSize();
            $(element).css({
                marginRight: -scrollbar,
                paddingBottom: scrollbar
            });
        };

        /**
         * Toggle items by category(attribute data-category, multiple categories must separed by comma)
         *
         * @param {String|Object} items    Items to filter
         * @param {String}        category Category
         */
        utils.filter = function(items, category) {
            var $items = $(items);
            if (category == 'all')
                $items.show();
            else
                $items.each(function() {
                    var $item = $(this);
                    var categories = $item.attr('data-category').split(',');
                    $item.toggle($.inArray(category, categories) != -1);
                });
        };

        /**
         * Detect iDevice
         *
         * @returns {Boolean}
         */
        utils.ios = function() {
            return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
        }

        /**
         * @namespace UI elements
         * @name      ui
         */
        var ui = {};

        /** Animation speed */
        ui.speed = 350;

        /** @namespace Preloader */
        ui.preloader = (function() {
            var speed = 500;
            var $images = $([]);
            var $preloader = $([]);

            /** @scope ui.preloader */
            return {

                /** Add image */
                add: function(src) {
                    if ($preloader.length)
                        $images = $images.add('<img src="' + src + '" />');
                },

                /** Show preloader */
                show: function() {
                    $preloader.show();
                },

                /**
                 * Hide preloader after all images are loaded
                 *
                 * @param {Function} callback
                 */
                hide: function(callback) {
                    if (!$preloader.length)
                        return;
                    $images
                        .add('img')
                        .loaded(function() {
                            $preloader.fadeOut(speed, callback || $.noop);
                        });
                },

                /** Initialization */
                init: function() {
                    $preloader = $('[data-ui="preloader"]');
                }
            };
        })();

        /** Button */
        ui.button = function() {
            var $buttons = $('[data-ui="button"]');
            if (!$buttons.length)
                return;

            // Button structure
            $buttons.each(function() {
                var $button = $(this);
                $button
                    .disableSelection()
                    .wrapInner('<span class="normal" />')
                    .contents()
                    .clone()
                    .attr('class', 'hover')
                    .appendTo($button)
                    .clone()
                    .attr('class', 'click')
                    .appendTo($button);
            });

            // Click effect
            $(document).on({
                mousedown: function() {
                    $(this).addClass('click');
                },
                'mouseup mouseleave': function() {
                    $(this).removeClass('click')
                }
            }, '[data-ui="button"]');
        };

        /** Tabs */
        ui.tabs = function() {
            var $tabs = $('[data-ui="tabs"]');
            if (!$tabs.length)
                return;

            // Tabs structure
            $tabs.each(function() {
                var menu = '<div class="menu"><a class="switch"></a><ul>';
                $(this)
                    .find('ul')
                    .wrap('<div class="clear" />')
                    .parent()
                    .addClass('panels')
                    .find('li')
                    .hide()
                    .each(function() {
                        menu += '<li>' + ($(this).data('label') || '') + '</li>';
                    })
                    .end()
                    .before(menu + '</ul></div>')
                    .find('li:eq(0)')
                    .show()
                    .add($('.menu li:eq(0)', this))
                    .addClass('active')
                    .end()
                    .end()
                    .prev()
                    .disableSelection();
            });

            // Switch tab
            $(document).on('click', '[data-ui="tabs"] .menu li:not(.active)', function() {
                var $tab = $(this);
                $tab
                    .siblings()
                    .removeClass('active')
                    .end()
                    .addClass('active');
                var $panels = $tab
                    .closest('[data-ui]')
                    .find('.panels');
                $panels
                    .stop(true, true)
                    .height($panels.height());
                var $panel = $panels
                    .find('li')
                    .stop(true, true)
                    .filter('.active')
                    .removeClass('active')
                    .fadeOut(ui.speed)
                    .end()
                    .eq($tab.index())
                    .addClass('active')
                    .fadeIn(ui.speed);
                $panels.animate({height: $panel.height()}, ui.speed, function() {
                    $panels.height('auto');
                });
            });

            // Switch between expanded and collapsed state
            function refresh() {
                $tabs.each(function() {
                    var $tabs = $(this);
                    var $menu = $('.menu', this);
                    var $list = $('.menu ul', this);
                    $tabs.removeClass('shrink');
                    $menu.removeClass('open');
                    $list
                        .show()
                        .fadeTo(0, 1);
                    var shrink = $menu.height() > $('li:eq(0)', $list).outerHeight();
                    $tabs.toggleClass('shrink', shrink);
                    $list.toggle(!shrink);
                });
            }
            $(window)
                .on('resize', function() {
                    refresh();
                    setTimeout(refresh, 250);
                })
                .trigger('resize');

            // Show tabs list
            $(document).on('click', '[data-ui="tabs"].shrink .switch', function() {
                var $list = $(this).siblings('ul');
                var visible = $list.is(':visible');
                $list
                    .stop(true, true)
                    ['slide' + (visible ? 'Up' : 'Down')](ui.speed)
                    .clearQueue()
                    .fadeTo(ui.speed, visible ? 0 : 1)
                    .parent()
                    .toggleClass('open');
            });
        };

        /** Accordion */
        ui.accordion = function() {
            var $accordions = $('[data-ui="accordion"]');
            if (!$accordions.length)
                return;

            // Accordion structure
            $accordions.each(function() {
                $('li', this).each(function() {
                    var $item = $(this);
                    $item
                        .wrapInner('<div class="content" />')
                        .prepend('<div class="label"><span class="icon"></span>' + ($item.data('label') || '') + '</div>')
                        .prepend('')
                        .find('.label')
                        .disableSelection();
                });
            });

            // Switch item
            $(document).on('click', '[data-ui="accordion"] .label', function() {
                $(this)
                    .parent()
                    .find('.content')
                    .stop(true, true)
                    .slideToggle(ui.speed)
                    .end()
                    .toggleClass('active')
                    .stop(true, true)
                    .siblings('.active')
                    .removeClass('active')
                    .find('.content')
                    .slideUp(ui.speed);
            });
        };

        /** Message boxes */
        ui.message = function() {
            var $messages = $('[data-ui="message"]');
            if (!$messages.length)
                return;

            // Message structure
            $messages.each(function() {
                $(this)
                    .prepend('<span class="ico" />')
                    .append('<a class="close" />');
            });

            // Hide message
            $(document).on('click', '[data-ui="message"] .close', function() {
                $(this)
                    .parent()
                    .slideUp(ui.speed)
                    .clearQueue()
                    .fadeOut(ui.speed);
            });
        };

        /** Graph */
        ui.graph = function() {
            var $graphs = $('[data-ui="graph"]');
            if (!$graphs.length)
                return;

            // Graph structure
            $graphs.each(function() {
                $('li', this).each(function() {
                    $(this)
                        .wrapInner('<div class="label" />')
                        .append('<div class="bar"><div class="fill"></div></div>');
                });
            });

            // Animation
            var $window = $(window)
            $window.on('scroll', function() {
                var $graphs = $('[data-ui="graph"]:not(.visible)');
                if (!$graphs.length)
                    return;
                var top = $window.scrollTop();
                var bottom = top + $window.height();
                $graphs.each(function() {
                    var $graph = $(this);
                    var graphTop = $graph.offset().top;
                    var graphBottom = graphTop + $graph.height();
                    if (graphTop > top && graphTop < bottom || graphBottom > top && graphBottom < bottom) {
                        $graph
                            .addClass('visible')
                            .find('li')
                            .each(function() {
                                var width = ($(this).data('percent') || 0) + '%';
                                $('.fill', this).animate({width: width}, 2000, 'easeOutBounce');
                            });
                    }
                });
            });
        };

        /** @namespace Flip effect */
        ui.flip = {};

        /**
         * Flip
         *
         * @param {String|Object} element Selector or element object
         * @param {Boolean}       [state] Value of data-flip attribute
         */
        ui.flip.toggle = function(element, state) {
            $element = $(element);
            state = state === undefined ? $element.attr('data-flip') != 'true' : state;
            $element.attr('data-flip', state);
        };

        /** Initialization */
        ui.flip.init = function() {
            $('[data-ui="flip"]')
                .wrapInner('<div class="content" />')
                .each(function() {
                    var $flip = $(this);
                    $flip.attr({
                        'data-flip': $flip.attr('data-flip') == 'true',
                        'data-axis': $flip.data('axis') || 'y'
                    });
                });
        };

        /** @namespace Scrollbars */
        ui.scrollbar = {};

        /** Enable custom scrollbars */
        ui.scrollbar.enabled = false;

        /**
         * Call an callback on each of selected scrollbars
         *
         * @param {String|Object} [scrollbars] Selector or element object
         * @param {Function}      [callback]   Callback function
         */
        ui.scrollbar.each = function(scrollbars, callback) {
            scrollbars = scrollbars || '[data-ui-scrollbar]';
            $(scrollbars).each(callback);
        };

        /**
         * Refresh scrollbars
         *
         * @param {String|Object} [scrollbars] Selector or element object
         */
        ui.scrollbar.refresh = function(scrollbars, force) {
            if (ui.scrollbar.enabled || force)
                ui.scrollbar.each(scrollbars, function() {
                    var api = ui.scrollbar.api(this);
                    if (api)
                        api.reinitialise();
                    else
                        ui.scrollbar.init(this);
                });
        };

        /**
         * Reset scrollbars
         *
         * @param {String|Object} [scrollbars] Selector or element object
         */
        ui.scrollbar.reset = function(scrollbars, force) {
            if (ui.scrollbar.enabled || force) {
                scrollbars = scrollbars || '[data-ui-scrollbar]';
                ui.scrollbar.destroy(scrollbars);
                ui.scrollbar.init(scrollbars);
            }
        };

        /**
         * Destroy scrollbars
         *
         * @param {String|Object} [scrollbars] Selector or element object
         */
        ui.scrollbar.destroy = function(scrollbars, force) {
            if (ui.scrollbar.enabled || force)
                ui.scrollbar.each(scrollbars, function() {
                    var api = ui.scrollbar.api(this);
                    if (api)
                        api.destroy();
                });
        };

        /**
         * Scroll to
         *
         * @param {String|Object} [scrollbars]    Selector or element object
         * @param {Number}        [x=0]           Horizontal position
         * @param {Number}        [y=0]           Vertical position
         * @param {Boolean}       [animate=false] Animate scroll
         */
        ui.scrollbar.scrollTo = function(scrollbars, x, y, animate) {
            if (ui.scrollbar.enabled || force) {
                x = x || 0;
                y = y || 0;
                animate = animate || false;
                ui.scrollbar.each(scrollbars, function() {
                    var api = ui.scrollbar.api(this);
                    if (api)
                        api.scrollTo(x, y, animate || false);
                });
            }
        };

        /**
         * Scroll to top
         *
         * @param {String|Object} [scrollbars]    Selector or element object
         * @param {Boolean}       [animate=false] Animate scroll
         */
        ui.scrollbar.scrollTop = function(scrollbars, animate) {
            // TODO
            if (ui.scrollbar.enabled)
                ui.scrollbar.scrollTo(scrollbars);
        };

        /**
         * Get API object
         *
         * @param   {String|Object} scrollbar Selector or element object
         *
         * @returns {Object}                  jScrollPane API object
         */
        ui.scrollbar.api = function(scrollbar) {
            return $(scrollbar).data('jsp');
        };

        /**
         * Check if scrollbar exists on certain element
         *
         * @param   {String|Object} scrollbar Selector or element object
         *
         * @returns {Boolean}
         */
        ui.scrollbar.exists = function(scrollbar) {
            return !!ui.scrollbar.api(scrollbar);
        };

        /**
         * Initialize scrollbars
         *
         * @param {String|Object} [scrollbars] Selector or element object
         */
        ui.scrollbar.init = function(scrollbars, force) {

            // Default
            if (!ui.scrollbar.enabled && !force) {
                ui.scrollbar.each(scrollbars, function() {
                    var $scrollbar = $(this);
                    var $pane =
                    $('<div class="jspPane jspContainer" />').css({
                        position: 'relative',
                        padding: $scrollbar.css('padding'),
                        paddingTop: $scrollbar.css('padding-top'),
                        paddingLeft: $scrollbar.css('padding-left'),
                        paddingRight: $scrollbar.css('padding-right'),
                        paddingBottom: $scrollbar.css('padding-bottom')
                    });
                    $scrollbar
                        .css({
                            padding: 0,
                            overflow: 'auto'
                        })
                        .wrapInner($pane)
                        .on('scroll', function(event) {
                            $(window).trigger('scroll', event);
                        });
                });
            }

            // Custom
            else
                ui.scrollbar.each(scrollbars, function() {
                    var $scrollbar = $(this);
                    if (!ui.scrollbar.exists(this)) {
                        $scrollbar.attr('data-ui-scrollbar', true);
                        var reinit = $scrollbar.data('ui-scrollbar-reinit');
                        $scrollbar.jScrollPane({
                            autoReinitialise: reinit === undefined || reinit,
                            autoReinitialiseDelay: utils.ios() ? 250 : 20,
                            animateScroll: true,
                            animateSteps: true,
                            animateDuration: 200,
                            mouseWheelSpeed: 200,
                            keyboardSpeed: 120
                        });
                    }
                });
        };

        /** @namespace Carousels */
        ui.carousel = (function() {

            // Item width
            var width = 220;

            // Remove preloaders after images are loaded
            function preload() {
                var $carousels = $('[data-ui="carousel"]');
                var count = $carousels.length;
                $carousels
                    .data('ui-scrollbar-reinit', false)
                    .each(function() {
                        var $carousel = $(this);
                        $carousel.loaded(function() {
                            if (!--count) {
                                ui.carousel.refresh();
                                ui.scrollbar.refresh();
                                setTimeout(ui.carousel.refresh, 50);
                            }
                        });
                        $('.item img', $carousel).each(function() {
                            var $image = $(this);
                            var fail = false;
                            $image
                                .one('error', function() {
                                    fail = true;
                                })
                                .loaded(function() {
                                    if (fail)
                                        return;
                                    $image
                                        .closest('.item')
                                        .addClass('loaded');
                                    var height = $('.jspPane', $carousel).height();
                                    $('.item:not(.loaded)').each(function() {
                                        $('> a', this).height(height - $('.contents', this).outerHeight());
                                    });
                                })
                        });
                    });
            }

            /** @scope carousel */
            return {

                /** Compute item widths */
                resize: function() {
                    $('[data-ui="carousel"]')
                        .each(function() {
                            var $carousel = $(this);
                            var $items = $('.item', $carousel);
                            var margin = parseInt($items.last().css('margin-left'));
                            var carousel = $carousel.width() + margin;
                            var count = Math.floor(carousel / (width + margin));
                            var item = Math.floor(carousel / count) - margin;
                            $items.width(item);
                        });
                },

                /** Refresh carousels */
                refresh: function() {
                    ui.scrollbar.destroy('[data-ui="carousel"]', true);
                    $('[data-ui="carousel"]').removeClass('init');
                    ui.scrollbar.init('[data-ui="carousel"]', true);
                    ui.carousel.resize();
                    $('[data-ui="carousel"]').each(function() {
                        var $carousel = $(this);
                        if (!$('.item:visible', this).length)
                            $carousel.hide();
                        else
                            $carousel
                                .find('.item')
                                .removeClass('first')
                                .filter(':visible:first')
                                .addClass('first')
                                .end()
                                .removeClass('last')
                                .filter(':visible:last')
                                .addClass('last');
                    })

                    // Equal items height
                    .each(function() {
                            var height = 0;
                            $('.item', this)
                                .height('auto')
                                .each(function() {
                                    height = Math.max(height, $(this).outerHeight());
                                })
                                .height(height);
                    });

                    ui.scrollbar.refresh('[data-ui="carousel"]', true);
                    $('[data-ui="carousel"]').addClass('init');
                },

                /** Filter carousel items by category */
                filter: function(category) {
                    utils.filter('[data-ui="carousel"] .item', category);
                    ui.carousel.refresh();
                },

                /** Initialization */
                init: function() {
                    var $carousels = $('[data-ui="carousel"]');
                    if (!$carousels.length)
                        return;

                    // Carousel structure
                    $carousels.each(function() {
                        $('> *', this)
                            .addClass('item')
                            .first()
                            .addClass('first');
                    });

                    // Remove preloaders after images are loaded
                    preload();

                    // Hover effect
                    ui.hover($('.item > a', $carousels));

                    // Refresh carousels after window resize
                    $(window).on('resize', function() {
                        setTimeout(ui.carousel.refresh, 50);
                    });
                }
            };
        })();

        /** View images in lightbox */
        ui.lightbox = function() {
            $('a[data-ui-lightbox]')
                .attr('rel', 'group')
                .fancybox({
                    imageLoading: 'img/lightbox/loading.gif',
                    imageBtnPrev: 'img/lightbox/prev.gif',
                    imageBtnNext: 'img/lightbox/next.gif',
                    imageBtnClose: 'img/lightbox/close.gif',
                    imageBlank: 'img/lightbox/blank.gif',
                    txtImage: '',
                    txtOf: '/'
                });
        };

        /**
         * Hover effect
         *
         * @param {String|Object} [elements] Selector or element object
         */
        ui.hover = function(elements) {
            var elements = elements || 'a[data-ui-hover]';
            $(elements).each(function() {
                var $element = $(this);
                if (!$element.data('ui-hover'))
                    $element
                        .attr('data-ui-hover', true)
                        .append('<span class="hover"><span class="ico"></span></span>')
                        .hoverdir();
            });
        };

        /** UI initialization */
        ui.init = function() {
            ui.preloader.init();
            ui.button();
            ui.tabs();
            ui.accordion();
            ui.message();
            ui.graph();
            ui.flip.init();
            ui.scrollbar.init();
            ui.carousel.init();
            ui.lightbox();
            ui.hover();
        };

        /**
         * @namespace Forms
         * @name      forms
         */
        var forms = {};

        /** Init placeholders(attribute data-placeholder) */
        forms.placeholders = function() {

            // Events
            $(document).on({
                focus: function() {
                    var $input = $(this);
                    if ($.trim($input.val()) == $input.data('placeholder'))
                        $input
                            .val('')
                            .removeClass('placeholder');
                },
                blur: function() {
                    var $input = $(this);
                    if (!$.trim($input.val()))
                        $input
                            .val($input.data('placeholder'))
                            .addClass('placeholder');
                },
                change: function() {
                    var $input = $(this);
                    return $input.val() != $input.data('placeholder');
                },
                keydown: function(event) {
                    if (event.which == 27)
                        $(this)
                            .val('')
                            .trigger('keyup')
                            .trigger('blur');
                }
            }, '[data-placeholder]');

            // Values
            $('[data-placeholder]').each(function() {
                var $input = $(this);
                var value = $.trim($input.val());
                if (!value || value == $input.data('placeholder'))
                    $input
                        .val('')
                        .trigger('blur');
            });
        };

        /** @namespace Form validation */
        forms.validation = {};

        /**
         * Any value
         *
         * @param   {String}  value Input value
         *
         * @returns {Boolean}
         */
        forms.validation.any = function(value) {
            return !!$.trim(value).length;
        };

        /**
         * E-mail
         *
         * @param   {String}  value Input value
         *
         * @returns {Boolean}
         */
        forms.validation.email = function(value) {
            var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value);
        };

        /**
         * Register form for validation before submit
         *
         * @param {Object|String} form Form element or selector
         */
        forms.validation.register = function(form) {
            var $form = $(form);
            $form.on('submit', function() {

                // Check required values
                var invalid = 0;
                $('[data-require]', $form).each(function() {
                    var $input = $(this);
                    var value = $.trim($input.val());
                    value = value == $input.data('placeholder') ? '' : value;
                    var type = $.trim($input.data('require'));
                    if (forms.validation[type]) {
                        var valid = forms.validation[type](value);
                        $input.toggleClass('invalid', !valid);
                        invalid += valid ? 0 : 1;
                    }
                });

                // Animate invalid fields
                $('.invalid', form).each(function() {
                    var $input = $(this);
                    $input
                        .wrap('<div />')
                        .parent()
                        .effect({
                            effect: 'shake',
                            duration: 1000,
                            times: 2,
                            distance: 4,
                            complete: function() {
                                $input.unwrap();
                            }
                        });
                });

                // Cancel form submit in the case some values are not valid
                return !invalid;
            });
        };

        /** Validation initialization */
        forms.validation.init = function() {
            $('form').each(function() {
                if ($('[data-require]', this).length)
                    forms.validation.register(this);
            });
        };

        forms.init = function() {

            // Init placeholders
            forms.placeholders();

            // Form validation
            forms.validation.init();

            // Submit form
            $('form .submit').on('click', function() {
                $(this)
                    .closest('form')
                    .trigger('submit');
                return false;
            });

            // Label "for" attribute IE8 workaround
            if ($.browser.msie && $.browser.version == 8)
                $(document).on('mousedown', 'label[for]', function() {
                    var $input = $('#' + $(this).attr('for'));
                    var $group = $('input[name="' + $input.attr('name') + '"]');
                    $group.removeAttr('checked');
                    $input
                        .attr('checked', 'checked')
                        .trigger('change');
                });
        };

        /**
         * @namespace Common functions
         * @name      common
         */
        var common = {};

        /** Browser sniffing */
        common.browser = function() {
            var version = parseInt($.browser.version);
            if ($.browser.mozilla)
                $('html').attr('data-mozilla', version);
            else if ($.browser.webkit)
                $('html').attr('data-webkit', version);
            else if ($.browser.opera)
                $('html').attr('data-opera', version);
            else if ($.browser.safari)
                $('html').attr('data-safari', version);
            else if ($.browser.msie)
                $('html').attr('data-msie', version);
        };

        /** Adjust embedded videos */
        common.embed = function() {
            $('iframe[src*="youtube"]')

                // Fix z-index & scrolling issue
                .each(function() {
                    var $iframe = $(this);
                    var src = $iframe.attr('src');
                    $iframe.attr({
                        src: src + (src.indexOf("?") == -1 ? '?' : "&") + 'wmode=transparent',
                        scrolling: 'no'
                    });
                })

                // Responsiveness
                .add('iframe[src*="vimeo"]')
                .filter('.responsive')
                .each(function() {
                    var $video = $(this);
                    var ratio = $video.attr('height') / $video.attr('width');
                    var $wrapper = $('<div />')
                        .css('padding-bottom', (ratio * 100) + '%')
                        .addClass('video');
                    $video
                        .removeAttr('width height')
                        .wrap($wrapper);
                });
        };

        /** Dropcaps */
        common.dropcap = function() {
            $('p.dropcap').html(function (id, html) {
                return html.replace(/^[^a-zA-Z]*([a-zA-Z])/g, '<span class="letter">$1</span>');
            });
        };

        /** @namespace Sidebar */
        var bar = (function() {

            // Bar toggle speed
            var speed = 250;

            // Menu animation speed
            var menuSpeed = 250;

            // Overlay edge
            var overlay = 480;

            // Bar visibility flag
            var visible = true;

            // Cached elements
            var $body = $('body');
            var $bar = $('#bar');
            var $switch = $('.switch', $bar);
            var $panel = $('#panel');

            // Bar width
            var width = $bar.outerWidth();

            // Animation step callback
            var step = $.noop;

            /** Toggle scrollbar flag class */
            function scrollbar() {
                var $items = $('.menu > li > a', $bar);
                $items.addClass('transition_none');
                $bar.toggleClass('scrollbar', $('.jspVerticalBar', $bar).is(':visible'));
                setTimeout(function() {
                    $items.removeClass('transition_none');
                }, 250);
            }

            /** @scope bar */
            return {

                /**
                 * Toggle sidebar
                 *
                 * @param {Boolean} show    Sidebar state
                 * @param {Boolean} animate Transition
                 */
                toggle: function(show, animate) {
                    show = show === undefined ? !visible : show;
                    if (show && utils.layout.width() <= 768 && info.visible())
                        info.hide();
                    visible = show;
                    animate = animate === undefined ? true : animate;

                    // Animation
                    $bar
                        .stop()
                        .animate(
                            {left: show ? 0 : -width},
                            {
                                duration: animate ? speed : 0,
                                complete: function() {
                                    step();
                                    $bar.toggleClass('hidden', !visible);
                                    width = $bar.outerWidth();
                                    ui.scrollbar.refresh('#bar');
                                    $(window).trigger('resize');
                                    scrollbar();
                                },
                                step: step
                            }
                        );

                    // Refresh
                    $bar
                        .find('.submenu.open')
                        .removeClass('open')
                        .find('> ul')
                        .slideUp(0);
                    ui.scrollbar.refresh('#bar');
                    ui.flip.toggle($switch, !visible);
                    var left = utils.layout.width() > overlay ? (show ? width : 0) : 0;
                    $body
                        .stop()
                        .animate({paddingLeft: left}, animate ? speed : 0);
                    $panel
                        .stop()
                        .animate({left: left}, animate ? speed : 0);
                },

                /**
                 * Show sidebar
                 *
                 * @param {Boolean} [animate=true] Transition
                 */
                show: function(animate) {
                    animate = animate === undefined ? true : animate;
                    bar.toggle(true, animate);
                },

                /**
                 * Hide sidebar
                 *
                 * @param {Boolean} [animate=true] Transition
                 */
                hide: function(animate) {
                    animate = animate === undefined ? true : animate;
                    bar.toggle(false, animate);
                },

                /** @returns Bar state */
                visible: function() {
                    return visible;
                },

                /** Animation step callback */
                step: function(callback) {
                    step = callback || step;
                },

                /**
                 * Initialization
                 *
                 * @param {Object}   [options]             Options
                 * @param {Number}   [options.overlay=480] Step from which bar will overlay main content
                 * @param {Function} [options.step]        Callback which will be called on each step of bar toggle animation
                 */
                init: function(options) {
                    options = options || {};
                    overlay = options.overlay || overlay;
                    step = options.step || step;
                    $panel.css('left', $bar.outerWidth());
                    var $footer = $('.footer', $bar);
                    if ($footer.length)
                        $('.scrollbar', $bar).css('padding-bottom', $footer.outerHeight());

                    // Scrollbar
                    ui.scrollbar.init('#bar');

                    // Switch
                    $('.switch', $bar).on('click', function() {
                        bar.toggle();
                    });
                    $(window).on('resize', function() {
                        width = $bar.outerWidth();
                        $bar.css('left', visible ? 0 : -width);
                    });

                    // Hide menu when switching to overlay
                    utils.layout.change(function(width) {
                        var show = width > overlay;
                        if (show != bar.visible())
                            ui.scrollbar.api('#bar').scrollTo(0, 0, false);
                        bar.toggle(show, false);
                    });

                    // Normal menu - hover
                    $bar.on({
                        mouseenter: function() {
                            if (utils.layout.width() > 480)
                                $('ul', this).stop(true, true).show('slide', {direction: 'left'}, menuSpeed);
                        },
                        mouseleave: function() {
                            if (utils.layout.width() > 480)
                                $('ul', this).stop(true, true).hide('slide', {direction: 'left'}, menuSpeed);
                        }
                    }, '.submenu');

                    // Mobile menu - accordion
                    function toggle($submenu) {
                        if (!$submenu.length)
                            return;
                        var open = $submenu.is(':visible');
                        var $siblings = $submenu
                            .parent()
                            .siblings()
                            .filter('.submenu');
                        $submenu['slide' + (open ? 'Up' : 'Down')](menuSpeed, function() {
                            $siblings.removeClass('open');
                            $submenu
                                .parent()
                                .toggleClass('open', !open);
                        });
                        $siblings
                            .find('> ul')
                            .slideUp(menuSpeed);
                    }
                    $bar

                        // Toggle submenu on click
                        .on('click', '.submenu > a', function() {
                            if (utils.layout.width() > 480)
                                return false;
                            toggle($(this).next('ul'));
                            return false;
                        })

                        // Mark items that contains submenu
                        .find('.menu > li')
                        .each(function() {
                            $(this).toggleClass('submenu', !!$('ul', this).length);
                        })
                        .filter('.submenu')
                        .find('> a')
                        .append('<span class="ico" />');

                    // Close submenu when switching overlay
                    utils.layout.change(function(width) {
                        if (width > 480)
                            toggle($('.submenu.open > ul', $bar));
                    });

                    // Filter
                    if (options.filter)
                        $.each(options.filter, function(name, callback) {
                            $bar.on('change', 'input[name="' + name + '"]', function() {
                                callback($(this).val());
                            });
                        });
                    $('.filter', $bar)

                        // Style radiobuttons
                        .find('input')
                        .each(function(id) {
                            id = 'bar_filter' + id;
                            $(this)
                                .attr('id', id)
                                .after('<label for="' + id + '" ><span></span></label>')
                                .parent()
                                .next()
                                .find('label')
                                .attr('for', id);
                        });

                    // Safari weird :checked behavior fix
                    if ($.browser.safari)
                        $('input[checked="checked"]')
                            .removeAttr('checked')
                            .prop('checked', true);

                    // Footer
                    var $placeholder = $('<div class="placeholder" />').appendTo($('.jspPane', $bar));
                    utils.resize(function() {
                        scrollbar();
                        $placeholder.css('height', $('.footer', $bar).outerHeight());
                    });
                }
            };
        })();

        /** Scroll area */
        common.scroll = function() {
            ui.scrollbar.init('.scrollarea');
        };

        /** @namespace Bottom panel */
        var panel = (function() {

            // Cached elements
            var $panel = $('#panel');
            var $scroll = $('.scroll', $panel);
            var $content = $('#content');

            // Speed of scrolling
            var scrollSpeed = 20;
            var scrollStep = 20;

            /** @scope panel */
            return {

                /** Toggle "Keep scrolling" notification */
                refresh: function() {
                    var scrollTop = $content.scrollTop();
                    var scrollLeft = $content.scrollLeft();
                    $('.up', $scroll).toggleClass('disabled',  !scrollTop);
                    $('.down', $scroll).toggleClass('disabled', scrollTop + $content.outerHeight() >= $content.prop('scrollHeight'));
                    $('.left', $scroll).toggleClass('disabled',  !scrollLeft);
                    $('.right', $scroll).toggleClass('disabled', scrollLeft + $content.outerWidth() >= $content.prop('scrollWidth'));
                },

                /** Initialization */
                init: function() {
                    $('body').css('padding-bottom', $panel.outerHeight() + utils.scrollbarSize());
                    $content.on('scroll', panel.refresh);
                    utils.resize(panel.refresh);

                    // Scroll content
                    $scroll
                        .on('mouseup mouseleave', function() {
                            utils.scroll.stop($content);
                        })
                        .find('.arrow')
                        .on('mousedown', function() {
                            var $arrow = $(this);
                            var x = $arrow.is('.left') ? -1 : ($arrow.is('.right') ? 1 : 0);
                            var y = $arrow.is('.up') ? -1 : ($arrow.is('.down') ? 1 : 0);
                            utils.scroll.start($content, scrollStep * x, scrollStep * y, scrollSpeed);
                        });
                }
            };
        })();

        /** @namespace Thumbnails */
        var thumbnails = (function() {

            // Thumbnail width
            var width = 320;

            // Thumbnails container
            var $container = $('#content');

            // Thumbnails
            var $thumbs = $('li', $container);

            /** @scope thumbnails */
            return {

                /** Organize thumbnails */
                organize: function() {
                    var container = $container.width();
                    var columns = Math.ceil(container / width);
                    var thumb = Math.floor(container / columns);
                    $thumbs.width(thumb);
                    $.when($container.masonry({
                        itemSelector : 'li:visible',
                        columnWidth: thumb
                    }))
                    .then(function() {
                        $container.addClass('loaded');
                        panel.refresh();
                    });
                },

                /**
                 * Filter thumbnails by category
                 *
                 * @param {String} category
                 */
                filter: function(category) {
                    utils.filter($thumbs, category);
                    $thumbs
                        .not(':visible')
                        .css({
                            top: 0,
                            left: 0
                        });
                    $.when($container.masonry('reload')).then(panel.refresh);
                },

                /** Initialization */
                init: function() {
                    var scrollbar = utils.scrollbarSize();
                    $container

                        // Hide scrollbars
                        .css({
                            paddingRight: scrollbar,
                            paddingBottom: scrollbar
                        })

                        // Organize thumbnails
                        .loaded(function() {
                            utils.resize(thumbnails.organize);
                        });

                    // Hover effect
                    $thumbs
                        .each(function() {
                            $(this).hoverdir({speed: 150});
                        })
                        .find('.hover')
                        .each(function() {
                            $(this).wrapInner('<span class="wrapper"><span class="content"></span></span>');
                        });
                }
            }
        })();

        /** @namespace Info sidebar */
        var info = (function() {

            // Bar toggle speed
            var speed = 250;

            // Bar visibility flag
            var visible = true;

            // Cached elements
            var $info = $('#info');
            var $switch = $('.switch', $info);
            var $body = $('body');
            var $panel = $('#panel');

            // Bar width
            var width = 0;

            /** @scope info */
            return {

                /**
                 * Toggle info sidebar
                 *
                 * @param {Boolean} show    Sidebar state
                 * @param {Boolean} animate Transition
                 */
                toggle: function(show, animate) {
                    show = show === undefined ? !visible : show;
                    if (show && utils.layout.width() <= 768 && bar.visible())
                        bar.hide();
                    visible = show;
                    animate = animate === undefined ? true : animate;
                    width = $info.outerWidth();
                    $info
                        .stop()
                        .animate(
                            {right: show ? 0 : -width},
                            animate ? speed : 0,
                            function() {
                                $info.toggleClass('hidden', !visible);
                            }
                        );
                    ui.flip.toggle($switch, !visible);
                    var right = utils.layout.width() > 1280 ? (show ? width : 0) : 0;
                    $body
                        .stop()
                        .animate({paddingRight: right}, animate ? speed : 0);
                    $panel
                        .stop()
                        .animate({right: right}, animate ? speed : 0);
                },

                /**
                 * Show info sidebar
                 *
                 * @param {Boolean} animate Transition
                 */
                show: function(animate) {
                    animate = animate === undefined ? true : animate;
                    info.toggle(true, animate);
                },

                /**
                 * Hide info sidebar
                 *
                 * @param {Boolean} animate Transition
                 */
                hide: function(animate) {
                    animate = animate === undefined ? true : animate;
                    info.toggle(false, animate);
                },

                /** @returns Bar state */
                visible: function() {
                    return visible;
                },

                /** Initialization */
                init: function() {
                    $panel.css('right', $info.outerWidth());

                    // Switch
                    $switch.on('click', function() {
                        info.toggle();
                    });
                    $(window).on('resize', function() {
                        width = $info.outerWidth();
                        $info.css('right', visible ? 0 : -width);
                    });

                    // Show "See live version" link on hover
                    var $link = $('#info .navigation .link');
                    var $label = $('span', $link);
                    var open = $label.width();
                    $label.hide();
                    $link.on({
                        mouseenter: function() {
                            $label
                                .stop()
                                .width(0)
                                .show()
                                .animate({width: open}, 250);
                        },
                        mouseleave: function() {
                            $label
                                .stop()
                                .animate({width: 0}, 250, function() {
                                    $(this).hide();
                                });
                        }
                    });
                }
            };
        })();

        /** @namespace Navigation bar */
        var navigation = (function() {

            // Animation speed
            var speed = 250;

            // Cached elements
            var $navigation = $('.navigation');
            var $left = $('.left', $navigation);
            var $right = $('.right', $navigation);
            var $more = $('<a class="more" />').prependTo($right);

            /** @scope navigation */
            return {

                /**
                 * Toggle navigation between full-width and shrinked
                 *
                 * @param {Boolean} shrinked
                 */
                toggle: function(shrinked) {
                    $navigation.toggleClass('shrinked', shrinked);
                    $right.removeClass('open');
                },

                /** Refresh navigation */
                refresh: function() {
                    navigation.toggle(false);
                    navigation.toggle($navigation.width() < $left.outerWidth() + $right.outerWidth());
                },

                /** Initialization */
                init: function() {
                    navigation.refresh();
                    $more.on('click', function() {
                        $right.toggleClass('open', speed);
                    });
                    $right.on('mouseleave', function() {
                        $right.removeClass('open', speed);
                    });
                    $(document).on('click', function(event) {
                        if (!$(event.target).is($more))
                            $right.removeClass('open', speed);
                    });
                    $(window).on('resize', navigation.refresh);
                }
            }
        })();

        /** @namespace Stripes */
        var stripes = (function() {

            // Thumbnails container
            var $container = $('#content ul');

            // Thumbnails
            var $stripes = $('li', $container);

            /** @scope stripes */
            return {

                /**
                 * Filter thumbnails by category
                 *
                 * @param {String} category
                 */
                filter: function(category) {
                    utils.filter($stripes, category);
                    stripes.refresh();
                    $stripes
                        .filter(':visible')
                        .each(function() {
                            var $stripe = $(this);
                            var left = $stripe.position().left;
                            $stripe
                                .css('left', -left)
                                .animate({left: 0}, 350);
                        });
                },

                /** Correct container width */
                refresh: function() {
                    var width = 0;
                    $stripes.each(function() {
                        var $stripe = $(this);
                        width += $stripe.is(':visible') ? $stripe.outerWidth() : 0;
                    });
                    $container.width(width);
                    panel.refresh();
                },

                /** Initialization */
                init: function() {
                    var $content = $('#content');

                    // Hide scrollbar
                    var scrollbar = utils.scrollbarSize();
                    $('body').css('padding-bottom', $('#panel').outerHeight() - scrollbar);
                    $content.css('padding-bottom', scrollbar);

                    // Hover effect
                    $stripes.loaded(function() {
                        stripes.refresh();
                        $stripes
                            .hoverdir({speed: 150})
                            .find('.hover')
                            .each(function() {
                                $(this).wrapInner('<span class="wrapper"><span class="content"></span></span>');
                            });
                    });

                    // Horizontal mousewheel scrolling
                    $content.mousewheel(function(event, delta) {
                        this.scrollLeft -= (delta * 40);
                        event.preventDefault();
                    });
                }
            }
        })();

        /** @namespace Contact */
        var contact = (function() {
            var $map = $('#contact .map');
            var map = null;
            var center = null;

            /** @scope contact */
            return {

                /**
                 * Map initialization
                 *
                 * @param {Function} [callback]
                 */
                map: function(callback) {
                    if (!$map.length) {
                        (callback || $.noop)();
                        return;
                    }

                    // Load API
                    $.getScript('https://www.google.com/jsapi', function() {
                        google.load('maps', '3', {other_params: 'sensor=false', callback: function() {

                            // Get map position
                            var latitude = parseFloat(String($map.data('latitude')).replace(',', '.'));
                            var longtitude = parseFloat(String($map.data('longtitude')).replace(',', '.'));
                            center = new google.maps.LatLng(latitude, longtitude);

                            // Set map height on window resize
                            utils.resize(function() {
                                $map.height($map.width() * 0.35);
                            });

                            // Render map
                            map = new google.maps.Map($map[0], {
                                zoom: 14,
                                scrollwheel: false,
                                center: center,
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                mapTypeControl: false,
                                panControlOptions: {
                                    position: google.maps.ControlPosition.LEFT_CENTER
                                },
                                zoomControlOptions: {
                                    position: google.maps.ControlPosition.LEFT_CENTER
                                },
                                scaleControlOptions: {
                                    position: google.maps.ControlPosition.LEFT_CENTER
                                }
                            });

                            // Center map on window resize
                            google.maps.event.addDomListener(window, 'resize', function() {
                                setTimeout(function() {
                                    map.setCenter(center);
                                }, 100);
                            });

                            // Custom marker
                            new google.maps.Marker({
                                draggable: false,
                                map: map,
                                shape: {
                                    coords: [27, 0, 31, 1, 34, 2, 36, 3, 37, 4, 39, 5, 40, 6, 41, 7, 42, 8, 43, 9, 43, 10, 44, 11, 45, 12, 45, 13, 46, 14, 46, 15, 46, 16, 47, 17, 47, 18, 47, 19, 47, 20, 47, 21, 47, 22, 47, 23, 47, 24, 47, 25, 47, 26, 47, 27, 47, 28, 47, 29, 47, 30, 47, 31, 46, 32, 46, 33, 46, 34, 45, 35, 45, 36, 44, 37, 44, 38, 44, 39, 43, 40, 43, 41, 42, 42, 41, 43, 41, 44, 40, 45, 40, 46, 39, 47, 38, 48, 37, 49, 37, 50, 36, 51, 35, 52, 34, 53, 33, 54, 32, 55, 31, 56, 30, 57, 29, 58, 28, 59, 27, 60, 26, 61, 25, 62, 23, 62, 23, 61, 22, 60, 21, 59, 20, 58, 19, 57, 18, 56, 17, 55, 16, 54, 15, 53, 14, 52, 14, 51, 13, 50, 11, 49, 11, 48, 10, 47, 9, 46, 8, 45, 8, 44, 7, 43, 6, 42, 6, 41, 5, 40, 4, 39, 4, 38, 3, 37, 3, 36, 2, 35, 2, 34, 2, 33, 1, 32, 1, 31, 1, 30, 1, 29, 0, 28, 0, 27, 0, 26, 0, 25, 0, 24, 0, 23, 0, 22, 0, 21, 1, 20, 1, 19, 1, 18, 1, 17, 1, 16, 2, 15, 2, 14, 3, 13, 3, 12, 4, 11, 4, 10, 5, 9, 6, 8, 7, 7, 8, 6, 9, 5, 10, 4, 12, 3, 14, 2, 16, 1, 21, 0, 27, 0],
                                    type: 'poly'
                                },
                                icon:  new google.maps.MarkerImage(
                                    'img/marker_icon.png',
                                    new google.maps.Size(48, 63),
                                    new google.maps.Point(0, 0),
                                    new google.maps.Point(24, 63)
                                ),
                                shadow: new google.maps.MarkerImage(
                                    'img/marker_shadow.png',
                                    new google.maps.Size(84, 63),
                                    new google.maps.Point(0, 0),
                                    new google.maps.Point(24, 63)
                                ),
                                position: new google.maps.LatLng(latitude, longtitude)
                            });

                            // Execute callback when map is ready
                            google.maps.event.addListenerOnce(map, 'idle', callback || $.noop);
                        }});
                    });
                },

                /** Refresh map */
                refresh: function() {
                    if ($map.length) {
                        setTimeout(function() {
                            ui.scrollbar.refresh('#content');
                        }, 50);
                        setTimeout(function() {
                            $map.height($map.width() * 0.35);
                            if (map) {
                                map.setCenter(center);
                                google.maps.event.trigger(map, 'resize');
                            }
                        }, 100);
                    }
                }
            };
        })();

        /**
         * @namespace Blog
         * @name      blog
         */
        var blog = {};

        /** Filter posts */
        blog.filter = function(category) {
            var $items = $('#content li');
            $items
                .not(':visible')
                .css({
                    left: 0,
                    top: 0
                });
            utils.filter('#content li', category);
            $('#content ul').masonry('reload');
        },

        /** Organize posts */
        blog.posts = function() {
            var $container = $('#content ul');
            var $items = $('li', $container);
            var container = $container.width();
            var columns = Math.ceil(container / 375);
            var item = Math.floor((container - (columns - 1) * 30) / columns);
            item = columns == 2 && item < 250 ? container : item;
            $items.width(item);
            $container.masonry({
                itemSelector : 'li:visible',
                columnWidth: item,
                gutterWidth: 30
            });
        };

        /** @namespace Slider */
        var slider = (function() {
            var $container = $('#content > ul');
            var $items = $('li', $container);
            var count = $items.length;
            var last = count - 1;
            var current = 0;

            // Render pagination
            function pagination() {
                var $pagination = $([
                    '<div class="pagination">',
                        '<a class="previous">&nbsp;</a>',
                        '<a class="next">&nbsp;</a>',
                    '</div>'
                ].join(''));
                $items
                    .each(function(id) {
                        $('<a />')
                            .attr('data-slide', id)
                            .text(id + 1)
                            .toggleClass('active', !id)
                            .appendTo($pagination);
                    })
                    .find('.content')
                    .append($pagination);
                $container
                    .on('click', '.previous', slider.previous)
                    .on('click', '.next', slider.next)
                    .on('click', '[data-slide]', function() {
                        slider.set($(this).data('slide'));
                    });
            }

            /** Set image stored in data-image attribute as slide background */
            function images() {
                $items.each(function() {
                    var $item = $(this);
                    var image = $item.data('image');
                    if (image) {
                        ui.preloader.add(image);
                        $('<div class="background" />')
                            .css('background-image', 'url(' + image + ')')
                            .prependTo($item);
                    }
                })
            }

            /** Set video stored in data-youtube attribute as slide background */
            function youtubeVideos() {
                $('[data-youtube]', $container).each(function() {
                    var $item = $(this);
                    var url = $item.data('youtube');
                    $('<div />')
                        .attr('data-youtube', url)
                        .prependTo($item);
                    $item.removeAttr('data-youtube');
                });
                youtube.init();
            }

            /** Set video stored in data-vimeo attribute as slide background */
            function vimeoVideos() {
                $('[data-vimeo]', $container).each(function() {
                    var $item = $(this);
                    var url = $item.data('vimeo');
                    $('<div class="background" />')
                        .attr('data-vimeo', url)
                        .prependTo($item);
                    $item.removeAttr('data-vimeo');
                });
                vimeo.init();
            }

            /** @scope slider */
            return {

                /** Slider initialization */
                init: function() {
                    if (!count)
                        return;

                    // Content
                    $container.addClass('items');
                    $items
                        .wrapInner('<div class="content" />')
                        .first()
                        .addClass('active');

                    // Images
                    images();

                    // Videos
                    youtubeVideos();
                    vimeoVideos();

                    // Pagination
                    if (count > 1)
                        pagination();
                },

                /** Update slider */
                refresh: function() {
                    $items
                        .removeClass('active')
                        .eq(current)
                        .addClass('active')
                        .end()
                        .find('.pagination a')
                        .removeClass('active')
                        .filter('[data-slide="' + current + '"]')
                        .addClass('active');
                    $.each(youtube.get(), function() {
                        this.pauseVideo();
                    });
                    $.each(vimeo.get(), function() {
                        this.api('pause');
                    });
                },

                /**
                 * Go to slide
                 *
                 * @param {Number} slide Slide index
                 */
                set: function(slide) {
                    slide = Math.max(0, Math.min(last, slide));
                    if (slide != current) {
                        current = slide;
                        slider.refresh();
                    }
                },

                /** Get current slide */
                get: function() {
                    return current;
                },

                /** Go to previous slide */
                previous: function() {
                    slider.set(current ? current - 1 : last);
                },

                /** Go to next slide */
                next: function() {
                    slider.set(current < last ? current + 1 : 0);
                }
            };
        })();

        /** @namespace Initialization */
        var init = {

            /** Common */
            common: function() {
                common.browser();
                ui.init();
                navigation.init();
                common.embed();
                common.dropcap();
                forms.init();
                common.scroll();
            },

            /** Thumbnails */
            thumbnails: function() {
                bar.init({
                    step: thumbnails.organize,
                    filter: {
                        category: function(value) {
                            thumbnails.filter(value);
                            if (utils.layout.width() <= 480) {
                                ui.scrollbar.scrollTop('#bar');
                                bar.hide();
                            }
                        }
                    }
                });
                panel.init();
                thumbnails.init();
                ui.preloader.hide();
            },

            /** Carousels */
            carousels: function() {
                bar.init({
                    overlay: 768,
                    step: ui.carousel.refresh,
                    filter: {
                        category: function(value) {
                            ui.carousel.filter(value);
                            if (utils.layout.width() <= 480) {
                                ui.scrollbar.scrollTop('#bar');
                                bar.hide();
                            }
                        }
                    }
                });
                ui.preloader.hide();
            },

            /** Stripes */
            stripes: function() {
                bar.init({
                    filter: {
                        category: stripes.filter
                    }
                });
                panel.init();
                stripes.init();
                ui.preloader.hide();
            },

            /** Work detail */
            detail: function() {
                bar.init({overlay: 1280});
                info.init();
                utils.layout.change(function(width) {
                    bar.toggle(width > 1440, false);
                    info.toggle(width > 1280, false);
                });
                utils.removeScrollbars('#content');
                panel.init();
                ui.preloader.hide();
            },

            /** Slider */
            slider: function() {
                var $bar = $('#bar');
                var $content = $('#content');
                bar.init({
                    overlay: 768,
                    step: function() {
                        $content.css('left', $bar.outerWidth() + $bar.offset().left);
                    }
                });
                slider.init();
                ui.preloader.hide();
            },

            /** Blog home */
            blog: function() {
                bar.init({
                    overlay: 768,
                    step: function() {
                        setTimeout(blog.posts, 200);
                    },
                    filter: {
                        category: blog.filter
                    }
                });
                blog.posts();
                $(window).on('resize', function() {
                    setTimeout(blog.posts, 200);
                });
                ui.preloader.hide();
            },

            /** Blog post */
            post: function() {
                function refresh() {
                    ui.scrollbar.reset('#content');
                }
                bar.init({
                    overlay: 768,
                    step: function() {
                        setTimeout(refresh, 50);
                    }
                });
                $(window).on('resize', refresh);
                ui.preloader.hide();
            },

            /** About */
            about: function() {
                var $content = $('#content');
                var about_a = !!$('.left', $content).length;
                bar.init({
                    overlay: about_a ? 768 : 1024
                });
                var edge = about_a ? 1440 : 1024;
                utils.layout.change(function(width) {
                    bar.toggle(width > edge, false);
                    if (about_a)
                        $content.toggleClass('full', width <= 1024);
                });
                ui.preloader.hide();
            },

            /** Contact */
            contact: function() {
                bar.init({
                    overlay: 768,
                    step: contact.refresh
                });
                utils.layout.change(function(width) {
                    bar.toggle(width > 1024, false);
                });
                $(window).on('resize', contact.refresh);
                contact.map(ui.preloader.hide);
            },

            /** Default initialization(no body id attribute) */
            'default': function() {
                bar.init({overlay: 1024});
                ui.preloader.hide();
            }
        };

        // Initialization
        init.common();
        var page = $('body').attr('id');
        if (init[page])
            init[page]();
        else
            init['default']();
    });
})(jQuery);