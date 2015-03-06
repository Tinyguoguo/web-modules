/*
* INSM Template Image
* This file contain the INSM Template Image function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmAsset(settings);
*
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options, templateFileId) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            
            _plugin = {
                htmlElements: {
                    formatValue: {}
                },
                settings: $.extend({
                    framework: null,
                    dataset: null,
                    initialized: false,
                    filechangeCallback: function (name) { },
                    mediaContentDirectoryId: 0,
                    fileFormat: function () { },
                    readableFileStatus: function () { },
                    filecache: [],
                    templateCompositeData: [],
                }, options),
                data: {},
                properties: {}
            };

            $this.data('insmTemplateComposite', _plugin);
            var compositeData = $.insmTemplateCache('get', templateFileId);
            _plugin.properties = compositeData.properties;
            _plugin.data.contentProperties = compositeData.contentProperties;
            //set id if exist or create new dataset structure of not
            if (!(_plugin.settings.dataset && _plugin.settings.dataset.Items)) {
                var id = (_plugin.settings.dataset && _plugin.settings.dataset.Id) || false;
                _plugin.settings.dataset = {
                    Items: {}
                }
            }

            // Populate with default dataset items
            var datasetItems = {};
            $.each(_plugin.properties, function (index, value) {
                datasetItems[index] = value;
            });

            //overwrite default value with value from server if exists.
            $.each(datasetItems, function (index) {
                if (typeof _plugin.settings.dataset.Items[index] != 'undefined') {
                    switch (datasetItems[index].type.toLowerCase()) {
                        case 'boolean':
                        case 'bool':
                            //special case boolean comes as text 'True' or 'False' => change to actual boolean values.
                            _plugin.settings.dataset.Items[index].Value = _plugin.settings.dataset.Items[index].Value &&
                                !(typeof _plugin.settings.dataset.Items[index].Value == 'string' && _plugin.settings.dataset.Items[index].Value.toLowerCase() == "false");
                            break;
                        case 'mediafile':
                        case 'image':
                        case 'movie':
                        case 'archive':
                            datasetItems[index].Value = _plugin.settings.dataset.Items[index].FileId;
                            datasetItems[index].currentValue = _plugin.settings.dataset.Items[index].FileId;
                            break;
                        default:
                            datasetItems[index].Value = _plugin.settings.dataset.Items[index].Value;
                            datasetItems[index].currentValue = _plugin.settings.dataset.Items[index].Value;
                            break;
                    }
                }
            });

            //Make sure all items from server are preserved in the data.
            _plugin.settings.dataset.Items = $.extend({}, _plugin.settings.dataset.Items, datasetItems);
            _plugin.settings.initialized = true;

            return $this;
        },
        getContentProperties: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');

            return _plugin.data.contentProperties;
        },
        generateProperties: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');

            var $table = $('<table />').addClass('vertical');

            $.each(options.properties, function (key,value) {

                var item = _plugin.settings.dataset.Items[key];
                item.tag = key;
                if (!_plugin.htmlElements.formatValue[item.tag]) {
                    item.mediaContentDirectory = _plugin.settings.mediaContentDirectoryId;
                    _plugin.htmlElements.formatValue[item.tag] = $('<div />').insmInput(item);
                }

                $table.append(
                    $('<tr />').append(
                        $('<th />').text(key)
                    ).append(
                        $('<td />').append(
                            options.edit ? _plugin.htmlElements.formatValue[item.tag].insmInput('edit') : _plugin.htmlElements.formatValue[item.tag].insmInput('view')
                        )
                    )
                );
            });

            return $table;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            
            var $table = $this.insmTemplateComposite('generateProperties', { properties: _plugin.properties });
            $this.html($table);
            return $this;
        },
        isInitialized: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            if (_plugin) {
                return _plugin.settings.initialized;
            } else {
                return false;
            }

        },
        getThumbnail: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');

            return $('<div />').insmAssetNew('getPreview', {
                datasetId: _plugin.settings.dataset.Id
            });
        },
        getPreview: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            return $this.insmTemplateComposite('getThumbnail');
        },
        getName: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            return _plugin.data.file.name;
        },
        getFileInfo: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');

            var def = $.Deferred();
            var files = [];
            $.each(_plugin.properties, function (propertyName, object) {
                if ((object.type == "Image" || object.type == "File" || object.type == "Archive" || object.type == "MediaFile")) {// && $.insmFileCache('get', object.Value)) {
                    files.push($.extend(true, {}, $.insmFileCache('get', object.Value)));
                }
            });
            
            def.resolveWith(this, files);
            
            return def;
        },
        getTemplateInfo: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            var def = $.Deferred();
            var status = {
                files: [],
                state: "OK",
                type: "",
            }

            var files = [];
            $.each(_plugin.properties, function (propertyName, object) {
                if ((object.type == "Image" || object.type == "File" || object.type == "Archive" || object.type == "MediaFile")) {// && $.insmFileCache('get', object.Value)) {
                    files.push($.extend(true, {}, $.insmFileCache('get', object.Value)));
                }
            });
            $.each(files, function (index, file) {
                if (_plugin.settings.readableFileStatus(fileFormat(file)) != "OK") {
                    status.state = _plugin.settings.readableFileStatus(fileFormat(file));
                }
            });
            status.files = files;
            def.resolveWith(this, [status]);
            
            return def;
        },
        editView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            var $table = $this.insmTemplateComposite('generateProperties', { properties: _plugin.properties, edit: true });
            $this.html($table);
            return $this;
        },
        getDateInterval: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            var def = $.Deferred();
            $this.insmTemplateComposite('getFileInfo').done(function (data) {
                if (!data || !data.startDate || !data.endDate) {
                    def.resolveWith(this, [0]);
                } else {
                    def.resolveWith(this, [{ start: new Date(data.startDate + localDateOffset()), end: new Date(data.endDate + localDateOffset()) }]);
                }
            });
            return def;
        },
        validate: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            var def = $.Deferred();
            $this.insmTemplateComposite('updateDataset');
            var tmpVal = true;
            $.each(_plugin.properties, function (key, object) {
                tmpVal = _plugin.htmlElements.formatValue[key].insmInput('validate') && tmpVal;
            });

            if (!tmpVal) {
                def.rejectWith(this, ['Please check template properties']);
            } else {
                def.resolve();
            }
            return def;
        },
        updateDataset: function (options) {
            //update dataset so if fits the htmlData. This should be called from insmAsset. 
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');

            // Update image id into dataset
            $.each(_plugin.properties, function (key, object) {
                if (_plugin.settings.dataset.Items[key]) {
                    //Fetch from html and save into dataset.
                    var val = _plugin.htmlElements.formatValue[key].insmInput('getValue');
                    var item = _plugin.settings.dataset.Items[key];
                    item.Value = val;


                    //Simplify dataset.
                    var reObject = {
                        Value: item.Value
                    };

                    switch (object.type.toLowerCase()) {
                        case 'bool':
                        case 'boolean':
                            reObject.Type = 'Boolean';
                            break;
                        case 'image':
                            reObject.Type = "MediaFile";
                            reObject.FileId = reObject.Value;
                            delete reObject.Value;
                            break;
                        default:
                            reObject.Type = 'Text';
                            break;
                    }
                    _plugin.settings.dataset.Items[key] = reObject;
                }
            });
            if (!_plugin.settings.dataset.Name) {
                _plugin.settings.dataset.Name = "Template";
            }
            return _plugin.settings.dataset;
        },
        getProperty: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateComposite');
            return _plugin.settings.dataset.Items[options.key];
        }
    };

    $.fn.insmTemplateComposite = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTemplateComposite');
            return null;
        }
    };
})(jQuery);

