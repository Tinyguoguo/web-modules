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

            if ($('insm-popup-content').length) _plugin.data.savedContent = $('insm-popup-content');
            _plugin.data.backdrop.remove();
            _plugin.data.closeButton.remove();
            _plugin.data.container.empty().remove();

            return $this;
        },
        destroy: function () {
            var $this = $(this);

            $this.insmPopup('close');
            $this.data('insmPopup', null);

            return $this;
        },
        init: function (options) {
            if (this instanceof $) {
                $this = $(this);
            } else {
                var $this = $("<div />");
                $this.insmPopup(options);
                return $this;
            }

            // Global vars
            var _plugin = $this.data('insmPopup');
            
            if (typeof (options.autoOpen) == 'undefined' || options.autoOpen) {
                //if it is an element we asume we want the click behavior.
                $this.click(function () {
                    $(this).insmPopup('open');
                });
            }

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    data: {
                        savedContent: '',
                        backdrop: $('<div />').addClass('insm-popup backdrop'),
                        container: $('<div />').addClass('insm-popup container'),
                        closeButton: $('<div >X</div>').addClass('insm-popup close')
                    },
                    settings: $.extend({
                        backdropTransparency: true,
                        backdropClickClose: true,
                        showCloseButton: true,
                        autoOpen: false,
                        content: '',
                        backdropClickCallback: function () {}
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
            if (!_plugin) {
                return $this;
            }

            if (_plugin.settings.showCloseButton) {
                _plugin.data.closeButton.prependTo(_plugin.data.container);
                _plugin.data.closeButton.click(function () {
                    $this.insmPopup('close');
                });
            }

            if (_plugin.settings.content instanceof jQuery) {
                _plugin.settings.content.addClass('insm-popup-content');
            }

            if (_plugin.data.savedContent) {
                _plugin.data.container.append(_plugin.data.savedContent);
            } else {
                if (typeof _plugin.settings.content == 'function') {
                    _plugin.data.container.append(_plugin.settings.content());
                } else {
                    _plugin.data.container.append(_plugin.settings.content);
                }
            }
            if (_plugin.settings.backdropTransparency) {
                _plugin.data.backdrop.switchClass("","transparent", 500);
            } else {
                _plugin.data.backdrop.switchClass("", "solid", 500);
            }
            _plugin.data.backdrop.appendTo('body').click(function () {
                _plugin.settings.backdropClickCallback();
                if (_plugin.settings.backdropClickClose) $this.insmPopup('close');
            });

            _plugin.data.container.animate({ opacity: 1 }, 400);
            _plugin.data.container.appendTo('body');
            
            _plugin.data.container.center();

            if ($('body').height() < _plugin.data.container.outerHeight(true)) {
                var margin = _plugin.data.container.outerHeight(true) - _plugin.data.container.height();
                margin += _plugin.settings.content.outerHeight(true) - _plugin.settings.content.height();
                _plugin.data.container.css({
                    height: parseInt($('body').height() - margin) + 'px'
                });
                _plugin.settings.content.css({
                    height: parseInt($('body').height() - margin) + 'px'
                });
            }

            return $this;
        },
        center: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPopup');
            if (!_plugin) {
                return $this;
            }

            _plugin.data.container.center();
            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPopup');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: "Missing plugin settings for Popup."
                });
                return;
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
