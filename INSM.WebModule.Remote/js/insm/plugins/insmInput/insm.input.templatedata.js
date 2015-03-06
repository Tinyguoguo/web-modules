/*
* INSM Asset
* This file contain the INSM Input String function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputTemplateData(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');
                _plugin = {
                    settings: $.extend({
                        type: 'templateData',
                        template: '',
                        templates: {},
                        regionId: null,
                        mediaDirectoryName: 'Media',
                        templateDirectoryName: 'Template',
                        value: {
                            template: '',
                            data: {},
                            name: ''
                        },
                        fileManager: null,
                        onUpdate: function () { }
                    }, options),
                    data: {
                        type: null,
                        currentView: null,
                        objectDefinition: {},
                        templates: {},
                        initialized: new $.Deferred()
                    },
                    htmlElements: {
                        templatePicker: {
                            container: $('<div />'),
                            title: $('<div />'),
                            dropdown: $('<div />')
                        },
                        preview: $('<div />'),
                        templateData: $('<div />')
                    }
                };

                $this.data('insmInputTemplateData', _plugin);

                $.insmFramework('getFiles', {
                    regionId: _plugin.settings.regionId,
                    directoryName: _plugin.settings.templateDirectoryName,
                    success: function (files) {
                        var deferredList = [];

                        _plugin.data.templates['Image'] = {
                            content: {
                                children: {
                                    Image: {
                                        type: 'image'
                                    }
                                }
                            },
                            manifest: {},
                            template: {
                                children: {
                                    ShowPlayUntilFinished: {
                                        type: 'Boolean',
                                        value: false
                                    },
                                    DefaultPlayUntilFinished: {
                                        type: 'Boolean',
                                        value: false
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
                            }
                        };

                        _plugin.data.templates['Movie'] = {
                            content: {
                                children: {
                                    Movie: {
                                        type: 'movie'
                                    }
                                }
                            },
                            manifest: {},
                            template: {
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
                                        value: false
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
                            }
                        };

                        $.each(files, function (index, template) {
                            // Get template data from template
                            deferredList.push($.insmFramework('getTemplateData', {
                                id: template.id,
                                success: function (data) {
                                    var title = (data.manifest.children.Title && data.manifest.children.Title.value ? data.manifest.children.Title.value : template.name);
                                    _plugin.data.templates[title] = data;
                                }
                            }));
                        });
                        
                        

                        $.when.apply(null, deferredList).done(function () {
                            var availableTemplates = [];
                            $.each(_plugin.data.templates, function (name, template) {
                                availableTemplates.push(name);
                            });
                            _plugin.htmlElements.templatePicker.dropdown.insmInput({
                                type: 'string',
                                required: false,
                                value: '',
                                availableValues: availableTemplates
                            });

                            _plugin.data.initialized.resolve();
                        });


                        $this.insmInputTemplateData('renderPreview', _plugin.settings.value);
                        return;
                    }
                });
            
                _plugin.htmlElements.templateData.insmInput({
                    type: 'table'
                });
                
                // Insert into DOM
                $this.empty().addClass('templateViewer').append(
                    _plugin.htmlElements.templatePicker.container.addClass('templatePicker').append(
                        _plugin.htmlElements.templatePicker.title.text('Template:'),
                        _plugin.htmlElements.templatePicker.dropdown
                    ),
                    _plugin.htmlElements.preview.addClass('templatePreview'),
                    _plugin.htmlElements.templateData.addClass('templateData')
                );

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');

            if (_plugin.settings.value.template) {
                _plugin.htmlElements.templateData.insmInput('view');
            }
            
            $.when(_plugin.data.initialized).done(function () {
                _plugin.htmlElements.templatePicker.dropdown.insmInput('view');
            });

            _plugin.settings.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');

            if (_plugin.settings.value.template) {
                _plugin.htmlElements.templateData.insmInput('edit');
            }
            
            $.when(_plugin.data.initialized).done(function () {
                _plugin.htmlElements.templatePicker.dropdown.insmInput('edit').change(function () {
                    _plugin.settings.value.data = null;
                    $this.insmInputTemplateData('setTemplate', {
                        template: _plugin.htmlElements.templatePicker.dropdown.insmInput('getValue')
                    });
                });
            });

            _plugin.settings.currentView = 'edit';
            
            return $this;
        },
        setTemplate: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');
            
            if (!_plugin) {
                return $this;
            }

            // Update settings.value.template
            _plugin.settings.value.template = options.template;

            _plugin.settings.onUpdate(_plugin.data.templates[_plugin.settings.value.template]);

            // Populate _plugin.data.objectDefinition
            $.when(_plugin.data.initialized).done(function () {
                _plugin.htmlElements.templatePicker.dropdown.insmInput('update', {
                    value: _plugin.settings.value.template
                });
                            
                _plugin.data.objectDefinition = {};
                if (typeof _plugin.data.templates[_plugin.settings.value.template] !== 'undefined') {
                    $.each(_plugin.data.templates[_plugin.settings.value.template].content.children, function (key, parameter) {
                        if (typeof parameter.type === 'string' && parameter.type.toLowerCase() == 'image') {
                            _plugin.data.objectDefinition[key] = {
                                type: 'file',
                                allowedFileTypes: ['image'],
                                onFileManagerStart: _plugin.settings.onFileManagerStart,
                                onFileManagerEnd: _plugin.settings.onFileManagerEnd,
                                onFileManagerDestroy: _plugin.settings.onFileManagerDestroy,
                                fileManager: _plugin.settings.fileManager,
                                regionId: _plugin.settings.regionId,
                                directoryName: _plugin.settings.mediaDirectoryName,
                                required: false,
                                onChange: function () {
                                    var data = _plugin.htmlElements.templateData.insmInput('getValue');
                                    $this.insmInputTemplateData('renderPreview', $this.insmInput('getValue'));
                                }
                            };
                        }
                        else if (typeof parameter.type === 'string' && parameter.type.toLowerCase() == 'movie') {
                            _plugin.data.objectDefinition[key] = {
                                type: 'file',
                                allowedFileTypes: ['video'],
                                onFileManagerStart: _plugin.settings.onFileManagerStart,
                                onFileManagerEnd: _plugin.settings.onFileManagerEnd,
                                onFileManagerDestroy: _plugin.settings.onFileManagerDestroy,
                                fileManager: _plugin.settings.fileManager,
                                regionId: _plugin.settings.regionId,
                                directoryName: _plugin.settings.mediaDirectoryName,
                                required: false,
                                onChange: function () {
                                    var data = _plugin.htmlElements.templateData.insmInput('getValue');
                                    $this.insmInputTemplateData('renderPreview', $this.insmInput('getValue'));
                                }
                            };
                        }
                        else if (typeof parameter.type === 'string' && parameter.type.toLowerCase() == 'file') {
                            _plugin.data.objectDefinition[key] = {
                                type: 'file',
                                onFileManagerStart: _plugin.settings.onFileManagerStart,
                                onFileManagerEnd: _plugin.settings.onFileManagerEnd,
                                onFileManagerDestroy: _plugin.settings.onFileManagerDestroy,
                                fileManager: _plugin.settings.fileManager,
                                regionId: _plugin.settings.regionId,
                                directoryName: _plugin.settings.mediaDirectoryName,
                                required: false,
                                onChange: function () {
                                    var data = _plugin.htmlElements.templateData.insmInput('getValue');
                                    $this.insmInputTemplateData('renderPreview', $this.insmInput('getValue'));
                                }
                            };
                        }
                        else {
                            _plugin.data.objectDefinition[key] = parameter;
                        }
                    });
                }

                _plugin.htmlElements.templateData.insmInput('destroy').insmInput({
                    type: 'table',
                    objectDefinition: _plugin.data.objectDefinition
                }).insmInput('view');
                
                if (_plugin.settings.value.data) {
                    var inputData = {};

                    $.each(_plugin.settings.value.data, function (key, parameter) {
                        if (typeof parameter === 'object') {
                            switch (parameter.type.toLowerCase()) {
                                case 'file':
                                case 'mediafile':
                                    inputData[key] = parameter.id;
                                    break;
                                case 'string':
                                case 'text':
                                case 'boolean':
                                    inputData[key] = parameter.value || '';
                                    break;
                                default:
                                    throw new Error('Type "'+parameter.type+'" not implemented');
                                    break;
                            }
                        }
                        else {
                            inputData[key] = parameter;
                        }
                    });

                    if (!$.isEmptyObject(inputData)) {
                        _plugin.htmlElements.templateData.insmInput('update', {
                            value: inputData
                        });
                    }
                }


                // If applicable - update the values in the fields

                // Re-render the preview
                $this.insmInputTemplateData('renderPreview', $this.insmInput('getValue'));

            });




            if (_plugin.settings.currentView === 'edit') {
                _plugin.htmlElements.templateData.insmInput('edit');
            }
            else {
                _plugin.htmlElements.templateData.insmInput('view');
            }

            return $this;
        },
        renderPreview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');

            if (!_plugin) {
                return $this;
            }

            _plugin.htmlElements.preview.empty();

            if (!options || $.isEmptyObject(options.data)) {
                return $this;
            }

            var systemInformation = $.insmFramework('getSystemInformation');

            switch (options.name.toLowerCase()) {
                case 'image':
                    // View
                    if (options.data.Image) {
                        _plugin.htmlElements.preview.html(
                            $('<img />', {
                                src: systemInformation.apiUrl + '/Files.aspx?method=getThumbnail&fileid=' + options.data.Image.id + '&session=' + $.insmFramework('getSession')
                            })
                        );
                    }
                    break;
                case 'movie':
                    if (options.data.Movie) {
                        _plugin.htmlElements.preview.html(
                            $('<img />', {
                                src: systemInformation.apiUrl + '/Files.aspx?method=getThumbnail&fileid=' + options.data.Movie.id + '&session=' + $.insmFramework('getSession')
                            })
                        );
                    }
                    break;
                default:
                    _plugin.htmlElements.preview.html('No preview available');
                    break;
            }

            return $this;
        },
        reset: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');

            $.when(_plugin.data.initialized).done(function () {
                if (!_plugin) {
                    return;
                }
                var templateName = '';

                if (typeof options.template.value === 'string') {
                    templateName = options.template.value;
                }
                else {
                    $.each(_plugin.data.templates, function (name, template) {
                        if (options.template.id == template.template.id) {
                            templateName = name;
                        }
                    });
                }

                if (options.template) {
                    _plugin.settings.value.name = templateName;
                    $this.insmInputTemplateData('setTemplate', {
                        template: _plugin.settings.value.name
                    });
                }

                // To put it at the end of the stack
                $.when(_plugin.data.initialized).done(function () {
                    if (options.value) {
                        if (!_.isEqual(_plugin.settings.value.data, options.value)) {
                            _plugin.settings.value.data = options.value;
                            var value = {};

                            $.each(_plugin.settings.value.data, function (key, parameter) {
                                value[key] = parameter.value;
                            });

                            _plugin.htmlElements.templateData.insmInput('update', {
                                value: value
                            });
                            $this.insmInputTemplateData('renderPreview', _plugin.settings.value);
                        }
                    }
                });
            });

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');
            

            var templateData;
            var selectedTemplate = _plugin.data.templates[_plugin.settings.value.template];
                        
            var value = {
                template: templateData,
                name: _plugin.settings.value.template,
                data: {}
            };
            
            var inputValue = _plugin.htmlElements.templateData.insmInput('getValue');
            
            $.each(_plugin.data.objectDefinition, function (key, parameter) {
                switch (parameter.type) {
                    case 'file':
                        value.data[key] = {
                            id: inputValue[key],
                            type: 'MediaFile'
                        };
                        break;
                    case 'archive':
                        value.data[key] = {
                            id: inputValue[key],
                            type: 'Archive'
                        };
                        break;
                    default:
                        value.data[key] = {
                            value: inputValue[key],
                            type: 'Text'
                        };
                        break;
                }
            });

            if (selectedTemplate && selectedTemplate.template.id) {
                value.templateData = {
                    type: 'Archive',
                    id: selectedTemplate.template.id
                };
            }
            else {
                value.templateData = {
                    type: 'string',
                    value: _plugin.settings.value.template
                };
            }

            return value;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');
            
            _plugin.settings.currentValue = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');
            
            var validTemplateData = _plugin.htmlElements.templateData.insmInput('validate');
            var validTemplatePicker = _plugin.htmlElements.templatePicker.dropdown.insmInput('validate');
            if (validTemplateData && validTemplatePicker) {
                return true;
            }

            return false;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');


            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTemplateData');
                        
            $.when(_plugin.data.initialized).done(function () {
                var templateName = '';

                if (typeof options.template.value === 'string') {
                    templateName = options.template.value;
                }
                else {
                    $.each(_plugin.data.templates, function (name, template) {
                        if (options.template.id == template.template.id) {
                            templateName = name;
                        }
                    });
                }

                if (options.template) {
                    _plugin.settings.value.name = templateName;

                    $this.insmInputTemplateData('setTemplate', {
                        template: _plugin.settings.value.name
                    });
                }

                if (options.value) {
                    if (!_.isEqual(_plugin.settings.value.data, options.value)) {
                        _plugin.settings.value.data = options.value;
                    
                        var value = {};

                        $.each(_plugin.settings.value.data, function (key, parameter) {
                            value[key] = parameter.value;
                        });

                        _plugin.htmlElements.templateData.insmInput('update', {
                            value: value
                        });

                        $this.insmInputTemplateData('renderPreview', _plugin.settings.value);
                    }
                }
            });


            switch (_plugin.settings.currentView) {
                case 'edit':
                    $this.insmInputTemplateData('edit');
                    break;
                default:
                    $this.insmInputTemplateData('view');
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputTemplateData', null);

            return $this;
        }
    };

    $.fn.insmInputTemplateData = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputTemplateData');
        }
    };
})(jQuery);