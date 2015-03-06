/*
* INSM Button Feedback
* This file contain the INSM Button Feedback plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmButtonFeedback(settings);
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
            $('button').on('click', function () {
                var overlay = $('<div />').addClass('insm-feedback-overlay');
                var button = $(this);

                overlay.css({
                    width: button.outerWidth() + 'px',
                    height: button.outerHeight + 'px',
                    top: button.offset().top + 'px',
                    left: button.offset().left + 'px'
                });

                $('html').eq(0).append(overlay);

                overlay.switchClass('', 'remove', 100, 'swing');
                setTimeout(function () {
                    overlay.remove();
                }, 200);
            });
        }
    };

    $.insmButtonFeedback = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmButtonFeedback');
        }
    };
})(jQuery);
