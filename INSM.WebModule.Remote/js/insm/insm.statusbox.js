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
                        tooltip: 'Tooltip not available',
                        statusBoxClickable:false
                    }, options),
                    htmlElements: {
                        box:$('<div>')
                    }
                };
                $this.data('insmStatusBox', _plugin);
            }
            if (_plugin.settings.tooltip == false) {
                $this.addClass('insm-statusbox').append(
                    _plugin.htmlElements.box.addClass(_plugin.settings.status ? _plugin.settings.status.toLowerCase() : '')
                );
            } else {
                $this.addClass('insm-statusbox').append(
                    _plugin.htmlElements.box.addClass(_plugin.settings.status ? _plugin.settings.status.toLowerCase() : '').insmTooltip({
                        content: _plugin.settings.tooltip,
                        backdropClickClose: true,
                        width: 400
                    })
                );
            }
            $this.addClass('insm-statusbox').append(function () {
                if (_plugin.settings.popup) {
                    if (_plugin.settings.statusBoxClickable) {
                        _plugin.htmlElements.box.addClass("is-clickable").click(function () {
                            $.insmPopup({
                                content: _plugin.settings.popup,
                                backdropClickClose: true
                            });
                        });
                        return _plugin.settings.title;
                    } else {
                        return $('<a />').text(_plugin.settings.title).click(function () {
                            $.insmPopup({
                                content: _plugin.settings.popup,
                                backdropClickClose: true
                            });
                        });
                    }
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