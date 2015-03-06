/*
* INSM Dataset Editor
* This file contain the INSM Dataset Editor function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmDatasetEditor(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
* Koji Wakayama - Creuna AB
*/

(function ($) {
    function parseNodes(node) {
        if (node) {
            var children = [];
            $.each(node.Regions, function (index, child) {
                children.push(parseNodes(child));
            });
            return {
                _class: 'region ' + node.State,
                name: node.Name,
                id: node.Id,
                description: node.Description,
                datasetId: node.DatasetId,
                state: node.State,
                children: children
            };
        }
        return null;
    }

    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmDatasetEditor');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        searchField: $('<div />').addClass('searchField'),
                        regionTree: $('<ul />').addClass('regionTree'),
                        breadcrumbs: $('<div/>').addClass('breadcrumbs'),
                        datasetEditorControls: $('<div />').addClass('datasetEditorControls'),
                        dataset: $('<div />').addClass('dataset'),
                        column: {
                            left: $('<div />').addClass('column'),
                            right: $('<div />').addClass('column')
                        }
                    },
                    data: {
                        tabs: options.tabs
                    },
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Dataset Editor',
                        ssl: false,
                        ams: '',
                        version: manifest.version
                    }, options)
                };
                $this.data('insmDatasetEditor', _plugin);
            }

            var frameworkNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Initializing Instoremedia',
                duration: 0
            });

            if (!_plugin.settings.framework) {
                if (!$.insmFramework('isInitialized')) {
                    $.insmFramework({
                        ams: _plugin.settings.ams,
                        app: _plugin.settings.applicationName,
                        version: _plugin.settings.version,
                        protocol: (_plugin.settings.ssl ? 'https' : 'http'),
                        session: (urlDecode($(document).getUrlParam('session')) || '')
                    });
                }
            }

            $.when($.insmFramework('initialized')).done(function () {
                frameworkNotificationHandle.update({
                    type: 'successful',
                    text: 'Initializing Instoremedia successful'
                });
                _plugin.framework = $.insmFramework('getDeprecatedFramework');

                // Init HTML
                $this.append(
                    _plugin.htmlElements.column.left.append(
                        $('<div class="paddingDiv">').append(_plugin.htmlElements.searchField),
                        $('<div class="paddingDiv">').append(_plugin.htmlElements.regionTree)
                    ),
                    _plugin.htmlElements.column.right.append(
                        $('<div class="paddingDiv">').append(_plugin.htmlElements.breadcrumbs),
                        $('<div class="paddingDiv">').append(_plugin.htmlElements.datasetEditorControls),
                        $('<div class="paddingDiv">').append(_plugin.htmlElements.dataset)
                    )
                ).addClass('nowrap');

                // Init Views
                _plugin.htmlElements.column.left.insmViewHandler({
                    viewName: 'regionTree',
                    method: function () {
                        $this.insmDatasetEditor('displayRegionTree');
                    }
                });

                _plugin.htmlElements.column.right.insmViewHandler({
                    viewName: 'datasetEditor',
                    method: function (viewData) {
                        $this.insmDatasetEditor('displayDatasetEditor', viewData);
                    }
                });

                _plugin.htmlElements.column.left.insmViewHandler('show', {
                    viewName: 'regionTree'
                });
            });
            return $this;
        },
        displayDataset: function(option) {
            var $this = $(this);
            var _plugin = $this.data('insmDatasetEditor');

            return $this;
        },
        displayDatasetEditor: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmDatasetEditor');

            var datasetEditorNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading dataset editor',
                duration: 0
            });

            _plugin.htmlElements.column.right.hide();
            var datasetInput = {
                method: 'get'
            };

            if(options.regionId){
                var node = _plugin.htmlElements.regionTree.insmListTree('getNodeByParameter', {
                    parameter: 'id',
                    identifier: options.regionId
                });
                datasetInput.regionId = node.id;
                _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('clear');
            }
            else if(options.datasetId) {
                datasetInput.datasetId = options.datasetId;
            }

            $.extend(datasetInput, {
                success: function (dataset) {
                    renderDataset(dataset);
                    _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('push', {
                        title: dataset.Name,
                        addClass: '',
                        onClick: function(event){
                            var crumbs = _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('get');
                            $.each(crumbs, function(index,crumb){
                                if(crumb.id === dataset.Id){
                                    for(var i=0; i<index+2; i++) {
                                        _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('pop');
                                    }
                                    return false;
                                }
                            });
                            $this.insmDatasetEditor('displayDatasetEditor', {
                                datasetId: dataset.Id
                            });
                        },
                        id: dataset.Id
                    });
                },
                error: function (message) {
                    renderDataset({
                        Name: '',
                        Type: 'dataset',
                        Description: '',
                        Items: {}
                    });
                },
                denied: function (data) {
                    // TODO: Recover
                }
            });

            function renderDataset(dataset){
                var saveButton = $('<a/>', {
                    'class': "button",
                    href: "#",
                    text: "Save"
                }).click(function () {
                    var saveNotificationHandle = $.insmNotification({
                        type: 'load',
                        text: 'Saving dataset',
                        duration: 0
                    });

                    if (_plugin.htmlElements.dataset.insmInput('validate')) {
                        var obj = _plugin.htmlElements.dataset.insmInput('getValue');
                        var data = {
                            method: 'set',
                            name: obj.Name,
                            description: obj.Description,
                            regionId: options.regionId,
                            removeAllReferences: true,
                            value: JSON.stringify(obj),
                            success: function (dataset) {
                                saveNotificationHandle.update({
                                    type: 'successful',
                                    text: 'Saved dataset'
                                });
                                $this.insmDatasetEditor('displayDatasetEditor', options);
                            },
                            denied: function () {
                                saveNotificationHandle.update({
                                    type: 'error',
                                    text: 'denied'
                                });

                            },
                            error: function (message) {
                                saveNotificationHandle.update({
                                    type: 'error',
                                    text: message
                                });
                            }
                        };
                        $.insmFramework('dataset', data);
                    }
                    else {
                        saveNotificationHandle.update({
                            type: 'error',
                            text: 'Dataset input is invalid'
                        });
                    }
                }).hide();

                var cancelButton = $('<a/>', {
                    'class': "button",
                    href: "#",
                    text: "Cancel"
                }).click(function () {
                    saveButton.hide();
                    cancelButton.hide();
                    editButton.show();

                    // Reset to old value
                    var resetValue = _plugin.htmlElements.dataset.data.tempValue;
                    renderDataset(resetValue);

                }).hide();

                var editButton = $('<a/>', {
                    'class': "button",
                    href: "#",
                    text: "Edit"
                }).click(function () {
                    saveButton.show();
                    cancelButton.show();
                    editButton.hide();

                    _plugin.htmlElements.dataset.data.tempValue = $.extend(true, {}, _plugin.htmlElements.dataset.insmInput('getValue'));

                    _plugin.htmlElements.dataset.insmInput('edit');
                });

                _plugin.htmlElements.datasetEditorControls.html([saveButton, editButton, cancelButton]);
                //_plugin.htmlElements.dataset
                _plugin.htmlElements.dataset.insmInput('destroy').insmInput({
                    type: "table",
                    multiSelect: false,
                    required: false,
                    currentValue: [dataset],
                    initObject: {
                        Name: {
                            type: "string",
                            currentValue: []
                        },
                        Type: {
                            type: "string",
                            currentValue: []
                        },
                        Description: {
                            type: "string",
                            currentValue: [],
                            required: false
                        },
                        Items: {
                            type: "dataset",
                            currentValue: {},
                            onItemClick: function(item){
                                if(item.Type === "DataSet"){
                                    $this.insmDatasetEditor('displayDatasetEditor', {
                                        datasetId: item.DataSetId
                                    });
                                }
                            }
                        }
                    }
                }).insmInput('view');

                _plugin.htmlElements.column.right.fadeIn();

                datasetEditorNotificationHandle.update({
                    type: 'successful',
                    text: 'Loading dataset editor successful'
                });
            }

            $.insmFramework('dataset', datasetInput);

            return $this;
        },
        displayRegionTree: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDatasetEditor');

            _plugin.htmlElements.searchField.insmSearchField({
                onSearch: function (searchstring) {
                    if (searchstring) {
                        var hits = 0;
                        _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                        var selectedNodeId;
                        $.each(_plugin.htmlElements.regionTree.insmListTree('getAllNodes'), function (index, node) {
                            if (node.name.toLowerCase().indexOf(searchstring.toLowerCase()) >= 0) {
                                hits++;
                                selectedNodeId = index;
                                _plugin.htmlElements.regionTree
                                    .insmListTree('expandNode', {
                                        nodeId: index
                                    })
                                    .insmListTree('markNode', {
                                        nodeId: index
                                    });
                            }
                        });
                        if (hits == 1) {
                            var region = _plugin.htmlElements.regionTree.insmListTree('getNode', {
                                id: selectedNodeId
                            });
                            $this.insmDatasetEditor('displayDatasetEditor', {
                                regionId: region.id
                            });
                        }
                        $.insmNotification({
                            type: 'information',
                            text: hits + ' search hits'
                        });
                    }
                },
                onClear: function () {
                    _plugin.htmlElements.searchField.insmSearchField('clearSearchField');
                    _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                }
            }).addClass('searchfield');

            $.insmFramework('regionTree', {
                regionId: _plugin.settings.regionId,
                includePlayers: false,
                success: function (regionTree) {
                    var tree = parseNodes(regionTree);
                    tree.root = true;
                    _plugin.htmlElements.regionTree.insmListTree({
                        tree: tree,
                        clickable: true,
                        selectable: false,
                        recursive: false,
                        lazyload: false,
                        onClick: function (node) {
                            _plugin.htmlElements.column.right.insmViewHandler('show', {
                                viewName: 'datasetEditor',
                                data: {
                                    regionId: node.id
                                }
                            });
                        }
                    });
                },
                denied: function (data) {
                    _plugin.framework.login({
                        type: data.Type,
                        target: data.Target,
                        version: data.Version,
                        success: function () {
                            $.insmViewHandler('show', {
                                viewName: 'regionTree'
                            });
                        }
                    });
                },
                error: function (message) {
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                }
            });

            return $this;
        }
    };

    $.fn.insmDatasetEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmDatasetEditor');
        }
    };
})(jQuery);