/*
* Center
* This file contain the Center plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').center(settings);
*
* File dependencies:
* jQuery 1.6.1
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    $.fn.center = function () {
        this.css("position", "fixed");
        this.css("top", Math.max(0, (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft()) + "px");
        return this;
    };
})(jQuery);
