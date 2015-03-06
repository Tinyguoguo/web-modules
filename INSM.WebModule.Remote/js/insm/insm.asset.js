/*
 * INSM Asset
 * This file contain the INSM Asset function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmAsset(settings);
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
            var _plugin = $this.data('insmAsset');
            
            _plugin = {
                htmlElements: {
                    deleteAssetButton: $('<div />'),
                    propertiesTable: $('<table />').addClass('vertical no-border'),
                    templateProperties: $('<div />'),
                    scheduleProperties: $('<div />'),
                    marketingTagProperties: $('<div />'),
                    editTemplate: $('<div />'),
                    inputField: {}
                },
                settings: $.extend({
                    filecache: [],
                    framework: null,
                    datasetId: 0,
                    inDataset: null,
                    dataset: null,
                    mode: 'normal', // set to listAsset if no recursive assets allowed etc.
                    regionDatasetId: null,
                    regionId: null,
                    mediaContentDirectoryId: 0,
                    assetContentDirectoryId: 0,
                    templateContentDirectoryId: 0,
                    compositeTemplates: {},
                    onLoad: function () {

                    },
                    onError: function (message) {
                        $.error('No error callback defined in INSM Asset. Message sent: "' + message + '"');
                    },
                    baseDatasetProperty: {
                        Name: {
                            type: 'string',
                            currentValue: '',
                            required: true
                        }
                    },
                    assetMarketingTags: {
                        //downloaded from server! Set from assetmanager.js
                    },
                    assetDefaultProperties: {
                        Orientation: {
                            type: 'string',
                            multiSelect: false,
                            required: true,
                            values: ['Any', 'Landscape', 'Portrait']
                        },
                        Duration: {
                            type: 'integer',
                            currentValue: '10',
                            required: false,
                            range: {
                                min: 5,
                                max: 30
                            }
                        }
                    },
                    readableFileStatus: function (file) {//TODO: this function should be moved to a central place (same logic everywhere!)
                        if (!file) {
                            return "N/A";
                        }
                        var assetStartDate;
                        var assetEndDate;
                        if (_plugin.settings.dataset.Items.Schedule.currentValue) {
                            $.each(_plugin.settings.dataset.Items.Schedule.currentValue, function (index, value) {
                                if (!assetStartDate || value.Date.start < assetStartDate) {
                                    assetStartDate = value.Date.start;
                                }
                                if (!assetEndDate || value.Date.end > assetEndDate) {
                                    assetEndDate = value.Date.end;
                                }
                            });
                        }

                        if ((file.startDate && file.startDate.substr(0, 10) > assetStartDate) || (file.endDate && file.endDate.substr(0, 10) < assetEndDate)) {
                            return "Warning: Asset start and/or end date is outside the file's validity dates.";
                        }

                        switch (file.status) {
                            case 'ok':
                                return 'OK';
                            case 'expired':
                                return 'Warning: ' + file.filename + ' has expired';
                            case 'in future':
                                return 'Info: ' + file.filename + ' is not available due to start date in future.';
                            case 'not active':
                                return 'Warning: ' + file.filename + ' is not marked as Available';
                            default:
                                return 'File status unknown';
                        }
                    }
                }, options)
            };
            
            if (_plugin.settings.mode != 'listAsset') {
                _plugin.settings.assetDefaultProperties.DefaultContent = {
                    type: 'boolean',
                    currentValue: false
                };
                _plugin.settings.assetDefaultProperties.Weight = {
                    type: 'integer',
                    currentValue: '1',
                    range: {
                        min: 1,
                        max: 10
                    }
                };
                _plugin.settings.assetDefaultProperties.Active = {
                    type: 'boolean',
                    currentValue: false
                };
            }

            $this.data('insmAsset', _plugin);

            if (!_plugin.settings.framework) {
                $.insmNotification({
                    type: 'error',
                    text: 'No framework provided in INSM Asset'
                });
            }
            
            if (!_plugin.settings.datasetId && !_plugin.settings.inDataset) {
                _plugin.settings.dataset = {
                    Items: $.extend(
                        { Template: {}, Content: { Type: 'DataSet' } },
                        _plugin.settings.assetDefaultProperties,
                        _plugin.settings.assetMarketingTags
                    ),
                    Name: ''
                };
                _plugin.settings.onLoad('');
            } else {
                var def = $.Deferred();
                if (!_plugin.settings.inDataset) {
                    // Get dataset from server.
                    var not = $.insmNotification({
                        text: 'Getting info',
                        type: 'load',
                        duration: 0
                    });
                    _plugin.settings.framework.dataset({
                        datasetId: _plugin.settings.datasetId,
                        depth: 1,
                        success: function (dataset) {
                            _plugin.settings.inDataset = dataset;
                            not.update({ type: 'successful', text: 'Downloaded info.' });
                            def.resolve();
                        },
                        error: function (message) {
                            not.update({
                                type: 'error',
                                text: message
                            });
                            $.insmViewHandler('dataset-list-view').init(_plugin.data.datasetId).show();
                        },
                        denied: function () {
                            not.update({
                                type: 'error',
                                text: 'Denied'
                            });
                        }
                    });
                } else {
                    def.resolve();
                }

                def.done(function () {
                    var dataset = $.extend(true, {}, _plugin.settings.inDataset);

                    if (!dataset.Items.Content || dataset.Items.Content.Type != 'DataSet' || !dataset.Items.Template) {
                        _plugin.settings.onError('Can not interpret dataset as Asset');
                        return;
                    }

                    _plugin.settings.baseDatasetProperty.Name.currentValue = dataset.Name;

                    // Populate with default dataset items
                    var datasetItems = {};
                    $.each(_plugin.settings.assetMarketingTags, function (index, value) {
                        datasetItems[index] = value;
                    });
                    $.each(_plugin.settings.assetDefaultProperties, function (index, value) {
                        datasetItems[index] = value;
                    });
                    datasetItems.Schedule = {};
                    
                    //overwrite default value with value from server if exists.
                    $.each(datasetItems, function (index) {
                        if (typeof dataset.Items[index] != 'undefined' && typeof dataset.Items[index].Value != 'undefined') {

                            if (datasetItems[index].Type == 'boolean') {
                                //special case boolean comes as text 'True' or 'False' => change to actual boolean values.
                                dataset.Items[index].Value = dataset.Items[index].Value && !(typeof dataset.Items[index].Value == 'string' && dataset.Items[index].Value.toLowerCase() == "false");
                            }
                            if (dataset.Items[index].Value) {
                                try {
                                    datasetItems[index].currentValue = JSON.parse(dataset.Items[index].Value);
                                }
                                catch (err) {
                                    datasetItems[index].currentValue = dataset.Items[index].Value.toString();
                                }
                            }
                        }
                    });

                    //Make sure all items from server are preserved in the data.
                    dataset.Items = $.extend({}, dataset.Items, datasetItems);
                    _plugin.settings.dataset = dataset;
                    
                    _plugin.settings.onLoad(_plugin.settings.baseDatasetProperty.Name.currentValue);
                    
                });
            }

            return $this;
        },
        view: function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Asset plugin not initialized'
                });
            }

            // Clean
            $this.empty();

            var contentDataset = $.extend(true, {}, _plugin.settings.dataset.Items.Content.DataSet);

            if (!_plugin.settings.dataset.Items.Template.Type) {
                _plugin.htmlElements.templateProperties = $('<div >No template selected</div>');
            } else {
                var template = $this.insmAsset('getTemplate');
                if (typeof template == 'function') {
                    template.apply(_plugin.htmlElements.templateProperties, ['view']);
                }
            }

            // Adding default properties to table
            _plugin.htmlElements.propertiesTable.html($this.insmAsset('generatePropertiesTable', { properties: _plugin.settings.assetDefaultProperties }));

            if (typeof _plugin.settings.dataset.Items.Schedule == 'undefined') {
                _plugin.settings.dataset.Items.Schedule = {
                    currentValue: []
                };
            }

            _plugin.htmlElements.scheduleProperties.html(
                    $('<h3 />').text('Schedule Tags')
                ).append(

                    $('<div id="scheduleTags"/>').insmInput({
                        type: "Table",
                        multiSelect: true,
                        required: false,
                        initObject: {
                            Weekdays: {
                                type: "Weekdays",
                                required: true
                            },
                            Date: {
                                type: "DateInterval",
                                required: true
                            },
                            Time: {
                                type: "TimeInterval",
                                required: true
                            }
                        },
                        currentValue: _plugin.settings.dataset.Items.Schedule.currentValue
                    }).insmInput('view')
                );
            // Tag properties
            _plugin.htmlElements.marketingTagProperties.html(
                    $('<h3 />').text('Marketing Tags')
                ).append(
                    $this.insmAsset('generatePropertiesTable', { properties: _plugin.settings.assetMarketingTags })
                );

            // Add elements to DOM
            $this.append(
                $('<div />').addClass('insmAssetContainer').append(
                    $('<h2 />').text(_plugin.settings.dataset.Name)).append(
                        _plugin.htmlElements.deleteAssetButton,
                        _plugin.htmlElements.propertiesTable
                    ).append(
                    function () {
                        if (_plugin.settings.mode == 'listAsset') {
                            return $('<div />').insmTabs({
                                tabs: {
                                    'TemplateData': {
                                        title: 'Options',
                                        content: _plugin.htmlElements.templateProperties
                                    }
                                }
                            });
                        } else {
                            return $('<div />').insmTabs({
                                tabs: {
                                    'TemplateData': {
                                        title: 'Options',
                                        content: _plugin.htmlElements.templateProperties
                                    },
                                    'ScheduleTags': {
                                        title: 'Schedule Tags',
                                        content: _plugin.htmlElements.scheduleProperties
                                    },
                                    'MarketingTags': {
                                        title: 'Marketing Tags',
                                        content: _plugin.htmlElements.marketingTagProperties
                                    }
                                }
                            });
                        }
                    }
                )
            );
            return $this;
        },
        getCreationDate: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');
            if (_plugin.settings.dataset && _plugin.settings.dataset.CreationDate) {
                return _plugin.settings.dataset.CreationDate;
            } else {
                return "00-00-00";
            }
        },
        getModificationDate: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');
            if (_plugin.settings.dataset && _plugin.settings.dataset.ModificationDate) {
                return _plugin.settings.dataset.ModificationDate;
            } else {
                return "00-00-00";
            }
        },
        getCreator: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');
            if (_plugin.settings.dataset && _plugin.settings.dataset.Creator) {
                return _plugin.settings.dataset.Creator;
            } else {
                return "N/A";
            }
        },
        getModifier: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');
            if (_plugin.settings.dataset && _plugin.settings.dataset.Modifier) {
                return _plugin.settings.dataset.Modifier;
            } else {
                return "N/A";
            }
        },
        isActive: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');
            if (_plugin.settings.dataset && _plugin.settings.dataset.Items && _plugin.settings.dataset.Items.Active) {
                if (_plugin.settings.dataset.Items.Active.Value == "True") {
                    return true;
                } else if (typeof _plugin.settings.dataset.Items.Active.currentValue != "undefined") {
                    if (_plugin.settings.dataset.Items.Active.currentValue == "True") {
                        return true;
                    }
                    else if (_plugin.settings.dataset.Items.Active.currentValue == "False") {
                        return false;
                    }
                }
                return false;
            } else {
                return false;
            }
        },
        getDateInterval: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');

            function sort(dateA, timeA, dateStringB, biggest) {
                var dateA = new Date(dateA + "T" + timeA + ":00" + localDateOffset());
                if (!dateStringB) {
                    return dateA;
                }
                var dateB;
                if (!(dateStringB instanceof Date)) {
                    dateB = new Date(dateB + ":00" + localDateOffset());
                } else {
                    dateB = dateStringB;
                }

                if (dateA && !dateB) {
                    return dateA;
                }
                return biggest ? (dateA > dateB ? dateA : dateB) : (dateA > dateB ? dateB : dateA);
            }


            if (
                _plugin.htmlElements.scheduleProperties &&
                _plugin.htmlElements.scheduleProperties.find('#scheduleTags').length !== 0 &&
                _plugin.htmlElements.scheduleProperties.find('#scheduleTags').insmInput
                ) {
                dates = _plugin.htmlElements.scheduleProperties.find('#scheduleTags').insmInput('getValue');
            } else if (_plugin.settings.dataset.Items.Schedule && _plugin.settings.dataset.Items.Schedule.currentValue) {
                dates = _plugin.settings.dataset.Items.Schedule.currentValue;
            } else {
                dates = [];
            }
            
            var startDate = "", endDate = "";
            $.each(dates, function (index, date) {
                if (date.Date.start) {
                    if (startDate == "" || date.Date.start < startDate) {
                        startDate = date.Date.start;
                    }
                }
                if (date.Date.end) {
                    if (endDate == "" || date.Date.end > endDate) {
                        endDate = date.Date.end;
                    }
                }

                /*if (date.Date && date.Date.start && date.Date.end) {
                    if (!date.Time || !date.Time.start || !date.Time.end) {
                        date.Time = { start: "00:00", end: "24:00" };
                    }
                    startDate = sort(date.Date.start, date.Time.start, startDate, false);
                    endDate = sort(date.Date.end, date.Time.end, endDate, true);
                }*/
            });
            
            return { end: endDate, start: startDate };
        },
        templateSelector: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');

            var def = $.Deferred();

            var templates = {
                'Image': { type: 'Text', value: 'Image' },
                'Movie': { type: 'Text', value: 'Movie' }
            };


            $.each(_plugin.settings.compositeTemplates, function (index, value) {
                templates[index] = {
                    type: 'Archive',
                    value: value,
                    fileId: value
                };
            });

            //if (_plugin.settings.mode != 'listAsset') {
            //    templates.List = {
            //        type: 'Text',
            //        value: 'List'
            //    };
            //}
            var currentSelected = [];
            $.each(templates, function (key, object) {
                if (object.value == options.currentTemplate) {
                    currentSelected.push(key);
                }
            });

            var proplist = {
                Template: {
                    type: 'string',
                    currentValue: currentSelected,
                    multiSelect: false,
                    values: []
                }
            };

            $.each(templates, function (key) { proplist.Template.values.push(key); });

            var $table = $this.insmAsset('generatePropertiesTable', {
                table: options.table,
                properties: proplist,
                customItem: proplist,
                edit: true
            });
            //select template type.
            _plugin.htmlElements.inputField.Template.find('select').change(function () {
                var $selected = $(this);
                if ($selected.val() != 'select') {
                    var template = {
                        Type: templates[$selected.val()].type,
                        Value: templates[$selected.val()].value
                    };
                    if (template.Type == "Archive") {
                        template.FileId = templates[$selected.val()].value;
                    }
                    //options.change is a callback with template info.
                    options.change(template);
                }
            });
        },
        editView: function () {
            // Global vars
            var $this = this;
            var _plugin = $this.data('insmAsset');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Asset plugin not initialized'
                });
            }

            _plugin.htmlElements.scheduleProperties.find('#scheduleTags').insmInput('edit');

            function viewTemplate() {
                if (!_plugin.settings.dataset.Items.Template.Type) {
                    _plugin.htmlElements.templateProperties.empty().append($('<div >No template selected</div>'));
                } else {
                    var template = $this.insmAsset('getTemplate');
                    if(typeof template =='function') {
                        template.apply(_plugin.htmlElements.templateProperties, ['editView']);
                    }
                }
            }
            viewTemplate();

            $.each(_plugin.htmlElements.inputField, function (key, object) {
                object.detach();
            });
            _plugin.htmlElements.propertiesTable.empty();

            //Adding name property to table;
            $this.insmAsset('generatePropertiesTable', { table: _plugin.htmlElements.propertiesTable, properties: _plugin.settings.baseDatasetProperty, customItem: _plugin.settings.dataset, edit: true });

            // Adding default properties to table
            $this.insmAsset('generatePropertiesTable', {
                table: _plugin.htmlElements.propertiesTable,
                properties: _plugin.settings.assetDefaultProperties,
                edit: true
            });
            var templateValue = '';
            if(_plugin.settings.dataset.Items && _plugin.settings.dataset.Items.Template && _plugin.settings.dataset.Items.Template.FileId) {
                templateValue = _plugin.settings.dataset.Items.Template.FileId;
            }
            else if(_plugin.settings.dataset.Items && _plugin.settings.dataset.Items.Template && _plugin.settings.dataset.Items.Template.Value) {
                templateValue = _plugin.settings.dataset.Items.Template.Value;
            }
            $this.insmAsset('templateSelector', {
                table: _plugin.htmlElements.propertiesTable,
                currentTemplate: templateValue,
                change: function (template) {
                    _plugin.settings.dataset.Items.Template = template;
                    var templateData = {
                        content: $this,
                        framework: _plugin.settings.framework,
                        dataset: $.extend(true, {}, _plugin.settings.dataset.Items.Content.DataSet),
                        type: _plugin.settings.dataset.Items.Template.Value,
                        mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                        assetContentDirectoryId: _plugin.settings.assetContentDirectoryId,
                        regionDatasetId: _plugin.settings.regionDatasetId,
                        fileFormat: _plugin.settings.fileFormat,
                        readableFileStatus: _plugin.settings.readableFileStatus,
                        filecache: _plugin.settings.filecache,
                        filechangeCallback: function (name) {
                            if (!_plugin.htmlElements.inputField.Name.insmInput('getValue')) {
                                _plugin.htmlElements.inputField.Name.insmInput('setValue', [name]);
                            }
                        }
                    };
                    _plugin.htmlElements.templateProperties.empty();
                    if (_plugin.settings.dataset.Items.Template.Type == 'Text') {
                        switch (_plugin.settings.dataset.Items.Template.Value) {
                            case 'Image':
                            case 'Movie':
                                _plugin.htmlElements.templateProperties.insmTemplateText(templateData);
                                break;
                            case 'List':
                                _plugin.htmlElements.templateProperties.insmTemplateList(templateData);
                                break;
                            default:
                                not.update({
                                    type: 'error',
                                    text: 'Template "' + _plugin.settings.dataset.Items.Template.Value + '" not implemented in INSM Asset'
                                });
                                break;
                        }
                    } else if (_plugin.settings.dataset.Items.Template.Type == "Archive" || _plugin.settings.dataset.Items.Template.Type == "MediaFile") {
                        var fileId = _plugin.settings.dataset.Items.Template.FileId || _plugin.settings.dataset.Items.Template.Value;
                        _plugin.htmlElements.templateProperties.insmTemplateComposite($.extend(true, {}, templateData), fileId);
                    }
                    viewTemplate();
                }
            });

            // MarketingTag properties
            _plugin.htmlElements.marketingTagProperties.html($this.insmAsset('generatePropertiesTable', { properties: _plugin.settings.assetMarketingTags, edit: true }));


            if (_plugin.settings.dataset.Id && _plugin.settings.mode == "normal") {
                // DeleteAsset button
                _plugin.htmlElements.deleteAssetButton.html($('<a class="button">Delete this asset.</a>').click(function () {
                    if (confirm("Are you sure you want to delete this asset?")) {
                        var not = $.insmNotification({
                            text: 'Removing asset',
                            type: 'load',
                            duration: 0
                        });
                        $this.insmAsset('remove').done(function () {
                            not.update({
                                text: 'Asset Removed',
                                type: 'successful'
                            });
                            $this.html('Asset was removed.');
                            $.insmViewHandlerOld('dataset-list-view').init(_plugin.settings.regionId).show();
                        });
                    }
                }));
            }
            return $this;
        },
        generatePropertiesTable: function (options) {
            var $this = this;
            var _plugin = $this.data('insmAsset');
            var table;
            if (options.table) {
                table = options.table;
            } else {
                table = $('<table />').addClass('vertical no-border');
            }

            $.each(options.properties, function (key) {
                //custom item is in use for the Name attr and the template dropdown.
                var item = (options.customItem && typeof options.customItem[key] != 'undefined' && options.properties[key]) || _plugin.settings.dataset.Items[key];
                if (_plugin.settings.dataset.Items[key] && typeof _plugin.settings.dataset.Items[key].currentValue != 'undefined') {
                    item.currentValue = _plugin.settings.dataset.Items[key].currentValue;
                }

                if (!_plugin.htmlElements.inputField[key]) {
                    _plugin.htmlElements.inputField[key] = $('<div />').insmInput(item);
                }
                
                var title = key;
                if (title == 'DefaultContent') {
                    title = 'Default Content';
                }
                if (title == 'Active') {
                    title = 'Available'
                }
                table.append(
                    $('<tr />').append(
                            $('<th />').text(title)
                        ).append(
                            $('<td />').append(
                               options.edit ? _plugin.htmlElements.inputField[key].insmInput('edit') : _plugin.htmlElements.inputField[key].insmInput('view')
                            )
                        )
                );
            });
            return table;
        },
        onLoad: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Asset plugin not initialized'
                });
            }

            _plugin.settings.onLoad = options.onLoad;

            return $this;
        },
        remove: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            var def = $.Deferred();
            
            _plugin.settings.framework.dataset({
                method: 'remove',
                removeAllReferences: true,
                recursive: true,
                datasetId: _plugin.settings.dataset.Id,
                success: function (data) {
                    def.resolve();
                },
                error: function (message) {
                    def.rejectWith(this, [message]);
                },
                denied: function () {
                    def.rejectWith(this, ['denied']);
                }
            });
            return def;
        },
        getPreview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            var template = $this.insmAsset('getTemplate');
            if (typeof template == 'function') {
                return template.apply(_plugin.htmlElements.templateProperties, ['getPreview']);
            }
            else {
                return $('<img />');
            }
        },
        getName: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            return _plugin.settings.dataset.Name;
            if (_plugin.settings.dataset && _plugin.settings.dataset.Name) {
                return _plugin.settings.dataset.Name;
            }
            return $('<div />').text(' - ');
        },
        getMarketingTags: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            var returnString = "";
            $.each(_plugin.settings.assetMarketingTags, function (index, item) {
                if (item.currentValue instanceof Array && item.currentValue.length > 0) {
                    returnString += index + ": " + item.currentValue.join(", ") + " <br /> ";
                } else if (item.currentValue && item.currentValue.length > 0) {
                    returnString += index + ": " + item.currentValue + " <br /> ";
                }

            });
            return returnString;

        },
        getTemplate: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            var templateData = {
                content: $this,
                framework: _plugin.settings.framework,
                dataset: $.extend(true, {}, _plugin.settings.dataset.Items.Content.DataSet),
                mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                assetContentDirectoryId: _plugin.settings.assetContentDirectoryId,
                regionDatasetId: _plugin.settings.regionDatasetId,
                fileFormat: _plugin.settings.fileFormat,
                readableFileStatus: _plugin.settings.readableFileStatus,
                filecache: _plugin.settings.filecache,
                filechangeCallback: function (name) {
                    if (!_plugin.htmlElements.inputField.Name.insmInput('getValue')) {
                        _plugin.htmlElements.inputField.Name.insmInput('setValue', [name]);
                    }
                }
            };
            if (_plugin.settings.dataset.Items.Template.Type == 'Text') {
                switch (_plugin.settings.dataset.Items.Template.Value) {
                    case 'Image':
                    case 'Movie':
                        if (!_plugin.htmlElements.templateProperties.insmTemplateText('isInitialized')) {
                            _plugin.htmlElements.templateProperties.insmTemplateText(templateData);
                        }
                        return _plugin.htmlElements.templateProperties.insmTemplateText;
                    case 'List':
                        if (!_plugin.htmlElements.templateProperties.insmTemplateList('isInitialized')) {
                            _plugin.htmlElements.templateProperties.insmTemplateList(templateData);
                        }
                        return _plugin.htmlElements.templateProperties.insmTemplateList;
                    default:
                        //$.insmNotification({
                        //    type: 'error',
                        //    text: 'Template "' + _plugin.settings.dataset.Items.Template.Value + '" not implemented in INSM Asset'
                        //});
                        break;
                }
            } else if (_plugin.settings.dataset.Items.Template.Type == "Archive" || _plugin.settings.dataset.Items.Template.Type == "MediaFile") {
                if (!_plugin.htmlElements.templateProperties.insmTemplateComposite('isInitialized')) {
                    var fileId = _plugin.settings.dataset.Items.Template.FileId || _plugin.settings.dataset.Items.Template.Value;
                    _plugin.htmlElements.templateProperties.insmTemplateComposite($.extend(true, {}, templateData), fileId);
                }
                return _plugin.htmlElements.templateProperties.insmTemplateComposite;
            }
            else {
                _plugin.htmlElements.inputField.Template.find('select').insmHighlight({
                    type: 'error'
                });
                return null;
            }
        },
        isInitialized: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            if (!_plugin) {
                return false;
            } else {
                return true;
            }
        },
        getTemplateInfo: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            var template = $this.insmAsset('getTemplate');
            if (typeof template == 'function') {
                return template.apply(_plugin.htmlElements.templateProperties, ['getTemplateInfo']);
            }
            else {
                return;
            }
        },
        getTemplateType: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            if (_plugin.settings.dataset.Items.Template.Type == 'Text') {
                return _plugin.settings.dataset.Items.Template.Value;
            } else {
                var returnString = "";
                $.each(_plugin.settings.compositeTemplates, function (index, value) {
                    if (value == _plugin.settings.dataset.Items.Template.Value) {
                        returnString = index;
                        return false;
                    }
                });
                return returnString;
            }
            return 'Template type not implemented';
        },
        save: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            var def = $.Deferred();
            var validateDef = $this.insmAsset('validate');

            if (_plugin.settings.dataset.Items.PlayUntilFinished &&
                typeof _plugin.settings.dataset.Items.PlayUntilFinished.Value != 'undefined' &&
                _plugin.settings.dataset.Items.PlayUntilFinished.Value == false &&
                _plugin.settings.dataset.Items.Duration.Value == "0") {
                
                def.rejectWith(this, ['Duration cannot be zero if play until finished is unchecked']);
                return def;
            }

            validateDef.fail(function (message) {
                def.rejectWith(this, [message]);
            }).done(function () {
                var not = $.insmNotification({
                    text: 'Saving asset',
                    type: 'load',
                    duration: 0
                });

                // Fix for the silvercurve UI where no duration equals play until finished
                if (_plugin.settings.dataset.Items.PlayUntilFinished && typeof _plugin.settings.dataset.Items.PlayUntilFinished.Value != 'undefined' && _plugin.settings.dataset.Items.PlayUntilFinished.Value == true) {
                    _plugin.settings.dataset.Items.Duration.Value = "0";
                }
                
                var data = {
                    method: 'set',
                    name: _plugin.settings.dataset.Name,
                    datasetId: _plugin.settings.dataset.Id,
                    removeAllReferences: true,
                    recursive: true,
                    contentDirectoryId: _plugin.settings.assetContentDirectoryId,
                    value: JSON.stringify(_plugin.settings.dataset),
                    success: function (data) {
                        not.update({
                            text: 'Asset saved',
                            type: 'successful'
                        });
                        if (!_plugin.settings.dataset.Id) {
                            _plugin.settings.dataset.Id = data.Id;
                            //add the newly created dataset to the region.
                            not = $.insmNotification({
                                text: 'Registering new Asset',
                                type: 'load',
                                duration: 0
                            });
                            $.insmFramework('dataset', {
                                method: 'set',
                                removeAllReferences: true,
                                datasetItem: data.Id,
                                datasetId: _plugin.settings.regionDatasetId,
                                datasetItemType: 'DataSet',
                                datasetItemValue: "id:" + data.Id,
                                value: data.Id,
                                success: function (data) {
                                    not.update({
                                        text: 'Asset registered',
                                        type: 'successful'
                                    });
                                    def.resolveWith(this, [_plugin.settings.dataset, $this]);
                                },
                                denied: function () {
                                    not.update({
                                        text: 'Denied',
                                        type: 'error'
                                    });
                                    def.rejectWith(this, ['denied']);
                                    $.insmFramework('login', {
                                        success: function () {
                                            $this.insmAsset('save', options);
                                        }
                                    });
                                },
                                error: function (message) {
                                    not.update({
                                        text: message,
                                        type: 'error'
                                    });
                                    def.rejectWith(this, [message]);
                                }
                            });
                        } else {
                            def.resolveWith(this, [_plugin.settings.dataset, $this]);
                        }
                    },
                    denied: function () {
                        not.update({
                            text: 'Denied',
                            type: 'error'
                        });
                        def.rejectWith(this, ['denied']);
                        $.insmFramework('login', {
                            success: function () {
                                not.update({
                                    type: 'successful',
                                    text: 'Authentication successful'
                                });

                                $this.insmAsset('save', options);
                            }
                        });
                    },
                    error: function (message) {
                        not.update({
                            text: message,
                            type: 'error'
                        });
                        def.rejectWith(this, [message]);
                    }
                };

                if (!data.datasetId) {
                    delete data.datasetId; //new asset.
                } else {
                    delete data.contentDirectoryId;
                }

                $.insmFramework('dataset', data);
            });
            return def;
        },
        validate: function () {
            // RETURNS: deffered that is rejected with error message if false or resolved if correct.
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            $this.insmAsset('updateDataset');

            var def = $.Deferred();

            if (_plugin.htmlElements.inputField.Name) {
                _plugin.htmlElements.inputField.Name.insmInput('validate');
            }

            if (!_plugin.settings.dataset.Name) {
                def.rejectWith(this, ["Asset must have a name"]);
                return def;
            }
            var scheduleInterval = {};

            // validate default properties (mainly display layout)
            var assetDefaultPropertiesError = false;
            $.each(_plugin.settings.assetDefaultProperties, function (key, object) {
                if (!_plugin.htmlElements.inputField[key].insmInput('validate')) {
                    assetDefaultPropertiesError = true;
                }
            });
            if (assetDefaultPropertiesError) {
                def.rejectWith(this, ['Required properties missing.']);
                return def;
            }


            if (_plugin.settings.mode == "normal") {
                var marketingTagsError = false;
                // validate Marketing Tags
                $.each(_plugin.settings.assetMarketingTags, function (key, object) {
                    if (!_plugin.htmlElements.inputField[key].insmInput('validate')) {
                        marketingTagsError = true;
                    }
                });
                if (marketingTagsError) {
                    def.rejectWith(this, ['Required Marketingtags missing.']);
                    return def;
                }
                // validate Schedule
                if (!_plugin.htmlElements.scheduleProperties.find('#scheduleTags').insmInput('validate')) {
                    def.rejectWith(this, ["Please check schedule settings"]);
                    return def;
                };

                var scheduleInterval = $this.insmAsset('getDateInterval');
            }

            // validate Template
            var template = $this.insmAsset('getTemplate');

            if (!template) {
                def.rejectWith(this, ["Asset must have a template"]);
                return def;
            }
            
            var templateValidDef = template.apply(_plugin.htmlElements.templateProperties, ['validate']);
            templateValidDef.done(function () {
                var templateIntervalDef = template.apply(_plugin.htmlElements.templateProperties, ['getDateInterval']);
                templateIntervalDef.done(function (templateInterval) {
                    if (scheduleInterval.start && scheduleInterval.end && templateInterval.start && templateInterval.end) {
                        //change 23:59:59 to 24:00.... 
                        if (templateInterval.end.getHours() == "23" && templateInterval.end.getMinutes() == "59" && templateInterval.end.getSeconds() == "59") {
                            templateInterval.end.setTime(templateInterval.end.getTime() + 1000);
                        }
                        if (scheduleInterval.start < templateInterval.start) {
                            def.rejectWith(this, ["The scheduled date (" + printDate(scheduleInterval.start, 'Y-m-d H:i') + ") is before the template's first allowed date (" + printDate(templateInterval.start, 'Y-m-d H:i') + ")"]);
                        } else if (scheduleInterval.end > templateInterval.end) {
                            def.rejectWith(this, ["The scheduled date (" + printDate(scheduleInterval.end, 'Y-m-d H:i') + ") is after the template's last allowed date (" + printDate(templateInterval.end, 'Y-m-d H:i') + ")"]);
                        } else {
                            def.resolve();
                        }
                    } else {
                        def.resolve();
                    }
                });
            }).fail(function (message) {
                def.rejectWith(this, [message])
            });


            return def;
        },
        getTemplateDateInterval: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAsset');
            var template = $this.insmAsset('getTemplate');
            return template.apply(_plugin.htmlElements.templateProperties, ['getDateInterval']);
        },
        updateDataset: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmAsset');

            //make sure datasets.Itemlist have no extra scrap. (like old marketing-tags etc.).
            var tmp = _plugin.settings.dataset.Items;
            _plugin.settings.dataset.Items = {};
            _plugin.settings.dataset.Items.Content = tmp.Content;
            _plugin.settings.dataset.Items.Template = tmp.Template;

            /*
             * Fetches the values from htmlElements and simplifies the dataset info.
             * (dataset corresponds to server version of the dataset. Stuff like a select box has to be text etc.)
             */
            var setDatasetFromHtmlElements = function (properties, customItem) {
                $.each(properties, function (key, object) {

                    //Fetch from html and save into dataset.
                    val = "";
                    if (_plugin.htmlElements.inputField[key] && _plugin.htmlElements.inputField[key].insmInput) {
                        val = _plugin.htmlElements.inputField[key].insmInput('getValue');
                    }

                    var item = (customItem && customItem[key]) || tmp[key];
                    item.Value = val;

                    //Simplify dataset.
                    var reObject = {
                        Value: item.Value
                    };


                    switch (object.type) {
                        case 'bool':
                        case 'boolean':
                            reObject.Type = 'Boolean';
                            reObject.Value = item.Value ? 'True' : 'False';
                            break;
                        default:
                            reObject.Type = 'Text';
                            reObject.Value = JSON.stringify(item.Value);
                            break;
                    }
                    if (!customItem) {
                        _plugin.settings.dataset.Items[key] = reObject;
                    } else {
                        customItem[key] = reObject;
                    }
                });
            };
            if (_plugin.htmlElements.scheduleProperties.find('#scheduleTags').length > 0) {
                _plugin.settings.dataset.Items.Schedule = {
                    Type: "Text",
                    Value: JSON.stringify(_plugin.htmlElements.scheduleProperties.find('#scheduleTags').insmInput('getValue'))
                };
            }
            //fetch the name value
            setDatasetFromHtmlElements(_plugin.settings.baseDatasetProperty, _plugin.settings.baseDatasetProperty);
            //fetch the assetTags values
            setDatasetFromHtmlElements(_plugin.settings.assetMarketingTags);
            //fetch the default values
            setDatasetFromHtmlElements(_plugin.settings.assetDefaultProperties);

            //make sure name corresponds on all places.
            _plugin.settings.dataset.Name = JSON.parse(_plugin.settings.baseDatasetProperty.Name.Value);

            var template = $this.insmAsset('getTemplate');
            if (!template) {
                return _plugin.settings.dataset;
            }
            _plugin.settings.dataset.Items.Content.DataSet = template.apply(_plugin.htmlElements.templateProperties, ['updateDataset']);

            //get properties that are special
            var propArray = template.apply(_plugin.htmlElements.templateProperties, ['getContentProperties']);
            $.each(propArray, function (index, value) {
                _plugin.settings.dataset.Items[value] = template.apply(_plugin.htmlElements.templateProperties, ['getProperty', { key: value }]);
            });
            return _plugin.settings.dataset;
        }
    };

    $.fn.insmAsset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAsset');
            return null;
        }
    };
})(jQuery);