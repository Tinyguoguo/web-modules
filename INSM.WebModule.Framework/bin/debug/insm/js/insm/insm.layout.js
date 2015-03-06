/*
* INSM Layout
* This file contain the INSM Layout function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmLayout(settings);
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
            var _plugin = $this.data('insmLayout');

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
                $this.data('insmLayout', _plugin);
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
                    $this.insmLayout('displayTable');
                }
            });

            _plugin.htmlElements.content.insmViewHandler({
                viewName: 'layout-view',
                method: function (layout) {
                    $this.insmLayout('displayLayout', layout);
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
            var _plugin = $this.data('insmLayout');

            $.when($.insmFramework('initialized')).done(function () {
                var $notification = $.insmNotification({ type: 'load', text: 'Downloading layouts', duration: 0 });
                $.insmFramework('layouts', {
                    method: 'get',
                    types: 'Channel',
                    success: function (layouts) {
                        //FILTERA BORT CHANNEL LAYOUTS
                        $notification.update({
                            type: 'successful',
                            text: 'Downloaded Layouts.',
                            duration: 1
                        });
                        $this.empty();
                        if (_plugin.settings.enableEdit) {
                            $this.append(
                                $('<a />').addClass('button').text('New Layout').click(function () {
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

                                $this.insmLayout('displayTable');
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
            var _plugin = $this.data('insmLayout');

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
                    $('<a />').addClass('button warning margin-left').text('Delete layout').click(function () {
                        $.insmDialog({
                            type: 'confirm',
                            title: 'Delete layout?',
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
                                        $this.insmLayout('displayTable');
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

                structure.Views.push(view);
            });

            var layoutTable = $('<div/>').insmInput({
                type: "Table",
                currentValue: structure,
                multiSelect: false,
                initObject: {
                    Name: {
                        type: "String",
                        required: true
                    },
                    Description: {
                        type: "String"
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
                                values: [],
                                currentValue: 0,
                                required: true
                            },
                            Y: {
                                type: "String",
                                values: [],
                                currentValue: 0,
                                required: true
                            },
                            ZIndex: {
                                type: "String",
                                values: [],
                                currentValue: 1,
                                required: true
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
                            layoutValue.Attributes.Type = 'Channel';

                            var layoutData = {
                                method: 'set',
                                value: JSON.stringify(layoutValue),
                                success: function (data) {
                                    saveNotificationHandle.update({
                                        type: 'successful',
                                        text: 'Saved'
                                    });
                                    $this.insmLayout('displayTable');
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
                        };
                    })
                );
            return $this;
        }
    };



    $.fn.insmLayout = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmLayout');
        }
    };
})(jQuery);