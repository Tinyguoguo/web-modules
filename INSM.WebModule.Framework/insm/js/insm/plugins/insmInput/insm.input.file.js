/*
* INSM Input File
* This file contain the INSM Input File function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputFile(settings);
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
            var _plugin = $this.data('insmInputFile');
            
            if (_plugin) {
                $this.insmInputFile('destroy');
            }
            _plugin = {
                settings: $.extend({
                    type: 'file',
                    defaultValue: '',
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: '',
                    regionId: null,
                    directoryName: 'Media',
                    allowedFileTypes: [],
                    doNotAllow: [],
                    onFileManagerStart: function () {
                        throw new Error('onFileManagerStart not defined');
                    },
                    onFileManagerEnd: function () {
                        throw new Error('onFileManagerStart not defined');
                    },
                    onFileManagerDestroy: function() {
                        throw new Error('onFileManagerDestroy not defined');
                    },
                    fileManager: null,
                    onChange: function () { }
                }, options),
                data: {
                    type: null,
                    element: null,
                    previousValue: null,
                    file: {},
                    subscriber: 'inputFile' + Math.floor(Math.random() * 1000000000000000)
                },
                htmlElements: {
                    selectFile: $('<button />').text('Choose file')
                }
            };
            
            if (typeof _plugin.settings.value === "number") {
                _plugin.settings.value = _plugin.settings.value.toString();
            }
            
            _plugin.htmlElements.selectFile.click(function () {
                $this.insmInputFile('onSelectFile');
            });

            $this.data('insmInputFile', _plugin);
            
            return $this;
        },
        onSelectFile: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            _plugin.settings.onFileManagerStart();
            _plugin.settings.fileManager.insmFileManager({
                target: _plugin.settings.fileManager,
                regionId: _plugin.settings.regionId,
                directoryName: _plugin.settings.directoryName,
                externalFilter: function (file) {
                    var valid = true;
                    $.each(_plugin.settings.allowedFileTypes, function (index, fileType) {
                        valid = false;
                        if (file.type.toLowerCase() == fileType.toLowerCase()) {
                            valid = true;
                            return;
                        }
                    });
                    return valid;
                },
                header: false,
                showBackButton: true,
                onSelect: function (files) {
                    $this.insmInputFile('update', {
                        value: files
                    });
                    _plugin.settings.fileManager.insmFileManager('destroy');
                    _plugin.settings.onFileManagerEnd();
                },
                onBack: function () {
                    _plugin.settings.fileManager.insmFileManager('destroy');
                    _plugin.settings.onFileManagerEnd();
                },
                onDestroy: function () {
                    _plugin.settings.onFileManagerDestroy();
                }
            }).insmFileManager('fullscreen').insmFileManager('showGrid');

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            //_plugin.htmlElements.selectFile.detach();

            if (!$.isEmptyObject(_plugin.data.file)) {
                $this.text(_plugin.data.file.name);
            }
            else {
                $this.text('No file selected');
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        startFileBrowser: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            $.insmFileBrowser({
                fileTypes: _plugin.settings.fileTypes,
                preselectedFileIds: [_plugin.settings.value],
                onSelect: function (selectedFiles) {
                    $this.insmInputFile('update', {
                        value: selectedFiles[0].id
                    });
                }
            });

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');
            
            if (_plugin.data.file) {
                $this.text(_plugin.data.file.name);
            }
            $this.append(
                _plugin.htmlElements.selectFile.click(function () {
                    $this.insmInputFile('onSelectFile');
                })
            );
            _plugin.data.currentView = 'edit';

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');
            
            return _plugin.settings.value;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            _plugin.settings.value = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');
            if (_plugin.settings.multiValue) {
                if (_plugin.settings.required === true && $this.insmInputFile("getValue").length === 0) {
                    _plugin.htmlElements.selectFile.insmHighlight({
                        type: 'error'
                    });
                    return false;
                } else {
                    return true;
                }
            }
            else {
                if (_plugin.settings.required === true && !$this.insmInputFile("getValue")) {
                    _plugin.htmlElements.selectFile.insmHighlight({
                        type: 'error'
                    });
                    return false;
                } else {
                    var foundNotAllowed = false;
                    $.each(_plugin.settings.doNotAllow, function (index, value) {
                        if ($this.insmInputFile("getValue").indexOf(value) != -1) {
                            foundNotAllowed = value;
                        }
                    });
                    if (foundNotAllowed) {
                        _plugin.htmlElements.selectFile.insmHighlight({
                            type: 'error'
                        });
                        return false;
                    }
                    return true;
                }
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            switch(_plugin.data.type){
                case 'input':
                    _plugin.data.element.val("");
                break;
                case 'dropdown':
                    _plugin.data.element.children().removeAttr("selected");
                    _plugin.data.element.children().eq(0).attr("selected", "selected");
                break;
            }
            // clear current value
            _plugin.settings.value = [];
            $this.find(".selected").children().remove();
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');
            
            if (!options) {
                options = {};
            }
            if (!_plugin) {
                return $this;
            }

            // TODO: Implement multi select
            if ($.isArray(options.value)) {
                options.value = options.value[0];
            }
            // If we have a new value (new file id) we need to update the view and also update the subscriptions
            if (options.file) {
                if (!$.isEmptyObject(_plugin.data.file) && options.file.id != _plugin.data.file.id) {
                    $this.parent().insmHighlight();
                }
                _plugin.data.file = options.file;

                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputFile('view');
                        break;
                    case 'edit':
                        $this.insmInputFile('edit');
                        break;
                    default:
                        break;
                }
            }
            else if (parseInt(options.value) > 0) {
                if (parseInt(_plugin.settings.value) > 0) {
                    $.insmService('unregister', {
                        subscriber: _plugin.data.subscriber,
                        type: 'file',
                        fileId: _plugin.settings.value
                    });
                }

                _plugin.settings.value = options.value;
                _plugin.settings.onChange();

                if (parseInt(_plugin.settings.value) > 0) {
                    $.insmService('register', {
                        subscriber: _plugin.data.subscriber,
                        type: 'file',
                        fileId: _plugin.settings.value,
                        update: function (file) {
                            $this.insmInputFile('update', {
                                file: file
                            });
                        },
                        reset: function () {

                        }
                    });
                }
            }

            return $this;
        },
        reset: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            //_plugin.settings.value = options.id;

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            if (_plugin) {
                $.insmService('unregister', {
                    subscriber: _plugin.data.subscriber,
                    type: 'file',
                    id: _plugin.settings.value
                });
            }

            $this.data('insmInputFile', null);

            return $this;
        }
    };

    $.fn.insmInputFile = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputFile');
        }
    };
})(jQuery);
