/*
* INSM Layout
* This file contain the INSM Layout function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmDisplay(settings);
*
* File dependencies:
* jQuery 1.6.1
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
            var _plugin = $this.data('insmDisplay');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        enableEdit: true
                    }, options),
                    data: {
                        layouts: []
                    },
                    htmlElements: {
                        content: $('<div />'),
                        layoutTable: $('<div />')
                    }
                };
                $this.data('insmDisplay', _plugin);
            }

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    ams: _plugin.settings.ams,
                    protocol: _plugin.settings.ssl ? 'https' : 'http',
                    app: _plugin.settings.app
                });
            }

            _plugin.htmlElements.content.insmViewHandler({
                viewName: 'table-view',
                method: function () {
                    $this.insmDisplay('displayTable');
                }
            });

            _plugin.htmlElements.content.insmViewHandler({
                viewName: 'layout-view',
                method: function (layout) {
                    $this.insmDisplay('displayLayout', layout);
                }
            });

            $.insmViewHandler('show', {
                viewName: 'table-view'
            });

            return $this;
        },
        displayTable: function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmDisplay');
            
            $.when($.insmFramework('initialized')).done(function () {
                var $notification = $.insmNotification({ type: 'load', text: 'Downloading display information', duration: 0 });
                $.insmFramework('layouts', {
                    method: 'get',
                    types: 'Display',
                    success: function (layouts) {
                        $notification.update({
                            type: 'successful',
                            text: 'Downloaded Layouts.',
                            duration: 1
                        });
                        $this.empty();
                        if (_plugin.settings.enableEdit) {
                            $this.append(
                                $('<a />').addClass('button').text('New Display').click(function () {
                                    $.insmViewHandler('show', {
                                        viewName: 'layout-view'
                                    });
                                })
                            );
                        }
                        layoutsArray = [];
                        $.each(layouts, function (index, layout) {
                            layoutsArray.push(layout);
                        });

                        _plugin.htmlElements.layoutTable.insmTablesorter({
                            data: layoutsArray.reverse(),
                            headers: _plugin.settings.tableHeaders,
                            paginationPosition: 'top',
                            searchPosition: 'top',
                            limitControlPosition: 'top'
                        });
                        $this.append(_plugin.htmlElements.layoutTable);
                    },
                    denied: function () {
                        $notification.update({
                            type: 'unauthorized',
                            text: 'Authentication needed'
                        });

                        $.insmFramework('login', {
                            success: function () {
                                $notification.update({
                                    type: 'successful',
                                    text: 'Authentication successful'
                                });

                                $this.insmDisplay('displayTable');
                            }
                        });
                    },
                    error: function (message) {
                        $notification.update({
                            type: 'error',
                            text: message
                        });
                    }
                });
            });

            return $this;
        },
        displayLayout: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmDisplay');

            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Layout not initialized'
                });
                return $this;
            }

            if (!options) {
                options = {
                    layout: {}
                };
            }
            options.layout = $.extend({
                Name: '',
                Description: '',
                Attributes: {
                    Type: ''
                },
                Views: {}
            }, options.layout);

            $this.empty();

            var $backButton = $('<a/>', {
                href: "#",
                class: "button",
                text: "Back"
            }).click(function () {
                $.insmViewHandler('show', {
                    viewName: 'table-view'
                });
            });

            $backButton.appendTo($this);

            if (options.layout.Id && _plugin.settings.enableEdit) {
                $this.append(
                    $('<a />').addClass('button warning margin-left').text('Delete display').click(function () {
                        $.insmDialog({
                            type: 'confirm',
                            title: 'Delete display?',
                            message: 'This cannot be undone. Are you sure?',
                            accept: function () {
                                var saveNotificationHandle = $.insmNotification({
                                    type: 'load',
                                    text: 'Deleting',
                                    duration: 0
                                });
                                var layoutData = {
                                    layoutid: options.layout.Id,
                                    method: 'remove',
                                    success: function (data) {
                                        saveNotificationHandle.update({
                                            type: 'successful',
                                            text: 'Deleted'
                                        });
                                        options.layout.Id = 0;
                                        $this.insmDisplay('displayTable');
                                    },
                                    denied: function (data) {
                                        saveNotificationHandle.update({
                                            type: 'unauthorized',
                                            text: 'Unauthorized'
                                        });
                                    },
                                    error: function (data) {
                                        saveNotificationHandle.update({
                                            type: 'error',
                                            text: data
                                        });
                                    }
                                };
                                $.insmFramework('layouts', layoutData);
                            }
                        });
                    }));
            }

            var structure = {
                Name: '',
                Description: '',
                Views: []
            };

            structure.Name = options.layout.Name;
            structure.Description = options.layout.Description;
            $.each(options.layout.Views, function (key, value) {
                var view = {};
                view['View number'] = key;
                view.Resolution = {};
                view.Resolution.Width = value.Resolution.Width;
                view.Resolution.Height = value.Resolution.Height;
                view.X = value.X ? value.X.toString() : 0;
                view.Y = value.Y ? value.Y.toString() : 0;
                view.ZIndex = value.ZIndex ? value.ZIndex.toString() : 0;
                view.Orientation = value.Orientation ? value.Orientation.toString() : '';
                view.Settings = value.Settings ? value.Settings : {};

                structure.Views.push(view);
            });

            var layoutTable = $('<div/>').insmInput({
                type: "Table",
                currentValue: structure,
                initObject: {
                    Name: {
                        type: "String",
                        required: true
                    },
                    Description: {
                        type: "String",
                        required: false
                    },
                    Views: {
                        type: "Table",
                        returnType: 'object',
                        multiSelect: true,
                        required: true,
                        initObject: {
                            'View number': {
                                type: "Constant",
                                currentValue: 'New view'
                            },
                            Orientation: {
                                type: "String",
                                values: ['Landscape', 'Portrait', 'Flipped Landscape', 'Flipped Portrait'],
                                currentValue: 'Landscape',
                                required: true
                            },
                            Resolution: {
                                type: "Resolution",
                                currentValue: {
                                    Width: 1920,
                                    Height: 1080
                                },
                                required: true
                            },
                            X: {
                                type: "String",
                                currentValue: 0,
                                required: true
                            },
                            Y: {
                                type: "String",
                                currentValue: 0,
                                required: true
                            },
                            ZIndex: {
                                type: "String",
                                currentValue: 0,
                                required: true
                            },
                            Settings: {
                                type: "Display",
                                currentValue: {},
                                initObject: {
                                    NEC: {
                                        X463UN: {
                                            DVI: ['1', '2', '3'],
                                            HDMI: ['1', '2', '3'],
                                            VGA: ['1', '2', '3'],
                                            DisplayPort: ['1', '2', '3']
                                        },
                                        X462S: {
                                            DVI: ['1', '2', '3'],
                                            HDMI: ['1', '2', '3'],
                                            VGA: ['1', '2', '3'],
                                            DisplayPort: ['1', '2', '3']
                                        },
                                        X461S: {
                                            DVI: ['1', '2', '3'],
                                            HDMI: ['1', '2', '3'],
                                            VGA: ['1', '2', '3'],
                                            DisplayPort: ['1', '2', '3']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }).insmInput('edit');

            $this.append(layoutTable);

            $this.append(
                    $('<a />').addClass('button').text('Save').click(function () {
                        if (layoutTable.insmInput('validate')) {
                            var saveNotificationHandle = $.insmNotification({
                                type: 'load',
                                text: 'Saving',
                                duration: 0
                            });
                            var layoutValue = $.extend({}, options.layout, layoutTable.insmInput('getValue'));
                            layoutValue.Attributes.Type = 'Display';

                            var layoutData = {
                                method: 'set',
                                value: JSON.stringify(layoutValue),
                                success: function (data) {
                                    saveNotificationHandle.update({
                                        type: 'successful',
                                        text: 'Saved'
                                    });
                                    $this.insmDisplay('displayTable');
                                },
                                denied: function (data) {
                                    saveNotificationHandle.update({
                                        type: 'unauthorized',
                                        text: 'Unauthorized'
                                    });
                                },
                                error: function (data) {
                                    saveNotificationHandle.update({
                                        type: 'error',
                                        text: data
                                    });
                                }
                            }

                            if (options.layout.Id) {
                                layoutValue.layoutid = options.layout.Id;
                            }

                            $.insmFramework('layouts', layoutData);
                        }
                    })
                );
            return $this;
        }
    };



    $.fn.insmDisplay = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmDisplay');
        }
    };
})(jQuery);