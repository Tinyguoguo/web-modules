/*
* INSM Asset
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
* Koji Wakayama - Creuna AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            _plugin = {
                settings: $.extend({
                    type: "File",
                    values: [],
                    currentValue: [],
                    multiSelect: false,
                    required: true,
                    onUpdate: function (newValue) { },
                    disabled: false,
                    mediaContentDirectoryId: null,
                    mediaContentDirectoryName: null,
                    regionId: null

                }, options),
                data: {
                    type: null,
                    element: null,
                    previousValue: null,
                    isInitialized: new $.Deferred()
                }
            };

            if (typeof _plugin.settings.currentValue === "number") {
                _plugin.settings.currentValue = _plugin.settings.currentValue.toString();
            }

            if (typeof _plugin.settings.currentValue === "string") {
                _plugin.settings.currentValue = [_plugin.settings.currentValue];
            }

            _plugin.data.previousValue = _plugin.settings.currentValue;

            $this.data('insmInputFile', _plugin).addClass('file-input-container');

            // Throw error if framework doesnt exist
            if (!$.insmFramework('isInitialized')) {
                throw new Error("File input requires initialized framework.");
            }

            // Throw error if mediaContentDirectoryId doesnt exist
            if (!_plugin.settings.mediaContentDirectoryId) {
                if (_plugin.settings.regionId && _plugin.settings.mediaContentDirectoryName) {
                    var not = $.insmNotification({
                        text: 'Getting media directory',
                        type: 'load',
                        duration: 0
                    });
                    $.insmFramework('directory', {
                        regionId: _plugin.settings.regionId,
                        name: _plugin.settings.mediaContentDirectoryName,
                        success: function (directory) {
                            not.update({
                                text: 'Downloaded media directory',
                                type: 'successful'
                            });
                            _plugin.settings.mediaContentDirectoryId = directory.Id;
                            _plugin.data.isInitialized.resolve();
                        },
                        error: function (message) {
                            not.update({
                                text: message,
                                type: 'error'
                            });
                        },
                        denied: function () {
                            not.update({
                                text: 'Denied',
                                type: 'error'
                            });
                            $.insmFramework('login', {
                                success: function () {
                                    $this.insmInputFile('init', options);
                                }
                            });
                        }
                    });
                }
                else {
                    throw new Error("File input requires a mediaContentDirectoryId.");
                }
            }
            else {
                _plugin.data.isInitialized.resolve();
            }

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');
            $.when(_plugin.data.isInitialized).done(function () {
                if ($.isArray(_plugin.settings.currentValue)) {
                    $this.text(_plugin.settings.currentValue.join(", "));
                }
                else {
                    $this.text(_plugin.settings.currentValue);
                }
            });

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');
            $this.empty();
            
            $.when(_plugin.data.isInitialized).done(function() {
                var textInput = $('<div/>').insmInput({
                    type: "String",
                    currentValue: _plugin.settings.currentValue
                }).insmInput('edit');

                _plugin.data.type = "input";
                _plugin.data.element = textInput;

                $this.append(textInput);
                
                var browseButton = newButton("Browse", "#").click(function (event) {
                    $.insmFileBrowser({
                        mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                        onSelect: function (file) {
                            var file = file;
                            $(_plugin.data.element.find('input')[0]).val(file.Name);
                            // Current value stores file Id
                            _plugin.settings.currentValue = [file.Id];
                            _plugin.settings.onUpdate($this.insmInput('getValue'));
                        }
                    });
                });

                $this.append(browseButton);
            });

            return $this;

            function newButton(text, link, closable, buttonClass) {
                var myClass;
                if (typeof buttonClass !== "string" || buttonClass.length === 0) {
                    myClass = "button";
                } else {
                    myClass = buttonClass;
                }
                var closable = closable ? "closable" : "";
                return $("<a/>", {
                    href: link,
                    text: text,
                    value: text,
                    class: myClass + " " + closable
                });
            }   
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            if (_plugin.settings.multiSelect) {
                return _plugin.settings.currentValue;
            } else {
                if (typeof _plugin.settings.currentValue === "undefined") {
                    return "";
                } else {
                    return _plugin.settings.currentValue[0];
                }
            }
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            if (_plugin.settings.multiSelect) {
                if (_plugin.settings.required === true && $this.insmInputFile("getValue").length === 0) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else {
                    _plugin.data.element.css({
                        border: '1px solid #000'
                    });
                    return true;
                }
            }
            else {
                if (_plugin.settings.required === true && !$this.insmInputFile("getValue")) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else {
                    _plugin.data.element.css({
                        border: '1px solid #000'
                    });
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
            _plugin.settings.currentValue = [];
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFile');

            _plugin.settings.currentValue = _plugin.data.previousValue;
            _plugin.settings.onUpdate($this.insmInputFile('getValue'));

            return $this;
        },
        destroy: function () {

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