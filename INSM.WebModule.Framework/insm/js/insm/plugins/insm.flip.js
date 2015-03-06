/*
* INSM Flip
* This file contain the INSM Flip function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFlip(options);
*
* Author:
* Guo Yang
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmFlip');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {              
               
                    _plugin = {
                        settings: $.extend({
                           
                            frontDiv: $('<div />').text('front'),
                            backDiv: $('<div />').text('back')
                        }, options),
                        htmlElements: {
                            frontFlip: $('<div />').addClass('insm-flip-front'),
                            backFlip: $('<div />').addClass('insm-flip-back'),
                            
                        }
                    };
                    $this.addClass('insm-flip-container');
                    $this.append(
                         _plugin.htmlElements.frontFlip.append(options.frontDiv),
                         _plugin.htmlElements.backFlip.append(options.backDiv)
                    )

                    $this.click(function (e) {
                       e.preventDefault();
                       $this.insmFlip('flip');
                   });
                    
                   $this.data('insmFlip', _plugin);
            }
            
            return $this;
        },
        flip: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFlip');
            $this.toggleClass('flipped');
        }
    };

    $.fn.insmFlip = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFlip');
        }
    };
})(jQuery);