/*
* INSM Loader
* This file contain the INSM Loader plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmLoader(settings);
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
            var $this = $(this);
            var _plugin = $this.data('insmLoader');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        deferred: null,
                        text: null,
                        textOnly: false,
                        background: 'transparent'
                    }, options),
                    htmlElements: {
                        counter: $('<span />'),
                        loader: $('<div />').addClass('insmLoader')
                    }
                };
                $this.data('insmLoader', _plugin);
            }

            if (_plugin.settings.text) {
                _plugin.htmlElements.loader.text(_plugin.settings.text).append(_plugin.htmlElements.counter).addClass('has-text');
            }
            if (!_plugin.settings.textOnly) {
                _plugin.htmlElements.loader.addClass('spinner');
            }
            else {
                _plugin.htmlElements.loader.addClass('text-only');
            }
            _plugin.htmlElements.loader.css('background-color', _plugin.settings.background);
            $this.append(
                _plugin.htmlElements.loader
            );

            if (_plugin.settings.deferred) {
                if ($.isArray(_plugin.settings.deferred)) {
                    var length = _plugin.settings.deferred.length;
                    var done = 0;
                    _plugin.htmlElements.counter.text(' ('+done+'/'+length+')');
                    $.each(_plugin.settings.deferred, function(index, deferred) {
                        $.when(deferred).done(function() {
                            done++;
                            _plugin.htmlElements.counter.text(' (' + done + '/' + length + ')');
                        });
                    });
                    $.when.apply($, _plugin.settings.deferred).done(function() {
                        $this.insmLoader('destroy');
                    });
                }
                else {
                    $.when(_plugin.settings.deferred).done(function() {
                        $this.insmLoader('destroy');
                    });
                }
            }

            return $this;
        },
        update: function (options) {

            var $this = $(this);
            var _plugin = $this.data('insmLoader');

            if (options.text) {
                _plugin.htmlElements.loader.text(options.text).addClass('has-text');
            } else {
                _plugin.htmlElements.loader.text('').removeClass('has-text');
            }
            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmLoader');

            options = $.extend({
                message: '',
                timeout: 2000
            }, options);

            if (options.message) {
                _plugin.htmlElements.loader.text(options.message).removeClass('spinner');
                setTimeout(function () {
                    $this.fadeOut(function () {
                        $this.empty();
                        $this.data('insmLoader', null);
                    });
                }, options.timeout)
            }
            else {
                $this.empty();
                $this.data('insmLoader', null);
            }

            return $this;
        }
    };

    $.fn.insmLoader = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmLoader');
            return null;
        }
    };
})(jQuery);
