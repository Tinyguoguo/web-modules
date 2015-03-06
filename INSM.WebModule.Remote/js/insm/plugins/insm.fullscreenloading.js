/*
* INSM Flip
* This file contain the INSM Flip function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFlip(options);
*
* Author:
* Guo Yang
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmFullScreenLoading');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {                          
                    _plugin = {
                        settings: $.extend({
                           text:null
                        }, options),
                        data:{
                            opened: false
                        },
                        htmlElements: {
                            content: $('<div />')
                        }
                    };                   
                    $this.data('insmFullScreenLoading', _plugin);
                    _plugin.htmlElements.content.insmLoader({ text: _plugin.settings.text });

                    
            }
            
            return $this;
        },
        popUp: function (options) {

            var $this = $(this);
            var _plugin = $this.data('insmFullScreenLoading');            
            var date = new Date().getTime();
            
            if (options) {
                if (options.text) {
                    _plugin.htmlElements.content.insmLoader({ text: options.text });
                }
                if (options.timer) {
                    _plugin.data.opened = true;
                    function getProgress() {
                        if (_plugin.data.opened) {
                            if (date + options.timer < new Date().getTime()) {
                                $this.insmPopup({
                                    backdropTransparency: true,
                                    backdropClickClose: false,
                                    showCloseButton: false,
                                    content: _plugin.htmlElements.content,
                                    backdropClickCallback: function () {
                                    },
                                    autoCenter: true
                                });
                            } else {
                                setTimeout(function () {
                                    getProgress();
                                }, options.timer / 2);
                            }
                        } else {

                        }
                    }
                    getProgress();
                }
            } else {
                $this.insmPopup({
                    backdropTransparency: true,
                    backdropClickClose: false,
                    showCloseButton: false,
                    content: _plugin.htmlElements.content,
                    backdropClickCallback: function () {
                    },
                    autoCenter: true
                });

            }
        },
        close: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFullScreenLoading');
            _plugin.data.opened = false;
            $this.insmPopup('close');
        }
    };

    $.fn.insmFullScreenLoading = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFullScreenLoading');
        }
    };
})(jQuery);