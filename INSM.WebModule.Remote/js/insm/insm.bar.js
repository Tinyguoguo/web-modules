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
            var _plugin = $this.data('insmBar');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        unit: '',
                        average: 0,
                        max: 0,
                        min: 0,
                        prefix: true
                    }, options),
                    htmlElements: {
                        min: $('<div />').addClass('insm-bar min'),
                        max: $('<div />').addClass('insm-bar max'),
                        barHolder: $('<div />').addClass('insm-bar barHolder'),
                        barContent: $('<div />').addClass('insm-bar barContent')
                    }
                };
                $this.data('insmBar', _plugin);
            }
            var widthPercent;
            var range = parseFloat(_plugin.settings.max - _plugin.settings.min);
            if (range > 0 && _plugin.settings.average > _plugin.settings.min) {
                widthPercent = parseFloat(_plugin.settings.average - _plugin.settings.min) / range;
            }
            else {
                widthPercent = 0;
            }

            if (_plugin.settings.min == _plugin.settings.max) {
                if (_plugin.settings.average > 0) {
                    widthPercent = 1;
                }
            }


            if (_plugin.settings.prefix) {
                _plugin.htmlElements.min.append(
                    $.insmUtilities('addPrefix', {
                        number: _plugin.settings.min
                    }),
                    _plugin.settings.unit
                );
            }
            else {
                _plugin.htmlElements.min.append(
                    _plugin.settings.min + ' ' + _plugin.settings.unit
                );
            }
            if (_plugin.settings.prefix) {
                _plugin.htmlElements.max.append(
                    $.insmUtilities('addPrefix', {
                        number: _plugin.settings.max
                    }),
                    _plugin.settings.unit
                );
            }
            else {
                _plugin.htmlElements.max.append(
                    _plugin.settings.max + ' ' + _plugin.settings.unit
                );
            }

            if (_plugin.settings.prefix) {
                _plugin.htmlElements.barHolder.append(
                    $($('<div />').insmProgressBar({
                        text: $.insmUtilities('addPrefix', {
                            number: _plugin.settings.average
                        }) + _plugin.settings.unit,
                        progress: widthPercent
                    }))
                );
            }
            else {
                _plugin.htmlElements.barHolder.append(
                    $($('<div />').insmProgressBar({
                        text: _plugin.settings.average + ' ' +_plugin.settings.unit,
                        progress: widthPercent
                    }))
                );
            }
            //_plugin.htmlElements.barHolder.append(_plugin.settings.average + " " + _plugin.settings.unit);
            //_plugin.htmlElements.barHolder.append(_plugin.htmlElements.barContent);
            //_plugin.htmlElements.barContent.css('width', widthPercent + "%");

            
            if (options.getHtmlElemets) {
                return _plugin.htmlElements;
            } else {
                $this.addClass('insm-bar').append(_plugin.htmlElements.min, _plugin.htmlElements.barHolder, _plugin.htmlElements.max);
                return $this;
            }
        }
    };

    $.fn.insmBar = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmBar');
        }
    };
})(jQuery);