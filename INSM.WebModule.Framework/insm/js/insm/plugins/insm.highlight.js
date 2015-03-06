/*
* INSM Highlight
* This file contain the INSM Highlight plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmHighlight(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);

            options = $.extend({
                type: 'notification'
            }, options);

            //$this.addClass('is-highlighted');
            //setTimeout(function () {
            //    $this.removeClass('is-highlighted');
            //}, 1000);
            var cssClass = 'is-highlighted';

            if (options.type === 'error') {
                cssClass = 'is-highlighted-error';
            }
            return $this.switchClass("", cssClass, function () {
                $this.switchClass(cssClass, "", 2000);
            });
        }
    };

    $.fn.insmHighlight = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmHighlight');
            return null;
        }
    };
})(jQuery);
