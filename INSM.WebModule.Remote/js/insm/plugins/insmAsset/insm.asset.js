/*
* INSM Asset
* This file contain the INSM Asset plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmAssetNew(settings);
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
            var _plugin = $this.data('insmAssetNew');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        fileManager: $('<div />'),
                        properties: $('<div />'),
                        templateContainer: $('<div />'),
                        assetContainer: $('<div />'),
                        templatePicker: {
                            title: $('<span />').text('Template:'),
                            container: $('<div />'),
                            picker: $('<div />')
                        },
                        templateInput: $('<div />'),
                        loading: $('<div />')
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    settings: $.extend({
                        previewRegionId: null,
                        asset: {
                            id: null,
                            name: null,
                            template: null
                        },
                        applicationName: 'insmAssetNew',
                        regionId: null,
                        mediaDirectoryName: 'Media',
                        templateDirectoryName: 'Template',
                        onRemove: null,
                        fileManager: null,
                        onOpenCallback: function () { },
                        onBackCallback: function () { },
                        onSelectCallback: function () { },
                        onStopSubscriptionsCallback: function () { }
                    }, options),
                    data: {
                        asset: {
                            id: null,
                            name: null,
                            template: null
                        },
                        selectedTemplate: null,
                        currentTemplateFileId: null,
                        currentView: null,
                        loading: true
                    }
                };
                $this.data('insmAssetNew', _plugin);
            }
            
            // Init inputs
            _plugin.htmlElements.properties.insmInput('destroy').insmInput({
                type: 'assetProperties'
            });

            _plugin.htmlElements.templateInput.insmInput({
                type: 'templateData',
                onFileManagerStart: function () {
                    _plugin.settings.onOpenCallback();
                    _plugin.htmlElements.assetContainer.hide()
                    _plugin.htmlElements.templateContainer.hide();
                    _plugin.htmlElements.fileManager.fadeIn();
                },
                onFileManagerEnd: function (file) {
                    _plugin.settings.onSelectCallback();
                    _plugin.htmlElements.fileManager.hide();
                    _plugin.htmlElements.assetContainer.fadeIn();
                    _plugin.htmlElements.templateContainer.fadeIn();
                },
                fileManager: _plugin.htmlElements.fileManager,
                regionId: _plugin.settings.regionId,
                mediaDirectoryName: _plugin.settings.mediaDirectoryName,
                templateDirectoryName: _plugin.settings.templateDirectoryName,
                onUpdate: function (value) {
                    value.template = $.extend(true, {
                        children: {
                            ShowPlayUntilFinished: {
                                type: 'Boolean',
                                value: false
                            },
                            DefaultPlayUntilFinished: {
                                type: 'Boolean',
                                value: true
                            },
                            ShowDuration: {
                                type: 'Boolean',
                                value: true
                            },
                            DefaultDuration: {
                                type: 'Numeric',
                                value: 10
                            },
                            DurationMin: {
                                type: 'Numeric',
                                value: 5
                            },
                            DurationMax: {
                                type: 'Numeric',
                                value: 30
                            }
                        }
                    }, value.template);
                    if (value.template.children.ShowDuration && value.template.children.ShowDuration.value) {
                        if (!value.template.children.DurationMin || !value.template.children.DurationMin.value) {
                            value.template.children.DurationMin.value = 5;
                        }
                        if (!value.template.children.DurationMax || !value.template.children.DurationMax.value) {
                            value.template.children.DurationMax.value = 30;
                        }
                        if (!value.template.children.DefaultDuration || typeof value.template.children.DefaultDuration.value !== 'number') {
                            value.template.children.DefaultDuration.value = 10;
                        }
                        _plugin.htmlElements.properties.insmInputAssetProperties('showDuration', {
                            value: value.template.children.DefaultDuration.value,
                            min: value.template.children.DurationMin.value,
                            max: value.template.children.DurationMax.value
                        });
                    }
                    else {
                        if (!value.template.children.DefaultDuration || typeof value.template.children.DefaultDuration.value !== 'number') {
                            value.template.children.DefaultDuration.value = 10;
                        }
                        _plugin.htmlElements.properties.insmInputAssetProperties('hideDuration', {
                            value: value.template.children.DefaultDuration.value
                        });
                    }
                    if (value.template.children.ShowPlayUntilFinished && value.template.children.ShowPlayUntilFinished.value) {
                        if (!value.template.children.DefaultPlayUntilFinished || typeof value.template.children.DefaultPlayUntilFinished.value !== 'boolean') {
                            value.template.children.DefaultPlayUntilFinished.value = true;
                        }
                        _plugin.htmlElements.properties.insmInputAssetProperties('showPlayUntilFinished', {
                            value: value.template.children.DefaultPlayUntilFinished.value,
                        });
                    }
                    else {
                        if (!value.template.children.DefaultPlayUntilFinished || typeof value.template.children.DefaultPlayUntilFinished.value !== 'boolean') {
                            value.template.children.DefaultPlayUntilFinished.value = true;
                        }
                        _plugin.htmlElements.properties.insmInputAssetProperties('hidePlayUntilFinished', {
                            value: value.template.children.DefaultPlayUntilFinished.value,
                        });
                    }
                }
            });
            
            if (_plugin.settings.asset.id == 'new') {
                // It's a new asset
                _plugin.htmlElements.loading.hide();
                _plugin.settings.loading = false;
                _plugin.htmlElements.properties.fadeIn();

                $this.insmAssetNew('edit');
            }
            else {
                _plugin.subscriptions.start = function () {
                    $.insmService('register', {
                        subscriber: _plugin.settings.applicationName,
                        type: 'asset',
                        assetId: options.asset.id,
                        update: function (asset) {
                            $this.insmAssetNew('update', {
                                asset: asset
                            });
                        }
                    });
                };

                _plugin.subscriptions.stop();
                _plugin.subscriptions.start();

                _plugin.subscriptions.stop = function () {
                    $.insmService('unregister', {
                        subscriber: _plugin.settings.applicationName,
                        type: 'asset',
                        assetId: options.asset.id
                    });

                    _plugin.settings.onStopSubscriptionsCallback();
                    _plugin.htmlElements.fileManager.insmFileManager('stopSubscriptions');
                };
            }

            _plugin.htmlElements.fileManager.hide();
            
            // Insert elements to DOM
            $this.empty().addClass('asset-viewer').append(
                _plugin.htmlElements.fileManager,
                _plugin.htmlElements.assetContainer.addClass('property-container').append(
                    _plugin.htmlElements.loading,
                    _plugin.htmlElements.properties
                ),
                _plugin.htmlElements.templateContainer.append(
                    _plugin.htmlElements.templateInput
                ).addClass('template-container')
            );

            return $this;
        },
        getAssetData: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            var asset = $.extend({
                content: {}
            }, _plugin.htmlElements.properties.insmInput('getValue'));
            
            asset.content.children = _plugin.htmlElements.templateInput.insmInput('getValue');

            return asset;
        },
        setTemplate: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');
            
            _plugin.htmlElements.templateInput.insmInput('destroy').insmInput({
                type: 'templateData',
                template: options.value,
                onFileManagerStart: function () {
                    _plugin.settings.onOpenCallback();
                    _plugin.htmlElements.assetContainer.hide()
                    _plugin.htmlElements.templateContainer.hide();
                    _plugin.htmlElements.fileManager.fadeIn();
                },
                onFileManagerEnd: function (file) {
                    _plugin.settings.onSelectCallback();
                    _plugin.htmlElements.fileManager.hide();
                    _plugin.htmlElements.assetContainer.fadeIn();
                    _plugin.htmlElements.templateContainer.fadeIn();
                },
                fileManager: _plugin.htmlElements.fileManager,
                regionId: _plugin.settings.regionId,
                value: _plugin.data.asset.content.children
            }).insmInput(_plugin.data.currentView);

            return $this;
        },
        getThumbnail: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            var thumbnail = $('<div />');
            var fileId = null;
            switch (options.asset.template.value) {
                case 'Image':
                    fileId = options.asset.content.children.Image.id;
                    break;
                case 'Movie':
                    fileId = options.asset.content.children.Movie.id;
                    break;
            }

            thumbnail.empty();
            var systemInformation = $.insmFramework('getSystemInformation');
            thumbnail.append(
                $('<img />', {
                    // TODO: _plugin.data.asset.preview
                    src: systemInformation.apiUrl + '/Files.aspx?method=getThumbnail&type=image&fileid=' + fileId + '&session=' + $.insmFramework('getSession')
                })
            );

            if (options.onClick) {
                thumbnail.click(function () {
                    options.onClick();
                });
            }

            return thumbnail;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            // Swtich to view-view
            _plugin.htmlElements.properties.insmInput('reset');
            _plugin.htmlElements.properties.insmInput('view');
            
            _plugin.htmlElements.templateInput.insmInput('reset', {
                template: _plugin.data.asset.template,
                value: _plugin.data.asset.content.children
            });
            _plugin.htmlElements.templateInput.insmInput('view');

            _plugin.data.currentView = 'view';  

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            // Switch to edit-view
            _plugin.htmlElements.properties.insmInput('edit');
            _plugin.data.currentView = 'edit';
            _plugin.htmlElements.templateInput.insmInput('edit');

            if (_plugin.settings.asset.id == 'new') {
                _plugin.data.asset = {
                    content: {}
                };
            }

            return $this;
        },
        save: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');
            
            // Save asset
            if (_plugin.settings.asset.id == 'new') {
                
                var validProperties = _plugin.htmlElements.properties.insmInput('validate');
                var validTemplateData = _plugin.htmlElements.templateInput.insmInput('validate');

                if (validProperties && validTemplateData) {
                    var asset = $.extend({
                        assetType: {
                            type: 'string',
                            value: ''
                        },
                        template: '',
                        type: 'dataset',
                        defaultContent: false,
                        playUntilFinished: false,
                        state: 'Available',
                        weight: 1,
                        name: null,
                        content: {
                            name: $.insmUtilities('generateGuid'),
                            type: 'dataset'
                        }
                    }, _plugin.htmlElements.properties.insmInput('getValue'));
                    asset.schedule = [{
                        Date: {
                            start: asset.startDate,
                            end: asset.endDate
                        },
                        Weekdays: [0, 1, 2, 3, 4, 5, 6],
                        Time: {
                            start: '',
                            end: ''
                        }
                    }];

                    delete asset.startDate;
                    delete asset.endDate;

                    var templateData = _plugin.htmlElements.templateInput.insmInput('getValue');

                    asset.template = templateData.templateData;

                    asset.content.children = templateData.data;
                    
                    $.insmServiceAsset('save', {
                        asset: asset,
                        success: options.success,
                        regionId: _plugin.settings.regionId
                    });
                }
                else {
                    options.fail();
                }
            }
            else {
                var asset = $.extend({}, _plugin.data.asset, _plugin.htmlElements.properties.insmInput('getValue'));

                asset.schedule = [{
                    Date: {
                        start: asset.startDate,
                        end: asset.endDate
                    },
                    Weekdays: [0, 1, 2, 3, 4, 5, 6],
                    Time: {
                        start: '',
                        end: ''
                    }
                }];

                delete asset.startDate;
                delete asset.endDate;
                
                var templateData = _plugin.htmlElements.templateInput.insmInput('getValue');
                
                asset.template = templateData.templateData;

                asset.content.children = templateData.data;

                
                var validProperties = _plugin.htmlElements.properties.insmInput('validate');
                var validTemplateData = _plugin.htmlElements.templateInput.insmInput('validate');

                if (validProperties && validTemplateData) {
                    $.insmServiceAsset('save', {
                        asset: asset,
                        success: options.success
                    });
                }
                else {
                    options.fail();
                }
            }

            return $this;
        },
        'delete': function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            $this.insmAssetNew('stopSubscriptions');

            return $.insmServiceAsset('delete', {
                asset: {
                    id: _plugin.data.asset.id,
                },
                success: function () {
                    $this.insmAssetNew('destroy');
                    options.callback();
                }
            });
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            _plugin.data.asset = $.extend({}, options.asset);

            if (_plugin.data.loading) {
                // Hide loader and show input
                _plugin.htmlElements.loading.hide();
                switch (_plugin.data.currentView) {
                    case 'edit':
                        $this.insmAssetNew('edit');
                        break;
                    default:
                        $this.insmAssetNew('view');
                        break;
                }
                _plugin.data.loading = false;
            }

            if (!$.isArray(_plugin.data.asset.schedule) || typeof _plugin.data.asset.schedule.length == 'undefined' || _plugin.data.asset.schedule.length == 0) {
                _plugin.data.asset.schedule = [
                    {
                        Date: {
                            start: '',
                            end: ''
                        },
                        Weekdays: [0, 1, 2, 3, 4, 5, 6],
                        Time: {
                            start: '',
                            end: ''
                        }
                    }
                ];
            }
            
            _plugin.htmlElements.properties.insmInput('update', {
                value: {
                    name: _plugin.data.asset.name,
                    state: _plugin.data.asset.state,
                    duration: parseInt(_plugin.data.asset.duration.value),
                    defaultContent: _plugin.data.asset.defaultContent.value,
                    playUntilFinished: _plugin.data.asset.playUntilFinished.value,
                    orientation: _plugin.data.asset.orientation.value,
                    startDate: _plugin.data.asset.schedule[0].Date.start,
                    endDate: _plugin.data.asset.schedule[0].Date.end,
                    template: _plugin.data.asset.template.value
                }
            });

            _plugin.htmlElements.templateInput.insmInput('update', {
                template: _plugin.data.asset.template,
                value: _plugin.data.asset.content.children
            });
                        
            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            if (_plugin) {
                _plugin.subscriptions.stop();
            }

            return $this;
        },
        isEqual: function (options) {
            var equal = true;
            $.each(options.asset1, function (key, property) {
                if (!_.isEqual(options.asset1[key], options.asset2[key])) {
                    equal = false;
                    return true;
                }
            });

            return equal;
        },
        getPreview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');
            
            var systemInfo = $.insmFramework('getSystemInformation');
            var session = $.insmFramework('getSession');
            
            var preview = $('<img class="is-clickable" />')
                .attr('src', systemInfo.apiUrl + '/Preview.aspx?session=' + session + '&method=getPreview&format=json&dataSetId=' + options.datasetId)
                .click(function () {
                    var clone = $(this).clone();
                    $.insmPopup({
                        backdropTransparency: true,
                        content: $('<div />').append(clone),
                        autoOpen: true,
                        showCloseButton: true,
                        backdropClickClose: true
                    });
                })
                .error(function () {
                        $.insmFramework('getModuleSettings', {
                            namespace: 'insmAssetManager',
                            key: 'previewRegion',
                            denied: function () { },
                            error: function () { },
                            success: function (previewRegionId) {

                                if (!parseInt(previewRegionId) > 0) {
                                    $.insmNotification({
                                        text: 'Preview region not set - cannot generate new previews',
                                        type: 'warning'
                                    });
                                    preview.attr('src', 'gfx/insm/icons/preview-not-available.png');
                                    return;
                                }

                                preview.attr('src', 'css/insm/plugins/insmLoader/insm-loading.gif');

                                $.ajax({
                                    url: systemInfo.apiUrl + '/Preview.aspx?session=' + session + '&method=generate&regionid=' + previewRegionId + '&format=json&dataSetId=' + options.datasetId,
                                    dataType: 'jsonp',
                                    success: function (data) {
                                        if (data.Status == 'Error') {
                                            preview.attr('src', 'gfx/insm/icons/preview-not-available.png');
                                            return;
                                        }
                                        function checkStatus() {
                                            $.ajax({
                                                url: systemInfo.apiUrl + '/Preview.aspx?session=' + session + '&method=getPreviewInfo&format=json&dataSetId=' + options.datasetId,
                                                dataType: 'jsonp',
                                                success: function (data) {
                                                    if (data.Result.State !== 'Completed' && data.Result.State !== 'Delivered') {
                                                        setTimeout(checkStatus, 2000);
                                                    }
                                                    else {
                                                        preview.attr('src', systemInfo.apiUrl + '/Preview.aspx?session=' + session + '&method=getPreview&format=json&cache=123&dataSetId=' + options.datasetId)
                                                    }
                                                }
                                            });
                                        }

                                        checkStatus();
                                    }
                                });
                            }
                        });
                        
                    });
            
            return preview;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAssetNew');

            if (_plugin) {
                _plugin.htmlElements.properties.insmInput('destroy');
                if (_plugin.htmlElements.templateProperties)
                    _plugin.htmlElements.templateProperties.clear().remove();
            }

            $this.insmAssetNew('stopSubscriptions');
            $this.data('insmAssetNew', null);
            $this.empty();

            return $this;
        }
    };

    $.fn.insmAssetNew = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAssetNew');
            return null;
        }
    };

    $.insmAssetNew = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAssetNew');
            return null;
        }
    };
})(jQuery);
