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
            var $this = $(this);
            $this.insmPopup('close');
        },
        init: function (options) {
            if (this instanceof $) {
                $this = $(this);
                if (typeof (options.autoOpen) == 'undefined' || options.autoOpen) {
                    //if it is an element we asume we want the click behavior.
                    $this.click(function () {
                        $(this).insmDialog('open');
                    });
                }
            } else {
                var $this = $("<div />");
                $this.insmDialog(options);
                return $this;
            }

            // Global vars
            var _plugin = $this.data('insmDialog');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        backdropClickClose: false,
                        showCloseButton: false,
                        autoOpen: true,
                        backgroundColor: '#eee',
                        content: '',
                        buttons: {}
                    }, options)
                };
                $this.data('insmDialog', _plugin);
            }

            if (_plugin.settings.autoOpen) {
                $this.insmDialog('open');
            }
            return $this;
        },
        open: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDialog');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: "Missing pluggin settings for popup window"
                });
                return $this;
            }

            var $combinedContent = $('<div class="insm-dialog container" />');
            var $content;
            if (typeof _plugin.settings.content == 'string') {
                $content = $('<div />').append(_plugin.settings.content);
            } else {
                $content = $(_plugin.settings.content);
            }
            $content.addClass('insm-dialog content');
            $combinedContent.append($content);
            var $buttons = $('<div class="insm-dialog" />');
            if (_plugin.settings.buttons) {
                $.each(_plugin.settings.buttons, function (key, object) {
                    $buttons.addClass('buttons');
                    $buttons.append($('<a class="button">').text(key).click(object).click(function() {
                        if (!_plugin.settings.noCloseOnAction) {
                            $this.insmDialog('close');
                        }
                    }));
                });
            
                $combinedContent.append($buttons);
            }
            var settings = $.extend(_plugin.settings, { content: $combinedContent });
            
            $this.insmPopup(settings);
            $content.height($combinedContent.outerHeight() - $buttons.outerHeight());
            return $this;
        },
        alert: function (options) {
            if (this instanceof $) {
                return $(this).insmDialog('init', options);
            } else {
                var $this = $("<div />");
                $this.insmDialog('init', options);
                return $this;
            }
        },
        confirm: function (options) {
            if (this instanceof $) {
                return $(this).insmDialog('init', options);
            } else {
                var $this = $("<div />");
                $this.insmDialog('init', options);
                return $this;
            }
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

    $.fn.insmDialog = function (method) {
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
