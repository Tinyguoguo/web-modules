/*
* INSM ModuleTemplate
* This file contain the INSM ModuleTemplate function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmModuleTemplate(settings);
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
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        // TODO: Change application name
                        applicationName: 'Module Template',
                        version: manifest.version
                    }, options),
                    htmlElements: {

                    },
                    data: {
                        fullscreenInitialized: false
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    permissions: {
                        region: {
                            read: true,
                            write: true
                        },
                        file: {
                            read: true,
                            write: true
                        }
                    }
                };
                $this.data('insmModuleTemplate', _plugin);
            }

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            if (!_plugin.settings.regionId) {
                // Read users region tree instead
                _plugin.settings.regionId = $.insmFramework('getUser').regionTree.id;
            }
            else {
                _plugin.settings.showRegionPicker = false;
            }

            return $this;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            // TODO: Change class name
            _plugin.settings.previewTarget.addClass('module module-preview moduleClass');

            
            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            // TODO: Change module title
            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Module Title')
            );
            
            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;


            // Init HTML
            _plugin.settings.target.fadeIn();
            _plugin.settings.target.empty();

            // TODO: Define content
            _plugin.settings.target.append('This is where the content will be');

            $this.insmModuleTemplate('resize');

            return _plugin.settings.target;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');
            if (_plugin) {
                
            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            switch (options.view.toLowerCase()) {
                case 'view1':
                    $this.insmModuleTemplate('stopSubscriptions');
                    $this.insmModuleTemplate('startSubscriptions');
                    break;
                case 'view2':
                    $this.insmModuleTemplate('stopSubscriptions');
                    $this.insmModuleTemplate('startSubscriptions');
                    break;
                default:
                    throw new Error('View "' + options.view + '" not recognised');
                    break;
            }

            return $this;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            $this.insmModuleTemplate('stopSubscriptions');
            $this.data('insmModuleTemplate', null).empty();

            return $this;
        }
    };

    $.fn.insmModuleTemplate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmModuleTemplate');
        }
    };

})(jQuery);