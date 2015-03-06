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
                        tooltip: 'Tooltip not available'
                    }, options),
                    htmlElements: {
                        tooltip: $('<div />').addClass('insm-tooltip')
                    }
                };
                $this.data('insmTooltip', _plugin);
            }

            $this.hover(
                    function () {
                        _plugin.htmlElements.tooltip.fadeIn(200);
                    }, function () {
                        _plugin.htmlElements.tooltip.stop(true).hide();
                    }
                ).mousemove(function (e) {
                    _plugin.htmlElements.tooltip.css({
                        'left': '20px'
                    });
                }).append(
                    _plugin.htmlElements.tooltip.append(
                        $('<div />').append(_plugin.settings.tooltip)
                    ).css({
                        position: 'relative'
                    }).hide()
                )

            return $this;
        }
    };

    $.fn.insmTooltip = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmToolTip');
        }
    };
})(jQuery);