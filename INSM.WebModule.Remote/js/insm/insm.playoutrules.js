/*
* INSM Playout Rules
* This file contain the INSM Playout Rules function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlayoutRules(settings);
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
    function parseNodes(node, parent) {
        if (node) {
            var children = [];
            $.each(node.Regions, function (index, child) {
                children.push(parseNodes(child, parent));
            });
            children.sort(function (a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });

            var user = $.insmFramework('user');
            var accessRight = 'Deny';
            if (user.Admin) {
                accessRight = 'Write';
            }
            else {
                if (node.AccessRights && node.AccessRights[user.Username] && node.AccessRights[user.Username].Content) {
                    accessRight = node.AccessRights[user.Username].Content;
                }
                else if (parent) {
                    accessRight = parent.accessRight;
                }
            }

            return {
                _class: 'region ' + node.State,
                name: node.Name,
                id: node.Id,
                description: node.Description,
                datasetId: node.DatasetId,
                state: node.State,
                children: children,
                accessLevel: accessRight
            };
        }
        return null;
    }

    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmPlayoutRules');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        refreshButton: $('<a class="button" />').text('Refresh'),
                        searchField: $('<div />').addClass('searchField'),
                        regionTree: $('<ul />').addClass('regionTree'),
                        breadcrumbs: $('<div/>').addClass('breadcrumbs'),
                        inheritInfo: $('<div />').addClass('inheritInfo'),
                        assetDistributionControls: $('<div />').addClass('assetDistributionControls'),
                        assetDistribution: $('<div />').addClass('assetDistribution'),
                        column: {
                            left: $('<div />').addClass('column'),
                            right: $('<div />').addClass('column')
                        }
                    },
                    data: {
                        tabs: options.tabs,
                        marketingTagKeys: { asset: [] },
                        marketingTags: { asset: [] },
                        moduleAccessRight: 'Write'
                    },
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Playout Rules',
                        ssl: false,
                        ams: '',
                        version: manifest.version,
                        enableModuleAccessCheck: false
                    }, options)
                };
                $this.data('insmPlayoutRules', _plugin);
            }

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

            function getMarketingTags() {
                var def = $.Deferred();
                var marketingTagsNotificationHandle = $.insmNotification({
                    type: 'load',
                    text: 'Loading marketing tags',
                    duration: 0
                });
                $.insmFramework('getModuleSettings', {
                    key: 'Marketing Tags',
                    success: function (marketingTags) {
                        marketingTagsNotificationHandle.update({
                            type: 'successful',
                            text: 'Successfully loaded marketing tags',
                            duration: -1
                        });
                        if (marketingTags) {
                            _plugin.data.marketingTags = marketingTags;
                        }
                        def.resolve();
                    },
                    denied: function (message) {
                        marketingTagsNotificationHandle.update({
                            type: 'unauthorized',
                            text: 'Authentication required',
                        });
                        $.insmFramework('login', {
                            success: function () {
                                marketingTagsNotificationHandle.update({
                                    type: 'successful',
                                    text: 'Access granted'
                                });
                                $this.insmPlayoutRules(options);
                            }
                        });
                        def.reject();
                    },
                    error: function (message) {
                        marketingTagsNotificationHandle.update({
                            type: 'error',
                            text: message
                        });
                        def.reject();
                    }
                });
                return def;
            }

            $.when($.insmFramework('initialized')).done(function () {
                $.insmAccess({
                    enableModuleAccessRestriction: _plugin.settings.enableModuleAccessCheck
                });
            
                $.insmAccess('getModuleAccess', {
                    module: _plugin.settings.applicationName.toLowerCase(),
                    success: function (data) {
                        var user = $.insmFramework('user');

                        if (!user.Admin && data.AccessLevel == 'Deny') {
                            $.insmPopup({
                                backdropTransparency: false,
                                content: $('<div />').text('Permission denied'),
                                autoOpen: true,
                                showCloseButton: false,
                                backdropClickClose: false
                            });

                            return;
                        }
                        else {
                            _plugin.data.moduleAccessRight = data.AccessLevel;
                        }

                        $.when(getMarketingTags()).done(function () {
                            if (_plugin.data.marketingTags.asset.length === 0) {
                                $.insmNotification({
                                    type: 'error',
                                    text: 'No marketing tags available for assets',
                                    duration: 0
                                });
                                _plugin.htmlElements.column.left.hide();
                                _plugin.htmlElements.column.right.hide();
                                return;
                            }
                            _plugin.framework = $.insmFramework('getDeprecatedFramework');

                            // Init HTML
                            $this.append(
                                _plugin.htmlElements.column.left.append(
                                    $('<div />').addClass('refreshButton').append(_plugin.htmlElements.refreshButton),
                                    _plugin.htmlElements.searchField,
                                    _plugin.htmlElements.regionTree
                                ),
                                _plugin.htmlElements.column.right.append(
                                    _plugin.htmlElements.breadcrumbs,
                                    _plugin.htmlElements.inheritInfo,
                                    _plugin.htmlElements.assetDistributionControls,
                                    _plugin.htmlElements.assetDistribution
                                )
                            ).addClass('nowrap');

                            // Init Views


                            _plugin.htmlElements.refreshButton.click(function () {
                                $this.insmPlayoutRules('displayRegionTree');
                            });
                            $this.insmPlayoutRules('displayRegionTree');
                        });
                    },
                    denied: function (data) {
                        $.insmFramework('login', {
                            success: function () {
                                $this.insmPlayoutRules(options);
                            }
                        });
                    }
                });
            });
            return $this;
        },
        displayAssetDistribution: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayoutRules');
            
            var assetDistributionNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading asset distribution',
                duration: 0
            });

            _plugin.htmlElements.column.right.hide();
            _plugin.htmlElements.assetDistribution.empty().show();

            var node = _plugin.htmlElements.regionTree.insmListTree('getNodeByParameter', {
                parameter: 'id',
                identifier: options.regionId
            });

            $.insmFramework('dataset', {
                method: 'geteffective',
                regionId: node.id,
                error: function (message) {
                    throw new Error(message);
                },
                denied: function (data) {
                    assetDistributionNotificationHandle.update({
                        type: 'unauthorized',
                        text: data.Message
                    });
                },
                success: function (dataset) {
                    var assetDistribution = null;
                    var inherited = false;
                    var regionInheritedFrom = null;

                    if (dataset.Items.AssetDistribution && dataset.Items.AssetDistribution.Value) {
                        assetDistribution = JSON.parse(dataset.Items.AssetDistribution.Value);
                        _plugin.htmlElements.inheritInfo.empty().hide();
                        if (node.id != dataset.Items.AssetDistribution.OriginalRegionId) {
                            inherited = true;
                            regionInheritedFrom = _plugin.htmlElements.regionTree.insmListTree('getNodeByParameter', {
                                parameter: 'id',
                                identifier: dataset.Items.AssetDistribution.OriginalRegionId
                            });

                            _plugin.htmlElements.inheritInfo.html([
                                'Inherited from ',
                                $('<a />').click(function () {
                                    $this.insmPlayoutRules('displayAssetDistribution', {
                                        regionId: regionInheritedFrom.id,
                                        accessLevel: regionInheritedFrom.accessLevel
                                    });
                                }).text(regionInheritedFrom.name)
                            ]).show();
                        }
                    }
                    if (!assetDistribution) {
                        // Create default assetDistribution
                        assetDistribution = [];
                    }
                    // Breadcrumbs
                    _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('clear');

                    var crumb = node;
                    while (crumb) {
                        _plugin.htmlElements.breadcrumbs.insmBreadcrumbs('unshift', {
                            crumb: crumb,
                            title: crumb.name,
                            addClass: (regionInheritedFrom && regionInheritedFrom.id == crumb.id ? 'italic' : ''),
                            onClick: function () {
                                if (node.id !== this.crumb.id) {
                                    $this.insmPlayoutRules('displayAssetDistribution', {
                                        regionId: this.crumb.id,
                                        accessLevel: this.crumb.accessLevel
                                    });
                                }
                            }
                        });
                        crumb = crumb._parent;
                    }

                    var saveButton = $('<a/>', {
                        'class': "button",
                        href: "#",
                        text: "Save"
                    }).click(function () {
                        if (!_plugin.htmlElements.assetDistribution.insmInput('validate')) {
                            $.insmNotification({
                                type: 'information',
                                text: 'Field validation failed'
                            });
                            return false;
                        }
                        var assetDistributionValue = _plugin.htmlElements.assetDistribution.insmInput('getValue');
                        var timeFailure = false;
                        $.each(assetDistributionValue, function (index, distribution) {
                            if (distribution.startTime >= distribution.endTime) {
                                $.insmNotification({
                                    type: 'warning',
                                    text: 'Time validation failed: Start time has to be before the end time.'
                                });
                                timeFailure = true;
                                return false;
                            }
                        });
                        if (timeFailure) {
                            return false;
                        }

                        if ($.isArray(assetDistributionValue) && assetDistributionValue.length === 0) {

                            if (assetDistribution.length == 0) {
                                $this.insmPlayoutRules('displayAssetDistribution', options);
                            }
                            else {
                                _plugin.framework.dataset({
                                    method: 'removeItem',
                                    regionId: node.id,
                                    datasetItemKey: 'AssetDistribution',
                                    success: function (data) {
                                        $this.insmPlayoutRules('displayAssetDistribution', options);
                                    },
                                    error: function (message) {
                                        if (message.indexOf('DataSet not found for') == 0 || message == "Item AssetDistribution did not exist on remove item") {
                                            $.insmNotification({
                                                type: 'error',
                                                text: 'Cannot delete inherited rule.'
                                            });
                                        }
                                        else {
                                            $.insmNotification({
                                                type: 'error',
                                                text: message
                                            });
                                        }
                                    },
                                    denied: function () {
                                        $.insmNotification({
                                            type: 'error',
                                            text: 'Access denied'
                                        });
                                        _plugin.framework.login({
                                            type: data.Type,
                                            target: data.Target,
                                            version: data.Version,
                                            success: function () {
                                                $this.insmPlayoutRules('displayRegionTree');
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            _plugin.framework.dataset({
                                method: 'set',
                                regionId: node.id,
                                datasetItemKey: 'AssetDistribution',
                                datasetItemType: 'Text',
                                datasetItemValue: JSON.stringify(assetDistributionValue),
                                success: function (data) {
                                    $this.insmPlayoutRules('displayAssetDistribution', options);
                                },
                                error: function (message) {
                                    $.insmNotification({
                                        type: 'error',
                                        text: message
                                    });
                                },
                                denied: function () {
                                    $.insmNotification({
                                        type: 'error',
                                        text: 'Access denied'
                                    });
                                    _plugin.framework.login({
                                        type: data.Type,
                                        target: data.Target,
                                        version: data.Version,
                                        success: function () {
                                            $this.insmPlayoutRules('displayRegionTree');
                                        }
                                    });
                                }
                            });
                        }
                    }).hide();

                    var cancelButton = $('<a/>', {
                        'class': "button",
                        href: "#",
                        text: "Cancel"
                    }).click(function () {
                        $this.insmPlayoutRules('displayAssetDistribution', options);
                    }).hide();

                    var editButton = $('<a/>', {
                        'class': "button",
                        href: "#",
                        text: "Edit"
                    }).click(function () {
                        saveButton.show();
                        cancelButton.show();
                        editButton.hide();
                        _plugin.htmlElements.assetDistribution.insmInput('edit');
                    });

                    if (options.accessLevel === 'Write' && _plugin.data.moduleAccessRight === 'Write') {
                        _plugin.htmlElements.assetDistributionControls.html([saveButton, editButton, cancelButton]);
                    }
                    else {
                        _plugin.htmlElements.assetDistributionControls.empty();
                    }

                    _plugin.htmlElements.assetDistribution.insmInput('destroy').insmInput({
                        type: "table",
                        multiSelect: true,
                        currentValue: assetDistribution,
                        required: false,
                        initObject: {
                            name: {
                                pretty: 'Name',
                                type: "string",
                                currentValue: [],
                                required: true
                            },
                            startTime: {
                                pretty: 'Start Time',
                                type: "time",
                                currentValue: '00:00',
                                required: true
                            },
                            endTime: {
                                pretty: 'End Time',
                                type: "time",
                                currentValue: '24:00',
                                required: true
                            },
                            ruleSets: {
                                pretty: 'Rule Sets',
                                type: "Ruleset",
                                multiSelect: true,
                                currentValue: [],
                                ruleHeader: 'Asset',
                                ruleKeys: _plugin.data.marketingTags.asset
                            }
                        }
                    }).insmInput('view');
                    _plugin.htmlElements.column.right.fadeIn();

                    assetDistributionNotificationHandle.update({
                        type: 'successful',
                        text: 'Loading asset distribution successful'
                    });
                }
            });

            return $this;
        },
        displayRegionTree: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayoutRules');

            var regionTreeNofificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading region tree',
                duration: 0
            });

            _plugin.htmlElements.searchField.insmSearchField({
                autoSearch: false,
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
                            $this.insmPlayoutRules('displayAssetDistribution', {
                                regionId: region.id,
                                accessLevel: region.accessLevel
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
                    if (regionTree) {
                        var tree = parseNodes(regionTree);
                        tree.root = true;
                        _plugin.htmlElements.regionTree.insmListTree({
                            tree: tree,
                            clickable: true,
                            selectable: false,
                            recursive: false,
                            lazyload: false,
                            onClick: function (node) {
                                $this.insmPlayoutRules('displayAssetDistribution', {
                                    regionId: node.id,
                                    accessLevel: node.accessLevel
                                });
                            }
                        });
                        regionTreeNofificationHandle.update({
                            type: 'successful',
                            text: 'Region tree downloaded successfully',
                            duration: -1
                        });


                        _plugin.htmlElements.searchField.insmSearchField('triggerSearch');
                    }
                    else {
                        regionTreeNofificationHandle.update({
                            type: 'unauthorized',
                            text: 'Your account has no access to any region tree - therefore you cannot use this module',
                            duration: 0
                        });
                        _plugin.htmlElements.column.right.hide();
                        _plugin.htmlElements.column.left.hide();
                    }
                },
                denied: function (data) {
                    _plugin.framework.login({
                        type: data.Type,
                        target: data.Target,
                        version: data.Version,
                        success: function () {
                            regionTreeNofificationHandle.update({
                                type: 'unauthorized',
                                text: '',
                                duration: -1
                            });
                            $this.insmPlayoutRules('displayRegionTree');
                        }
                    });
                },
                error: function (message) {
                    throw new Error(message);
                }
            });

            return $this;
        }
    };

    $.fn.insmPlayoutRules = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlayoutRules');
        }
    };
})(jQuery);