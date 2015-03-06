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
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');


            _plugin = {
                htmlElements: {
                    formatValue: {},
                    asset: {}
                },
                settings: $.extend({
                    framework: null,
                    dataset: {
                        Items: {}
                    },
                    filecache: [],
                    regionDatasetId: 0,
                    mediaContentDirectoryId: 0,
                    initialized: false,
                    readableFileStatus: function () { }
                }, options),
                properties: {
                    PlayUntilFinished: {
                        Type: 'bool',
                        Value: 'true'
                    }
                }
            };

            $this.data('insmTemplateList', _plugin);

            // Populate with default dataset items
            var datasetItems = {};
            $.each(_plugin.properties, function (index, value) {
                datasetItems[index] = value;
            });

            //overwrite default value with value from server if exists.
            $.each(datasetItems, function (index) {
                if (typeof _plugin.settings.dataset.Items[index] != 'undefined' && typeof _plugin.settings.dataset.Items[index].Value != 'undefined') {
                    if (datasetItems[index].Type == 'boolean' || datasetItems[index].Type == 'bool') {
                        //special case boolean comes as text 'True' or 'False' => change to actual boolean values.
                        _plugin.settings.dataset.Items[index].Value = _plugin.settings.dataset.Items[index].Value &&
                            !(typeof _plugin.settings.dataset.Items[index].Value == 'string' && _plugin.settings.dataset.Items[index].Value.toLowerCase() == "false");
                    }
                    datasetItems[index].Value = _plugin.settings.dataset.Items[index].Value;
                }
            });

            //Make sure all items from server are preserved in the data.
            _plugin.settings.dataset.Items = $.extend({}, _plugin.settings.dataset.Items, datasetItems);
            _plugin.settings.initialized = true;
            _plugin.settings.dataset.Items = sortObject(_plugin.settings.dataset.Items);
            return $this;
        },
        getContentProperties: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            if (_plugin.settings.type == 'Movie') {
                return ['PlayUntilFinished']
            }
            return [];
        },
        generateProperties: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');

            var $table = $('<table />').addClass('vertical');
            $.each(options.properties, function (key) {
                var item = _plugin.settings.dataset.Items[key];
                item.tag = key;

                if (!_plugin.htmlElements.formatValue[item.tag]) {
                    _plugin.htmlElements.formatValue[item.tag] = $('<div />').insmFormatValue(item);
                }

                $table.append(
                    $('<tr />').append(
                        $('<th />').text(key)
                    ).append(
                        $('<td />').append(
                            options.edit ? _plugin.htmlElements.formatValue[item.tag].insmFormatValue('edit') : _plugin.htmlElements.formatValue[item.tag].insmFormatValue('view')
                        )
                    )
                );
            });

            return $table;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var $table = $this.insmTemplateList('generateProperties', { properties: _plugin.properties });
            $.each(_plugin.settings.dataset.Items, function (key, item) {
                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }
                if (isNumber(key)) {
                    var $previewTd = $('<td />').text('Loading Preview');
                    var $nameTd = $('<td />').text('...');

                    $table.append($('<tr />').append($previewTd, $nameTd));
                    if (!item.DataSet.Items.Content || item.DataSet.Items.Content.Type != 'DataSet' || !item.DataSet.Items.Template) {
                        return;
                    }
                    if (item.DataSet.Items.Template.Value == 'Movie' || item.DataSet.Items.Template.Value == 'Image') {
                        var $templateText = $('<div />').insmTemplateText({
                            framework: _plugin.settings.framework,
                            dataset: item.DataSet.Items.Content.DataSet,
                            mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                            filecache: _plugin.settings.filecache
                        });

                        var $preview = $templateText.insmTemplateText('getPreview');
                        var $name = item.DataSet.Name;
                        $previewTd.html($preview);
                        $nameTd.html($name);
                    }
                }
            });
            $this.html($table);
            return $this;
        },
        createAssetRow: function (object) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var key = object.key;
            var item = object.item;

            var $showButton = $('<a class="button">Show</a>');
            var $preview = null;
            var $TR;
            var $previewTD = null;
            var $nameTD = null;
            var $removeTD = null;
            var assetLoaded = $.Deferred();
            var $assetTD = $('<td class="assetTd" />').html($showButton)

            var $asset = $('<div class="asset" />').insmAsset({
                mode: 'listAsset',
                framework: _plugin.settings.framework,
                regionDatasetId: _plugin.settings.regionDatasetId,
                datasetId: item.DataSet.Id,
                inDataset: item.DataSet,
                mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                onLoad: function (name) {
                    if (!name) {
                        assetLoaded.resolveWith(this, [true]);
                    } else {
                        assetLoaded.resolveWith(this, [false]);
                    }
                }
            });
            $asset.insmAsset('view').insmAsset('editView');
            _plugin.htmlElements.asset[key] = $asset;

            var $hideButton = $('<a key="' + key + '"class="button" />').text('Validate and Minimize').click(function () {
                var button = this;
                $asset.insmAsset('validate').done(function () {
                    _plugin.settings.dataset.Items[$(button).attr('key')] = {
                        Type: 'DataSet',
                        DataSet: $asset.insmAsset('updateDataset')
                    }
                    $preview = $asset.insmAsset('getPreview')
                    $previewTD.html($preview);
                    $nameTD.html($asset.insmAsset('getName'));
                    $asset.detach();
                    $assetTD.append($showButton);
                    $hideButton.detach();
                    $removeTD.html($removeButton);
                }).fail(function (message) {
                    $.insmNotification({
                        text: message,
                        type: 'error'
                    });
                });


                
            });

            var $removeButton = $('<a key="' + key + '" class="button remove"> Remove </a>').click(function () {
                if (confirm("Are you sure you want to remove this asset?")) {
                    _plugin.settings.dataset.Items = sortObject(_plugin.settings.dataset.Items);
                    delete _plugin.settings.dataset.Items[$(this).attr('key')];
                    _plugin.htmlElements.asset[$(this).attr('key')].remove();
                    delete _plugin.htmlElements.asset[$(this).attr('key')];
                    $TR.remove();
                }
            });

            $removeTD = $('<td />').html($removeButton);

            $showButton.click(function () {
                //find the remove button and change it into a save button!
                $showButton.detach();
                $assetTD.append($asset);
                $removeButton.detach();
                $removeTD.append($hideButton);
            });

            assetLoaded.done(function (show) { //if the asset has no name then lets click the show button so that the user can fill in.
                if (show) {
                    $showButton.detach();
                    $assetTD.append($asset);
                    $removeButton.detach();
                    $removeTD.append($hideButton);
                }
            });

            $preview = $asset.insmAsset('getPreview');
            $previewTD = $('<td />').html($preview);
            $nameTD = $('<td />').html($asset.insmAsset('getName'));
            $TR = $('<tr />').append($previewTD, $nameTD, $assetTD, $removeTD);
            return $TR;
        },
        editView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var $table = $this.insmTemplateList('generateProperties', { properties: _plugin.properties, edit: true });
            var index = 0;

            $.each(_plugin.settings.dataset.Items, function (key, item) {
                if (isNumber(key)) {
                    $table.append($this.insmTemplateList('createAssetRow', { key: key, item: item }));
                }
                if (!isNaN(key)) {
                    index = index > key ? index : key;
                }
            });
            $this.empty();

            _plugin.htmlElements.editViewTable = $table;
            $this.append(_plugin.htmlElements.editViewTable);
            $this.append(
                $('<a class="button" />').html('Add asset').click(
                function () {
                    var dataset = {
                        Items: {
                            Content: {
                                Type: 'DataSet'
                            },
                            Template: {
                                Type: 'Text',
                                Value: 'Image'
                            }
                        }
                    };
                    index++;
                    _plugin.settings.dataset.Items[index] = { Type: "DataSet", DataSet: dataset };
                    $table.append($this.insmTemplateList('createAssetRow', { key: index, item: _plugin.settings.dataset.Items[index] }));
                })
            );
            return $this;
        },
        isInitialized: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            if (_plugin) {
                return _plugin.settings.initialized;
            } else {
                return false;
            }
        },
        getPreview: function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var $previewList = $('<div />');
            //SHOULD HANDLE LIST ASSET BUT DOES NOT!
            $.each(_plugin.settings.dataset.Items, function (key, object) {
                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }
                var dataset = object.DataSet;
                if (isNumber(key)) {
                    if (!dataset || !dataset.Items || !dataset.Items.Content || dataset.Items.Content.Type != 'DataSet' || !dataset.Items.Template) {
                        // Hm, error?
                    }
                    else if (dataset.Items.Template.Value == 'Movie' || dataset.Items.Template.Value == 'Image') {
                        var $templateText = $('<div />').insmTemplateText({
                            framework: _plugin.settings.framework,
                            dataset: dataset.Items.Content.DataSet,
                            mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                            filecache: _plugin.settings.filecache
                        });
                        $previewList.append($templateText.insmTemplateText('getPreview'));
                    }
                }
            });
            return $previewList;
        },
        updateDataset: function (options) {
            //update dataset so if fits the htmlData.

            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');

            //make sure no scrap pieces is left in dataset
            var tmp = _plugin.settings.dataset.Items;
            _plugin.settings.dataset.Items = {};
            _plugin.htmlElements.asset = sortObject(_plugin.htmlElements.asset);
            var index = 0; //ajust so that index really goes from 1...->
            $.each(_plugin.htmlElements.asset, function (i, $asset) {
                index++;
                _plugin.settings.dataset.Items[index] = {
                    Type: 'DataSet',
                    DataSet: $asset.insmAsset('updateDataset')
                }
            });

            $.each(_plugin.properties, function (key, object) {
                if (tmp[key]) {
                    //Fetch from html and save into dataset.
                    var val;
                    if (object.Type != 'bool' && object.Type != 'boolean') {
                        val = _plugin.htmlElements.editViewTable.find('input[tag="' + key + '"], select[tag="' + key + '"]').val();
                    } else {
                        val = _plugin.htmlElements.editViewTable.find('input[tag="' + key + '"]').is(':checked') ? 'True' : 'False';
                    }

                    var item = tmp[key];
                    item.Value = val;

                    //Simplify dataset.
                    var reObject = {
                        Value: item.Value
                    };
                    switch (object.Type) {
                        case 'bool':
                        case 'boolean':
                            reObject.Type = 'Boolean';
                            break;
                        default:
                            reObject.Type = 'Text';
                            break;
                    }
                    _plugin.settings.dataset.Items[key] = reObject;
                }
            });

            if (!_plugin.settings.dataset.Name) {
                _plugin.settings.dataset.Name = "ContentAsset";
            }

            return _plugin.settings.dataset;
        },
        getProperty: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            return _plugin.settings.dataset.Items[options.key];
        },
        getDateInterval: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var def = $.Deferred();

            /**
            * The valid date interval for a template list is the cut (think venn diagram) of all assets date intervals.
            */

            function cut(aDates, bDates) {
                if (bDates == 0 || aDates == 0) {
                    return 0;
                }
                if (!bDates.start) {
                    return aDates;
                }
                if (bDates.start < aDates.start) {
                    bDates.start = aDates.start;
                }
                if (bDates.end > aDates.end) {
                    bDates.end = aDates.end;
                }
                if (bDates.end > bDates.start) {
                    return { start: bDates.start, end: bDates.end };
                } else {
                    return 0;
                }
            }

            var currentDate = {};
            var assetDateDefList = [];

            $.each(_plugin.htmlElements.asset, function (index, $asset) {
                var assetDateIntervalDef = $asset.insmAsset('getTemplateDateInterval')
                var def = $.Deferred();
                assetDateDefList.push(def);
                assetDateIntervalDef.done(function (assetDates) {
                    currentDate = cut(assetDates, currentDate);
                    def.resolve();
                });
            });
            
            $.when.apply(this, assetDateDefList).done(function () {
                def.resolveWith(this, [currentDate]);
            });
            return def;
        },
        validate: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var def = $.Deferred();
            var items = 0;
            $.each(_plugin.settings.dataset.Items, function (key, object) {
                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }
                if (isNumber(key)) {
                    items++;
                }
            });
            if (items == 0) {
                $this.css({
                    border: '1px solid #e67'
                });
                def.rejectWith(this, ["List asset must have at least one asset!"]);
                return def;
            }


            var returnList = [];
            var returnFailedData = [];

            $.each(_plugin.htmlElements.asset, function (index, $asset) {
                var assetValidDef = $asset.insmAsset('validate');
                returnList.push(assetValidDef);
                assetValidDef.fail(function (message) {
                    returnFailedData.push(message);
                });
            });

            $.when.apply(this, returnList).done(function () {
                    $this.insmTemplateList('getDateInterval').done(function (dateInterval) {
                        if (dateInterval == 0) {
                            def.rejectWith(this, ["Files selected does not create an overlapping time interval"]);
                        } else {
                            $this.css({
                                border: '0px'
                            });
                            def.resolve();
                        }
                    });
            }).fail(function () {
                def.rejectWith(this, ["Template: " + returnFailedData.join(", ")]);
            });

            return def;
        },
        getTemplateInfo: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateList');
            var defList = [];
            var templateInfo = [];
            var failList = [];
            var ret = $.Deferred();

            //SHOULD HANDLE LIST ASSET BUT DOES NOT!
            $.each(_plugin.settings.dataset.Items, function (key, object) {
                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }
                if (isNumber(key)) {
                    var def = $.Deferred();
                    defList.push(def);
                    var dataset = object.DataSet;
                    if (!dataset || !dataset.Items || !dataset.Items.Content || dataset.Items.Content.Type != 'DataSet' || !dataset.Items.Template) {
                        //hm do what?
                    }
                    else if (dataset.Items.Template.Value == 'Movie' || dataset.Items.Template.Value == 'Image') {
                        var $templateText = $('<div />').insmTemplateText({
                            framework: _plugin.settings.framework,
                            dataset: dataset.Items.Content.DataSet,
                            mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                            readableFileStatus: _plugin.settings.readableFileStatus,
                            filecache: _plugin.settings.filecache
                        });
                        $templateText.insmTemplateText('getTemplateInfo').done(function (data) {
                            templateInfo.push(data);
                            def.resolve();
                        }).fail(function (data) {
                            failList.push(data);
                            def.resolve();
                        });
                    }
                }
            });

            $.when.apply(this, defList).done(function () {
                if (failList.length > 0) {
                    ret.rejectWith(this, failList);
                } else {
                    var statusText = "OK";
                    var files = [];
                    $.each(templateInfo, function (index, info) {
                        if (info.state != "OK" && statusText == "OK") {
                            statusText = info.state;
                        } else if (info.state != "OK" && statusText != "OK") {
                            statusText += "<br /> " + info.state;
                        }
                        files = files.concat(info.files);
                    });
                    var info = {
                        state: statusText,
                        files: files
                    }
                    ret.resolveWith(this, [info]);
                }
            });
            return ret;

        }
    };

    $.fn.insmTemplateList = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTemplateList');
            return null;
        }
    };
})(jQuery);