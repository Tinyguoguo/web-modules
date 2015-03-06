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
            var _plugin = $this.data('insmBigStatusBox');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        infoArea: false,
                        infoContent: false,
                        status: '',
                        text: ''
                        
                    }, options),
                    htmlElements: {
                        stateDiv: $('<div />')
                    }
                };
                $this.data('insmBigStatusBox', _plugin);
            }            
            $this.addClass('insm-bigstatusbox').append(
                _plugin.htmlElements.stateDiv.addClass(_plugin.settings.status ? _plugin.settings.status.toLowerCase() : '').append(
                    $('<h4 />').text(_plugin.settings.status),
                    $('<h6 />').text(_plugin.settings.text)
                )
            )
            if (_plugin.settings.infoArea) {
                $this.click(function () {
                    _plugin.settings.infoArea.empty();
                    _plugin.settings.infoArea.append(_plugin.settings.infoContent);
                    $this.parent().parent().parent().find('.is-selected').removeClass('is-selected');
                    _plugin.htmlElements.stateDiv.addClass('is-selected');

                }).addClass('is-clickable');

            }
            return $this;
        }
    };

    $.fn.insmBigStatusBox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmStatusBox');
        }
    };
})(jQuery);