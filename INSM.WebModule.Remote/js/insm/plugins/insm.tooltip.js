/*
* INSM Tooltip
* This file contain the INSM Tool tip function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmTooltip(options);
*
* Author:
* Mikael Berglund
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        tooltip: 'Tooltip not available',
                        text: null,
                        content: null,
                        fixedPosition: '',
                        position: {
                            top: null,
                            left: null
                        },
                        width: null
                    }, options),
                    htmlElements: {
                        tooltip: $('<div />').addClass('insm-tooltip'),
                        content: $('<div />'),
                        container: null
                    },
                    data: {
                        hoverCheckInterval: null,
                        isTouchDevice: false
                    }
                };
                $this.data('insmTooltip', _plugin);
            }

            if ('ontouchstart' in window || 'onmsgesturechange' in window || navigator.msMaxTouchPoints) {
                _plugin.data.isTouchDevice = true;
            }


            if (_plugin.settings.width) {
                _plugin.data.width = _plugin.settings.width;
            }

            if (_plugin.settings.textAlign) {
                _plugin.data.textAlign = _plugin.settings.textAlign;
            }

            if (_plugin.settings.text) {
                _plugin.settings.text = $.trim(_plugin.settings.text);
                _plugin.htmlElements.tooltip.append(
                    _plugin.htmlElements.content.html(_plugin.settings.text)
                ).hide();
            }
            else if (typeof _plugin.settings.content != 'undefined') {
                _plugin.htmlElements.tooltip.append(
                    _plugin.htmlElements.content.html(_plugin.settings.content)
                ).hide();
            }
            else {
                throw new Error('Tooltip needs parameter "text" or "content" to work.');
            }

            if (_plugin.data.width) {
                _plugin.htmlElements.content.css({
                    width: _plugin.data.width
                });
            }

            if (_plugin.data.textAlign) {
                _plugin.htmlElements.content.css({
                    'text-align': _plugin.data.textAlign
                });
            }
            var deleteTooltipTimer;
            $(this).mouseenter(function (evt) {
                evt.stopPropagation();
                $this.insmTooltip('onMouseEnter');
            }).mouseleave(function (evt) {
                evt.stopPropagation();
                $this.insmTooltip('onMouseLeave');
            });

            if (_plugin.data.isTouchDevice) {
                $(this).click(function (evt) {
                    evt.stopPropagation();
                    $this.insmTooltip('onMouseEnter');
                });
                _plugin.htmlElements.tooltip.click(function () {
                    $this.insmTooltip('onMouseLeave');
                });
            }


            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            var positioningOrder = ['above', 'toLeft' ,'below', 'toRight'];
            var targetSides = {};

            $('html').eq(0).prepend(
                _plugin.htmlElements.tooltip.show().css({
                    display: 'table'
                })
            );

            var targetPosition = $this.offset();
            var tooltipSize = {
                width: _plugin.htmlElements.tooltip.outerWidth(true),
                height: _plugin.htmlElements.tooltip.outerHeight(true)
            };
            var targetSize = {
                width: $this.outerWidth(),
                height: $this.outerHeight()
            };

            targetPosition.left -= tooltipSize.width / 2;
            targetPosition.top -= tooltipSize.height / 2;

            targetSides.above = $.extend({}, targetPosition);
            targetSides.above.left += targetSize.width / 2;
            targetSides.above.top -= tooltipSize.height / 2;

            targetSides.toLeft = $.extend({}, targetPosition);
            targetSides.toLeft.left -= tooltipSize.width / 2;
            targetSides.toLeft.top += targetSize.height / 2;
            

            targetSides.below = $.extend({}, targetPosition);
            targetSides.below.left += targetSize.width / 2;
            targetSides.below.top += targetSize.height + tooltipSize.height / 2;
            

            targetSides.toRight = $.extend({}, targetPosition);
            targetSides.toRight.left += targetSize.width + tooltipSize.width / 2;
            targetSides.toRight.top += targetSize.height / 2;

            $.each(positioningOrder, function (index, position) {
                _plugin.htmlElements.tooltip.offset({
                    left: targetSides[position].left,
                    top: targetSides[position].top
                });
                if ($this.insmTooltip('isTooltipInViewport', _plugin.htmlElements.container)) {
                    _plugin.htmlElements.tooltip.hide().stop(true).fadeIn(200);
                    return false;
                }
            });

            return $this;
        },
        onMouseEnter: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            $this.insmTooltip('view');
            var handle = _plugin.htmlElements.tooltip;
            _plugin.data.hoverCheckInterval = setInterval(function () {
                if (!$this.is(':visible')) {
                    handle.hide();
                    handle.detach();
                    clearInterval(_plugin.data.hoverCheckInterval);
                }
            }, 2000);

            return $this;
        },
        onMouseLeave: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            $this.insmTooltip('hide');
            clearInterval(_plugin.data.hoverCheckInterval);

            return $this;
        },
        getSize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            return {
                width: _plugin.htmlElements.tooltip.outerWidth(true),
                height: _plugin.htmlElements.tooltip.outerHeight(true)
            }
        },
        isTooltipInViewport: function (target) {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');


            var rect = _plugin.htmlElements.tooltip[0].getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
                );
        },
        hide: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            if (_plugin) {
                _plugin.htmlElements.tooltip.hide();
                _plugin.htmlElements.tooltip.detach();
            }

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTooltip');

            _plugin.htmlElements.tooltip.remove();
            $this.data('insmTooltip', null);
        }
    };

    $.fn.insmTooltip = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTooltip');
        }
    };
})(jQuery);