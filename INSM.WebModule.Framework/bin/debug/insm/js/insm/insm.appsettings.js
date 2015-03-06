/*
* INSM App Settings
* This file contain the INSM App Settings function.
* 
* This file may only be used by Instoremedia AB or it's customers and partners.
* 
* Called by $('identifier').insmAppSettings(settings);
*
* File dependencies:
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
            $.each(node.Players, function (index, child) {
                children.push({
                    _class: 'player ' + child.State,
                    name: child.Name,
                    id: child.UPId,
                    description: child.Description,
                    datasetId: child.DatasetId,
                    state: child.State,
                    type: 'player',
                    version: child.Version
                });
            });

            if (children) {
                children.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });
            }

            return {
                _class: 'region ' + node.State,
                name: node.Name,
                id: node.Id,
                description: node.Description,
                datasetId: node.DatasetId,
                state: node.State,
                children: children,
                type: 'region'
            };
        }
        return null;
    }
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmAppSettings');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Player Settings',
                        ssl: false,
                        ams: '',
                        version: manifest.version,
                        onUpdate: function (currentValue) { }
                    }, options),
                    data: {
                        appSettings: null,
                        currentId: null
                    },
                    htmlElements: {
                        appSettings: $('<div />', { "class": "appSettings" }),
                        appSettingsControls: $('<div />', { "class": "appSettingsControls" }),
                        appSettingEditor: $('<div />', { "class": "appSettingEditor" }),
                        searchField: $('<div />').addClass('searchField'),
                        regionTree: $('<ul />').addClass('regionTree'),
                        breadcrumbs: $('<div/>').addClass('breadcrumbs'),
                        inheritInfo: $('<div />').addClass('inheritInfo'),
                        regionTitle: $('<h2 />'),
                        column: {
                            left: $('<div />').addClass('column'),
                            right: $('<div />').addClass('column')
                        }
                    }
                };
            }

            $this.data('insmAppSettings', _plugin);
            $this.empty();

            var frameworkNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Initializing App Settings',
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

            $.when($.insmFramework('initialized')).done(function (data) {
                frameworkNotificationHandle.update({
                    type: 'successful',
                    text: 'Initializing App Settings successful'
                });
                _plugin.framework = $.insmFramework('getDeprecatedFramework');

                // Init View
                $this.append(
                    _plugin.htmlElements.appSettings.append(
                        _plugin.htmlElements.column.left.append(
                            _plugin.htmlElements.searchField,
                            _plugin.htmlElements.regionTree
                        ),
                        _plugin.htmlElements.column.right.append(
                            _plugin.htmlElements.regionTitle,
                            _plugin.htmlElements.breadcrumbs,
                            _plugin.htmlElements.appSettingsControls,
                            _plugin.htmlElements.appSettingEditor
                        )
                    )
                );

                // Display Region Tree
                $this.insmAppSettings('displayRegionTree');
            });

            return $this;
        },
        displayRegionTree: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAppSettings');

            _plugin.htmlElements.searchField.insmSearchField({
                autoSearch: false,
                onSearch: function (searchstring) {
                    if (searchstring) {
                        _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                        var selectedNodeId;
                        $.each(_plugin.htmlElements.regionTree.insmListTree('getAllNodes'), function (index, node) {
                            if (node.name.toLowerCase().indexOf(searchstring.toLowerCase()) >= 0) {
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
                        recursive: true,
                        lazyload: false,
                        onClick: function (node) {
                            _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                            _plugin.htmlElements.regionTree.insmListTree('markNode', {
                                node: node
                            });
                            _plugin.htmlElements.regionTitle.text(node.name);
                            _plugin.data.currentId = node.id;
                            $this.insmAppSettings('displayAppSettingEditor', {
                                node: node
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
                            $this.insmAppSettings('displayRegionTree');
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
        },
        displayAppSettingEditor: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAppSettings');

            var not = $.insmNotification({
                text: 'Getting region info',
                type: 'load',
                duration: 0
            });

            // Clear container
            _plugin.htmlElements.appSettingEditor.empty();
            _plugin.htmlElements.appSettingsControls.empty();
            $.insmFramework((options.node.type === 'region') ? 'regionSettings' : 'playerSettings', {
                id: options.node.id,
                success: function (data) {
                    $.insmFramework('region', {
                        regionId: options.node.id,
                        success: function (region) {
                            $.each(data, function (index, playerSetting) {
                                if (typeof region.Settings.App[playerSetting.Key] !== 'undefined') {
                                    data[index].Value = region.Settings.App[playerSetting.Key];
                                }
                                else {
                                    data[index].Value = data[index].DefaultValue;
                                }
                            });

                            not.update({
                                text: 'Downloaded region info',
                                type: 'successful'
                            });
                            // Display App Setting Editor
                            _plugin.data.appSettings = data;

                            // Add breadcrumbs
                            _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('clear');
                            _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('unshift', {
                                title: options.node.name,
                                onClick: function () {
                                    $this.insmAppSettings('displayAppSettingEditor', {
                                        node: options.node
                                    });
                                }
                            });
                            var breadcrumbs = [];

                            function pushBread(leaf) {
                                if (leaf._parent) {
                                    breadcrumbs.push(leaf._parent);
                                    pushBread(leaf._parent);
                                }
                            } (options.node);

                            $.each(breadcrumbs, function (index, breadcrumb) {
                                _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('unshift', {
                                    title: breadcrumb.name,
                                    onClick: function () {
                                        $this.insmAppSettings('displayAppSettingEditor', {
                                            node: breadcrumb
                                        });
                                    }
                                });
                            });

                            // Draw App settings
                            var appSettingEditor = _plugin.htmlElements.appSettingEditor.insmInputAppSetting({
                                values: _plugin.data.appSettings
                            }).insmInputAppSetting('view');

                            // Add controls
                            _plugin.htmlElements.appSettingsControls.empty();

                            var editButton = $('<a/>', {
                                'class': "button",
                                href: "#",
                                text: "Edit"
                            }).click(function () {
                                appSettingEditor.insmInputAppSetting('edit');
                                saveButton.show();
                                cancelButton.show();
                                editButton.hide();
                            });

                            var cancelButton = $('<a/>', {
                                'class': "button",
                                href: "#",
                                text: "Cancel"
                            }).click(function () {
                                appSettingEditor.insmInputAppSetting('cancel');
                                saveButton.hide();
                                cancelButton.hide();
                                editButton.show();
                            }).hide();

                            var saveButton = $('<a/>', {
                                'class': "button",
                                href: "#",
                                text: "Save"
                            }).click(function () {
                                // Parse data
                                var parseData = appSettingEditor.insmInputAppSetting('getValue');

                                var appSettings = {};
                                $.each(parseData, function (key, value) {
                                    appSettings[key] = {}.value = value.Value;
                                });
                                var not = $.insmNotification({
                                    type: 'load',
                                    text: 'Saving appsettings',
                                    duration: 0
                                });
                                var data = {
                                    method: 'set',
                                    regionid: _plugin.data.currentId,
                                    id: _plugin.data.currentId,
                                    appSettings: JSON.stringify(appSettings),
                                    success: function (data) {
                                        not.update({
                                            text: 'Appsettings saved',
                                            type: 'successful'
                                        });
                                        saveButton.hide();
                                        cancelButton.hide();
                                        editButton.show();
                                        $this.insmAppSettings('displayAppSettingEditor', {
                                            node: options.node
                                        });
                                    },
                                    error: function (data) {
                                        not.update({
                                            text: data,
                                            type: 'error'
                                        });
                                    },
                                    denied: function (data) {
                                        not.update({
                                            text: 'Denied',
                                            type: 'error'
                                        });
                                        _plugin.framework.login({
                                            type: data.Type,
                                            target: data.Target,
                                            version: data.Version,
                                            success: function () {
                                                $this.insmAppSettings('displayRegionTree');
                                            }
                                        });
                                    }
                                };

                                options.node.type === 'region' ? delete data.id : delete data.regionid;
                                $.insmFramework((options.node.type === 'region') ? 'region' : 'players', data);

                            }).hide();

                            _plugin.htmlElements.appSettingsControls.html([saveButton, editButton, cancelButton]);
                        },
                        error: function (data) {
                            not.update({
                                text: data,
                                type: 'error'
                            });
                        },
                        denied: function (data) {
                            not.update({
                                text: 'Denied',
                                type: 'error'
                            });
                            _plugin.framework.login({
                                type: data.Type,
                                target: data.Target,
                                version: data.Version,
                                success: function () {
                                    $this.insmAppSettings('displayRegionTree');
                                }
                            });
                        }
                    });
                },
                error: function (data) {
                    not.update({
                        text: data,
                        type: 'error'
                    });
                },
                denied: function (data) {
                    not.update({
                        text: 'Denied',
                        type: 'error'
                    });
                    _plugin.framework.login({
                        type: data.Type,
                        target: data.Target,
                        version: data.Version,
                        success: function () {
                            $this.insmAppSettings('displayRegionTree');
                        }
                    });
                }
            });
        }
    }

    $.fn.insmAppSettings = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAppSettings');
        }
    };
})(jQuery);