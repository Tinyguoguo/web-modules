/*
* INSM Dataset Editor
* This file contain the INSM Plugin Manager function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
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
            var _plugin = $this.data('insmPluginManager');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        regionTree: $('<ul />').addClass('regionTree'),
                        pluginSettings: $('<div />').addClass('pluginSettings'),
                        columnContainer: $('<div />').addClass('l-columnContainer'),
                        column: {
                            left: $('<div />').addClass('l-column'),
                            right: $('<div />').addClass('l-column')
                        },
                        header: $('<h2 />')
                    },
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Plugin Manager',
                        ssl: false,
                        ams: '',
                        version: manifest.version
                    }, options)
                };
                $this.data('insmPluginManager', _plugin);
            }
            if (!$.insmService('isInitialized')) {
                $.insmService({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            $.when($.insmService('initialized')).done(function () {
                // Init HTML
                $this.append(
                    _plugin.htmlElements.columnContainer.append(
                        _plugin.htmlElements.column.left.append(
                            _plugin.htmlElements.regionTree
                        ),
                        _plugin.htmlElements.column.right.append(
                            _plugin.htmlElements.header,
                            _plugin.htmlElements.pluginSettings
                        )
                    )
                );

                
                $this.insmPluginManager('displayRegionTree');


                $(window).resize(function () {
                    $this.insmPluginManager('resize');
                });

                $this.insmPluginManager('resize');

                $.insmFramework('insertModuleInformation');
            });
            return $this;
        },
        displayPluginManager: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginManager');

            _plugin.htmlElements.header.text(options.region.name);

            _plugin.htmlElements.pluginSettings.insmPluginSettings('destroy');
            _plugin.htmlElements.pluginSettings.insmPluginSettings({
                settingsRegionId: options.region.id,
                onSave: function () {
                    $this.insmPluginManager('displayPluginManager', {
                        region: options.region
                    });
                }
            });
            return $this;
        },
        displayRegionTree: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginManager');


            _plugin.htmlElements.regionTree.addClass('regionPicker expanded').insmRegionPicker({
                applicationName: _plugin.settings.applicationName,
                onSelect: function (region) {
                    $this.insmPluginManager('displayPluginManager', {
                        region: region
                    });
                }
            });

            return $this;
        },
        resize: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginManager');


            if (_plugin) {
                var targetHeight = $('#container').height();
                var headerHeight = $('#header').outerHeight(true);
                
                $('#content').css({
                    height: parseInt(targetHeight - headerHeight) + 'px'
                });
                _plugin.htmlElements.columnContainer.css({
                    height: parseInt(targetHeight - headerHeight) + 'px'
                });

                _plugin.htmlElements.regionTree.css({
                    height: parseInt(targetHeight - headerHeight) + 'px'
                });

                var leftColumnWidth = _plugin.htmlElements.column.left.outerWidth(true);
                var totalColumnWidth = _plugin.htmlElements.columnContainer.width();

                _plugin.htmlElements.column.right.css({
                    width: parseInt(totalColumnWidth - leftColumnWidth) + 'px',
                    height: parseInt(targetHeight - headerHeight) + 'px'
                });

                var rightColumnHeaderHeight = _plugin.htmlElements.header.outerHeight(true);
                var rightColumnContentMargin = _plugin.htmlElements.pluginSettings.outerHeight(true) - _plugin.htmlElements.pluginSettings.height();
                _plugin.htmlElements.pluginSettings.css({
                    height: parseInt(targetHeight - headerHeight - rightColumnHeaderHeight - rightColumnContentMargin) + 'px'
                });

                _plugin.htmlElements.regionTree.insmRegionPicker('resize');
            }


            return $this;
        }
    };

    $.fn.insmPluginManager = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPluginManager');
        }
    };
})(jQuery);