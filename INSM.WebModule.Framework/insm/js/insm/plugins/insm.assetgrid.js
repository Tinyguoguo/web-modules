/*
* INSM Asset Grid
* This file contain the INSM Asset Grid function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmAssetGrid(settings);
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
            var _plugin = $this.data('insmAssetGrid');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        assetContainer: $('<div />'),
                        imageAssets: $('<div />'),
                        videoAssets: $('<div />'),
                        listAssets: $('<div />'),
                        dynamicAssets: $('<div />')
                    },
                    data: {
                        assets: {},
                        selectedItems: []
                    },
                    settings: $.extend(true, {
                        onDoubleClick: function (asset) {

                        }
                    }, options)
                };
                $this.data('insmAssetGrid', _plugin);
            }
            
            $this.html(
                _plugin.htmlElements.assetContainer.addClass('assetContainer')
            ).addClass('assetGrid');

            return $this;
        },
        remove: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetGrid');


            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetGrid');

            $.each(options.items, function (id, asset) {
                // Each asset... if anything has changed then do update.
                if (!_plugin.data.assets[id]) {
                    _plugin.data.assets[id] = $.extend({}, asset);
                    $this.insmAssetGrid('createThumbnail', id);
                }
                else if (!$this.insmAsset('isEqual', {
                    asset1: asset,
                    asset2: _plugin.data.assets[id]
                })) {
                    _plugin.data.assets[id] = $.extend(_plugin.data.assets[id], asset);
                    $this.insmAssetGrid('createThumbnail', id);
                    setTimeout(function () {
                        _plugin.data.assets[id]._thumbnail.insmHighlight();
                        _plugin.data.assets[id]._thumbnail.find('h2').insmHighlight();
                    }, 1);
                }
            });

            $this.insmAssetGrid('onItemUpdated');

            return $this;
        },
        hasUpdate: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceFile');

            var hasUpdate = false;

            if (typeof _plugin.objects[options.file.id] === 'undefined') {
                _plugin.objects[options.file.id] = options.file;
                hasUpdate = true;
            }
            else {
                $.each(options.file, function (parameter, value) {
                    if (typeof _plugin.objects[options.file.id][parameter] === 'undefined') {
                        _plugin.objects[options.file.id][parameter] = value;
                        hasUpdate = true;
                    }
                    if (!_.isEqual(_plugin.objects[options.file.id][parameter], value)) {
                        hasUpdate = true;
                    }
                });
            }

            return hasUpdate;
        },
        onItemUpdated: function (id) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetGrid');

            $.each(_plugin.data.assets, function (id, asset) {
                if (asset._thumbnail) {
                    asset._thumbnail.detach();
                }
            });
                        
            var categories = {
                image: {
                    show: false,
                    name: 'Images',
                    assets: $('<div />').addClass('l-grid')
                },
                video: {
                    show: false,
                    name: 'Videos',
                    assets: $('<div />').addClass('l-grid')
                },
                list: {
                    show: false,
                    name: 'Lists',
                    assets: $('<div />').addClass('l-grid')
                }
            };

            $.each(_plugin.data.assets, function (id, asset) {
                switch (asset.template.toLowerCase()) {
                    case 'image':
                        categories.image.show = true;
                        break;
                    case 'video':
                        categories.video.show = true;
                        break;
                    case 'list':
                        categories.list.show = true;
                        break;
                    case 'template':
                        // Add some template
                        break;
                    default:
                        //throw new Error('Unknown asset template "' + asset.template + '"');
                        break;
                }
            });

            _plugin.htmlElements.assetContainer.empty();
            $.each(categories, function (key, category) {
                if (category.show) {
                    _plugin.htmlElements.assetContainer.append(
                        $('<h2 />').text(category.name),
                        category.assets,
                        $('<div />').addClass('clear')
                    )
                }
            });

            $.each(_plugin.data.assets, function (id, asset) {
                switch (asset.template.toLowerCase()) {
                    case 'image':
                        categories.image.assets.append(asset._thumbnail);
                        break;
                    case 'video':
                        categories.video.assets.append(asset._thumbnail);
                        break;
                    case 'list':
                        categories.list.assets.append(asset._thumbnail);
                        break;
                    case 'template':
                        // Add to some template div
                        break;
                    default:
                        //throw new Error('Unknown asset template "' + asset.template + '"');
                        break;
                }
                asset._thumbnail.draggable(
                    {
                        opacity: 0.7,
                        helper: function () {
                            return asset._thumbnail.clone().data('assetId', asset.id).data('origin', 'assetManager');
                        }
                    }
                );
            });

            return $this;
        },
        getSelectedAssets: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetGrid');

            var selectedAssets = [];
            $.each(_plugin.data.selectedItems, function (index, assetId) {
                selectedAssets.push(_plugin.data.assets[assetId]);
            });

            return selectedAssets;
        },
        deselect: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetGrid');
            
            $.each(_plugin.data.selectedItems, function (index, assetId) {
                _plugin.data.assets[assetId]._selected = false;
                _plugin.data.assets[assetId]._thumbnail.switchClass('is-selected', '', {
                    duration: 100,
                    queue: true
                });
            });

            _plugin.data.selectedItems = [];

            return $this;
        },
        createThumbnail: function (id) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetGrid');

            _plugin.data.assets[id]._thumbnail = $.insmAsset('getThumbnail', {
                asset: _plugin.data.assets[id]
            }).dblclick(function () {
                //_plugin.settings.onDoubleClick(_plugin.data.assets[id]);
            }).click(function (event) {
                if (event.ctrlKey == 1) {
                    if (_plugin.data.assets[id]._selected) {
                        _plugin.data.assets[id]._selected = false;
                        _plugin.data.assets[id]._thumbnail.switchClass('is-selected', '', {
                            duration: 100,
                            queue: true
                        });

                        if ($.isArray(_plugin.data.selectedItems)) {
                            var index = _plugin.data.selectedItems.indexOf(id);

                            if (index > -1) {
                                _plugin.data.selectedItems.splice(index, 1);
                            }
                            else {
                                throw new Error('The selected item was not in the list of selected items.');
                            }
                        }
                    }
                    else {
                        _plugin.data.assets[id]._selected = true;
                        _plugin.data.assets[id]._thumbnail.switchClass('', 'is-selected', {
                            duration: 100,
                            queue: true
                        });
                        _plugin.data.selectedItems.push(id);
                    }
                }
                else {
                    _plugin.settings.onDoubleClick(_plugin.data.assets[id]);
                }
            });

            return $this;
        }
    };

    $.fn.insmAssetGrid = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAssetGrid');
        }
    };

    $.insmAssetGrid = function (method) {
        return $('<div />').insmAssetGrid(arguments);
    };
})(jQuery);