/*
* INSM Popup
* This file contain the INSM Popup plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPopup(settings);
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
        close: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmPopup');

            $this.css('position', '');

            if (!_plugin) {
                return $;
            }

            _plugin.settings.onClose();

            _plugin.htmlElements.container.fadeOut(function () {
                _plugin.htmlElements.container.detach();
            });

            $this.data('insmPopup', null);

            return $;
        },
        destroy: function () {
            $.insmPopup('close');

            return $;
        },
        init: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmPopup');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        container: $('<div />').addClass('insm-popup-container'),
                        backdrop: $('<div />').addClass('backdrop'),
                        content: $('<div />').addClass('content'),
                        closeButton: $('<div />').addClass('close')
                    },
                    settings: $.extend({
                        backdropTransparency: true,
                        backdropClickClose: false,
                        enableBackdrop: true,
                        backdropClickCallback: function () { },
                        showCloseButton: true,
                        autoOpen: true,
                        content: '',
                        autoCenter: true,
                        width: 0,
                        height: 0,
                        onClose: function () {

                        }
                    }, options),
                    data: {
                        lastContentSize: {
                            width: 0,
                            height: 0
                        }
                    }
                };
                $this.data('insmPopup', _plugin);
            }
                        
            if (_plugin.settings.enableBackdrop) {
                _plugin.htmlElements.container.append(
                    _plugin.htmlElements.backdrop
                );
                if (_plugin.settings.backdropClickClose) {
                    _plugin.htmlElements.backdrop.click(function () {
                        $.insmPopup('close');
                    }).addClass('is-clickable');
                }
            }
            _plugin.htmlElements.container.append(
                _plugin.htmlElements.content
                
            );

            if (_plugin.settings.autoOpen) {
                $.insmPopup('open');
            }

            $(window).resize(function () {
                $.insmPopup('resize');
            });
            $.insmPopup('resize');

            return $this;
        },
        resize: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmPopup');
            
            if (!_plugin) {
                return $;
            }
            
            options = $.extend({
                height: _plugin.data.lastContentSize.height,
                width: _plugin.data.lastContentSize.width
            }, options);

            _plugin.data.lastContentSize.height = options.height;
            _plugin.data.lastContentSize.width = options.width;


            var margin = {
                height: _plugin.htmlElements.content.outerHeight(true) - _plugin.htmlElements.content.height(),
                width: _plugin.htmlElements.content.outerWidth(true) - _plugin.htmlElements.content.width(),
            };

            _plugin.htmlElements.content.center({
                height: options.height,
                width: options.width
            });

            var position = _plugin.htmlElements.content.position();
            
            _plugin.htmlElements.closeButton.css({
                top: position.top + 'px',
                left: parseInt(position.left + _plugin.htmlElements.content.outerWidth(true) - margin.width / 2 - _plugin.htmlElements.closeButton.width() / 2) + 'px'
            });

            return $;
        },
        open: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmPopup');
            
            $this.css('position', 'fixed');

            if (_plugin) {
                $('body').append(
                    _plugin.htmlElements.container
                 );

                if (_plugin.settings.backdropTransparency) {
                    _plugin.htmlElements.backdrop.switchClass("", "transparent", 500);
                } else {
                    _plugin.htmlElements.backdrop.removeClass('transparent').addClass('solid');
                }

                _plugin.htmlElements.content.empty().append(_plugin.settings.content);
                if (_plugin.settings.showCloseButton) {
                    _plugin.htmlElements.content.before(
                        _plugin.htmlElements.closeButton.click(function () {
                            $.insmPopup('close');
                        })
                    );
                }

                $.insmPopup('resize');
            }

            return $this;
        },
        update: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmPopup');
            if (!_plugin) {
                throw new Error('INSM Popup not initialized');
            }
            if (options.content) {
                _plugin.data.container.empty().append(_plugin.settings.content = options.content);
            }

            if (typeof options.backdropClickClose != "undefined") {
                if (options.backdropClickClose == true && !_plugin.settings.backdropClickClose) {
                    _plugin.settings.backdropClickClose = true;
                    _plugin.htmlElements.backdrop.click(function () {
                        if (_plugin.settings.backdropClickClose) $this.insmPopup('close');
                    });
                } else if (options.backdropClickClose == false && _plugin.settings.backdropClickClose) {
                    _plugin.settings.backdropClickClose = false
                    _plugin.htmlElements.backdrop.unbind();
                }
            }

            if (typeof options.showCloseButton != "undefined") {
                if (options.showCloseButton == true && !_plugin.settings.showCloseButton) {
                    _plugin.htmlElements.backdrop.click(function () {
                        if (_plugin.settings.backdropClickClose) $this.insmPopup('close');
                    });
                    _plugin.settings.showCloseButton = true;
                } else if (options.showCloseButton == false && _plugin.settings.showCloseButton) {
                    _plugin.htmlElements.closeButton.detach();
                    _plugin.settings.showCloseButton = false;
                }
            }
            return;
        }
    };

    $.insmPopup = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPopup');
            return null;
        }
    };

    $.fn.insmPopup = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPopup');
            return null;
        }
    };
})(jQuery);
