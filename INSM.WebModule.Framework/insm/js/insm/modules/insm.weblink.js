/*
* INSM Web Link
* This file contains the INSM Web Link plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmWebLink(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');
                        
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        applicationName: 'Web link',
                        version: manifest.version,
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        iFrame: $('<iframe />')
                    }
                };
                $this.data('insmWebLink', _plugin);
            }
            
            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');
            
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview weblink');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });
            
            _plugin.settings.previewTarget.html(
                $('<h2 />').text(_plugin.settings.applicationName)
            );

            return _plugin.settings.previewTarget;
        },
        hasSettings: function() {
            return false;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');
            var apiUrl = $.insmFramework('getSystemInformation').apiUrl;
            var session = $.insmFramework('getSession');
            if (_plugin.settings.externalModule) {
                if (_plugin.settings.url.indexOf('?') > -1) {
                    _plugin.settings.url = _plugin.settings.url + '&session=' + session + '&apiUrl=' + apiUrl;
                } else {
                    _plugin.settings.url = _plugin.settings.url + '?session=' + session + '&apiUrl=' + apiUrl;
                }
                _plugin.htmlElements.iFrame.attr('src', _plugin.settings.url);
            } else {
                _plugin.htmlElements.iFrame.attr('src', _plugin.settings.url);
            }
            _plugin.settings.target.addClass('insm-weblink').append(
                _plugin.htmlElements.iFrame
            );
            $this.insmWebLink('resize');

            return _plugin.settings.target;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');

            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                var totalHeight = _plugin.settings.target.parent().parent().height();
               
                var contentContainerHeight = parseInt(totalHeight - 40);
                _plugin.htmlElements.iFrame.css({
                    height: contentContainerHeight + 'px'
                });
                _plugin.htmlElements.iFrame.css({
                    width: parseInt(target.width) + 'px'
                });
            }

            return $this;
        },
        startSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');

            _plugin.subscriptions.start = function () {
                
            };

            $this.insmWebLink('stopSubscriptions');
            $this.insmWebLink('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                
            };

            return $this;
        },
        onClose: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');
            if (_plugin.settings.externalModule) {
                $.insmDialog({
                    type: 'confirm',
                    title: 'Are you sure to continue?',
                    message: 'Since this is a external web link, you will lose all of your changes without saving',
                    accept: function () {
                        options.success();                        
                    }
                });            
            }else {
                options.success();           
            }
        },
       
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmWebLink');
            //$this.insmWebLink('stopSubscriptions');
            $this.data('insmWebLink', null).empty();

            return $this;
        }
    };

    $.fn.insmWebLink = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmWebLink');
        }
    };

})(jQuery);