/*
* INSM Screen Layout
* This file contain the INSM Screen Layout plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmScreenLayout(settings);
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmScreenLayout');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        name: '',
                        resolution: {
                            width: 0,
                            height: 0
                        }
                    }, options),
                    htmlElements: {

                    }
                };
                $this.data('insmScreenLayout', _plugin);
            }
            
            $this.addClass('insm-screen-layout');
           
            setTimeout(function () {
                var maxWidth = $this.width();
                var maxHeight = $this.height();

                var scaleX = _plugin.settings.resolution.width / maxWidth;
                var scaleY = _plugin.settings.resolution.height / maxHeight;

                var modelWidth = 0;
                var modelHeight = 0;

                if (scaleX > scaleY) {
                    modelWidth = _plugin.settings.resolution.width / scaleX;
                    modelHeight = _plugin.settings.resolution.height / scaleX;
                }
                else {
                    modelWidth = _plugin.settings.resolution.width / scaleY;
                    modelHeight = _plugin.settings.resolution.height / scaleY;
                }

                $this.append(
                    $('<div />').css({
                        width: modelWidth + 'px',
                        height: modelHeight + 'px'
                    }),
                    $('<h3 />').text(_plugin.settings.name)
                );
            }, 0);
            
            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmScreenLayout');

            $this.empty();
            $this.data('insmScreenLayout', null);

            return $this;
        }
    };

    $.fn.insmScreenLayout = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmScreenLayout');
            return null;
        }
    };
})(jQuery);
