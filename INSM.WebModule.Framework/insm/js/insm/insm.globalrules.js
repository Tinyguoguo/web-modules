/*
* INSM Global Rules
* This file contain the INSM Global Rules function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmGlobalRules(settings);
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
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmGlobalRules');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        controlPanel: $('<div class="control-panel">'),
                        inheritInfo: $('<div />').addClass('inheritInfo'),
                        datasetItemControls: $('<div />').addClass('datasetItemControls'),
                        datasetItem: $('<div />').addClass('datasetItem'),
                        main: $('<div />').addClass('main')
                    },
                    data: {
                        tabs: options.tabs,
                        marketingTags: {
                            asset: [],
                            player: []
                        },
                        marketingTagKeys: {
                            asset: [],
                            player: []
                        }
                    },
                    settings: $.extend({
                        datasetItemKey: 'AssetExclusion',
                        framework: null,
                        regionId: 1,
                        applicationName: 'Global Rules',
                        ssl: false,
                        ams: '',
                        version: manifest.version
                    }, options)
                };
                $this.data('insmGlobalRules', _plugin);
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

                _plugin.htmlElements.controlPanel.append(_plugin.htmlElements.datasetItemControls);

                // Init HTML
                $this.append(
                    _plugin.htmlElements.controlPanel,
                    _plugin.htmlElements.main.append(
                        _plugin.htmlElements.inheritInfo,
                        _plugin.htmlElements.datasetItem
                    )
                );

                $.insmFramework('moduleSettings', {
                    key: 'Marketing Tags',
                    success: function (marketingTags) {
                        if (marketingTags) {
                            _plugin.data.marketingTags = marketingTags;
                        }
                        $.each(_plugin.data.marketingTags.asset, function (index, tag) {
                            _plugin.data.marketingTagKeys.asset.push(tag.name);
                        });
                        $.each(_plugin.data.marketingTags.player, function (index, tag) {
                            _plugin.data.marketingTagKeys.player.push(tag.name);
                        });
                        $this.insmGlobalRules('displayDatasetItem');
                    },
                    denied: function (message) {
                        $.insmFramework('login', {
                            success: function () {
                                marketingTagsNotificationHandle.update({
                                    type: 'successful',
                                    text: 'Access granted'
                                });
                                $this.insmGlobalRules(options);
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
            });
            return $this;
        },
        displayDatasetItem: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmGlobalRules');
            var datasetItemNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading asset distribution',
                duration: 0
            });

            _plugin.htmlElements.main.hide();

            $.insmFramework('dataset', {
                method: 'geteffective',
                regionId: 1,
                success: function (dataset) {
                    var datasetItem;
                    var inherited = false;
                    var regionInheritedFrom;

                    if (dataset.Items[_plugin.settings.datasetItemKey] && dataset.Items[_plugin.settings.datasetItemKey].Value) {
                        datasetItem = JSON.parse(dataset.Items[_plugin.settings.datasetItemKey].Value);
                    }
                    if (!datasetItem) {
                        // Create default datasetItem
                        datasetItem = [
                        ]
                    }

                    var saveButton = $('<a/>', {
                        class: "button",
                        href: "#",
                        text: "Save"
                    }).click(function () {
                        if (!_plugin.htmlElements.datasetItem.insmInput('validate')) {
                            return;
                        }
                        var saveNotificationHandle = $.insmNotification({
                            type: 'load',
                            text: 'Saving asset distribution',
                            duration: 0
                        });
                        var datasetItemValue = _plugin.htmlElements.datasetItem.insmInput('getValue');
                        _plugin.framework.dataset({
                            method: 'set',
                            regionId: 1,
                            datasetItemKey: _plugin.settings.datasetItemKey,
                            datasetItemType: 'Text',
                            datasetItemValue: JSON.stringify(datasetItemValue),
                            success: function (data) {
                                $.insmFramework('activityRemove', {
                                    id: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                                    type: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                                    success: function (activity) {
                                        saveNotificationHandle.update({
                                            type: 'successful',
                                            text: 'Saving asset distribution successful'
                                        });
                                        $this.insmGlobalRules('displayDatasetItem', options);
                                    },
                                    denied: function () {
                                        // TODO
                                    },
                                    error: function (message) {
                                        throw new Error(message);
                                    }
                                });
                            },
                            error: function (message) {
                                saveNotificationHandle.update({
                                    type: 'error',
                                    text: message
                                });
                            },
                            denied: function () {
                                saveNotificationHandle.update({
                                    type: 'error',
                                    text: 'Access denied'
                                });
                                _plugin.framework.login({
                                    type: data.Type,
                                    target: data.Target,
                                    version: data.Version,
                                    success: function () {
                                        $this.insmGlobalRules('displayDatasetItem');
                                    }
                                });
                            }
                        });
                    }).hide();

                    var cancelButton = $('<a/>', {
                        class: "button",
                        href: "#",
                        text: "Cancel"
                    }).click(function () {
                        $.insmFramework('activityRemove', {
                            id: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                            type: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                            success: function (activity) {
                                $this.insmGlobalRules('displayDatasetItem');
                            },
                            denied: function () {
                                // TODO
                            },
                            error: function (message) {
                                throw new Error(message);
                            }
                        });
                    }).hide();

                    var editButton = $('<a/>', {
                        class: "button",
                        href: "#",
                        text: "Edit"
                    }).click(function () {
                        $.insmFramework('activityCheck', {
                            id: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                            type: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                            success: function (activity) {
                                if (activity.length > 0) {
                                    $.insmNotification({
                                        type: 'unauthorized',
                                        text: 'Rules are already being edited by ' + activity[0].User
                                    });
                                }
                                else {
                                    $.insmFramework('activityAdd', {
                                        id: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                                        type: 'GlobalRules:' + _plugin.settings.datasetItemKey,
                                        success: function (activity) {
                                            saveButton.show();
                                            cancelButton.show();
                                            editButton.hide();
                                            _plugin.htmlElements.datasetItem.insmInput('edit');
                                        },
                                        denied: function () {
                                            // TODO
                                        },
                                        error: function (message) {
                                            throw new Error(message);
                                        }
                                    });
                                }
                            },
                            denied: function () {
                                // TODO
                            },
                            error: function (message) {
                                throw new Error(message);
                            }
                        });
                    });

                    _plugin.htmlElements.datasetItemControls.html([saveButton, editButton, cancelButton]);


                    _plugin.htmlElements.datasetItem.insmInput({
                        type: "Rules",
                        leftHeader: 'Asset',
                        rightHeader: 'Player',
                        leftValues: _plugin.data.marketingTagKeys.asset,
                        rightValues: _plugin.data.marketingTagKeys.player,
                        currentValue: datasetItem,
                        multiSelect: true,
                        required: false
                    }).insmInput('view');

                    //_plugin.htmlElements.datasetItem
                    //_plugin.htmlElements.datasetItem.insmInput({
                    //    type: "DefaultRules",
                    //    assetKeys: _plugin.data.marketingTagKeys.asset,
                    //    playerKeys: _plugin.data.marketingTagKeys.player,
                    //    currentValue: datasetItem,
                    //    multiSelect: true
                    //}).insmInput('view');

                    _plugin.htmlElements.main.fadeIn();

                    datasetItemNotificationHandle.update({
                        type: 'successful',
                        text: 'Loading asset distribution successful'
                    });
                },
                error: function (message) {
                    datasetItemNotificationHandle.update({
                        type: 'error',
                        text: message
                    });
                },
                denied: function (data) {
                    _plugin.framework.login({
                        type: data.Type,
                        target: data.Target,
                        version: data.Version,
                        success: function () {
                            $this.insmGlobalRules('displayDatasetItem');
                        }
                    });
                }
            });

            return $this;
        }
    };

    $.fn.insmGlobalRules = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmGlobalRules');
        }
    };
})(jQuery);