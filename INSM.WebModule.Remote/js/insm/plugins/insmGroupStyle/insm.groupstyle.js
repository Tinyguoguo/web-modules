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
            var _plugin = $this.data('insmGroupStyle');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {              
               
                    _plugin = {
                        settings: $.extend({
                            isToggled:true,
                            text: null,
                            onClick: function () {
                            }
                        }, options),
                        htmlElements: {
                            
                        }
                    };
                    $this.addClass('insm-group-style');
                    $this.append($('<span />').text(_plugin.settings.text)).click(function () {
                        if (_plugin.settings.isToggled) {
                            $this.toggleClass('insm-group-style-is-selected');
                        }
               
                        _plugin.settings.onClick();
                    });
                    $this.data('insmGroupStyle', _plugin);
            }           
            return $this;
        },
        isSelected: function (){
            var $this = $(this);
            var _plugin = $this.data('insmGroupStyle');
            $this.addClass('insm-group-style-is-selected');
        },
        toggleSelected: function(){
            var $this = $(this);
            var _plugin = $this.data('insmGroupStyle');
            $this.toggleClass('insm-group-style-is-selected');
        }
    };

    $.fn.insmGroupStyle = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmGroupStyle');
        }
    };
})(jQuery);