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
            var _plugin = $this.data('insmUserStyle');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {              
               
                    _plugin = {
                        settings: $.extend({
                            text: null,
                            onClick: function () {

                            }
                        }, options),
                        htmlElements: {
                            
                        }
                    };
                    $this.addClass('insm-user-style');
                    $this.append($('<span />').text(_plugin.settings.text)).click(function () {
                       
                        //$this.parent().find('.insm-group-style-is-selected').removeClass('insm-group-style-is-selected');
                        //$this.addClass('insm-group-style-is-selected');
                        _plugin.settings.onClick();
                    });
                    $this.data('insmUserStyle', _plugin);
            }           
            return $this;
        },
        isSelected: function (){
            var $this = $(this);
            var _plugin = $this.data('insmUserStyle');
            $this.addClass('insm-user-style-is-selected');
        },
        toggleSelected: function(){
            var $this = $(this);
            var _plugin = $this.data('insmUserStyle');
            $this.toggleClass('insm-user-style-is-selected');
        }
    };

    $.fn.insmUserStyle = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmUserStyle');
        }
    };
})(jQuery);