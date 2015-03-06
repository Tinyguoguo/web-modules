/*
* INSM File Browser
* This file contain the INSM File Browser plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFileBrowser(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFileBrowser');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        regionId: null,
                        directoryName: 'Media',
                        onSelect: function () { },
                        applicationName: 'insmFileBrowser'
                    }, options),
                    htmlElements: {
                        table: $('<div />'),
                        controls: {
                            container: $('<div />'),
                            cancel: $('<a />'),
                            select: $('<a />')
                        }
                    },
                    data: {
                        tableHeaders: {
                            themeDefault: {
                                Preview: {
                                    output: function (file) {
                                        return $('<img />', {
                                            src: file.url.thumbnail
                                        });
                                    }
                                },
                                Name: {
                                    key: 'name'
                                },
                                MimeType: {
                                    key: 'mimeType'
                                }
                            }
                        },
                        files: {},
                        tableSearchIndex: function (file) {
                            var searchArray = [];
                            $.merge(searchArray, file.name.split(' '));
                            return searchArray;
                        }

                    }
                };
                $this.data('insmFileBrowser', _plugin);
            }

            // Init html
            $this.empty().append(
                _plugin.htmlElements.controls.container.append(
                    _plugin.htmlElements.controls.cancel,
                    _plugin.htmlElements.controls.select
                ),
                _plugin.htmlElements.table
            );

            _plugin.htmlElements.controls.select.addClass('button').text('Choose file').click(function () {
                $.insmService('unregister', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'file',
                    regionId: _plugin.settings.regionId,
                    directoryName: _plugin.settings.directoryName
                });
                _plugin.settings.onSelect(_plugin.htmlElements.table.insmTable('getSelected'));
            });
            _plugin.htmlElements.controls.cancel.addClass('button').text('Cancel');

            _plugin.htmlElements.table.insmTable({
                headers: _plugin.data.tableHeaders.themeDefault,
                items: _plugin.data.files,
                searchIndex: _plugin.data.tableSearchIndex,
                onDoubleClick: function (file) {
                }
            });
            $.insmService('register', {
                subscriber: _plugin.settings.applicationName,
                type: 'file',
                regionId: _plugin.settings.regionId,
                directoryName: _plugin.settings.directoryName,
                update: function (files) {
                    var filesToBeUpdated = {};
                    
                    $.each(files, function (index, file) {
                        // TODO
                        // Check which files should be updated
                        filesToBeUpdated[file.id] = file;
                    });

                    _plugin.htmlElements.table.insmTable('update', {
                        items: filesToBeUpdated
                    });
                }
            });

            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            
            $this.data('insmFileBrowser', null);

            return $this;
        }
    };

    $.fn.insmFileBrowser = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFileBrowser');
            return null;
        }
    };

    //$.insmFileBrowser = function (method) {
    //    return $('<div />').insmFileBrowser.apply(this, arguments);
    //};
})(jQuery);
