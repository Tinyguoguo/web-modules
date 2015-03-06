/*
* INSM File
* This file contain the INSM File plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFile(settings);
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
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        properties: $('<div />'),
                        staticProperties: $('<div />'),
                        loading: $('<div />'),
                        preview: $('<div />'),
                        browse: $('<div />')
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    settings: $.extend({
                        id: null,
                        applicationName: 'File'
                    }, options),
                    data: {
                        file: {},
                        loading: true,
                        currentView: null
                    }
                };
                $this.data('insmFile', _plugin);
            }

            _plugin.htmlElements.properties.empty();
            _plugin.htmlElements.staticProperties.empty();

            _plugin.htmlElements.properties.insmInput({
                type: 'fileProperties'
            });

            _plugin.htmlElements.staticProperties.insmInput({
                type: 'table'
            });
            if (_plugin.settings.id === 'new') {
                // It's a new file
                _plugin.htmlElements.loading.hide();
                _plugin.settings.loading = false;
                _plugin.htmlElements.properties.fadeIn();
                _plugin.htmlElements.staticProperties.hide();
                _plugin.htmlElements.preview.addClass('preview');
                _plugin.htmlElements.browse.fadeIn().insmInput({
                    type: 'upload'      
                }).insmInput('edit').addClass('browse-file');

                $this.insmFile('edit');
            }
            else {
                _plugin.htmlElements.browse.hide();
                _plugin.subscriptions.start = function () {
                    $.insmService('register', {
                        subscriber: _plugin.settings.applicationName,
                        type: 'file',
                        fileId: _plugin.settings.id,
                        update: function (file) {
                            $this.insmFile('update', {
                                file: file
                            });
                        },
                        remove: function (fileId) {
                            // TODO
                            // Maybe this one should do something?
                        },
                        reset: function () {
                            // TODO
                            // Maybe this one should do something?
                        }
                    });
                };

                _plugin.subscriptions.stop = function () {
                    $.insmService('unregister', {
                        subscriber: _plugin.settings.applicationName,
                        type: 'file',
                        fileId: _plugin.settings.id
                    });
                };


                _plugin.htmlElements.loading.html('Loading...').fadeIn();
                _plugin.htmlElements.properties.hide();
                _plugin.htmlElements.staticProperties.hide();
                _plugin.htmlElements.preview.addClass('preview');

                _plugin.subscriptions.start();
            }

            $this.empty().addClass('file-viewer');
            $this.append(
                $('<div />').addClass('property-container').append(
                    _plugin.htmlElements.loading,
                    _plugin.htmlElements.properties,
                    $('<div class="divider" />'),
                    _plugin.htmlElements.browse,
                    _plugin.htmlElements.staticProperties
                ),
                _plugin.htmlElements.preview
            );

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            // Switch to view-view
            _plugin.htmlElements.properties.insmInput('reset');
            _plugin.htmlElements.properties.insmInput('view').fadeIn();
            _plugin.htmlElements.staticProperties.insmInput('view').fadeIn();
            
            if (_plugin.data.file.url) {
                _plugin.htmlElements.preview.empty().append(
                    $('<img />', {
                        src: _plugin.data.file.url.preview
                    })
                );
            }

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            // Switch to edit-view
            _plugin.htmlElements.staticProperties.insmInput('view');
            _plugin.htmlElements.properties.insmInput('edit');
            _plugin.data.currentView = 'edit';
            
            if (_plugin.data.file.url) {
                _plugin.htmlElements.preview.empty().append(
                    $('<img />', {
                        src: _plugin.data.file.url.preview
                    })
                );
            }

            return $this;
        },
        save: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            // Save file
            if (_plugin.settings.id == 'new') {
                var properties = _plugin.htmlElements.properties.insmInput('getValue');
                var fileInputElement = _plugin.htmlElements.browse.insmInput('getValue');

                var fileIsSelected = _plugin.htmlElements.browse.insmInput('validate');
                var mandatoryPropertiesProvided = _plugin.htmlElements.properties.insmInput('validate');

                if (fileIsSelected && mandatoryPropertiesProvided) {
                    $.insmProgressHandler('add', {
                        properties: properties,
                        fileInputElement: fileInputElement,
                        regionId: options.regionId,
                        directoryName: options.directoryName,
                        callback: function () {
                            options.success();
                        }
                    });
                }
                else {
                    options.fail();
                }
            }
            else {
                var file = $.extend({}, _plugin.data.file, _plugin.htmlElements.properties.insmInput('getValue'));
                // Validate input
                if (_plugin.htmlElements.properties.insmInput('validate')) {
                    $.insmServiceFile('save', {
                        file: file,
                        success: options.success,
                        invalid: function (message) {
                            // TODO: Platform should specify which parameters are wrong and why
                            $.insmNotification({
                                message: message,
                                type: 'warning'
                            });
                            options.fail();
                        }
                    });
                }
                else {
                    options.fail();
                }
            }

            return $this;
        },
        'delete': function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            return $.insmServiceFile('delete', {
                fileId: _plugin.data.file.id,
                success: function () {
                    $this.insmFile('destroy');
                    options.callback();
                }
            });
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            if (options.file) {
                _plugin.data.file = options.file;
            }

            if (_plugin.data.loading) {
                // Hide loader and show input
                _plugin.htmlElements.loading.hide();
                switch (_plugin.data.currentView) {
                    case 'edit':
                        $this.insmFile('edit');
                        break;
                    default:
                        $this.insmFile('view');
                        break;
                }
                _plugin.data.loading = false;
            }

            _plugin.htmlElements.properties.insmInput('update', {
                value: {
                    name: options.file.name,
                    state: options.file.state,
                    startDate: options.file.startDate || '',
                    endDate: options.file.endDate || ''
                }
            });

            if (options.file.duration) {
                var fileDuration = options.file.duration;
                var duration = $.insmUtilities('millisecondsToPretty', fileDuration);
            }

            var objectDefinition = {
                mimeType: {
                    displayName: 'Mime Type',
                    type: 'string',
                    value: options.file.mimeType
                },
                size: {
                    displayName: 'Size',
                    type: 'string',
                    value: $.insmUtilities('addPrefix', {
                        value: options.file.size
                    }) + 'b'
                },
                orientation: {
                    displayName: 'Orientation',
                    type: 'string',
                    value: options.file.orientation
                },
                resolution: {
                    displayName: 'Resolution',
                    type: 'resolution',
                    value: options.file.resolution
                }
            }

            if (duration) {
                objectDefinition.duration = {
                    displayName: 'Duration',
                    type: 'string',
                    value: duration
                }
            }
            
            _plugin.htmlElements.staticProperties.insmInput('destroy').insmInput({
                type: 'table',
                objectDefinition: objectDefinition
            }).insmInput('view');


            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            _plugin.subscriptions.start();


            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            if (_plugin) {
                _plugin.subscriptions.stop();
            }

            return $this;
        },
        isEqual: function (options) {
            var equal = true;
            $.each(options.file1, function (key, property) {
                if (!_.isEqual(options.file1[key], options.file2[key])) {
                    equal = false;
                    return true;
                }
            });

            return equal;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFile');

            if (_plugin) {
                _plugin.htmlElements.properties.insmInput('destroy');
                _plugin.htmlElements.staticProperties.insmInput('destroy');

                $this.insmFile('stopSubscriptions');
                $this.data('insmFile', null);
            }

            $this.empty();

            return $this;
        }
    };

    $.fn.insmFile = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFile');
            return null;
        }
    };

    $.insmFile = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFile');
            return null;
        }
    };
})(jQuery);
