/*
* INSM Progress Handler
* This file contain the INSM File Progress Handler
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmProgressHandler(settings);
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
    var notificationHandleIterator = 1;
    var methods = {
        init: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmProgressHandler');
            
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        target: null
                    }, options),
                    data: {
                        notificationHandles: {}
                    }
                };
                $this.data('insmProgressHandler', _plugin);
            }


            return $this;
        },
        add: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmProgressHandler');
            
            if (!_plugin) {
                $.insmProgressHandler();
                _plugin = $this.data('insmProgressHandler');
            }

            var notificationHandleId;
            if (!_plugin.settings.target) {
                notificationHandleId = notificationHandleIterator;
                notificationHandleIterator++;
            }

            options.callback();

            return $.insmFramework('uploadFile', {
                properties: options.properties,
                fileInputElement: options.fileInputElement,
                regionId: options.regionId,
                directoryName: options.directoryName,
                retry: function(message) {
                    _plugin.data.notificationHandles[notificationHandleId].update({
                        type: 'warning',
                        message: message,
                        duration: 8000,
                        progress: 0
                    });
                },
                progress: function(progress) {
                    if (_plugin.settings.target) {
                        _plugin.settings.target.append('loading');
                    }
                    else {
                        if (_plugin.data.notificationHandles[notificationHandleId]) {
                            _plugin.data.notificationHandles[notificationHandleId].update({
                                progress: progress,
                                duration: 0
                            });
                        }
                        else {
                            function fileFromPath(file) {
                                return file.replace(/.*(\/|\\)/, "");
                            }
                            _plugin.data.notificationHandles[notificationHandleId] = $.insmNotification({
                                type: 'load',
                                message: 'Uploading ' + fileFromPath(options.fileInputElement.val()),
                                progress: progress,
                                duration: 0
                            });
                        }
                    }
                },
                done: function() {
                    if (_plugin.settings.target) {
                        _plugin.settings.target.empty();
                    }
                    else {
                        $.insmServiceFile('update');

                        _plugin.data.notificationHandles[notificationHandleId].update({
                            type: 'successful',
                            message: 'Upload successful',
                            duration: 2000
                        });
                    }
                }
            });
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmProgressHandler');

            return $this;
        }
    };

    $.insmProgressHandler = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmProgressHandler');
            return null;
        }
    };
})(jQuery);
