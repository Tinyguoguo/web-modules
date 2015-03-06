/*
* INSM PlayerPreview
* This file contains the INSM playerPreview plugin.c:\projects2\insm\webmodules\source\main\insm.webmodule.framework\insm\js\insm\modules\insm.pricemanager.js
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlayerPreviewModule(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Guo Yang
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
                        
            if (!_plugin) {
                _plugin = {

                    settings: $.extend({
                        target: null,
                        region: 0,
                        apiUrl: '',
                        applicationName: 'PriceManager',
                        version: manifest.version,
                        header: true,
                        headers: [{
                            type: "drink",
                            headers: [{
                                name: "Name",
                                type: "string",
                                unique: true,
                                searchIndex:true
                            }, {
                                name: "Big Price",
                                type: "string"
                            }, {
                                name: "Small Price",
                                type: "string"
                            }]
                        }]
                    }, options),
                    htmlElements: {
                        popupLoading: $('<div />'),
                        header: $('<div />'),
                        content: {
                            container: $('<div />'),
                            header: {
                                container: $('<div />').addClass('sub-header'),
                                title: $('<h2 />'),                               
                            },
                            views: {
                                container: $('<div />').addClass('content'),
                                regionPicker: $('<div />'),
                                tableDiv: $('<div />'),
                                loadingDiv: $('<div/>').addClass('loader'),
                                buttonContainer:$('<div />').addClass('tableButtonContainer'),
                                saveButton: $('<button />').text('Save').addClass('tableButton'),
                                addButton: $('<button />').text('Add').addClass('tableButton')
                            }
                        }
                    },
                    data: {                       
                        header: {},
                        onSave: true,
                        originalList: {},
                        originalEditList: {},
                        sticky: {},
                        priceList: {
                            children: {}
                        },
                        removedDataset:[]
                    },              
                };
                $this.data('insmPriceManager', _plugin);
            }
            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }
            return _plugin.settings.target;
        },
        formatEditItems: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            var itemList = [];
            _plugin.data.originalList = {};
            _plugin.data.originalEditList = {};
            _plugin.data.changedItemArray = [];
            _plugin.data.removedDataset = [];
            $.each(options.list, function (key, item) {
                _plugin.data.originalList[item.name] = {};
                _plugin.data.originalEditList[item.name] = {};

                var formatItem = {
                };
                try {
                    $.each(item.children.Content.children, function (key, cell) {                 
                        formatItem[key] = cell.value;
                        _plugin.data.originalList[item.name][key] = cell.value;
                        _plugin.data.originalEditList[item.name][key] = cell.value;
                    });
                    formatItem['itemType'] = item.children.Type.value;
                    formatItem['rowId'] = item.name;                                 
                    formatItem['datasetId'] = item.id;
                    formatItem['contentId'] = item.children.Content.id;

                    itemList.push(formatItem);
                } catch(err){
                }
            });
            $.each(itemList, function (index, item) {
                item.id = index;
            });
            return itemList;
        },
        formatSaveItems: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            var priceList = {
                children:{}
            }

            $.each(options.list, function (index, item) {
                priceList.children[item.rowId] = {
                    type: "dataset",
                    name: item.rowId,
                    id:item.datasetId,
                    children: {
                        Active: true,
                        Type: _plugin.data.selectedType,
                        Content: {
                            type: "dataset",
                            name: item.rowId,
                            id: item.contentId,
                            children: {}
                        }
                    }
                }

                $.each(item, function (key, cell) {
                    if (typeof cell == 'object') {
                        if (!cell.insmInput('validate')) {
                            _plugin.data.onSave = false;
                        } else {
                            priceList.children[item.rowId].children.Content.children[key] = {
                                type: 'string',
                                value: cell.insmInput('getValue')
                            }
                        }
                    }
                });                
            });
            return priceList;
        },
        updateTable: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            var searchIndexValue;

            $.each(_plugin.data.header, function (key,obj) {
                if (obj.searchIndex) {
                    searchIndexValue = key;
                }
            });
            _plugin.htmlElements.content.views.tableDiv.insmTable('destroy').insmTable({
                headers: _plugin.data.header,
                items: _plugin.data.itemList,
                selectable: false,
                search: true,
                searchIndex: function (item) {                   
                    var str = item[searchIndexValue].insmInput('getValue');
                    if (str) {
                        return str.split(" ");
                    } else {
                        return [];
                    }
                },
                sticky: function (item) {
                    var sticky = false;
                    $.each(item, function (key, value) {
                        if (typeof value =='object') {
                            if (!value.insmInput('validate')) {
                                sticky = true
                            } 
                        }
                    });
                    return sticky;
                }
            });
        },
        refreshData: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            $.insmFramework('regionDirectory', {
                regionId: _plugin.settings.region.id,
                name: 'pricelist',
                success: function (directory) {
                    
                    _plugin.settings.region.directoryId = directory.Id;
                    $.insmFramework('getDatasetsInDirectory', {

                        directoryId: directory.Id,
                        
                        success: function (datasets) {
                            _plugin.htmlElements.content.views.regionPicker.insmRegionPicker('selectNode', {
                                node: _plugin.settings.region
                            });
                            _plugin.data.priceList.children = {};
                            $.each(datasets, function (key, item) {
                                _plugin.data.priceList.children[key] = item;
                            });

                            _plugin.data.itemList = $this.insmPriceManager('formatEditItems', {
                                list: _plugin.data.priceList.children
                            });                           
                            $this.insmPriceManager('generateTable', {
                                items: _plugin.data.itemList
                            });
                            _plugin.htmlElements.popupLoading.insmFullScreenLoading('close');
                        }
                    });
                },
                denied: function (data) {
                },
                error: function (data) {
                }
            });

        },
        generateCell: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');

            var stateRow = $('<div />').insmInput({
                type: 'string',
                value: options.item[options.title],
                autoFocus: true,
                required: true,
                validateFunction: function (value) {

                    if (value.length == 0) {
                        return false;
                    }
                    else if (options.unique) {

                        var uniqueItemList = [];
                        $.each(_plugin.data.originalEditList, function (key, rowId) {
                            $.each(rowId, function (title, value) {
                                if (title == options.title) {
                                    uniqueItemList.push(value);                                    
                                }
                            });
                        });
                        var uniqueValues = {};
                        var listOfValue = [];
                        $.each(uniqueItemList, function (index,value) {
    
                            if (!uniqueValues[value]) {
                                uniqueValues[value] = true;
                            } else {
                                listOfValue.push(value);
                            }
                        });
                        if ($.inArray(value,listOfValue) < 0) {                           
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                },
                onBlur: function () {
                    stateRow.insmInput('view');                   
                    if (_plugin.data.originalEditList[options.item.rowId][options.title] !== stateRow.insmInput('getValue')) {
                        _plugin.data.originalEditList[options.item.rowId][options.title] = stateRow.insmInput('getValue');
                        _plugin.data.changedItemArray.push(options.item.id);
                        var updateItem = {};
                        updateItem[options.item.id] = options.item;
                        _plugin.htmlElements.content.views.tableDiv.insmTable('update', {
                            items: updateItem
                        });
                    }
                    stateRow.insmInput('validate');
                },
            }).insmInput('view');
            stateRow.click(function () {
                stateRow.insmInput('edit');
            });
            return stateRow;
        },
        generateTable: function (options) {

            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            $.insmFramework('getModuleSettings', {
                regionId: _plugin.settings.region.id,
                namespace: "insmPriceManager",
                key: "headers",
                success: function (headers) {
                    headers = _plugin.settings.headers;
                    $.insmFramework('setModuleSettings', {
                        regionId: _plugin.settings.region.id,
                        namespace: "insmPriceManager",
                        key: "headers",
                        value: headers,
                        success: function (data) {
                        },
                    });
     
                    if (headers.length == 1) {
                        _plugin.data.selectedType = headers[0].type;
                        var itemListCopy = [];
                        $.each(_plugin.data.itemList, function (index, item) {
                            if (item.itemType == _plugin.data.selectedType) {
                                itemListCopy.push(item);
                               
                            }
                        });
                        _plugin.data.itemList = [];
                        $.each(itemListCopy, function (index,item) {
                            _plugin.data.itemList.push(item);
                            item.id = index;
                        });

                        var headerCheckList = {}
                        var headerNameArray = [];
                        $.each(_plugin.data.itemList, function (index, item) {
                            var headerArray = [];
                            $.each(item, function (key, cell) {
                                headerArray.push(key);
                            });
                            headerCheckList[index] = headerArray;
                        });
                        $.each(headers[0].headers, function (index, header) {
                            $.each(headerCheckList, function (index, nameArray) {
                                if ($.inArray(header.name, nameArray) < 0) {
                                    _plugin.data.itemList[index][header.name] = '';                                   
                                }

                            })
                        });
                        $.each(headers[0].headers, function (index, header) {
                            $.each(_plugin.data.itemList, function (index, item) {
                                $.each(item, function (key, cell) {
                                    if (key == header.name) {
                                        var stateRow = $this.insmPriceManager('generateCell', {
                                            item: item,
                                            title: header.name,
                                            unique: header.unique
                                        });
                                        item[key] = stateRow;
                                    }
                                });                                                                                         
                            });
                        });
                        $.each(headers[0].headers, function (index, header) {
                            _plugin.data.header[header.name] = {
                                searchIndex:header.searchIndex,
                                unique: header.unique,
                                weight: 0.5,
                                name: header.name,
                                output: function (item) {
                                    var statRow;
                                    $.each(item, function (key, cell) {
                                        if (key == header.name) {                                         
                                            statRow = cell;
                                        }                                       
                                    });
                                    return statRow;
                                },
                                sort: function (rowA, rowB) {

                                    var aValue = rowA[header.name].insmInput('getValue');
                                    var bValue = rowB[header.name].insmInput('getValue');
                                    if (aValue.toLowerCase() < bValue.toLowerCase()) {
                                        return -1;
                                    }
                                    else if (aValue.toLowerCase() > bValue.toLowerCase()) {
                                        return 1;
                                    }
                                    return 0;
                                }
                            }
                        });
                        _plugin.data.header["Remove"] = {
                            weight: 0.3,
                            name: "Remove",
                            sortable:false,
                            output: function (item) {
                                var stateRow = $('<div />').addClass('remove is-clickable');
                                stateRow.click(function () {
                                    var removeIndex;
                                    $.each(_plugin.data.itemList, function (index, content) {                   
                                        if (content.rowId == item.rowId) {
                                            if (item.datasetId) {
                                                _plugin.data.removedDataset.push(item.datasetId);
                                            }
                                            removeIndex = index;
                                            delete _plugin.data.originalEditList[item.rowId];
                                        }
                                    });

                                    _plugin.data.itemList.splice(removeIndex, 1);

                                    _plugin.htmlElements.content.views.tableDiv.insmTable('remove', {
                                        id: item.id
                                    });
                                });                                
                                return stateRow;
                            },
                        }
                    } 
                    $this.insmPriceManager('updateTable');      
                    //_plugin.htmlElements.popupLoading.insmFullScreenLoading('popUp', {text:'Updating data Since Header is Changed'});                      
                    var priceList = $this.insmPriceManager('formatSaveItems', {
                        list: _plugin.data.itemList
                    });
                    if (_plugin.data.onSave) {
                        var saveDeferredList = [];
                        $.each(priceList.children, function (key, item) {

                            var saveDeferred = $.insmFramework('saveDatasetInDirectory', {
                                dataset: {
                                    name: item.name,
                                    children: item.children,
                                    id: item.id,
                                    contentDirectoryId: _plugin.settings.region.directoryId,
                                },
                                
                                regionId: _plugin.settings.region.id,
                                datasetItemKey: 'priceList',
                                success: function () {
                                },
                            });
                            saveDeferredList.push(saveDeferred);
                        });
                        $.when.apply(null, saveDeferredList).done(function () {

                        });
                    } else {
                        _plugin.data.onSave = true;
                    }
                    
                },
            });
        },        
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }
            _plugin.settings.previewTarget.addClass('module module-preview pricemanager');
            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Price Manager')
            );
            return _plugin.settings.previewTarget;
        },

        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function() {
                    $this.insmPriceManager('resize');
                }, 1);
                return $this;
            }           
            _plugin.data.fullscreenInitialized = true;
            // Init html
            _plugin.htmlElements.popupLoading.insmFullScreenLoading();
            _plugin.settings.target.addClass('pricemanager').show();
            _plugin.settings.target.empty();
            _plugin.settings.target.append(
                _plugin.htmlElements.header.addClass('header').append(
                    $('<div />').addClass('company-logo'),
                    $('<div />').addClass('module-logo')
                ),                   
                _plugin.htmlElements.content.container.addClass('container').append(                   
                    _plugin.htmlElements.content.views.regionPicker.addClass('regionPicker expanded'),
                    _plugin.htmlElements.content.views.container.append(
                        _plugin.htmlElements.content.views.buttonContainer.append(
                            _plugin.htmlElements.content.views.saveButton.click(function () {
 
                                var priceList = $this.insmPriceManager('formatSaveItems', {
                                    list: _plugin.data.itemList
                                });
                                if (_plugin.data.onSave) {
                                    _plugin.data.originalList = {};
                                    $.each(_plugin.data.originalEditList, function (key, item) {
                                        _plugin.data.originalList[key] = $.extend(true, {}, item);
                                    });
                                    _plugin.htmlElements.popupLoading.insmFullScreenLoading('popUp');
                                    var removeDeferredList = [];
                                    $.each(_plugin.data.removedDataset, function (index, value) {
                                        var removeDeferred = $.insmFramework('deleteDataset', {
                                            id: value,
                                            success: function() {                                           
                                            }
                                        });
                                        removeDeferredList.push(removeDeferred);
                                    });
                                    $.when.apply(null, removeDeferredList).done(function () {
                                        _plugin.data.removedDataset = [];
                                        var saveDeferredList = [];
                                        $.each(priceList.children, function (key, item) {
                                            var saveDeferred = $.insmFramework('saveDatasetInDirectory', {
                                                dataset: {
                                                    name: item.name,
                                                    children: item.children,
                                                    id: item.id,
                                                    contentDirectoryId: _plugin.settings.region.directoryId,
                                                },
                                                regionId: _plugin.settings.region.id,

                                                datasetItemKey: 'priceList',
                                                success: function (){ 
                                                    
                                                },
                                            });
                                            saveDeferredList.push(saveDeferred);
                                        });
                                        function saveDatasetLinkInRegionDeferred(name,id) {
                                            var deferred = $.Deferred();
                                            $.insmFramework('saveDatasetLinkInRegion', {
                                                dataset: {
                                                    name: originalDataset.name,
                                                    id: originalDataset.id,
                                                    regionId: _plugin.settings.region.id
                                                },
                                                success: function () {
                                                    return deferred.resolve();
                                                },
                                            });
                                        };
                                        $.when.apply(null, saveDeferredList).done(function () {
                                            $.insmFramework('getDatasetsInDirectory', {
                                                directoryId: _plugin.settings.region.directoryId,
                                                success: function (datasets) {
                                                   
                                                    var datasetItemKey = [];
                                                    var datasetValue = [];
                                                    $.each(datasets, function (datasetId, originalDataset) {
                                                        datasetItemKey.push(originalDataset.name);
                                                        datasetValue.push(originalDataset.id);                      
                                                    });

                                                    $.insmFramework('saveDatasetLinkInRegion', {
                                                        dataset: {
                                                            itemKey: datasetItemKey,
                                                            value: datasetValue,
                                                            regionId: _plugin.settings.region.id
                                                        },
                                                        success: function () {
                                                            $this.insmPriceManager('refreshData');
                                                        },
                                                    });                                                     
                                                }
                                            });                        
                                        });
                                    });
                                } else {
                                    _plugin.data.onSave = true;
                                }
                            }).hide(),
                             //addButton
                             _plugin.htmlElements.content.views.addButton.click(function () {
                                 var newItem = {};
                                 newItem.rowId = $.insmUtilities('generateGuid');
                                 _plugin.data.originalEditList[newItem.rowId] = {};

                                 $.each(_plugin.data.header, function (key, header) {
                                     if (key != 'Remove') {
                                         newItem[key] = $this.insmPriceManager('generateCell', {
                                             item:newItem,
                                             title: key,
                                             unique:header.unique                                          
                                         });
                                         _plugin.data.originalEditList[newItem.rowId][key] = "";
                                         $.each(_plugin.data.itemList, function (index, item) {
                                             item[key].detach();
                                         });
                                     }
                                 });

                                 _plugin.data.itemList.unshift(newItem);

                                 $.each(_plugin.data.itemList, function (index, item) {
                                     item.id = index;
                                 })
                                 $this.insmPriceManager('updateTable');
                             }).hide()
                        ),
                        _plugin.htmlElements.content.views.tableDiv
                    )                  
                )   
            );
            // generate Region
            _plugin.htmlElements.content.views.regionPicker.insmRegionPicker({
                applicationName: _plugin.settings.applicationName,
                includePlayers: false,
                clickable: true,
                nodeOutput: function (node) {                          
                    if (node.upid) {                            
                        var span = $('<span />').text(node.name);
                        _plugin.data.nodeNameLookup[node.upid] = span
                        return span;
                    }
                    else {
                        // Is a region
                        return node.name;
                    }
                },
                onSelect: function (region) {
                   
                    $this.insmPriceManager('onClose', {
                        success: function () {
                            _plugin.htmlElements.popupLoading.insmFullScreenLoading('popUp', {
                                timer: 200
                            });
                            _plugin.settings.region = region;
                            _plugin.htmlElements.content.views.addButton.fadeIn();
                            _plugin.htmlElements.content.views.saveButton.fadeIn();                            
                            $this.insmPriceManager('refreshData');
                        }
                    });
                    return false;
                    //$this.insm('changeRegion');
                }
            });
            return $this;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');

                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                var totalHeight = _plugin.settings.target.height();
                var headerHeight = _plugin.htmlElements.header.outerHeight(true);

                var contentContainerHeight = parseInt(totalHeight - headerHeight);
                _plugin.htmlElements.content.container.css({
                    height: contentContainerHeight + 'px'
                });

                var viewsContainerMargin = _plugin.htmlElements.content.views.container.outerHeight(true) - _plugin.htmlElements.content.views.container.height();

                _plugin.htmlElements.content.views.container.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });
                _plugin.htmlElements.content.views.regionPicker.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });
                var regionPicker = _plugin.htmlElements.content.views.regionPicker.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.content.views.container.css({
                    width: parseInt(target.width - regionPicker.width) + 'px'
                });
                _plugin.htmlElements.content.views.regionPicker.css({
                    height: parseInt(target.height - header.height) + 'px'
                });


                _plugin.htmlElements.content.views.regionPicker.insmRegionPicker('resize');
            }

            return $this;
        },

        hasSettings: function () {
            return false;
        },
        onClose: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');
            var moduleList = [];
            
            var originalString = JSON.stringify(_plugin.data.originalList);
            var finalString = JSON.stringify(_plugin.data.originalEditList);
            if (originalString == finalString) {
                options.success();
            } else {
                $.insmDialog({
                    type: 'confirm',
                    title: 'You have unsaved changes.',
                    message: 'Are you sure you want to leave?',
                    accept: function () {
                        options.success();
                    }
                });
            }            
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPriceManager');

            //$this.insmPriceManager('stopSubscriptions');
            $this.data('insmPriceManager', null).empty();

            return $this;
        },             
    };

    $.fn.insmPriceManager = function (method) {
        
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPriceManager');
        }
    };

})(jQuery);