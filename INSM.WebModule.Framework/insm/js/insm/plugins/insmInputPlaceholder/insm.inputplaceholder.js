/*
* INSM Input Placeholder
* This file contain the INSM Input Placeholder function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmInputPlaceholder(settings);
*
* File dependencies:
* jQuery 1.9.1
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlaceholder');

            if (!$this.is(':input')) {
                throw new Error('Input placeholder can only be used on input fields.');
            }
            
            // Create input placeholder plugin.

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        placeholder: $('<div />').addClass('input-placeholder'),
                        wrapper: $('<div />').addClass('input-placeholder-wrapper')
                    },
                    settings: $.extend({
                        text: 'Search...',
                        hasIcon: false
                    }, options)
                };
                $this.data('insmInputPlaceholder', _plugin);

                $this.before(
                    _plugin.htmlElements.wrapper
                );

                _plugin.htmlElements.wrapper.append(
                    _plugin.htmlElements.placeholder.text(_plugin.settings.text),
                    $this
                );

                if (_plugin.settings.hasIcon) {
                    _plugin.htmlElements.placeholder.addClass('has-icon');
                }

                $this.insmInputPlaceholder('hide');

                if (!$this.is(':focus') && $this.val() == '') {
                    $this.insmInputPlaceholder('show');
                }

                $this.click(function () {
                    $this.focus();
                }).focus(function () {
                    $this.insmInputPlaceholder('hide');
                });
                _plugin.htmlElements.placeholder.click(function () {
                    $this.trigger('click');
                });

                $this.blur(function () {
                    if ($(this).val() == '') {
                        $this.insmInputPlaceholder('show');
                    }
                });

                $this.on("remove", function () {
                    $this.insmInputPlaceholder('destroy');
                });
            }


            return $this;
        },
        show: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlaceholder');

            if(_plugin) {
                _plugin.htmlElements.placeholder.fadeIn();
            }

            return $this;
        },
        hide: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlaceholder');

            _plugin.htmlElements.placeholder.hide();

            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlaceholder');

            if (_plugin) {
                _plugin.htmlElements.wrapper.before($this);
                
                _plugin.htmlElements.placeholder.remove();
                _plugin.htmlElements.wrapper.remove();
                $this.data('insmInputPlaceholder', '');
            }
            return $this;
        }
    };

    $.fn.insmInputPlaceholder = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputPlaceholder');
        }
    };
})(jQuery);