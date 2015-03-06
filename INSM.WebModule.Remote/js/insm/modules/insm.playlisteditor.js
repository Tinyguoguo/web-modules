/*
* INSM Playlist Editor
* This file contain the INSM Playlist Editor function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlaylistEditor(settings);
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
            var _plugin = $this.data('insmPlaylistEditor');
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        regionPicker: {
                            container: $('<div />'),
                            button: $('<a />')
                        },
                        playlists: {
                            controls: $('<div />')
                        },
                        selectedPlaylist: {
                            container: $('<div />'),
                            header: $('<div />'),
                            title: $('<h5 />'),
                            information: $('<div />'),
                            controls: {
                                container: $('<div />'),
                                save: $('<button />'),
                                remove: $('<button />'),
                            },
                            items: $('<div />')
                        },
                        assetControls: {
                            container: $('<div />'),
                            edit: $('<button />'),
                            remove: $('<button />'),
                            label: $('<h3 />')
                        },
                        fullscreen: {
                            rightColumn: $('<div />'),
                            leftColumn: $('<div />'),
                            header: $('<div />'),
                            assetManager: $('<div />'),
                            playlists: $('<div />'),
                            playlistContainer: $('<div />'),
                            playlistAddContainer: $('<div />'),
                            input: {
                                addNewButton: $('<button />'),
                                addNewInputName: $('<div />'),
                                savePlaylist: $('<button />'),
                                deletePlaylist: $('<button />')
                            },
                            controls: {
                                container: $('<div />'),
                                //addToPlaylist: $('<a />'),
                                viewSelector: $('<select />')
                            },
                            playlistsContentText: {
                                header: $('<h2 />'),
                                body: $('<span />')
                            }
                        }
                    },
                    data: {
                        fullscreenInitialized: false,
                        selectedPlaylist: {},
                        assetsInSelectedPlaylist: {},
                        currentPlaylistItems: [],
                        selectedAssetId: 0,
                        selectedAssetIndex: 0,
                        assets: {},
                        playlists: {},
                        currentPlaylist: {
                            name: '',
                            items: []
                        },
                        playlistTotalTime: 0,
                        playlistTotalItems: 0,
                        isEditing: false,
                        currentAsset: {},
                        playerUpdateListeners: [],
                        tableSearchIndex: function (asset) {
                            var searchArray = [];
                            $.merge(searchArray, asset.name.split(' '));
                            return searchArray;
                        },
                        tableHeaders: {
                            themeDefault: {
                                Name: {
                                    key: 'name'
                                },
                                'Last modified': {
                                    key: 'modificationDate'
                                }
                            }
                        }
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    settings: $.extend({
                        apiUrl: '',
                        playlistAssetTypeValue: 'playlist',
                        applicationName: 'Playlist Editor',
                        version: manifest.version,
                        containerCallback: function (module) {

                        },
                        show: function () { },
                        target: null,
                        previewTarget: null,
                        thumbnailTarget: null,
                        regionId: null
                    }, options)
                };
                $this.data('insmPlaylistEditor', _plugin);

                if (!_plugin.settings.regionId) {
                    _plugin.settings.regionId = $.insmFramework('getUser').regionTree.id;
                }
            }

            return $this;
        },
        isInitialized: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            if (_plugin) {
                return true;
            }
            else {
                return false;
            }
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview playlistEditor').html(
                $('<h2 />').text('Playlist Editor')
            );

            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

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
            var _plugin = $this.data('insmPlaylistEditor');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;



            // Init HTML
            _plugin.settings.target.addClass('playlistEditor container').fadeIn();
            if (!_plugin.settings.regionId) {
                _plugin.settings.target.append(
                    $('<div class="single-message" />').append(
                        $('<h2 />').text('Unsufficient access'),
                        $('<p />').text('Sorry, but you don\'t have permission to a region and can therefore not use the Playlist Editor.')
                    )
                );

                return;
            }

            _plugin.settings.target.empty().append(
                _plugin.htmlElements.fullscreen.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    ),
                _plugin.htmlElements.regionPicker.container,
                _plugin.htmlElements.fullscreen.leftColumn.append(
                    _plugin.htmlElements.playlists.controls.addClass('controls').append(
                        _plugin.htmlElements.regionPicker.button.addClass('toggleRegionPicker show').text('Choose region')
                    ),
                    _plugin.htmlElements.fullscreen.playlists,
                    _plugin.htmlElements.fullscreen.playlistAddContainer.append(
                        _plugin.htmlElements.fullscreen.input.addNewInputName,
                        _plugin.htmlElements.fullscreen.input.addNewButton.text('Add').addClass('add')
                    ).addClass('addNewPlaylist')
                ),
                _plugin.htmlElements.fullscreen.rightColumn.append(
                    _plugin.htmlElements.fullscreen.assetManager,
                    _plugin.htmlElements.assetControls.container.addClass('assetControls').append(
                        _plugin.htmlElements.assetControls.remove.text('Remove'),
                        _plugin.htmlElements.assetControls.edit.text('Edit'),
                        _plugin.htmlElements.assetControls.label
                    ),
                    _plugin.htmlElements.selectedPlaylist.container.addClass('playlistContainer').append(
                        _plugin.htmlElements.selectedPlaylist.header.addClass('header').append(
                            _plugin.htmlElements.selectedPlaylist.controls.container.addClass('controls').append(
                                _plugin.htmlElements.selectedPlaylist.controls.remove.text('Delete'),
                                _plugin.htmlElements.selectedPlaylist.controls.save.text('Save')
                            ),
                            _plugin.htmlElements.selectedPlaylist.title,
                            _plugin.htmlElements.selectedPlaylist.information.addClass('information')
                        ),
                        _plugin.htmlElements.selectedPlaylist.items.addClass('playlistItems l-grid-row')
                    )
                )
            );
            
            // Append the region picker button to the asset manager controls element

            // Add new playlist
            _plugin.htmlElements.fullscreen.input.addNewInputName.insmInput({
                type: 'string',
                value: '',
                disabled: false,
                required: true,
                validate: function () {
                    var regex = /^[a-zA-Z0-9]+$/;
                    var val = value;
                    if (regex.test(val)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }).insmInput('edit');

            _plugin.htmlElements.fullscreen.input.addNewButton.click(function () {
                // Validate name
                var validatePlaylistName = _plugin.htmlElements.fullscreen.input.addNewInputName.insmInput('validate');

                // Get value
                var playlistNameInput = _plugin.htmlElements.fullscreen.input.addNewInputName.insmInput('getValue');
                if (validatePlaylistName) {
                    _plugin.htmlElements.fullscreen.input.addNewInputName.addClass('disabled');
                    var asset = {
                        template: 'List',
                        type: 'dataset',
                        defaultContent: false,
                        playUntilFinished: true,
                        state: 'Available',
                        schedule: [],
                        weight: 1,
                        assetType: {
                            type: 'string',
                            value: 'playlist'
                        },
                        name: playlistNameInput,
                        content: {
                            name: $.insmUtilities('generateGuid'),
                            type: 'dataset'
                        }
                    };
                    $.insmServiceAsset('save', {
                        asset: asset,
                        success: function () {
                            _plugin.htmlElements.fullscreen.input.addNewInputName.insmInput('empty').removeClass('disabled');
                        },
                        regionId: _plugin.settings.regionId
                    });
                }
            });

            
            // Asset Controls init listeners
            _plugin.htmlElements.assetControls.container.hide();
            _plugin.htmlElements.assetControls.edit.click(function () {
                $.each(_plugin.data.currentPlaylist.items, function (index, item) {
                    if (index == _plugin.data.selectedAssetIndex) {
                        _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('showAsset', {
                            assetId: item.id
                        });
                        return;
                    }
                });

                
            });

            _plugin.htmlElements.assetControls.remove.click(function () {
                _plugin.data.currentPlaylist.items.splice(_plugin.data.selectedAssetIndex, 1);
                _plugin.data.selectedAssetIndex = 0;
                if (_plugin.htmlElements.assetControls.container.is(':visible')) {
                    _plugin.htmlElements.assetControls.container.stop(true).slideToggle();
                }
                $this.insmPlaylistEditor('onPlaylistUpdate');
            });

            // Delete selected playlist
            _plugin.htmlElements.selectedPlaylist.controls.remove.click(function () {
                $.insmDialog({
                    type: 'confirm',
                    accept: function () {
                        var def = $.Deferred();

                        $.insmServiceAsset('delete', {
                            asset: {
                                id: _plugin.data.currentPlaylist.object.id,
                            },
                            success: function () {
                                def.resolve();
                                _plugin.data.currentPlaylist = {
                                    name: '',
                                    items: []
                                };
                                $this.insmPlaylistEditor('deselectPlaylist');
                            }
                        });

                        return def;
                    },
                    title: 'Delete playlist',
                    message: 'Are you sure?'
                });
            });

            // Save selected playlist
            _plugin.htmlElements.selectedPlaylist.controls.save.click(function () {
                _plugin.htmlElements.selectedPlaylist.controls.save.attr('disabled', 'disabled');
                _plugin.htmlElements.selectedPlaylist.controls.remove.attr('disabled', 'disabled');

                // Remove old items
                $.each(_plugin.data.currentPlaylist.object.content.children, function (index, item) {
                    if (parseInt(index) > 0) {
                        delete _plugin.data.currentPlaylist.object.content.children[index]
                    }
                });

                // Add new items
                $.each(_plugin.data.currentPlaylist.items, function (index, item) {
                    var itemCopy = $.extend({}, item);
                    delete itemCopy._index;
                    _plugin.data.currentPlaylist.object.content.children[item._index] = {
                        id: itemCopy.id,
                        type: itemCopy.type
                    };
                });

                $.insmServiceAsset('save', {
                    asset: _plugin.data.currentPlaylist.object,
                    success: function () {
                        _plugin.htmlElements.selectedPlaylist.controls.save.removeAttr('disabled');
                        _plugin.htmlElements.selectedPlaylist.controls.remove.removeAttr('disabled');
                    }
                });
            });

            // Make playlist items sortable
            _plugin.htmlElements.selectedPlaylist.items.sortable({
                update: function (event, ui) {
                    var newOrder = {};
                    var i = 1;
                    var assets = _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('getAssets');

                    $.each(_plugin.htmlElements.selectedPlaylist.items.children(), function (index, thumbnail) {
                        newOrder[i] = $(thumbnail).data('itemId');
                        i++;
                    });

                    var newContent = [];
                    
                    $.each(newOrder, function (index, itemId) {
                        $.each(_plugin.data.currentPlaylist.items, function (index2, item) {
                            if (itemId == item.id) {
                                item._index = index;
                                newContent.push($.extend({}, item));
                                return false;
                            }
                        });
                    });

                    newContent.sort(function (a, b) {
                        if(a._index < b._index) {
                            return -1;
                        }
                        if (a._index > b._index) {
                            return 1;
                        }
                        return 0;
                    });

                    _plugin.data.currentPlaylist.items = newContent;
                }
            });

            // Define columns
            _plugin.htmlElements.fullscreen.leftColumn.addClass('leftColumn');
            _plugin.htmlElements.fullscreen.rightColumn.addClass('rightColumn');
            
            // Define region picker
            var showTree = false;
            _plugin.htmlElements.regionPicker.button.text('Choose Region').click(function () {
                showTree = !showTree;
                if (showTree) {
                    _plugin.htmlElements.regionPicker.button.text('Hide Region Tree').removeClass('show').addClass('hide');
                    var regionPickerWidth = _plugin.htmlElements.regionPicker.container.width();
                    var rightColumnWidth = _plugin.htmlElements.fullscreen.rightColumn.width();
                    var leftColumnWidth = _plugin.htmlElements.fullscreen.leftColumn.width();
                    var targetWidth = _plugin.settings.target.width();
                    
                    _plugin.htmlElements.fullscreen.rightColumn.animate({
                        width: parseInt(targetWidth - leftColumnWidth - regionPickerWidth) + 'px'
                    });

                    _plugin.htmlElements.regionPicker.container.switchClass('', 'expanded', function () {
                        $this.insmPlaylistEditor('resize');
                        _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('resize');
                    });

                    if (!_plugin.htmlElements.regionPicker.container.insmRegionPicker('isInitialized')) {
                        _plugin.htmlElements.regionPicker.container.insmRegionPicker({
                            selectedRegionId: _plugin.settings.regionId,
                            applicationName: _plugin.settings.applicationName,
                            onSelect: function (region) {
                                _plugin.settings.regionId = region.id;
                                $this.insmPlaylistEditor('deselectPlaylist');
                                $this.insmPlaylistEditor('render');
                            }
                        });
                    }
                }
                else {
                    _plugin.htmlElements.regionPicker.button.text('Show Region Tree').removeClass('hide').addClass('show');

                    var rightColumnWidth = _plugin.htmlElements.fullscreen.rightColumn.width();
                    var leftColumnWidth = _plugin.htmlElements.fullscreen.leftColumn.width();
                    var targetWidth = _plugin.settings.target.width();

                    _plugin.htmlElements.fullscreen.rightColumn.animate({
                        width: parseInt(targetWidth - leftColumnWidth) + 'px'
                    });

                    _plugin.htmlElements.regionPicker.container.switchClass('expanded', '', function () {
                        $this.insmPlaylistEditor('resize');
                        _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('resize');
                    });

                    _plugin.htmlElements.regionPicker.container.insmRegionPicker('stopSubscriptions');
                }
            });

            _plugin.htmlElements.regionPicker.container.addClass('regionPicker');

            // Define controls
            _plugin.htmlElements.fullscreen.controls.container.addClass('controls');
                        
            // Define playlist
            _plugin.htmlElements.selectedPlaylist.container.droppable({
                drop: function (event, ui) {
                    if ($(ui.helper).data('origin') == 'itemGrid' && typeof _plugin.data.currentPlaylist.object === 'object' && !$.isEmptyObject(_plugin.data.currentPlaylist.object)) {
                        var assetId = $(ui.helper).data('itemId');

                        if (!assetId) {
                            throw new Error('UI Helper missing parameter assetId');
                        }
                        var assets = _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('getAssets');

                        var asset = assets[assetId];

                        
                        asset._index = _plugin.data.currentPlaylist.items.length+1;

                        _plugin.data.currentPlaylist.items.push($.extend({}, asset));
                        $this.insmPlaylistEditor('onPlaylistUpdate');
                    }
                }
            });
            
            // Define playlists
            _plugin.htmlElements.fullscreen.playlists.addClass('playlists').insmTable({
                limit: 100,
                pagination: false,
                headers: {
                    Playlists: {
                        key: 'name',
                        sort: 'string'
                    }
                },
                searchIndex: function (playlist) {
                    var searchArray = [];
                    $.merge(searchArray, playlist.name.split(' '));
                    return searchArray;
                },
                onSelect: function (playlist) {
                    _plugin.data.currentPlaylist.object = $.extend(true, {}, playlist);
                    $this.insmPlaylistEditor('onSelectPlaylist');
                }
            });

            // Render playlist select area
            $this.insmPlaylistEditor('render');
                        
            $this.insmPlaylistEditor('resize');
            _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('resize');

            return _plugin.settings.target;
        },
        addItem: function (item) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');
            // Add item to _plugin.data.currentPlaylist.items
            // Update _plugin.data.currentPlaylist.items
            // Call onPlaylistUpdate
            return $this;
        },
        removeItem: function (item) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');
            // Remove item from _plugin.data.currentPlaylist.items
            // Update _plugin.data.currentPlaylist.items
            // Call onPlaylistUpdate
            return $this;
        },
        deselectPlaylist: function() {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            _plugin.htmlElements.selectedPlaylist.title.text('No playlist selected');
            _plugin.htmlElements.selectedPlaylist.items.html(
                $('<span />').text('Please select or add a new playlist to the left')
            );
            _plugin.htmlElements.selectedPlaylist.controls.container.hide();
            
            return $this;
        },
        onSelectPlaylist: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            // Hide asset controls and deselect selected asset
            if (_plugin.htmlElements.assetControls.container.is(':visible')) {
                _plugin.data.selectedAssetIndex = 0;
                _plugin.htmlElements.assetControls.container.stop(true).slideToggle();
            }
            _plugin.htmlElements.selectedPlaylist.controls.container.show();
            
            _plugin.data.currentPlaylist.items = [];

            // Populate currentPlaylist
            $.each(_plugin.data.currentPlaylist.object.content.children, function (index, item) {
                if (parseInt(index) > 0) {
                    item._index = parseInt(index);
                    _plugin.data.currentPlaylist.items.push(item);
                }
            });

            $this.insmPlaylistEditor('updatePlaylistInformation');

            // Call onPlaylistUpdate
            $this.insmPlaylistEditor('onPlaylistUpdate');

            return $this;
        },
        updatePlaylistInformation: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            // Reset currentPlaylist info
            $.extend(_plugin.data.currentPlaylist, {
                information: {
                    title: _plugin.data.currentPlaylist.object.name,
                    totalDuration: 0,
                    numberOfItems: 0
                }
            });

            $.each(_plugin.data.currentPlaylist.items, function (index, item) {
                _plugin.data.currentPlaylist.information.numberOfItems++;

                // This should be handled differently if items have playUntilFinished set to true. Also some templates have a duration but maybe we don't know it.
                _plugin.data.currentPlaylist.information.totalDuration += parseInt(item.duration.value);
            });

            // Playlist info and controls
            _plugin.htmlElements.selectedPlaylist.title.text(_plugin.data.currentPlaylist.information.title);
            _plugin.htmlElements.selectedPlaylist.information.empty().append(
                $('<span />').text('(' + _plugin.data.currentPlaylist.information.numberOfItems + ' item' + (_plugin.data.currentPlaylist.information.numberOfItems > 1 ? 's' : '') + ')'),
                $('<span />').text('Total playing time: ' + _plugin.data.currentPlaylist.information.totalDuration + ' sec')
            );

            _plugin.data.currentPlaylist.items.sort(function (a, b) {
                if (a._index < b._index) {
                    return -1;
                }
                if (a._index > b._index) {
                    return 1;
                }
                return 0;
            });

            return $this;
        },
        displayAssetControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            var selectedAsset = _plugin.data.currentPlaylist.items[_plugin.data.selectedAssetIndex];
            _plugin.htmlElements.assetControls.label.text(selectedAsset.name);

            if (_plugin.htmlElements.assetControls.container.is(':animated') || !_plugin.htmlElements.assetControls.container.is(':visible')) {
                _plugin.htmlElements.assetControls.container.slideDown();
            }

            return $this;
        },
        onPlaylistUpdate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');
            
            // Render playlist
            _plugin.htmlElements.selectedPlaylist.items.empty();

            $this.insmPlaylistEditor('updatePlaylistInformation');

            // Current playlist items are in _plugin.data.currentPlaylist.items
            $.each(_plugin.data.currentPlaylist.items, function (index, item) {
                item._index = index + 1;
                var isSelected = false;
                if(item._thumbnail && item._thumbnail.hasClass('is-selected')) {
                    isSelected = true;
                }
                //if (!item._thumbnail) {
                    item._thumbnail = $this.insmAssetNew('getThumbnail', {
                        onClick: function () {
                            _plugin.data.selectedAssetIndex = item._index-1;
                            $this.insmPlaylistEditor('displayAssetControls');

                            _plugin.htmlElements.selectedPlaylist.items.children().removeClass('is-selected');
                            item._thumbnail.addClass('is-selected');
                        },
                        asset: item
                    }).data('itemId', item.id).addClass('asset-thumbnail');
                    if(isSelected) {
                        item._thumbnail.addClass('is-selected');
                    }

                    $this.insmAssetManager('generateEndDateTooltip', {
                        container: item._thumbnail,
                        asset: item
                    });

                    $this.insmAssetManager('generateStartDateTooltip', {
                        container: item._thumbnail,
                        asset: item
                    });
                //}

                _plugin.htmlElements.selectedPlaylist.items.append(item._thumbnail);
            });


            return $this;
        },
        hasSettings: function () {
            return false;
        },
        updatePlaylist: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            _plugin.data.playlists[options.playlist.id] = $.extend(true, {}, options.playlist);

            return $this;
        },
        render: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            // Define asset manager

            _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('destroy');

            // Has to have the timeout because otherwise it unregisters on the service again. No idea why...
            setTimeout(function () {
                _plugin.htmlElements.fullscreen.assetManager.insmAssetManager({
                    applicationName: _plugin.settings.applicationName + ' & Asset Manager',
                    target: _plugin.htmlElements.fullscreen.assetManager,
                    regionId: _plugin.settings.regionId,
                    header: false
                });
                _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('fullscreen');
                _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('showGrid');
            }, 0);

            _plugin.data.playlists = {};
            _plugin.htmlElements.fullscreen.playlists.insmTable('empty');

            $this.insmPlaylistEditor('deselectPlaylist');

            $this.insmPlaylistEditor('setSubscriptions', {
                view: 'playlist'
            });

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            switch (options.view.toLowerCase()) {
                case "playlist":
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'asset',
                            local: true,
                            regionId: _plugin.settings.regionId,
                            update: function (assets) {
                                var playlistsToBeUpdated = {};
                                $.each(assets, function (index, asset) {
                                    if (asset.template.value == 'List' && asset.assetType.value == _plugin.settings.playlistAssetTypeValue) {
                                        if (_plugin.data.playlists[asset.id]) {
                                            if (!_.isEqual(_plugin.data.playlists[asset.id], asset)) {
                                                playlistsToBeUpdated[asset.id] = asset;
                                            }
                                        }
                                        else {
                                            playlistsToBeUpdated[asset.id] = asset;
                                        }
                                    }
                                });

                                $.each(playlistsToBeUpdated, function (id, playlist) {
                                    $this.insmPlaylistEditor('updatePlaylist', {
                                        playlist: playlist
                                    });
                                });

                                _plugin.htmlElements.fullscreen.playlists.insmTable('update', {
                                    items: $.extend(true, {}, playlistsToBeUpdated)
                                });

                                $this.insmPlaylistEditor('resize');
                            },
                            remove: function (playlistId) {
                                if (_plugin.data.playlists[playlistId]) {
                                    _plugin.htmlElements.fullscreen.playlists.insmTable('remove', {
                                        id: playlistId
                                    });
                                }
                            }
                        });
                    }

                    $this.insmPlaylistEditor('stopSubscriptions');
                    $this.insmPlaylistEditor('startSubscriptions');

                    var regionId = _plugin.settings.regionId;

                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'asset',
                            local: true,
                            regionId: regionId
                        });
                        _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('stopSubscriptions');
                    }

                    break;
                case "asset":
                    
                    break;
            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            if (_plugin) {
                _plugin.subscriptions.stop();
            }

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');
            if (_plugin) {
                var container = _plugin.settings.target.insmUtilities('size');

                var header = _plugin.htmlElements.fullscreen.header.insmUtilities('size', { actualSize: true });
                var regionPicker = _plugin.htmlElements.regionPicker.container.insmUtilities('size', { actualSize: true });
                var controls = _plugin.htmlElements.fullscreen.controls.container.insmUtilities('size', { actualSize: true });
                var playlist = _plugin.htmlElements.selectedPlaylist.container.insmUtilities('size', { actualSize: true });
                var playlists = _plugin.htmlElements.fullscreen.playlists.insmUtilities('size', { actualSize: true });

                var leftColumn = _plugin.htmlElements.fullscreen.leftColumn.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.fullscreen.leftColumn.css({
                    height: parseInt(container.height - header.height) + 'px'
                });

                _plugin.htmlElements.regionPicker.container.css({
                    height: parseInt(container.height - header.height) + 'px'
                });

                _plugin.htmlElements.fullscreen.rightColumn.css({
                    height: parseInt(container.height - header.height) + 'px',
                    width: parseInt(container.width - leftColumn.width - regionPicker.width) + 'px'
                });

                var rightColumn = _plugin.htmlElements.fullscreen.rightColumn.insmUtilities('size');

                var assetManager = _plugin.htmlElements.fullscreen.assetManager.insmUtilities('size');
                var assetManagerActual = _plugin.htmlElements.fullscreen.assetManager.insmUtilities('size', { actualSize: true });
                var marginHeight = assetManagerActual.height - assetManager.height;

                

                playlist = _plugin.htmlElements.selectedPlaylist.container.insmUtilities('size');
                var playlistActual = _plugin.htmlElements.selectedPlaylist.container.insmUtilities('size', { actualSize: true });
                var playlistMarginWidth = playlistActual.width - playlist.width;
                _plugin.htmlElements.selectedPlaylist.container.css({
                    width: assetManagerActual.width - playlistMarginWidth + 'px'
                });

                _plugin.htmlElements.fullscreen.assetManager.css({
                    height: parseInt(rightColumn.height - controls.height - playlistActual.height - marginHeight) + 'px'
                });

                _plugin.htmlElements.fullscreen.playlists.css({
                    height: leftColumn.height - controls.height +'px'
                });

                _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('resize');
            }

            return $this;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            $this.insmPlaylistEditor('stopSubscriptions');
            
            $this.data('insmPlaylistEditor', null).empty();

            return $this;
        }
    };

    $.fn.insmPlaylistEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlaylistEditor');
        }
    };

    //$.insmPlaylistEditor = function (method) {
    //    return $('html').insmPlaylistEditor(arguments);
    //};
})(jQuery);