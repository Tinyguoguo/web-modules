/*
* INSM Asset
* This file contain the INSM Asset plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmAsset(settings);
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
            var _plugin = $this.data('insmAsset');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        assetDetails: $('<div />'),
                        fileBrowser: $('<div />'),
                        properties: $('<div />'),
                        templatePicker: $('<select />'),
                        templateProperties: $('<div />')
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    settings: $.extend({
                        asset: {
                            id: null,
                            name: null,
                            template: null
                        },
                        applicationName: 'insmAsset',
                        regionId: null,
                        directoryName: 'Media',
                        onRemove: null
                    }, options),
                    data: {
                        asset: {
                            id: null,
                            name: null,
                            template: null
                        }
                    }
                };
                $this.data('insmAsset', _plugin);
            }
            
            _plugin.htmlElements.properties.empty();
            _plugin.htmlElements.templateProperties.empty();
            _plugin.htmlElements.templatePicker.empty();

            _plugin.htmlElements.templatePicker.append(
                $('<option />').text('Select'),
                $('<option />').text('Image')
                //$('<option />').text('List')
            );

            _plugin.htmlElements.properties.insmInput({
                type: 'table',
                objectDefinition: {
                    name: {
                        displayName: 'Name',
                        type: 'string'
                    },
                    state: {
                        displayName: 'State',
                        type: 'string'
                    },
                    duration: {
                        displayName: 'Duration',
                        type: 'integer'
                    },
                    orientation: {
                        displayName: 'Orientation',
                        type: 'string'
                    }
                }
            });

            _plugin.htmlElements.templatePicker.val(_plugin.settings.asset.template);

            _plugin.htmlElements.templatePicker.change(function () {
                switch (_plugin.htmlElements.templatePicker.val().toLowerCase()) {
                    case 'select':
                        _plugin.htmlElements.templateProperties.insmInput('destroy');
                        break;
                    case 'image':
                        var value = null;
                        if (options.asset.content.children.Image && options.asset.content.children.Image.id) {
                            value = options.asset.content.children.Image.id;
                        }
                        _plugin.htmlElements.templateProperties.insmInput('destroy').insmInput({
                            type: 'table',
                            value: {
                                image: value
                            },
                            objectDefinition: {
                                image: {
                                    displayName: 'Image',
                                    type: 'file',
                                    fileTypes: ['image'],
                                    selectFileCallback: function (options) {
                                        _plugin.htmlElements.assetDetails.hide();
                                        _plugin.htmlElements.fileBrowser.insmFileManager({
                                            regionId: _plugin.settings.regionId,
                                            directoryName: _plugin.settings.directoryName,
                                            onSelect: function (options) {
                                                _plugin.htmlElements.fileBrowser.hide();
                                                _plugin.htmlElements.assetDetails.fadeIn();

                                                options.onSelect(options);
                                            }
                                        }).fadeIn();
                                    }
                                }
                            }
                        }).insmInput('edit');
                        break;
                    case 'list':
                        // TODO something like this
                        //var value = null;
                        //if (options.asset.content.children.Image && options.asset.content.children.Image.id) {
                        //    value = options.asset.content.children.Image.id;
                        //}
                        _plugin.htmlElements.templateProperties.insmInput('destroy').insmInput({
                            type: 'table',
                            value: {
                                list: 'mock value'
                            },
                            objectDefinition: {
                                list: {
                                    displayName: 'Mock key',
                                    type: 'string'
                                }
                            }
                        }).insmInput('edit');
                        break;
                    default:
                        throw new Error('Unknown template "' + _plugin.htmlElements.templatePicker.val() + '"');
                }
            });
            if (_plugin.settings.asset.template) {
                switch (_plugin.settings.asset.template.toLowerCase()) {
                    case 'image':
                        _plugin.htmlElements.templateProperties.insmInput('destroy').insmInput({
                            type: 'table',
                            value: {
                                image: _plugin.settings.asset.content.children.Image.id
                            },
                            objectDefinition: {
                                image: {
                                    displayName: 'Image',
                                    type: 'file',
                                    fileTypes: ['image'],
                                    selectFileCallback: function (options) {
                                        _plugin.htmlElements.assetDetails.hide();
                                        _plugin.htmlElements.fileBrowser.insmFileManager({
                                            regionId: _plugin.settings.regionId,
                                            directoryName: _plugin.settings.directoryName,
                                            onSelect: function (file) {
                                                _plugin.htmlElements.fileBrowser.hide();
                                                _plugin.htmlElements.assetDetails.fadeIn();

                                                _plugin.htmlElements.templateProperties.insmInput('update', {
                                                    value: {
                                                        image: file.id
                                                    }
                                                });
                                            }
                                        }).fadeIn();
                                    }
                                }
                            }
                        });
                        break;
                    case 'list':
                        _plugin.htmlElements.templateProperties.insmInput('destroy').insmInput({
                            type: 'table',
                            value: {
                                list: 'mock value'
                            },
                            objectDefinition: {
                                list: {
                                    displayName: 'Mock key',
                                    type: 'string'
                                }
                            }
                        });
                        break;
                    default:
                        throw new Error('Unknown template "' + _plugin.settings.asset.template + '"');
                }
            }
            else {
                _plugin.htmlElements.templateProperties.insmInput({
                    type: 'table'
                });
            }
            
            $this.addClass('l-grid').append(
                _plugin.htmlElements.assetDetails.append(
                    _plugin.htmlElements.properties,
                    $('<div />').append(
                        _plugin.htmlElements.templatePicker,
                        _plugin.htmlElements.templateProperties
                    )
                ),
                _plugin.htmlElements.fileBrowser
            ).fadeIn();


            _plugin.subscriptions.start = function () {
                $.insmService('register', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'asset',
                    assetId: options.assetId,
                    update: function (asset) {
                        $this.insmAsset('update', {
                            asset: asset
                        });
                    }
                });
            };

            _plugin.subscriptions.stop = function () {
                $.insmService('unregister', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'asset',
                    assetId: options.assetId
                });
            };

            _plugin.subscriptions.start();

            return $this;
        },
        getThumbnail: function (options) {
            if (!options || !options.asset) {
                throw new Error('Asset not provided');
            }
            var thumbnail = $('<div />');

            if (typeof options.onRemove === 'function') {
                thumbnail.append(
                    $('<div />').addClass('remove').text('x').click(function() {
                        options.onRemove();
                    })
                );
            }

            switch(options.asset.template.toLowerCase()) {
                case 'image':
                    thumbnail.addClass('asset-thumbnail image').append(
                        $('<div class="image" />').append(
                            $('<div class="inner" />').append(
                                $('<img />', {
                                    src: $.insmFramework('getFileImageUrls', {
                                        id: options.asset.content.children.Image.id
                                    }).preview
                                })
                            )
                        ),
                        $('<h2 />').text(options.asset.name)
                    );
                    break;
                case 'list':
                    var images = [];
                    $.each(options.asset.content.children, function (index, item) {
                        if (parseInt(index) > 0) {
                            images.push(item.children.Content.children.Image.id);
                        }
                    });
                    thumbnail.addClass('asset-thumbnail list');

                    for(var i=0; i < 4; i++) {
                        thumbnail.append(
                            $('<div class="image" />').append(
                                function () {
                                    if (images[i]) {
                                        return $('<img />', {
                                            src: $.insmFramework('getFileImageUrls', {
                                                id: images[i]
                                            }).preview
                                        });
                                    }
                                }
                            )
                        );
                    }

                    thumbnail.append(
                        $('<h2 />').text(options.asset.name)
                    );
                    break;
                default:
                    thumbnail.text('TMP');
                    //throw new Error('Thumbnail not implemented for asset with template "'+options.asset.template+'"');
                    break;
            }

            thumbnail.data('assetId', options.asset.id);

            return thumbnail;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            // Switch to view-view
            _plugin.htmlElements.properties.insmInput('view').fadeIn();
            _plugin.htmlElements.templateProperties.insmInput('view').fadeIn();

            _plugin.htmlElements.templatePicker.attr('disabled', 'disabled');

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            // Switch to edit-view
            _plugin.htmlElements.properties.insmInput('edit');
            _plugin.htmlElements.templateProperties.insmInput('edit').fadeIn();

            _plugin.htmlElements.templatePicker.removeAttr('disabled');

            return $this;
        },
        save: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            // Save asset
            var asset = $.extend({}, _plugin.settings.asset, _plugin.htmlElements.properties.insmInput('getValue'));
            switch (asset.template.toLowerCase()) {
                case 'image':
                    asset.content.children.Image.id = _plugin.htmlElements.templateProperties.insmInput('getValue').image;
                    break;
                case 'list':
                    throw new Error('Not implemented');
                    break;
            }

            $.insmServiceAsset('save', {
                asset: asset,
                success: function () {
                    options.callback();
                }
            });

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            _plugin.htmlElements.properties.insmInput('update', {
                value: {
                    name: options.asset.name,
                    state: options.asset.state,
                    duration: options.asset.duration,
                    orientation: options.asset.orientation
                }
            });

            switch (options.asset.template.toLowerCase()) {
                case 'image':
                    _plugin.htmlElements.templateProperties.insmInput('update', {
                        type: 'table',
                        value: {
                            image: options.asset.content.children.Image.id
                        },
                        objectDefinition: {
                            image: {
                                displayName: 'Image',
                                type: 'file'
                            }
                        }
                    });
                    break;
                case 'list':
                    _plugin.htmlElements.templateProperties.insmInput({
                        type: 'table',
                        value: {
                            list: 'mock value'
                        },
                        objectDefinition: {
                            list: {
                                displayName: 'Mock key',
                                type: 'string'
                            }
                        }
                    });
                    break;
            }
            
            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            _plugin.subscriptions.start();


            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            if (_plugin) {
                _plugin.subscriptions.stop();
            }

            return $this;
        },
        isEqual: function (options) {
            var equal = true;
            $.each(options.asset1, function (key, property) {
                if (!_.isEqual(options.asset1[key], options.asset2[key])) {
                    equal = false;
                    return true;
                }
            });

            return equal;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            if (_plugin) {
                _plugin.htmlElements.properties.insmInput('destroy');
                _plugin.htmlElements.templateProperties.insmInput('destroy');
            }

            $this.insmAsset('stopSubscriptions');
            $this.data('insmAsset', null);
            $this.empty();

            return $this;
        }
    };

    $.fn.insmAsset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAsset');
            return null;
        }
    };

    $.insmAsset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAsset');
            return null;
        }
    };
})(jQuery);
