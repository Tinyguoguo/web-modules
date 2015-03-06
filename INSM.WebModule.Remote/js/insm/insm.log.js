/*
* INSM Popup
* This file contain the INSM Popup plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPopup(settings);
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
            if ($.browser.mozilla) {
                //log a stacktrace
                if (true) {
                    try {
                        throw new ChuckNorrisError("Whoho");
                    } catch (e) {

                    }
                }
            } else {
                alert(options);
            }
        }
    };

    $.insmLog = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPopup');
            return null;
        }
    };
})(jQuery);
