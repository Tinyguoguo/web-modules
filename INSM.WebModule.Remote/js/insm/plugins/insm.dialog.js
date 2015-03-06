/*
* INSM Dialog
* This file contain the INSM dialog plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmDialog(settings);
*
* File dependencies:
* jQuery 1.6.1
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        close: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmDialog');

            if (_plugin) {
                _plugin.htmlElements.container.remove();
                _plugin.htmlElements.buttonsContainer.remove();
                _plugin.htmlElements.popup.insmPopup('destroy');
            }

            return $this;
        },
        init: function (options) {
            var $this = $("html").eq(0);

            // Global vars
            var _plugin = $this.data('insmDialog');

            // If the plugin hasn't been initialized yet
            _plugin = {
                settings: $.extend({
                    backdropClickClose: false,
                    showCloseButton: false,
                    autoOpen: true,
                    content: '',
                    title: null,
                    message: null,
                    buttons: null,
                    accept: null,
                    deny: null
                }, options),
                htmlElements: {
                    popup: null,
                    container: $('<div />'),
                    title: $('<h3 />'),
                    message: $('<p />'),
                    buttonsContainer: $('<div />'),
                    buttons: {
                        alert: {
                            accept: $('<button class="accept" />').text('Ok')
                        },
                        confirm: {
                            accept: $('<button class="accept" />').text('Yes'),
                            deny: $('<button class="deny" />').text('No')
                        }
                    }
                }
            };

            if (!_plugin.settings.title) {
                throw new Error("Missing required parameter 'title'.");
            }

            $this.data('insmDialog', _plugin);

            if (_plugin.settings.autoOpen) {
                $.insmDialog('open');
            }

            return $this;
        },
        open: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmDialog');
            
            _plugin.htmlElements.container.append(
                _plugin.htmlElements.title.text(_plugin.settings.title),
                _plugin.htmlElements.message.append(_plugin.settings.message),
                _plugin.htmlElements.buttonsContainer.addClass('buttons-container')
            ).addClass('insm-dialog container');

            if (!_plugin.settings.buttons) {
                if (!_plugin.htmlElements.buttons[_plugin.settings.type]) {
                    throw new Error('Button type "' + _plugin.settings.type + '" is not implemented');
                }

                switch (_plugin.settings.type.toLowerCase()) {
                    case "alert":
                        _plugin.htmlElements.buttonsContainer.append(
                            _plugin.htmlElements.buttons.alert.accept.click(function () {
                                if (typeof _plugin.settings.accept == 'function') {
                                    _plugin.settings.accept();
                                }
                                $.insmDialog('close');
                            })
                        );
                        break;
                    case "confirm":
                        _plugin.htmlElements.buttonsContainer.append(
                            _plugin.htmlElements.buttons.confirm.accept.click(function () {
                                if (typeof _plugin.settings.accept == 'function') {
                                    _plugin.settings.accept();
                                    $.insmDialog('close');
                                }
                                else {
                                    $.insmDialog('close');
                                }
                            }),
                            _plugin.htmlElements.buttons.confirm.deny.click(function () {
                                if (typeof _plugin.settings.deny == 'function') {
                                    _plugin.settings.deny();
                                }
                                $.insmDialog('close');
                            })
                        );
                        break;
                    default:
                        throw new Error('Button type "' + _plugin.settings.type + '" is not implemented');
                        break;
                }
            }
            var settings = $.extend(_plugin.settings, {
                content: _plugin.htmlElements.container
            });
            _plugin.htmlElements.popup = $this.insmPopup(settings);
            return $this;
        },
        destroy: function () {
            var $this = $('html').eq(0);
            $this.data('insmDialog', null);

            return $this;
        }
    };

    $.insmDialog = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmDialog');
            return null;
        }
    };
})(jQuery);
