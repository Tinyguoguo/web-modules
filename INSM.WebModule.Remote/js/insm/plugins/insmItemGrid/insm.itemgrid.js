/*
* INSM Item Grid
* This file contain the INSM Item Grid function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmItemGrid(settings);
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
            var _plugin = $this.data('insmItemGrid');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        items: {
                            container: $('<div />')
                        },
                        noItemsContainer: $('<div />'),
                        seeMoreItems: $('<button />')
                    },
                    data: {
                        items: {},
                        selectedItems: [],
                        categories: {},
                        resetRowCount: false,
                        previousVisibleItems: 0,
                        previousVisibleRows: null,
                        currentVisibleRows: 0,
                        visibleItems: 5,
                        visibleRows: 100,
                        itemsInGrid: 100,
                        containerWidth: null,
                        containerHeight: null,
                        itemWidth: null,
                        itemHeight: null,
                        isInitialized: false
                    },
                    settings: $.extend(true, {
                        items: {},
                        thumbnailGeneration: function () {
                            return $('<div />').text('Thumbnails not defined');
                        },
                        onHighlight: function (thumbnail) {
                            thumbnail.insmHighlight();
                            thumbnail.find('h2').insmHighlight();
                        },
                        categoryAllocation: function () {

                        },
                        onClick: function () {
                            
                        },
                        onUpdate: function () {

                        }
                    }, options)
                };
                $this.data('insmItemGrid', _plugin);
            }

            $this.empty().append(
                _plugin.htmlElements.noItemsContainer.addClass('noItemsContainer'),
                _plugin.htmlElements.items.container.addClass('container'),
                _plugin.htmlElements.seeMoreItems.text('See more').addClass('seeMore').hide()
            ).addClass('itemGrid');

            _plugin.htmlElements.seeMoreItems.click(function () {
                _plugin.data.currentVisibleRows = _plugin.data.currentVisibleRows + 1;
                $this.insmItemGrid('setVisibleItems');
            });

            $(window).smartresize(function () {
                // TODO: Reset function for whole grid?
                _plugin.data.previousVisibleRows = 0;
                _plugin.data.currentVisibleRows = null;

                $this.insmItemGrid('setVisibleItems');
            });

            return $this;
        },
        setEmptyContentPlaceholder: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            _plugin.htmlElements.noItemsContainer.html(
                options.content
            );
            
            return $this;
        },
        seeMoreItems: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            _plugin.data.currentVisibleRows = _plugin.data.currentVisibleRows + 1;

            $this.insmItemGrid('setVisibleItems');

            return $this;
        },
        resetVisibleItems: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');
            _plugin.data.previousVisibleItems = 0;
            _plugin.data.previousVisibleRows = 0;
            return $this;
        },
        setVisibleItems: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');
            
            var itemsToShow = 0;
            var rowsToShow = 0;

            if (typeof _plugin !== 'undefined') {
                _plugin.data.containerWidth = _plugin.htmlElements.items.container.width();
                _plugin.data.containerHeight = _plugin.htmlElements.items.container.parent().height();

                if (_plugin.data.itemHeight > 0) {
                    rowsToShow = Math.floor(_plugin.data.containerHeight / _plugin.data.itemHeight);
                 
                    if (_plugin.data.previousVisibleRows != rowsToShow) {
                        _plugin.data.previousVisibleRows = _plugin.data.visibleRows;
                        _plugin.data.visibleRows = rowsToShow;

                        // TODO: Is this needed as a reference?
                        if (!_plugin.data.currentVisibleRows) {
                            // Saved for adding row each time more button is clicked
                            _plugin.data.currentVisibleRows = rowsToShow;
                        }

                        if (_plugin.data.visibleRows == 0) {
                            _plugin.data.visibleRows = 1;
                        }
                        $this.insmItemGrid('populateGrid');
                    }
                }
                else {
                    if (_plugin.data.visibleRows == 0) {
                        _plugin.data.visibleRows = 1;
                    }
                    $this.insmItemGrid('populateGrid');
                }
                
                if (_plugin.data.itemWidth > 0) {
                    itemsToShow = Math.floor(_plugin.data.containerWidth / _plugin.data.itemWidth);

                    if (_plugin.data.previousVisibleItems != itemsToShow) {
                        _plugin.data.previousVisibleItems = _plugin.data.visibleItems;
                        _plugin.data.visibleItems = itemsToShow;

                        if (_plugin.data.visibleItems == 0) {
                            _plugin.data.visibleItems = 1;
                        }
                        $this.insmItemGrid('populateGrid');
                    }
                }
                else {
                    if (_plugin.data.visibleItems == 0) {
                        _plugin.data.visibleItems = 1;
                    }
                    $this.insmItemGrid('populateGrid');
                }

                if (itemsToShow && _plugin.data.currentVisibleRows) {
                    // Calculate how many items that could be seen according to row and item count
                    _plugin.data.itemsInGrid = itemsToShow * _plugin.data.currentVisibleRows;

                    // TODO: Is this really needed to be run so many times?
                    $this.insmItemGrid('populateGrid');
                }
            }

            return $this;
        },
        remove: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            // Find item to remove visually
            if (_plugin.data.items[options.itemId]) {
                var thumb = _plugin.data.items[options.itemId]._thumbnail;
                if (thumb) {
                    thumb.animate({
                        opacity: 0
                    }, 500, function () {
                        thumb.remove();
                        $this.insmItemGrid('populateGrid');
                    });
                }
                delete _plugin.data.items[options.itemId];
                $.each(_plugin.data.categories, function (key, category) {
                    delete category.items[options.itemId];
                });
            }

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            _plugin.data.resetRowCount = options.resetRowCount;

            if (_plugin.data.resetRowCount) {
                _plugin.data.resetRowCount = false;
                _plugin.data.currentVisibleRows = null;
            }

            $.each(options.items, function (id, item) {
                // Each item... if anything has changed then do update.
                if (!_plugin.data.items[id]) {
                    _plugin.data.items[id] = $.extend({}, item);
                }
                else {
                    _plugin.data.items[id] = $.extend(_plugin.data.items[id], item);
                    if (_plugin.data.items[id]._thumbnail) {
                        // Thumbnail exists and should be replaced
                        $this.insmItemGrid('createThumbnail', id);
                        var item2 = _plugin.data.items[id];
                        setTimeout(function () {
                            _plugin.settings.onHighlight(item2._thumbnail);
                        }, 1);
                    }
                }
            });

            $this.insmItemGrid('populateGrid');
            _plugin.settings.onUpdate();

            return $this;
        },
        populateGrid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            if (!_plugin) {
                return $this;
            }

            $.each(_plugin.data.categories, function (key, category) {
                $.each(category.items, function (id, item) {
                    var categoryName = _plugin.settings.categoryAllocation(item);

                    if (key != categoryName) {
                        delete item._thumbnail.remove();
                        $this.insmItemGrid('createThumbnail', item.id);
                        delete category.items[id];
                    }
                });
            });

            // Generate new categories
            var newCategories = {};
            
            $.each(_plugin.data.items, function (id, item) {
                var category = _plugin.settings.categoryAllocation(item);
                // In the future want to be able to have an array of categories
                if ($.isArray(category)) {
                    category = category[0];
                }

                if (typeof newCategories[category] === 'undefined') {
                    newCategories[category] = {
                        items: {},
                        container: $('<div />').addClass('l-grid-row')
                    }
                }
                newCategories[category].items[item.id] = item;
            });

            $.each(newCategories, function (key, category) {
                if (!_plugin.data.categories[key]) {
                    // Add category container
                    _plugin.htmlElements.items.container.append(
                        $('<div class="item-grid-category" />').append(
                            $('<h2 />').text(key),
                            category.container,
                            $('<div />').addClass('clear')
                        )
                    )
                }
            });

            // Items that have been updated are already there and highlighted.
            // We only need to search for new items and add the thumbnail to the correct category
            $.each(newCategories, function (key, category) {
                if (!_plugin.data.categories[key]) {
                    _plugin.data.categories[key] = {
                        items: {},
                        container: category.container
                    };
                }

                // Update items
                $.each(category.items, function (itemId, item) {
                    if (!_plugin.data.categories[key].items[itemId]) {
                        // Add item
                        _plugin.data.categories[key].items[itemId] = item;
                    }
                });
            });

            var categoryKeys = [];
            $.each(_plugin.data.categories, function (key, category) {
                if ($.isEmptyObject(category.items)) {
                    category.container.parent().remove();
                    delete _plugin.data.categories[key];
                }
                else {
                    categoryKeys.push(key);
                }
            });
            categoryKeys.sort();

            // If we are seen multiple categories we need no more items button
            if (categoryKeys.length > 1) {
                _plugin.htmlElements.seeMoreItems.stop().hide();
            }
            else {
                _plugin.htmlElements.seeMoreItems.fadeIn();
            }
            
            // If no items were found in category, hide more items button and show message
            if (categoryKeys.length == 0) {
                _plugin.htmlElements.noItemsContainer.fadeIn();
                _plugin.htmlElements.seeMoreItems.stop().hide();
            }
            else {
                _plugin.htmlElements.noItemsContainer.stop(true).hide();
                if (categoryKeys.length == 1) {
                    // Count items
                    var size = 0;
                    $.each(_plugin.data.categories[categoryKeys[0]].items, function (id, file) {
                        size++;
                    });

                    _plugin.data.visibleItems = size;
                    _plugin.htmlElements.items.container.children('div').css({
                        'overflow': 'auto',
                        'height': 'auto'
                    });
                }
                else {
                    _plugin.htmlElements.items.container.children('div').removeAttr('style');
                }
            }

            $.each(categoryKeys, function (id, category) {
                var elem = _plugin.data.categories[category].container.parent().detach();
                _plugin.htmlElements.items.container.append(elem);
            });

            

            // Print items to categories
            $.each(_plugin.data.categories, function (key, category) {
                var itemOrder = [];
                $.each(category.items, function (itemId, item) {
                    itemOrder.push(item);
                });

                itemOrder.sort(function (a, b) {
                    var aDate = parseInt(a.modificationDate.replace(/\D/g, ''));
                    var bDate = parseInt(b.modificationDate.replace(/\D/g, ''));
                    if (aDate < bDate) {
                        return 1;
                    }
                    else if (aDate > bDate) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });

                $.each(itemOrder, function (index, item) {
                    if (index < _plugin.data.visibleItems && index < _plugin.data.itemsInGrid) {
                        if (!item._thumbnail) {
                            $this.insmItemGrid('createThumbnail', item.id);
                        }

                        // If we reached all items we hide more items button
                        if ((index + 1) === _plugin.data.visibleItems) {
                            _plugin.htmlElements.seeMoreItems.stop().hide();
                        }

                        // Insert the thumbnail if 
                        var inserted = false;
                        $.each(itemOrder, function (index2, item2) {
                            if (item == item2) {
                                if (itemOrder[index2 - 1]) {
                                    // Insert it after the previous thumbnail
                                    itemOrder[index2 - 1]._thumbnail.after(item._thumbnail.fadeIn());
                                    inserted = true;
                                }
                            }
                        });

                        if (!inserted) {
                            // This thumbnail should be placed in the front
                            category.container.prepend(item._thumbnail.fadeIn());
                        }

                        if (!_plugin.data.itemWidth && !_plugin.data.itemHeight) {
                            var thumbnailWidth = item._thumbnail.outerWidth(true);
                            var thumbnailHeight = item._thumbnail.outerHeight(true);
                            _plugin.data.itemWidth = parseInt(thumbnailWidth);
                            _plugin.data.itemHeight = parseInt(thumbnailHeight);
                            
                            // TODO: Maybe this should be here? 2013-11-11
                            //$this.insmItemGrid('setVisibleItems');
                        }

                        item._thumbnail.draggable({
                            opacity: 0.7,
                            helper: function () {
                                return item._thumbnail.clone().data('itemId', item.id).data('origin', 'itemGrid').addClass('l-onTop');
                            }
                        });
                    }
                    else {
                        if (item._thumbnail) {
                            item._thumbnail.detach();
                        }
                    }
                });
                

            });

            return $this;
        },
        getCategories: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');
            return _plugin.data.categories;
        },
        getSelectedAssets: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            var selectedAssets = [];
            $.each(_plugin.data.selectedItems, function (index, assetId) {
                selectedAssets.push(_plugin.data.assets[assetId]);
            });

            return selectedAssets;
        },
        deselect: function () {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');
            
            $.each(_plugin.data.selectedItems, function (index, assetId) {
                _plugin.data.assets[assetId]._selected = false;
                //_plugin.data.assets[assetId]._thumbnail.switchClass('is-selected', '', {
                //    duration: 100,
                //    queue: true
                //});
            });

            _plugin.data.selectedItems = [];

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmItemGrid', null);
            return $this;
        },
        createThumbnail: function (id) {
            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');
            
            var newThumbnail = _plugin.settings.thumbnailGeneration(_plugin.data.items[id]);

            if (_plugin.data.items[id]._thumbnail) {
                _plugin.data.items[id]._thumbnail.before(newThumbnail);
                _plugin.data.items[id]._thumbnail.detach();
            }

            _plugin.data.items[id]._thumbnail = newThumbnail;

            if (typeof _plugin.settings.onClick === 'function') {
                _plugin.data.items[id]._thumbnail.click(function () {
                    _plugin.settings.onClick(_plugin.data.items[id]);
                }).addClass('is-clickable');
            }

            return $this;
        },
        empty: function () {
            // TODO: Implement empty function for clearing whole table and show only filtered items

            var $this = $(this);
            var _plugin = $this.data('insmItemGrid');

            _plugin.htmlElements.items.container.empty();
            
            _plugin.data.items = {};
            _plugin.data.categories = {};

            $this.insmItemGrid('populateGrid');

            return $this;
        }
    };

    $.fn.insmItemGrid = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmItemGrid');
        }
    };

    $.insmItemGrid = function (method) {
        return $('<div />').insmItemGrid(arguments);
    };
})(jQuery);