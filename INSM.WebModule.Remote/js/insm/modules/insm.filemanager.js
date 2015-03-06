/*
* INSM File Manager
* This file contain the INSM File Manager plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFileManager(settings);
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
            var _plugin = $this.data('insmFileManager');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        regionId: null,
                        showRegionPicker: true,
                        directoryName: 'Media',
                        previewTarget: null,
                        target: null,
                        onSelect: null,
                        onCancel: null,
                        enableSelect: false,
                        applicationName: 'File Manager',
                        showBackButton: false,
                        hideFilters: false,
                        filesType: [],
                        onOpenCallback: function() { }, 
                        onBack: function () { },
                        onDestroy: null,
                        externalFilter: function() { return true },
                        categoryAllocation: function (file) {
                            return file.type;
                        },
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        fileManager: $('<div />'),
                        regionPicker: {
                            container: $('<div />'),
                            button: $('<a />')
                        },
                        controls: {
                            search: $('<div />'),
                            container: $('<div />'),
                            file: {
                                edit: $('<button />'),
                                save: $('<button />'),
                                cancel: $('<button />'),
                                back: $('<button />'),
                                remove: $('<button />')
                            },
                            newFile: {
                                save: $('<button />'),
                                cancel: $('<button />')
                            },
                            cancel: $('<button />'),
                            select: $('<button />'),
                            upload: $('<button />'),
                            back: $('<button />'),
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
                                    state: {
                                        title: '<span>State</span>',
                                        currentOption: 'available',
                                        defaultOption: 'available',
                                        options: {
                                            available: {
                                                displayName: 'Available',
                                                filterFunction: function (file) {
                                                    var expired = false;
                                                    if (file.endDate) {
                                                        var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                                                        var endDate = parseInt($.datepicker.formatDate('yymmdd', new Date(file.endDate)));
                                                        // Do comparison
                                                        if (endDate < today) {
                                                            expired = true;
                                                        }
                                                    }
                                                    if (!expired && file.state == 'Available') {
                                                        return true;
                                                    }
                                                    return false;
                                                }
                                            },
                                            unavailable: {
                                                displayName: 'Unavailable',
                                                filterFunction: function (file) {
                                                    var expired = false;
                                                    if (file.endDate) {
                                                        var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                                                        var endDate = parseInt($.datepicker.formatDate('yymmdd', new Date(file.endDate)));
                                                        // Do comparison
                                                        if (endDate < today) {
                                                            expired = true;
                                                        }
                                                    }
                                                    if (!expired && file.state == 'Unavailable') {
                                                        return true;
                                                    }
                                                    return false;
                                                }
                                            },
                                            expired: {
                                                displayName: 'Expired',
                                                filterFunction: function (file) {
                                                    var expired = false;
                                                    if (file.endDate) {
                                                        var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                                                        var endDate = parseInt($.datepicker.formatDate('yymmdd', new Date(file.endDate)));
                                                        // Do comparison
                                                        if (endDate < today) {
                                                            expired = true;
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
                        files: {
                            container: $('<div />'),
                            grid: $('<div />'),
                            details: $('<div />') 
                        }
                    },
                    data: {
                        files: {},
                        filesToBeUpdated: {},
                        resetRowCount: false,
                        currentFiles: {},
                        categories: {},
                        selectedFile: {
                            id: null
                        },
                        filterFunction: function () {
                            return true;
                        },
                        searchstring: '',
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

                $this.data('insmFileManager', _plugin);
            }

            if (!_plugin.settings.regionId) {
                // Read users region tree instead
                _plugin.settings.regionId = $.insmFramework('getUser').regionTree.id;
            }
            else {
                _plugin.settings.showRegionPicker = false;
            }

            if (typeof _plugin.settings.onSelect === 'function') {
                _plugin.settings.enableSelect = true;
            }

            if (!_plugin.settings.directoryName) {
                throw new Error('No directory name');
            }

            return $this;
        },
        getCategories: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');
            
            _plugin.data.categories = {};
            
            $.each(_plugin.data.files, function (id, file) {

                var category = _plugin.settings.categoryAllocation(file);

                if (typeof _plugin.data.categories[file] === 'undefined') {
                    _plugin.data.categories[category] = {
                        name: category
                    }
                }
            });
            
            return $this;
        },
        updateFilterByCategory: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            // Set references to category filter dropdown
            var dropdown = _plugin.htmlElements.controls.filter.dropdownElements['categories'];
            var selectedCategory = dropdown.currentOption;
            var selectedIndex = 0;

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
                    filterObj[category.toLowerCase()].filterFunction = function (file) {
                        var _category = _plugin.settings.categoryAllocation(file).toLowerCase();
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
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            // Init html
            _plugin.settings.target.addClass('fileManager').fadeIn();
            _plugin.htmlElements.files.container.addClass('filesContainer');
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
                        $('<p />').text('Sorry, but you don\'t have permission to a region and can therefore not use the File Manager.')
                    )
                );

                return;
            }

            _plugin.settings.target.append(
                _plugin.htmlElements.regionPicker.container.addClass('regionPicker'),
                _plugin.htmlElements.fileManager.append(
                    _plugin.htmlElements.controls.container.addClass('container'),
                    _plugin.htmlElements.files.container.append(
                        _plugin.htmlElements.files.grid,
                        _plugin.htmlElements.files.details
                    )
                ).addClass('fileManager-container')
            );

            _plugin.htmlElements.controls.container.addClass('controls-container');

            _plugin.htmlElements.files.grid.insmItemGrid('destroy').insmItemGrid({
                items: _plugin.data.files,
                thumbnailGeneration: function (file) {
                    var thumbnail = $('<div class="filemanager-itemGrid-file" />').append(
                        $('<div />').addClass('image-container').append(
                            $('<img />', {
                                src: file.url.thumbnail
                            })
                        ),
                        $('<h2 />').text(file.name)
                    );

                    $this.insmFileManager('generateStartDateTooltip', {
                        file: file,
                        container: thumbnail
                    });

                    $this.insmFileManager('generateEndDateTooltip', {
                        file: file,
                        container: thumbnail
                    });
                    
                    return thumbnail;
                },
                onUpdate: function () {
                    if (!_plugin.settings.hideFilters) {
                        $this.insmFileManager('getCategories');
                        $this.insmFileManager('updateFilterByCategory');
                    }
                    _plugin.htmlElements.files.grid.insmItemGrid('resetVisibleItems');
                    _plugin.htmlElements.files.grid.insmItemGrid('setVisibleItems');
                },
                onHighlight: function (thumbnail) {
                    thumbnail.find('h2').insmHighlight();
                    thumbnail.find('.image-container').insmHighlight();
                },
                categoryAllocation: function (file) {
                    return _plugin.settings.categoryAllocation(file);
                },
                onClick: function (file) {
                    // Show file #File Manager=id:#;
                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName]) {
                        hash[_plugin.settings.applicationName] = {
                            id: file.id
                        }
                        $.insmHashChange('updateHash', hash);
                    }
                    else {
                        $this.insmFileManager('showFile', {
                            id: file.id
                        });
                    }
                }
            });

            // Add controls
            _plugin.htmlElements.controls.container.empty().append(
                _plugin.htmlElements.regionPicker.button,
                _plugin.settings.showBackButton ? _plugin.htmlElements.controls.back : '',
                _plugin.htmlElements.controls.file.back,
                _plugin.htmlElements.controls.file.edit,
                _plugin.htmlElements.controls.file.cancel,
                _plugin.htmlElements.controls.file.save,
                _plugin.htmlElements.controls.newFile.cancel,
                _plugin.htmlElements.controls.newFile.save,
                _plugin.htmlElements.controls.file.remove
            );

            var showTree = false;
            _plugin.htmlElements.regionPicker.button.addClass('toggleRegionPicker show').text('Choose Region').click(function () {
                showTree = !showTree;
                if (showTree) {
                    _plugin.htmlElements.regionPicker.button.text('Hide Region Tree').removeClass('show').addClass('hide');
                    _plugin.htmlElements.regionPicker.container.switchClass('', 'expanded', function () {
                        var regionPickerWidth = _plugin.htmlElements.regionPicker.container.width();
                        var containerWidth = _plugin.htmlElements.fileManager.width();

                        _plugin.htmlElements.fileManager.css({
                            width: parseInt(containerWidth - regionPickerWidth) + 'px',
                            float: 'left'
                        });
                        _plugin.htmlElements.files.grid.insmItemGrid('setVisibleItems');
                    });

                    if (!_plugin.htmlElements.regionPicker.container.insmRegionPicker('isInitialized')) {
                        _plugin.htmlElements.regionPicker.container.insmRegionPicker({
                            selectedRegionId: _plugin.settings.regionId,
                            applicationName: _plugin.settings.applicationName,
                            onSelect: function (region) {
                                _plugin.settings.regionId = region.id;

                                var hash = $.insmHashChange('get');
                                if (hash[_plugin.settings.applicationName]) {
                                    if (hash.index) {
                                        $.insmHashChange('updateHash', _plugin.settings.applicationName);
                                    }
                                    else {
                                        $this.insmFileManager('showGrid');
                                    }
                                }
                                else {
                                    $this.insmFileManager('showGrid');
                                }
                            }
                        });
                    }
                }
                else {
                    _plugin.htmlElements.regionPicker.button.text('Show Region Tree').removeClass('hide').addClass('show');
                    _plugin.htmlElements.regionPicker.container.switchClass('expanded', '', function () {
                        _plugin.htmlElements.fileManager.css({
                            width: '',
                            float: ''
                        });
                        _plugin.htmlElements.files.grid.insmItemGrid('setVisibleItems');
                    });

                    _plugin.htmlElements.regionPicker.container.insmRegionPicker('stopSubscriptions');
                }
            });

            _plugin.htmlElements.controls.back.text('Back').click(function () {
                _plugin.htmlElements.files.details.insmFile('destroy');
                $.insmHashChange('unregister', {
                    applicationName: _plugin.settings.applicationName
                });

                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName]) {
                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                }
                else {
                    _plugin.settings.onBack();
                }
            });

            _plugin.htmlElements.controls.file.back.text('Back').click(function () {
                _plugin.htmlElements.files.details.insmFile('destroy');
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName]) {
                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                }
                else {
                    $this.insmFileManager('showGrid');
                }
            });

            _plugin.htmlElements.controls.newFile.cancel.text('Cancel').click(function () {
                _plugin.htmlElements.files.details.insmFile('destroy')
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName]) {
                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                }
                else {
                    $this.insmFileManager('showGrid');
                }
            });

            _plugin.htmlElements.controls.file.edit.text('Edit').click(function () {
                _plugin.htmlElements.controls.file.back.hide();
                _plugin.htmlElements.controls.file.edit.hide();
                _plugin.htmlElements.controls.file.remove.hide();
                _plugin.htmlElements.controls.file.save.fadeIn();
                _plugin.htmlElements.controls.file.cancel.fadeIn();
                _plugin.htmlElements.files.details.insmFile('edit');
            });

            _plugin.htmlElements.controls.file.save.text('Save').click(function () {
                $this.insmFileManager('disableControls');
                _plugin.htmlElements.controls.file.save.text('Saving...');
                _plugin.htmlElements.files.details.insmFile('save', {
                    success: function () {
                        $this.insmFileManager('enableControls');
                        _plugin.htmlElements.controls.file.save.hide().text('Save');
                        _plugin.htmlElements.controls.file.back.fadeIn();
                        _plugin.htmlElements.controls.file.edit.fadeIn();
                        _plugin.htmlElements.controls.file.remove.fadeIn();
                        _plugin.htmlElements.files.details.insmFile('view');
                        _plugin.htmlElements.controls.file.cancel.hide();
                    },
                    fail: function () {
                        $this.insmFileManager('enableControls');
                        _plugin.htmlElements.controls.file.save.text('Save');
                    }
                });
            });

            _plugin.htmlElements.controls.newFile.save.text('Save').click(function () {
                _plugin.htmlElements.controls.newFile.save.text('Saving...');
                _plugin.htmlElements.files.details.insmFile('save', {
                    directoryName: _plugin.settings.directoryName,
                    regionId: _plugin.settings.regionId,
                    success: function () {
                        _plugin.htmlElements.controls.newFile.save.text('Save');

                        var hash = $.insmHashChange('get');
                        if (hash[_plugin.settings.applicationName]) {
                            $.insmHashChange('updateHash', _plugin.settings.applicationName);
                        }
                        else {
                            $this.insmFileManager('showGrid');
                        }
                    },
                    fail: function () {
                        $this.insmFileManager('enableControls');
                        _plugin.htmlElements.controls.newFile.save.text('Save');
                    }
                });
            });

            _plugin.htmlElements.controls.file.cancel.text('Cancel').click(function () {
                _plugin.htmlElements.controls.file.save.hide();
                _plugin.htmlElements.controls.file.cancel.hide();
                _plugin.htmlElements.controls.file.back.fadeIn();
                _plugin.htmlElements.controls.file.edit.fadeIn();
                _plugin.htmlElements.controls.file.remove.fadeIn();
                _plugin.htmlElements.files.details.insmFile('view');
            });

            _plugin.htmlElements.controls.file.remove.addClass('button').text('Delete').click(function () {
                $.insmDialog({
                    type: 'confirm',
                    accept: function () {
                        var def = $.Deferred();
                        _plugin.htmlElements.files.details.insmFile('delete', {
                            callback: function () {
                                var hash = $.insmHashChange('get');
                                if (hash[_plugin.settings.applicationName]) {
                                    $.insmHashChange('updateHash', _plugin.settings.applicationName);
                                }
                                else {
                                    $this.insmFileManager('showGrid');
                                }
                                def.resolve();
                            }
                        });
                        return def;
                    },
                    title: 'Delete file',
                    message: 'Are you sure?'
                });
            });

            _plugin.htmlElements.controls.container.append(
                _plugin.htmlElements.controls.upload
            );

            // Add label to filter container
            _plugin.htmlElements.controls.filter.container.empty().append(
                _plugin.htmlElements.controls.filter.title
            );

            // Add filters
            if (!_plugin.settings.hideFilters) {
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
                        _plugin.data.resetRowCount = true;
                        _plugin.htmlElements.controls.filter.dropdownElements[name].currentOption = this.value;
                        $this.insmFileManager('filterAndUpdateGrid');

                        // Scroll container to top
                        _plugin.htmlElements.files.grid.scrollTop(0);
                    });

                    _plugin.htmlElements.controls.filter.container.append(
                        select
                    );
                });


                _plugin.htmlElements.controls.container.append(
                    _plugin.htmlElements.controls.filter.container
                );

                _plugin.htmlElements.controls.filter.container.append(
                    $('<span>Search</span>'),
                    _plugin.htmlElements.controls.search.addClass('searchfield-container').insmSearchField('destroy').insmSearchField({
                        onSearch: function (searchstring) {
                            _plugin.data.searchstring = searchstring;
                            $this.insmFileManager('filterAndUpdateGrid');
                        }
                    })
                );

                // TODO: Why is it necessary?
                _plugin.htmlElements.controls.filter.container.css({ 'display': 'inline' });
            }

            if (_plugin.permissions.region.write) {
                _plugin.htmlElements.controls.upload.text('Upload').click(function () {
                    // Show file #File Manager=id:#;
                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName]) {
                        hash[_plugin.settings.applicationName] = {
                            id: 'new'
                        }
                        $.insmHashChange('updateHash', hash);
                    }
                    else {
                        $this.insmFileManager('showFile', {
                            id: 'new'
                        });
                    }
                });
            }

            if (_plugin.settings.enableSelect) {
                _plugin.htmlElements.controls.container.append(
                    _plugin.htmlElements.controls.select,
                    _plugin.htmlElements.controls.cancel
                );
                _plugin.htmlElements.controls.select.text('Choose file').click(function () {
                    _plugin.settings.onSelect([_plugin.data.selectedFile.id]);
                });
                _plugin.htmlElements.controls.cancel.text('Cancel').click(function () {
                    _plugin.settings.onSelect([]);
                });
            }
            
            // Hash listener
            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (hash) {
                    var fileManager = hash[_plugin.settings.applicationName];
                    if (fileManager) {
                        if (fileManager.id) {
                            $this.insmFileManager('showFile', {
                                id: fileManager.id
                            });
                        }
                        else {
                            $this.insmFileManager('showGrid');
                        }
                    }
                }
            });

            $this.insmFileManager('resize');

            return _plugin.settings.target;
        },
        hideControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            _plugin.htmlElements.controls.container.children().css('opacity', 1).hide();

            return $this;
        },
        disableControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            _plugin.htmlElements.controls.container.children().attr('disabled', 'disabled');

            return $this;
        },
        enableControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            _plugin.htmlElements.controls.container.children().removeAttr('disabled');

            return $this;
        },
        showGrid: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            $this.insmFileManager('hideControls');
            if (_plugin.permissions.region.write) {
                _plugin.htmlElements.controls.upload.fadeIn();
            }

            if (_plugin.settings.showRegionPicker) {
                _plugin.htmlElements.regionPicker.button.fadeIn();
            }

            if (_plugin.settings.showBackButton) {
                _plugin.htmlElements.controls.back.fadeIn();
            }

            _plugin.htmlElements.controls.filter.container.fadeIn();
            _plugin.htmlElements.files.details.hide();
            _plugin.htmlElements.files.grid.fadeIn();

            $this.insmFileManager('setSubscriptions', {
                view: 'grid'
            });

            return $this;
        },
        generateStartDateTooltip: function (options) {
            var startDateToCompare;

            if (options.file.startDate) {
                startDateToCompare = options.file.startDate;
            }

            if (startDateToCompare && startDateToCompare.length > 0) {
                var compare = $.insmUtilities('getDifferenceDateAndToday', startDateToCompare);
                if (compare.diff > 0) {
                    var dateStr = compare.diff + compare.prefix;
                    options.container.append(
                        $('<div />').addClass('remainingTimePlayStart').text(dateStr).insmTooltip({
                            container: $('.fileManager .container'),
                            fixedPosition: 'above',
                            text: 'The start date of playout is<br/><strong>' + startDateToCompare + '</strong>'
                        })
                    );
                }
            }
        },
        generateEndDateTooltip: function (options) {
            var endDateToCompare;

            if (options.file.endDate) {
                endDateToCompare = options.file.endDate;
            }

            if (endDateToCompare && endDateToCompare.length > 0) {
                var compare = $.insmUtilities('getDifferenceDateAndToday', endDateToCompare);
                if (compare.diff > 0) {
                    var dateStr = compare.diff + compare.prefix;
                    options.container.append(
                        $('<div />').addClass('remainingTimePlayEnd').text(dateStr).insmTooltip({
                            container: $('.fileManager .container'),
                            fixedPosition: 'above',
                            text: 'The end date of playout is<br/><strong>' + endDateToCompare + '</strong>'
                        })
                    );
                }
            }
        },
        showFile: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            $this.insmFileManager('hideControls');
            
            _plugin.data.selectedFile = {
                id: options.id
            };
            // Subscriptions
            if (options.id == 'new') {
                // Should be in edit mode directly
                _plugin.htmlElements.controls.newFile.save.fadeIn();
                _plugin.htmlElements.controls.newFile.cancel.fadeIn();
            }
            else {
                _plugin.htmlElements.controls.file.back.fadeIn();
                if (_plugin.settings.enableSelect) {
                    _plugin.htmlElements.controls.select.fadeIn();
                }

                if (_plugin.permissions.region.write) {
                    _plugin.htmlElements.controls.file.edit.fadeIn();
                    _plugin.htmlElements.controls.file.remove.fadeIn();
                }

                $this.insmFileManager('setSubscriptions', {
                    view: 'file'
                });
            }

            _plugin.htmlElements.files.grid.hide();
            _plugin.htmlElements.files.details.fadeIn().insmFile('destroy').insmFile({
                id: _plugin.data.selectedFile.id
            });

            return $this;
        },
        filterAndUpdateGrid: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');
            
            var fileIdsToShow = [];

            $.each(_plugin.data.files, function (id, file) {
                var showFile = true;
                if (showFile) {
                    // Run each dropdown filter
                    var elemOptions = null;
                    $.each(_plugin.htmlElements.controls.filter.dropdownElements, function (name, dropdown) {
                        elemOptions = dropdown.options[dropdown.currentOption];

                        if (elemOptions && !elemOptions.filterFunction(file)) {
                            showFile = false;
                            return;
                        }
                    });
                }

                if (showFile) {
                    // Run search filter
                    if (file.name.toLowerCase().indexOf(_plugin.data.searchstring.toLowerCase()) === -1) {
                        showFile = false;
                    }
                }

                if (showFile) {
                    fileIdsToShow.push(id);
                }
            });

            // Compare fileIdsToShow with _plugin.data.currentFiles and update itemGrid
            $.each(_plugin.data.currentFiles, function (id, file) {
                var index = fileIdsToShow.indexOf(id);
                if (index === -1) {
                    // Remove from grid
                    _plugin.htmlElements.files.grid.insmItemGrid('remove', {
                        itemId: id
                    });
                    delete _plugin.data.currentFiles[id];
                }
                else {
                    // It's already in the grid
                    fileIdsToShow.splice(index, 1);
                }
            });

            // The rest should be added
            var filesToBeAdded = {};
            $.each(fileIdsToShow, function (index, fileId) {
                filesToBeAdded[fileId] = _plugin.data.files[fileId];
                _plugin.data.currentFiles[fileId] = _plugin.data.files[fileId];
            });

            _plugin.htmlElements.files.grid.insmItemGrid('update', {
                items: filesToBeAdded,
                resetRowCount: _plugin.data.resetRowCount
            });

            // Reset grid row count
            _plugin.data.resetRowCount = false;

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            switch (options.view.toLowerCase()) {
                case 'grid':
                    _plugin.htmlElements.files.grid.insmItemGrid('setEmptyContentPlaceholder', {
                        content: 'Loading files...'
                    });
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'file',
                            local: true,
                            regionId: _plugin.settings.regionId,
                            directoryName: _plugin.settings.directoryName,
                            update: function (files) {
                                // Set all files to _plugin.data.files
                                // If file has a thumbnail: update it and highlight.
                                var updatedFiles = {};
                                $.each(files, function (index, file) {
                                    // Run the external filter
                                    if (_plugin.settings.externalFilter(file)) {
                                        if (!_plugin.data.files[file.id]) {
                                            _plugin.data.files[file.id] = file;
                                        }
                                        else {
                                            $.each(file, function (property, value) {
                                                if (!_.isEqual(_plugin.data.files[file.id][property], file[property])) {
                                                    _plugin.data.files[file.id] = file;
                                                    updatedFiles[file.id] = file;
                                                    return false;
                                                }
                                            });
                                        }
                                    }
                                });
                                
                                _plugin.htmlElements.files.grid.insmItemGrid('update', {
                                    items: updatedFiles,
                                    resetRowCount: _plugin.data.resetRowCount
                                });

                                $this.insmFileManager('filterAndUpdateGrid');

                                if ($.isEmptyObject(_plugin.data.currentFiles)) {
                                    _plugin.htmlElements.files.grid.insmItemGrid('setEmptyContentPlaceholder', {
                                        content: 'No files available'
                                    });
                                }

                                $this.insmFileManager('resize');

                                return;
                            },
                            reset: function () {
                                //_plugin.htmlElements.files.grid.insmItemGrid('empty');
                                _plugin.data.files = {};
                            },
                            remove: function (fileId) {
                                if (_plugin.data.files[fileId]) {
                                    _plugin.htmlElements.files.grid.insmItemGrid('remove', {
                                        itemId: fileId
                                    });
                                    delete _plugin.data.files[fileId];
                                }
                            }
                        });
                    };

                    $this.insmFileManager('stopSubscriptions');
                    $this.insmFileManager('startSubscriptions');

                    var applicationName = _plugin.settings.applicationName;
                    var regionId = _plugin.settings.regionId;
                    var directoryName = _plugin.settings.directoryName;
                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: applicationName,
                            type: 'file',
                            regionId: regionId,
                            directoryName: directoryName
                        });
                    };
                    break;
                case 'file':
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'file',
                            fileId: _plugin.data.selectedFile.id,
                            update: function (file) {
                                // TODO
                                // Check which files should be updated
                                var updateFile = false;
                                if (!_plugin.data.files[file.id]) {
                                    updateFile = true;
                                    _plugin.data.files[file.id] = file;
                                }
                                else {
                                    $.each(file, function (property, value) {
                                        if (!_.isEqual(_plugin.data.files[file.id][property], file[property])) {
                                            _plugin.data.files[file.id] = file;
                                            updateFile = true;
                                        }
                                    });
                                }

                                if (updateFile) {
                                    if (_plugin.data.filterFunction(file)) {
                                        var items = {};
                                        items[file.id] = file;
                                        _plugin.htmlElements.files.grid.insmItemGrid('update', {
                                            items: items
                                        });
                                    }
                                    else {
                                        _plugin.htmlElements.files.grid.insmItemGrid('remove', {
                                            itemId: file.id
                                        });
                                    }
                                }
                                $this.insmFileManager('resize');
                            },
                            reset: function () {

                            },
                            remove: function (fileId) {
                                if (_plugin.data.files[fileId]) {
                                    _plugin.htmlElements.files.grid.insmItemGrid('remove', {
                                        itemId: fileId
                                    });
                                    delete _plugin.data.files[fileId];
                                }
                            }
                        });
                    };

                    $this.insmFileManager('stopSubscriptions');
                    $this.insmFileManager('startSubscriptions');

                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'file',
                            fileId: _plugin.data.selectedFile.id
                        });

                        _plugin.htmlElements.files.details.insmFile('stopSubscriptions');
                    };
                    break;
                default:
                    throw new Error('View "' + options.view + '" not recognised');
                    break;
            }

            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            if (_plugin) {
                _plugin.subscriptions.stop();
            }

            return $this;
        },
        hasSettings: function () {
            return false;
        },
        resize: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');
            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                var controls = _plugin.htmlElements.controls.container.insmUtilities('size', { actualSize: true });
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                var regionPicker = _plugin.htmlElements.regionPicker.container.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.fileManager.css({
                    width: parseInt(target.width - regionPicker.width) + 'px'
                });

                _plugin.htmlElements.files.container.css({
                    height: parseInt(target.height - controls.height - header.height) + 'px'
                });

                _plugin.htmlElements.regionPicker.container.css({
                    height: parseInt(target.height - header.height) + 'px'
                });
            }
            return $this;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileManager');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview fileManager');

            
            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });
            
            _plugin.settings.previewTarget.html(
                $('<h2 />').text(_plugin.settings.applicationName)
            );  

            return _plugin.settings.previewTarget;
        },
        onClose: function (options) {
            options.success();
        },

        destroy: function (options) {
            var $this = $(this);

            $this.insmFileManager('stopSubscriptions');
            $this.data('insmFileManager', null).empty();
            
            return $this;
        }
    };

    $.fn.insmFileManager = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFileManager');
            return null;
        }
    };

    //$.insmFileManager = function (method) {
    //    return $('<div />').insmFileManager.apply(this, arguments);
    //};
})(jQuery);
