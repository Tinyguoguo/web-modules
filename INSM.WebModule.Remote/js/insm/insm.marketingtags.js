/*
* INSM Marketing Tags
* This file contain the INSM Marketing Tags function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmMarketingTags(settings);
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
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmMarketingTags');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        controlPanel: $('<div class="control-panel">'),
                        marketingTagsControls: $('<div />').addClass('marketingTagsControls'),
                        marketingTags: $('<div />').addClass('marketingTags'),
                        assetTags: $('<div />').addClass('assetTags'),
                        playerTags: $('<div />').addClass('playerTags')
                    },
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Marketing Tags',
                        ssl: false,
                        ams: '',
                        version: manifest.version
                    }, options),
                    data: {
                        marketingTags: {}
                    }
                };
                $this.data('insmMarketingTags', _plugin);
            }

            $this.empty();

            var frameworkNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Initializing framework tags.',
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
                    text: 'Initializing framework successful.',
                    duration: -1
                });
                _plugin.framework = $.insmFramework('getDeprecatedFramework');

                // Init HTML
                var table = $("<table/>").addClass('horizontal').append(
                    $('<tr/>').append(
                        $('<th/>', { text: "Asset Tags" }),
                        $('<th/>', { text: "Player Tags" })
                    ),
                    $('<tr/>').append(
                        $('<td/>').append(_plugin.htmlElements.assetTags),
                        $('<td/>').append(_plugin.htmlElements.playerTags)
                    )
                );

                _plugin.htmlElements.controlPanel.html(_plugin.htmlElements.marketingTagsControls);
                $this.append(
                    _plugin.htmlElements.controlPanel,
                    _plugin.htmlElements.marketingTags.html(table)
                );

                // Init Views
                $this.insmMarketingTags('displayTags');
            });
            return $this;
        },
        displayTags: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmMarketingTags');

            var marketingTagsNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading marketing tags',
                duration: 0
            });

            var moduleSettingsDeferred = $.insmFramework('getModuleSettings', {
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

                    _plugin.htmlElements.assetTags.insmInput('destroy');
                    _plugin.htmlElements.playerTags.insmInput('destroy');

                    // Create Asset- And Player tags
                    _plugin.htmlElements.assetTags.insmInput({
                        type: "table",
                        multiSelect: true,
                        required: false,
                        currentValue: _plugin.data.marketingTags.asset,
                        initObject: {
                            name: {
                                pretty: 'Name',
                                type: "string",
                                doNotAllow: ['!', '='],
                                tooltip: "The name of the asset tag"
                            },
                            type: {
                                pretty: 'Type',
                                type: "string",
                                values: ["String"],
                                currentValue: "String",
                                tooltip: "The type of the input field the asset tag should be"
                            },
                            values: {
                                pretty: 'Available values',
                                type: "string",
                                multiSelect: true,
                                uniqueValues: true,
                                tooltip: "The different values that the user should be able to select"
                            },
                            multiSelect: {
                                pretty: 'Enable multi select',
                                type: "boolean",
                                currentValue: false,
                                tooltip: "Enabling this results in the user being able to pick multiple values instead of just one"
                            },
                            required: {
                                pretty: 'Required field',
                                type: "boolean",
                                currentValue: false,
                                tooltip: "Enabling this results in the user having to provide a value for this asset tag"
                            }
                        }
                    }).insmInput('view');

                    _plugin.htmlElements.playerTags.insmInput({
                        type: "table",
                        multiSelect: true,
                        required: false,
                        currentValue: _plugin.data.marketingTags.player,
                        initObject: {
                            name: {
                                pretty: 'Name',
                                type: "string",
                                tooltip: "The name of the player tag"
                            },
                            level: {
                                pretty: 'Region tree level',
                                type: "integer",
                                range: {
                                    min: 1,
                                    max: 10
                                },
                                currentValue: 1,
                                tooltip: "The level (depth) in the region tree that this tag should be available"
                            },
                            type: {
                                pretty: 'Type',
                                type: "string",
                                values: ["String"],
                                currentValue: "String",
                                tooltip: "The type of the input field the player tag should be"
                            },
                            values: {
                                pretty: 'Available values',
                                type: "string",
                                multiSelect: true,
                                uniqueValues: true,
                                tooltip: "The different values that the user should be able to select"
                            },
                            multiSelect: {
                                pretty: 'Enable multi select',
                                type: "boolean",
                                currentValue: false,
                                tooltip: "Enabling this results in the user being able to pick multiple values instead of just one"
                            },
                            required: {
                                pretty: 'Required field',
                                type: "boolean",
                                currentValue: false,
                                tooltip: "Enabling this results in the user having to provide a value for this asset tag"
                            }
                        }
                    }).insmInput('view');
                },
                denied: function (data) {
                    marketingTagsNotificationHandle.update({
                        type: 'unauthorized',
                        text: 'Authentication required',
                        duration: 0
                    });

                    $.insmFramework('login', {
                        success: function () {
                            marketingTagsNotificationHandle.update({
                                type: 'successful',
                                text: 'Access granted',
                                duration: -1
                            });
                            $this.insmMarketingTags('displayTags');
                        }
                    });
                },
                error: function (message) {
                    throw new Error(message);}
            });

            var saveButton = $('<a/>', {
                'class': "button",
                href: "#",
                text: "Save"
            }).click(function () {
                if (_plugin.htmlElements.assetTags.insmInput('validate') && _plugin.htmlElements.playerTags.insmInput('validate')) {

                    // get value
                    var assetTagsValue = _plugin.htmlElements.assetTags.insmInput('getValue');
                    var playerTagsValue = _plugin.htmlElements.playerTags.insmInput('getValue');

                    var saveNotificationHandle = $.insmNotification({
                        type: 'load',
                        text: 'Saving marketing tags',
                        duration: 0
                    });
                    var obj = { asset: assetTagsValue, player: playerTagsValue };

                    var sendObj = {
                        asset: assetTagsValue,
                        player: playerTagsValue
                    };

                    // send value
                    
                    var moduleSettingsDeferred = $.insmFramework('getModuleSettings', {
                        key: 'Marketing Tags',
                        value: JSON.stringify(sendObj),
                        success: function (result) {
                            $.insmFramework('activityRemove', {
                                id: 'MarketingTags',
                                type: 'MarketingTags',
                                success: function (activity) {
                                    saveNotificationHandle.update({
                                        type: 'successful',
                                        text: 'Successfully saved marketing tags',
                                        duration: -1
                                    });
                                    $this.insmMarketingTags('displayTags');
                                },
                                denied: function (data) {
                                    saveNotificationHandle.update({
                                        type: 'unauthorized',
                                        text: data.Message
                                    });
                                },
                                error: function (message) {
                                    throw new Error(message);
                                }
                            });
                        },
                        denied: function (data) {
                            $.insmFramework('activityRemove', {
                                id: 'MarketingTags',
                                type: 'MarketingTags',
                                success: function (activity) {
                                    saveNotificationHandle.update({
                                        type: 'unauthorized',
                                        text: data.Message
                                    });
                                    $this.insmMarketingTags('displayTags');
                                },
                                denied: function (data) {
                                    saveNotificationHandle.update({
                                        type: 'unauthorized',
                                        text: data.Message
                                    });
                                },
                                error: function (message) {
                                    throw new Error(message);
                                }
                            });
                        },
                        error: function (message) {
                            throw new Error(message);
                        }
                    });
                }
            }).hide();

            // Marketing tags controls
            var cancelButton = $('<a/>', {
                'class': "button",
                href: "#",
                text: "Cancel"
            }).click(function () {
                
                $.insmDialog({
                    type: 'confirm',
                    title: 'Are you sure?',
                    message: 'Pressing "Yes" will reset any changes made',
                    accept: function () {
                        $.insmFramework('activityRemove', {
                            id: 'MarketingTags',
                            type: 'MarketingTags',
                            success: function (activity) {
                                $this.insmMarketingTags('init');
                            },
                            denied: function () {
                                // TODO
                            },
                            error: function (message) {
                                throw new Error(message);
                            },
                        });
                    }
                });
            }).hide();

            var editButton = $('<a/>', {
                'class': "button",
                href: "#",
                text: "Edit"
            }).click(function () {
                var editNotificationHandler = $.insmNotification({
                    type: 'load',
                    text: 'Checking if other users are editing already',
                    duration: 0
                });
                // Check if being edited already
                $.insmFramework('activityCheck', {
                    id: 'MarketingTags',
                    type: 'MarketingTags',
                    success: function (activity) {
                        if (activity.length > 0) {
                            editNotificationHandler.update({
                                type: 'unauthorized',
                                text: 'Marketing tags are already being edited by ' + activity[0].User
                            });
                        }
                        else {
                            $.insmFramework('activityAdd', {
                                id: 'MarketingTags',
                                type: 'MarketingTags',
                                success: function (activity) {
                                        saveButton.show();
                                        cancelButton.show();
                                        editButton.hide();
                                        _plugin.htmlElements.assetTags.insmInput('edit');
                                        _plugin.htmlElements.playerTags.insmInput('edit');
                                        editNotificationHandler.update({
                                            type: 'successful',
                                            text: 'Access granted',
                                            duration: -1
                                        });
                                },
                                denied: function () {
                                    // TODO
                                },
                                error: function (message) {
                                    throw new Error(message);
                                },
                            });
                        }
                    },
                    denied: function () {
                        // TODO
                    },
                    error: function (message) {
                        throw new Error(message);
                    },
                });

            });

            _plugin.htmlElements.marketingTagsControls.html([saveButton, editButton, cancelButton]);

            return $this;
        }
    };

    $.fn.insmMarketingTags = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmMarketingTags');
        }
    };
})(jQuery);