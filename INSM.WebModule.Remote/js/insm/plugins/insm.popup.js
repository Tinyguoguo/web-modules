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
            var $this = $(this);
            var _plugin = $this.data('insmPopup');

            $this.empty();
            $this.remove();

            return $this;
        },
        init: function (options) {
            var autoOpenDefault = true;
            var $this = $("<div />").addClass('popup');

            // Global vars
            var _plugin = $this.data('insmPopup');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        backdrop: $('<div />').addClass('backdrop'),
                        content: $('<div />').addClass('content'),
                        closeButton: $('<div />').addClass('close')
                    },
                    settings: $.extend({
                        backdropTransparency: true,
                        backdropClickClose: false,
                        showCloseButton: true,
                        autoOpen: autoOpenDefault,
                        content: '',
                        backdropClickCallback: function () { },
                        autoCenter: true
                    }, options)
                };
                $this.data('insmPopup', _plugin);
            }
            
            if (_plugin.settings.autoOpen) {
                $this.insmPopup('open');
            }
            return $this;
        },
        open: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPopup');

            _plugin.htmlElements.backdrop.detach();
            _plugin.htmlElements.closeButton.detach();
            _plugin.htmlElements.content.detach();

            $this.empty();
            $this.remove();

            $this.append(
                _plugin.htmlElements.backdrop.click(function () {
                    if (_plugin.settings.backdropClickClose) $this.insmPopup('close');
                })
             );

            if (_plugin.settings.showCloseButton) {
                $this.append(
                    _plugin.htmlElements.closeButton.click(function () {
                        $this.insmPopup('close');
                    })
                );
            }

            $this.append(
                _plugin.htmlElements.content.html(
                    _plugin.settings.content
                )
            );

            if (_plugin.settings.backdropTransparency) {
                _plugin.htmlElements.backdrop.switchClass("","transparent", 500);
            } else {
                _plugin.htmlElements.backdrop.switchClass("", "solid", 500);
            }

            $('body').append(
                $this
            );

            $(window).smartresize(function () {
                //$.insmUtilities('centerElement', $this);
                $this.center();
            });

            $this.smartresize(function () {
                //$.insmUtilities('centerElement', $this);
                $this.center();
            });

            //$.insmUtilities('centerElement', $this);
            $this.center();

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPopup');
            if (!_plugin) {
                throw new Error('INSM Popup not initialized');
            }
            if (options.content) {
                _plugin.data.container.empty().append(_plugin.settings.content = options.content);
            }

            if (typeof options.backdropClickClose != "undefined") {
                if (options.backdropClickClose == true && !_plugin.settings.backdropClickClose) {
                    _plugin.settings.backdropClickClose = true
                    _plugin.data.backdrop.appendTo('body').click(function () {
                        if (_plugin.settings.backdropClickClose) $this.insmPopup('close');
                    });
                } else if (options.backdropClickClose == false && _plugin.settings.backdropClickClose) {
                    _plugin.settings.backdropClickClose = false
                    _plugin.data.backdrop.unbind();
                }
            }

            if (typeof options.showCloseButton != "undefined") {
                if (options.showCloseButton == true && !_plugin.settings.showCloseButton) {
                    _plugin.data.backdrop.appendTo('body').click(function () {
                        if (_plugin.settings.backdropClickClose) $this.insmPopup('close');
                    });
                    _plugin.settings.showCloseButton = true;
                } else if (options.showCloseButton == false && _plugin.settings.showCloseButton) {
                    _plugin.data.closeButton.detach();
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
