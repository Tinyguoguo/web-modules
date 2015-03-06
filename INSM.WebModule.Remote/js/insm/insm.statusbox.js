/*
* INSM Status Box
* This file contain the INSM Status Box function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPlayerDetails(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmStatusBox');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        status: '',
                        title: '',
                        tooltip: 'Tooltip not available'
                    }, options)
                };
                $this.data('insmStatusBox', _plugin);
            }
            
            $this.addClass('insm-statusbox').append(
                $('<div />').addClass(_plugin.settings.status ? _plugin.settings.status.toLowerCase() : '').insmTooltip({
                    content: _plugin.settings.tooltip,
                    backdropClickClose: true
                })
            ).append(function () {
                if (_plugin.settings.popup) {
                    return $('<a />').text(_plugin.settings.title).click(function() {
                        $.insmPopup({
                            content: _plugin.settings.popup,
                            backdropClickClose: true
                        });
                    });
                }
                else {
                    return _plugin.settings.title;
                }
            });

            return $this;
        }
    };

    $.fn.insmStatusBox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmStatusBox');
        }
    };
})(jQuery);