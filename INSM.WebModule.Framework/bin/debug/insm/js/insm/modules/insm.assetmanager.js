/*
* INSM Asset Manager
* This file contain the INSM Asset Manager function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmAssetManager(settings);
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
            var _plugin = $this.data('insmAssetManager');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        regionId: null,
                        mediaDirectoryName: 'Media',
                        templateDirectoryName: 'Template',
                        showRegionPicker: true,
                        apiUrl: '',
                        applicationName: 'Asset Manager',
                        version: manifest.version,
                        containerCallback: function (module) {
                        },
                        header: true,
                        show: function () { },
                        target: null,
                        previewTarget: null,
                        thumbnailTarget: null,
                        hideFilters: false,
                        assetTags: [],
                        externalFilter: function() { return true },
                        templateAllocation: function (asset) {
                            var template = '';
                            if (typeof asset.template.value === 'string' && asset.template.value) {
                                template = asset.template.value;
                            }
                            else {
                                template = 'Templates';
                            }
                            return template;
                        }
                    }, options),
                    htmlElements: {
                        regionPicker: {
                            container: $('<div />'),
                            button: $('<a />')
                        },
                        module: {
                            container: $('<div />')
                        },
                        assetManager: $('<div />'),
                        fileBrowser: $('<div />'),
                        header: $('<div />'),
                        controls: {
                            search: $('<div />'),
                            container: $('<div />'),
                            asset: {
                                back: $('<button />'),
                                edit: $('<button />'),
                                cancel: $('<button />'),
                                save: $('<button />'),
                                remove: $('<button />')
                            },
                            newAsset: {
                                save: $('<button />'),
                                cancel: $('<button />')
                            },
                            cancel: $('<button />'),
                            add: $('<button />'),
                            filter: {
                                title: '<span class="filterTitle">Filter by:</span>',
                                container: $('<div class="filterContainer" />'),
                                dropdownElements: {
                                    categories: {
                                        title: '<span>Category</span>',
                                        currentOption: null,
                                        defaultOption: null,
                                        selectElem: null,
                                        options: { }
                                    },
                                    defaultContent: {
                                        title: '<span>DefaultContent</span>',
                                        currentOption: null,
                                        defaultOption: 'all',
                                        options: {
                                            all: {
                                                displayName: 'All',
                                                filterFunction: function (file) {
                                                    return true;
                                                }
                                            },
                                            defaultContent: {
                                                displayName: 'Yes',
                                                filterFunction: function (asset) {
                                                    var result = false;
                                                    if (asset.defaultContent && typeof asset.defaultContent.value === 'boolean') {
                                                        result = asset.defaultContent.value;
                                                    }
                                                    return result;
                                                }
                                            },
                                            notDefaultContent: {
                                                displayName: 'No',
                                                filterFunction: function (asset) {
                                                    var result = false;
                                                    if (asset.defaultContent && typeof asset.defaultContent.value === 'boolean') {
                                                        result = asset.defaultContent.value;
                                                    }
                                                    return !result;
                                                }
                                            }
                                        }
                                    },
                                    state: {
                                        title: '<span>State</span>',
                                        currentOption: 'available',
                                        defaultOption: 'available',
                                        options: {
                                            available: {
                                                displayName: 'Available',
                                                filterFunction: function (asset) {
                                                    var expired = false;
                                                    if (asset.schedule) {
                                                        var lastAvailableDate = null;
                                                        $.each(asset.schedule, function (index, interval) {
                                                            if (interval.Date) {
                                                                if (interval.Date.end) {
                                                                    lastAvailableDate = interval.Date.end;
                                                                }
                                                            }
                                                        });
                                                        if (lastAvailableDate != null) {
                                                            var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                                                            var endDate = parseInt($.datepicker.formatDate('yymmdd', new Date(lastAvailableDate)));
                                                            // Do comparison
                                                            if (endDate < today) {
                                                                expired = true;
                                                            }
                                                        }
                                                    }
                                                    if (!expired && asset.state == 'Available') {
                                                        return true;
                                                    }
                                                    return false;
                                                }
                                            },
                                            unavailable: {
                                                displayName: 'Unavailable',
                                                filterFunction: function (asset) {
                                                    var expired = false;
                                                    if (asset.schedule) {
                                                        var lastAvailableDate = null;
                                                        $.each(asset.schedule, function (index, interval) {
                                                            if (interval.Date) {
                                                                if (interval.Date.end) {
                                                                    lastAvailableDate = interval.Date.end;
                                                                }
                                                            }
                                                        });
                                                        if (lastAvailableDate != null) {
                                                            var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                                                            var endDate = parseInt($.datepicker.formatDate('yymmdd', new Date(lastAvailableDate)));
                                                            // Do comparison
                                                            if (endDate < today) {
                                                                expired = true;
                                                            }
                                                        }
                                                    }
                                                    if (!expired && asset.state == 'Unavailable') {
                                                        return true;
                                                    }
                                                    return false;
                                                }
                                            },
                                            expired: {
                                                displayName: 'Expired',
                                                filterFunction: function (asset) {
                                                    var expired = false;
                                                    if (asset.schedule) {
                                                        var lastAvailableDate = null;
                                                        $.each(asset.schedule, function (index, interval) {
                                                            if (interval.Date) {
                                                                if (interval.Date.end) {
                                                                    lastAvailableDate = interval.Date.end;
                                                                }
                                                            }
                                                        });
                                                        if (lastAvailableDate != null) {
                                                            var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                                                            var endDate = parseInt($.datepicker.formatDate('yymmdd', new Date(lastAvailableDate)));
                                                            // Do comparison
                                                            if (endDate < today) {
                                                                expired = true;
                                                            }
                                                        }
                                                    }
                                                    return expired;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        views: {
                            grid: {
                                container: $('<div />'),
                                thumbnails: $('<div />')
                            },
                            asset: {
                                container: $('<div />'),
                                details: $('<div />')
                            }
                        }
                    },
                    data: {
                        fullscreenInitialized: false,
                        assets: {},
                        currentAssets: {},
                        playerUpdateListeners: [],
                        assetsToBeUpdated: {},
                        categories: {},
                        searchstring: '',
                        selectedAsset: {
                            id: null
                        },
                        filterFunction: function () {
                            return true;
                        },
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
                $this.data('insmAssetManager', _plugin);
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
            var _plugin = $this.data('insmAssetManager');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview assetManager');

            
            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });
            
            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Asset Manager')
            );
            
            return _plugin.settings.previewTarget;
        },
        updateFilterByCategory: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            // Set references to category filter dropdown
            var dropdown = _plugin.htmlElements.controls.filter.dropdownElements['categories'];
            var selectedCategory = dropdown.currentOption;

            var selectedIndex = 0;

            if (selectedCategory) {
                dropdown.selectElem.eq(0).val(selectedCategory);
            }

            if (dropdown) {
                // Empty dropdown of elements
                dropdown.selectElem.empty();

                // Create new category array for sorting
                var categoryArr = [];
                $.each(_plugin.data.categories, function (key, category) {
                    categoryArr.push(key);
                });
                categoryArr.sort();

                // Create new filter object
                var filterObj = {
                    all: {
                        displayName: 'All',
                        filterFunction: function (file) {
                            return true;
                        }
                    }
                };

                // Set each category filter function to available categories
                $.each(categoryArr, function (key, category) {
                    filterObj[category.toLowerCase()] = {
                        displayName: category,
                        filterFunction: null
                    };

                    // Filter function is based on categories for each file
                    filterObj[category.toLowerCase()].filterFunction = function (asset) {
                        var _category = _plugin.settings.templateAllocation(asset).toLowerCase();
                        if (_category == this.displayName.toLowerCase()) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                });

                // Set filter object to dynamically created object
                dropdown.options = filterObj;

                // Populate filter select element
                $.each(dropdown.options, function (key, option) {
                    dropdown.element = $('<option value="' + key + '"/>').text(option.displayName);
                    dropdown.selectElem.append(dropdown.element);
                });
                
                // Set selected index to currently selected category
                if (selectedCategory) {
                    dropdown.selectElem.eq(0).val(selectedCategory);
                }
            }

            return $this;
        },
        runFilters: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            var filterFunction = null;
            var dropdownOptions = null;
            var isAssetPassed = true;

            $.each(_plugin.htmlElements.controls.filter.dropdownElements, function (name, dropdown) {
                if (typeof dropdown.options == "function") {
                    dropdownOptions = dropdown.options()[dropdown.currentOption];
                }
                else {
                    dropdownOptions = dropdown.options[dropdown.currentOption];
                }

                if (dropdownOptions && !dropdownOptions.filterFunction(options.file)) {
                    isAssetPassed = false;
                    return;
                }
            });

            return isAssetPassed;
        },
        getCategories: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            _plugin.data.categories = {};

            $.each(_plugin.data.assets, function (id, asset) {
                var category = _plugin.settings.templateAllocation(asset);
                if (typeof _plugin.data.categories[category] === 'undefined') {
                    _plugin.data.categories[category] = {
                        name: category
                    }
                }
            });

            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        setVisibleItems: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            _plugin.htmlElements.views.grid.container.insmItemGrid('setVisibleItems');

            return $this;
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;


            // Init HTML
            _plugin.settings.target.addClass('assetManager').fadeIn();
            _plugin.settings.target.empty();


            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }

            if (!_plugin.settings.regionId) {
                _plugin.settings.target.append(
                    $('<div class="single-message" />').append(
                        $('<h2 />').text('Unsufficient access'),
                        $('<p />').text('Sorry, but you don\'t have permission to a region and can therefore not use the Asset Manager.')
                    )
                );

                return;
            }
            
            _plugin.settings.target.append(
                _plugin.htmlElements.regionPicker.container.addClass('regionPicker'),
                _plugin.htmlElements.module.container.addClass('assetManager-container').append(
                    _plugin.htmlElements.controls.container.addClass('controlsContainer').append(
                        _plugin.htmlElements.regionPicker.button,
                        _plugin.htmlElements.controls.asset.back,
                        _plugin.htmlElements.controls.asset.edit,
                        _plugin.htmlElements.controls.asset.cancel,
                        _plugin.htmlElements.controls.asset.save,
                        _plugin.htmlElements.controls.newAsset.cancel,
                        _plugin.htmlElements.controls.newAsset.save,
                        _plugin.htmlElements.controls.add,
                        _plugin.htmlElements.controls.asset.remove
                    ),
                    _plugin.htmlElements.assetManager.append(
                        _plugin.htmlElements.views.grid.container,
                        _plugin.htmlElements.views.asset.container,
                        _plugin.htmlElements.fileBrowser.addClass('file-browser')
                    ).addClass('assetsContainer')
                )
            );

            // Region picker
            var showTree = false;
            _plugin.htmlElements.regionPicker.button.addClass('toggleRegionPicker show').text('Choose Region').click(function () {
                showTree = !showTree;
                if (showTree) {
                    _plugin.htmlElements.regionPicker.button.text('Hide Region Tree').removeClass('show').addClass('hide');
                    _plugin.htmlElements.regionPicker.container.switchClass('', 'expanded', function () {
                        var regionPickerWidth = _plugin.htmlElements.regionPicker.container.width();
                        var containerWidth = _plugin.htmlElements.module.container.width();

                        _plugin.htmlElements.module.container.css({
                            width: parseInt(containerWidth - regionPickerWidth) + 'px',
                            float: 'left'
                        });
                        _plugin.htmlElements.views.grid.container.insmItemGrid('setVisibleItems');
                    });

                    if (!_plugin.htmlElements.regionPicker.container.insmRegionPicker('isInitialized')) {
                        _plugin.htmlElements.regionPicker.container.insmRegionPicker({
                            selectedRegionId: _plugin.settings.regionId,
                            applicationName: _plugin.settings.applicationName,
                            onSelect: function (region) {
                                _plugin.settings.regionId = region.id;
                                $this.insmAssetManager('showGrid');
                            }
                        });
                    }
                }
                else {
                    _plugin.htmlElements.regionPicker.button.text('Show Region Tree').removeClass('hide').addClass('show');
                    _plugin.htmlElements.regionPicker.container.switchClass('expanded', '', function () {
                        _plugin.htmlElements.module.container.css({
                            width: '',
                            float: ''
                        });
                        _plugin.htmlElements.views.grid.container.insmItemGrid('setVisibleItems');
                    });

                    _plugin.htmlElements.regionPicker.container.insmRegionPicker('stopSubscriptions');
                }
            });
            
            // Thumbnails
            _plugin.htmlElements.views.grid.container.insmItemGrid({
                items: _plugin.data.files,
                thumbnailGeneration: function (asset) {
                    var systemInformation = $.insmFramework('getSystemInformation');
                    var thumbnail = $('<div class="assetManager-itemGrid-file" />').append(
                        $('<div />').addClass('image-container').append(
                            $('<img />', {
                                // TODO: implement asset.url.thumbnail
                                src: function () {
                                    switch (asset.template.value) {
                                        case 'Image':
                                            return asset.content.children.Image ? systemInformation.apiUrl + '/Files.aspx?method=getThumbnail&fileid=' + asset.content.children.Image.id + '&session=' + $.insmFramework('getSession') : '';
                                            break;
                                        case 'Movie':
                                            return asset.content.children.Movie ? systemInformation.apiUrl + '/Files.aspx?method=getThumbnail&fileid=' + asset.content.children.Movie.id + '&session=' + $.insmFramework('getSession') : '';
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            })
                        ),
                        $('<h2 />').text(asset.name)
                    );

                    $this.insmAssetManager('generateStartDateTooltip', {
                        asset: asset,
                        container: thumbnail
                    });

                    $this.insmAssetManager('generateEndDateTooltip', {
                        asset: asset,
                        container: thumbnail
                    });

                    return thumbnail;
                },
                onUpdate: function () {
                    if (!_plugin.settings.hideFilters) {
                        $this.insmAssetManager('getCategories');
                        $this.insmAssetManager('updateFilterByCategory');
                    }

                    _plugin.htmlElements.views.grid.container.insmItemGrid('resetVisibleItems');
                    _plugin.htmlElements.views.grid.container.insmItemGrid('setVisibleItems');
                },
                onHighlight: function (thumbnail) {
                    thumbnail.find('h2').insmHighlight();
                    thumbnail.find('.image-container').insmHighlight();
                },
                categoryAllocation: function (asset) {
                    return _plugin.settings.templateAllocation(asset);
                },
                onClick: function (asset) {
                    // Show file #Asset Manager=id:#;
                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName]) {
                        hash[_plugin.settings.applicationName] = {
                            id: asset.id
                        }
                        $.insmHashChange('updateHash', hash);
                    }
                    else {
                        $this.insmAssetManager('showAsset', {
                            assetId: asset.id
                        });
                    }
                }
            });

            // Define Back Button
            _plugin.htmlElements.controls.asset.back.text('Back').click(function () {
                _plugin.htmlElements.views.asset.container.insmAssetNew('destroy');
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName]) {
                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                }
                else {
                    $this.insmAssetManager('showGrid');
                }
            });

            // Define Edit Button
            _plugin.htmlElements.controls.asset.edit.text('Edit').click(function () {
                _plugin.htmlElements.views.asset.container.insmAssetNew('edit');
                _plugin.htmlElements.controls.asset.back.hide();
                _plugin.htmlElements.controls.asset.cancel.fadeIn();
                _plugin.htmlElements.controls.asset.save.fadeIn();
                _plugin.htmlElements.controls.asset.edit.hide();
            });

            // Define Cancel Button
            _plugin.htmlElements.controls.asset.cancel.text('Cancel').click(function () {
                _plugin.htmlElements.views.asset.container.insmAssetNew('view');
                _plugin.htmlElements.controls.asset.save.hide();
                _plugin.htmlElements.controls.asset.edit.fadeIn();
                _plugin.htmlElements.controls.asset.back.fadeIn();
                _plugin.htmlElements.controls.asset.cancel.hide();
            });

            // Define Save Button
            _plugin.htmlElements.controls.asset.save.text('Save').click(function () {
                $this.insmAssetManager('disableControls');
                _plugin.htmlElements.controls.asset.save.text('Saving...');
                _plugin.htmlElements.views.asset.container.insmAssetNew('save', {
                    success: function () {
                        $this.insmAssetManager('enableControls');
                        _plugin.htmlElements.controls.asset.save.hide().text('Save');
                        _plugin.htmlElements.controls.asset.back.fadeIn();
                        _plugin.htmlElements.controls.asset.edit.fadeIn();
                        _plugin.htmlElements.controls.asset.remove.fadeIn();
                        _plugin.htmlElements.views.asset.container.insmAssetNew('view');
                        _plugin.htmlElements.controls.asset.cancel.hide();
                    },
                    fail: function () {
                        $this.insmAssetManager('enableControls');
                        _plugin.htmlElements.controls.asset.save.text('Save');
                    }
                });
            });

            // Define Add Asset Button
            if (_plugin.permissions.region.write) {
                _plugin.htmlElements.controls.add.addClass('add').text('Add asset').click(function () {
                    // No need to update assets in this view
                    $this.insmAssetManager('stopSubscriptions');

                    // Show file #Asset Manager=id:#;
                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName]) {
                        hash[_plugin.settings.applicationName] = {
                            id: 'new'
                        }
                        $.insmHashChange('updateHash', hash);
                    }
                    else {
                        $this.insmAssetManager('showAsset', {
                            assetId: 'new'
                        });
                    }
                });
            }

            // Define Add Asset Cancel Button
            _plugin.htmlElements.controls.newAsset.cancel.text('Cancel').click(function () {
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName]) {
                    _plugin.htmlElements.views.asset.container.insmAssetNew('destroy');
                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                }
                else {
                    $this.insmAssetManager('showGrid');
                }
            });

            // Define Add Asset Save Button
            _plugin.htmlElements.controls.newAsset.save.text('Save').click(function () {
                _plugin.htmlElements.controls.newAsset.save.text('Saving...');

                // Otherwise the grid won't update
                $this.insmAssetManager('stopSubscriptions');

                _plugin.htmlElements.views.asset.container.insmAssetNew('save', {
                    directoryName: _plugin.settings.directoryName,
                    regionId: _plugin.settings.regionId,
                    success: function () {
                        _plugin.htmlElements.controls.newAsset.save.text('Save');
                        var hash = $.insmHashChange('get');
                        if (hash[_plugin.settings.applicationName]) {
                            $.insmHashChange('updateHash', _plugin.settings.applicationName);
                        }
                        else {
                            $this.insmAssetManager('showGrid');
                        }
                    },
                    fail: function () {
                        $this.insmAssetManager('enableControls');
                        _plugin.htmlElements.controls.newAsset.save.text('Save');
                    }
                });
            });

            // Define Remove Asset Button
            _plugin.htmlElements.controls.asset.remove.text('Delete').click(function () {
                $.insmDialog({
                    type: 'confirm',
                    accept: function () {
                        $this.insmAssetManager('stopSubscriptions');
                        var def = $.Deferred();
                        _plugin.htmlElements.views.asset.container.insmAssetNew('delete', {
                            callback: function () {
                                var hash = $.insmHashChange('get');
                                if (hash[_plugin.settings.applicationName]) {
                                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                                }
                                else {
                                    $this.insmAssetManager('showGrid');
                                }
                                def.resolve();
                            }
                        });
                        return def;
                    },
                    title: 'Delete asset',
                    message: 'Are you sure?'
                });
            });

            // Add label to filter container
            _plugin.htmlElements.controls.filter.container.empty().append(
                _plugin.htmlElements.controls.filter.title
            );

            // Add filters
            $.each(_plugin.htmlElements.controls.filter.dropdownElements, function (name, dropdown) {
                var select = $('<select />');
                var title = dropdown.title;

                _plugin.htmlElements.controls.filter.container.append(
                    title
                );

                $.each(dropdown.options, function (key, option) {
                    option.element = $('<option value="' + key + '"/>').text(option.displayName);
                    select.append(option.element);
                });

                if (!dropdown.selectElem) {
                    dropdown.selectElem = select;
                }

                // Set dropdown listener
                select.change(function () {
                    // Selected value
                    _plugin.htmlElements.controls.filter.dropdownElements[name].currentOption = this.value;

                    $this.insmAssetManager('filterAndUpdateGrid');

                    return;
                });

                _plugin.htmlElements.controls.filter.container.append(
                    select
                );
            });
            
            _plugin.htmlElements.controls.filter.container.append(
                _plugin.htmlElements.controls.search.empty().addClass('searchfield-container').insmSearchField({
                    onSearch: function (searchstring) {
                        _plugin.data.searchstring = searchstring;
                        $this.insmAssetManager('filterAndUpdateGrid');
                    }
                })
            );

            _plugin.htmlElements.controls.container.append(
                _plugin.htmlElements.controls.filter.container
            );

            // TODO: Why is it necessary?
            _plugin.htmlElements.controls.filter.container.css({ 'display': 'inline' });

            // Show default view
            _plugin.htmlElements.controls.asset.back.hide();
            _plugin.htmlElements.controls.asset.edit.hide();
            _plugin.htmlElements.controls.asset.cancel.hide();
            _plugin.htmlElements.controls.asset.save.hide();
            _plugin.htmlElements.controls.newAsset.save.hide();
            _plugin.htmlElements.controls.newAsset.cancel.hide();

            _plugin.htmlElements.controls.add.fadeIn();
            
            // Hash listener
            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (hash) {
                    var assetManager = hash[_plugin.settings.applicationName];
                    if (assetManager) {
                        if (assetManager.id) {
                            $this.insmAssetManager('showAsset', {
                                assetId: assetManager.id
                            });
                        }
                        else {
                            $this.insmAssetManager('showGrid');
                        }
                    }
                }
            });

            $this.insmAssetManager('resize');

            return _plugin.settings.target;
        },
        generateStartDateTooltip: function (options) {
            var startDateToCompare;

            if (options.asset.schedule && options.asset.schedule.length > 0 && options.asset.schedule[0].Date) {
                startDateToCompare = options.asset.schedule[0].Date.start;
            }

            if (startDateToCompare && startDateToCompare.length > 0) {
                var compare = $.insmUtilities('getDifferenceDateAndToday', startDateToCompare);
                if (compare.diff > 0) {
                    var dateStr = compare.diff + compare.prefix;
                    options.container.append(
                        $('<div />').addClass('remainingTimePlayStart').text(dateStr).insmTooltip({
                            container: $('.assetManager .container'),
                            fixedPosition: 'above',
                            text: 'The start date of playout is<br/><strong>' + startDateToCompare + '</strong>'
                        })
                    );
                }
            }
        },
        generateEndDateTooltip: function (options) {
            var endDateToCompare;

            if (options.asset.schedule && options.asset.schedule.length > 0 && options.asset.schedule[0].Date) {
                endDateToCompare = options.asset.schedule[0].Date.end;
            }

            if (endDateToCompare && endDateToCompare.length > 0) {
                var compare = $.insmUtilities('getDifferenceDateAndToday', endDateToCompare);
                if (compare.diff > 0) {
                    var dateStr = compare.diff + compare.prefix;
                    options.container.append(
                        $('<div />').addClass('remainingTimePlayEnd').text(dateStr).insmTooltip({
                            container: $('.assetManager .container'),
                            fixedPosition: 'above',
                            text: 'The end date of playout is<br/><strong>' + endDateToCompare + '</strong>'
                        })
                    );
                }
            }
        },
        filterAndUpdateGrid: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            var assetIdsToShow = [];
          
            $.each(_plugin.data.assets, function (id, asset) {
                var showAsset = true;
                // Run the external filter
                if (!_plugin.settings.externalFilter(asset)) {
                    showAsset = false;
                }

                if (showAsset) {
                    // Run each dropdown filter
                    var elemOptions = null;
                    $.each(_plugin.htmlElements.controls.filter.dropdownElements, function (name, dropdown) {
                        elemOptions = dropdown.options[dropdown.currentOption];

                        if (elemOptions && !elemOptions.filterFunction(asset)) {
                            showAsset = false;
                            return;
                        }
                    });
                }

                if (showAsset) {
                    // Run search filter
                    if (asset.name.toLowerCase().indexOf(_plugin.data.searchstring.toLowerCase()) === -1) {
                        showAsset = false;
                    }
                }

                if (showAsset) {
                    assetIdsToShow.push(id);
                }
            });

            // Compare assetIdsToShow with _plugin.data.currentAssets and update itemGrid
            $.each(_plugin.data.currentAssets, function (id, asset) {
                var index = assetIdsToShow.indexOf(id);
                if (index === -1) {
                    // Remove from grid
                    _plugin.htmlElements.views.grid.container.insmItemGrid('remove', {
                        itemId: id
                    });
                    delete _plugin.data.currentAssets[id];
                }
                else {
                    // It's already in the grid and maybe we should update it
                    $.each(_plugin.data.assets[id], function (property, value) {
                        if (!_.isEqual(_plugin.data.currentAssets[id][property], _plugin.data.assets[id][property])) {
                            
                            $.extend(_plugin.data.currentAssets[id], _plugin.data.assets[id]);

                            var items = {};
                            items[id] = _plugin.data.assets[id];
                            _plugin.htmlElements.views.grid.container.insmItemGrid('update', {
                                items: items
                            });
                            return false;
                        }
                    });
                    assetIdsToShow.splice(index, 1);
                }
            });


            // The rest should be added
            var assetsToBeAdded = {};
            $.each(assetIdsToShow, function (index, assetId) {
                assetsToBeAdded[assetId] = _plugin.data.assets[assetId];
                _plugin.data.currentAssets[assetId] = _plugin.data.assets[assetId];
            });

            _plugin.htmlElements.views.grid.container.insmItemGrid('update', {
                items: assetsToBeAdded
            });

            return $this;
        },
        showGrid: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            // Show correct controls
            $this.insmAssetManager('hideControls');

            if (_plugin.permissions.region.write) {
                _plugin.htmlElements.controls.add.fadeIn();
            }

            if (_plugin.settings.showRegionPicker) {
                _plugin.htmlElements.regionPicker.button.fadeIn();
            }

            _plugin.htmlElements.views.asset.container.hide();
            _plugin.htmlElements.views.grid.container.fadeIn();
            _plugin.htmlElements.controls.filter.container.fadeIn();

            $this.insmAssetManager('setSubscriptions', {
                view: 'grid'
            });

            return $this;
        },
        showAsset: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');
            
            // Show correct controls
            $this.insmAssetManager('hideControls');

            _plugin.data.selectedAsset = {
                id: options.assetId
            };

            // Controls
            if (options.assetId == 'new') {
                // Should be in edit mode directly
                _plugin.htmlElements.controls.newAsset.save.fadeIn();
                _plugin.htmlElements.controls.newAsset.cancel.fadeIn();
            }
            else {
                _plugin.htmlElements.controls.asset.back.fadeIn();
                $this.insmAssetManager('setSubscriptions', {
                    view: 'asset'
                });
                if (_plugin.permissions.region.write) {
                    _plugin.htmlElements.controls.asset.edit.fadeIn();
                    _plugin.htmlElements.controls.asset.remove.fadeIn();
                }
            }
            // Show the asset details
            _plugin.htmlElements.views.grid.container.hide();
            
            _plugin.htmlElements.views.asset.container.fadeIn().insmAssetNew('destroy').insmAssetNew({
                asset: {
                    id: _plugin.data.selectedAsset.id
                },
                regionId: _plugin.settings.regionId,
                mediaDirectoryName: _plugin.settings.mediaDirectoryName,
                templateDirectoryName: _plugin.settings.templateDirectoryName,
                fileBrowser: _plugin.htmlElements.fileBrowser,
                onOpenCallback: function () {
                    _plugin.htmlElements.controls.container.hide();
                    //_plugin.htmlElements.views.grid.container.hide();
                },
                onBackCallback: function () {
                    _plugin.htmlElements.controls.container.show();
                    //_plugin.htmlElements.views.grid.container.show();
                },
                onSelectCallback: function () {
                    _plugin.htmlElements.controls.container.show();
                    //_plugin.htmlElements.views.grid.container.show();
                },
                onStopSubscriptionsCallback: function () {
                    _plugin.htmlElements.controls.container.show();
                }
            });

            return $this;
        },
        hideControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            _plugin.htmlElements.controls.container.children().css('opacity', 1).hide();

            return $this;
        },
        disableControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            _plugin.htmlElements.controls.container.children().attr('disabled', 'disabled');

            return $this;
        },
        enableControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            _plugin.htmlElements.controls.container.children().removeAttr('disabled');

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');
            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                var regionPicker = _plugin.htmlElements.regionPicker.container.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.module.container.css({
                    width: parseInt(target.width - regionPicker.width) + 'px'
                });

                var controls = _plugin.htmlElements.controls.container.insmUtilities('size', { actualSize: true });
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });


                

                _plugin.htmlElements.assetManager.css({
                    height: parseInt(target.height - controls.height - header.height) + 'px'
                });

                _plugin.htmlElements.views.grid.container.css({
                    height: parseInt(target.height - controls.height - header.height) + 'px'
                });

                _plugin.htmlElements.regionPicker.container.css({
                    height: parseInt(target.height - header.height) + 'px'
                });

                _plugin.htmlElements.views.grid.container.insmItemGrid('setVisibleItems');
            }

            return $this;
        },
        updateAsset: function (asset) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            // Returns true if it is updated and false if it's not updated

            if (!_plugin.data.assets[asset.id]) {
                // TODO
                // Why do we need extend here for id to stay integer?
                _plugin.data.assets[asset.id] = $.extend({}, asset);
                return true;
            }
            else {
                var hasUpdate = false;
                // The asset id goes from int to string for some reason. Need to investigate why.
                $.each(asset, function (parameter, value) {
                    if (typeof _plugin.data.assets[asset.id][parameter] === 'undefined') {
                        _plugin.data.assets[asset.id][parameter] = value;
                        hasUpdate = true;
                    }
                    if (!_.isEqual(_plugin.data.assets[asset.id][parameter], value)) {
                        hasUpdate = true;
                    }
                });
                if (hasUpdate) {
                    _plugin.data.assets[asset.id] = asset;
                    return true;
                }
                return false;
            }
        },
        isValidAsset: function (asset) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');
            var validAsset = true;

            // The asset has to contain the correct asset tags
            $.each(_plugin.settings.assetTags, function (index, tag) {
                if (!$.isArray(asset.assetTags)) {
                    validAsset = false;
                    return true;
                }
                if (!$.inArray(tag, asset.assetTags)) {
                    validAsset = false;
                    return true;
                }
            });

            if (!validAsset) {
                return false;
            }
            return true;
        },
        getSelectedAssets: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            return _plugin.htmlElements.views.grid.container.insmItemGrid('getSelectedAssets');
        },
        getAssets: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            return _plugin.data.assets;
        },
        deselect: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            return _plugin.htmlElements.views.grid.container.insmItemGrid('deselect');
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            switch (options.view.toLowerCase()) {
                case 'grid':
                    _plugin.htmlElements.views.grid.container.insmItemGrid('setEmptyContentPlaceholder', {
                        content: 'Loading assets...'
                    });
                    // Start registering
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'asset',
                            regionId: _plugin.settings.regionId,
                            update: function (assets) {
                                $.each(assets, function (index, asset) {
                                    if (asset.assetType.value == "") {
                                        _plugin.data.assets[asset.id] = asset;
                                    }
                                });

                                $this.insmAssetManager('filterAndUpdateGrid');

                                if ($.isEmptyObject(_plugin.data.currentAssets)) {
                                    _plugin.htmlElements.views.grid.container.insmItemGrid('setEmptyContentPlaceholder', {
                                        content: 'No assets available'
                                    });
                                }

                                return;
                            },
                            remove: function (assetId) {                                
                                if (_plugin.data.assets[assetId]) {
                                    _plugin.htmlElements.views.grid.container.insmItemGrid('remove', {
                                        itemId: assetId
                                    });
                                    delete _plugin.data.assets[assetId];
                                }
                            }
                        });
                    }

                    $this.insmAssetManager('stopSubscriptions');
                    $this.insmAssetManager('startSubscriptions');

                    var regionId = _plugin.settings.regionId;
                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'asset',
                            regionId: regionId
                        });
                    }
                    break;
                case 'asset':
                    // Start subscribing on the single asset instead
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'asset',
                            assetId: _plugin.data.selectedAsset.id,
                            invalid: function () {
                                $this.insmAssetManager('stopSubscriptions');
                                var hash = $.insmHashChange('get');
                                if (hash[_plugin.settings.applicationName]) {
                                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                                }
                                else {
                                    $this.insmAssetManager('showGrid');
                                }
                            },
                            update: function (asset) {
                                _plugin.data.assets[asset.id] = asset;

                                $this.insmAssetManager('filterAndUpdateGrid');

                                if ($.isEmptyObject(_plugin.data.currentAssets)) {
                                    _plugin.htmlElements.views.grid.container.insmItemGrid('setEmptyContentPlaceholder', {
                                        content: 'No assets available'
                                    });
                                }
                            },
                            remove: function (assetId) {
                                delete _plugin.data.assets[assetId];
                                _plugin.htmlElements.views.grid.container.insmItemGrid('remove', {
                                    id: assetId
                                });
                            }
                        });
                    };

                    $this.insmAssetManager('stopSubscriptions');
                    $this.insmAssetManager('startSubscriptions');

                    var selectedAssetId = _plugin.data.selectedAsset.id;
                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'asset',
                            assetId: selectedAssetId
                        });

                        _plugin.htmlElements.views.asset.container.insmAssetNew('stopSubscriptions');
                    };
                    break;
                default:
                    throw new Error('View "' + options.view + '" not recognised');
                    break;
            }

            return $this;
        },
        hasSettings: function (options) {
            return false;
        },
        onClose: function (options) {
            options.success();
        },

        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetManager');

            $this.insmAssetManager('stopSubscriptions');
            $this.data('insmAssetManager', null).empty();

            return $this;
        }
    };

    $.fn.insmAssetManager = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAssetManager');
        }
    };

    //$.insmAssetManager = function (method) {
    //    return $('html').insmAssetManager(arguments);
    //};
})(jQuery);