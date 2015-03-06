/*
* INSM Asset
* This file contain the INSM Input String function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputString(settings);
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
            var _plugin = $this.data('insmInputString');

            _plugin = {
                settings: $.extend({
                    type: "String",
                    values: [],
                    currentValue: [],
                    doNotAllow: [],
                    multiSelect: false,
                    uniqueValues: false,
                    required: true,
                    onUpdate: function (newValue) { },
                    disabled: false
                }, options),
                data: {
                    type: null,
                    element: null,
                    previousValue: null
                }
            };
            
            if (typeof _plugin.settings.currentValue === "number") {
                _plugin.settings.currentValue = _plugin.settings.currentValue.toString();
            }

            if (typeof _plugin.settings.currentValue === "string") {
                _plugin.settings.currentValue = [_plugin.settings.currentValue];
            }

            _plugin.data.previousValue = _plugin.settings.currentValue;

            $this.data('insmInputString', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            if ($.isArray(_plugin.settings.currentValue)) {
                $this.text(_plugin.settings.currentValue.join(", "));
            }
            else {
                $this.text(_plugin.settings.currentValue);
            }

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');
            $this.empty();

            if (_plugin.settings.values.length === 0) {
                // Input
                var textInput = $("<input/>", {
                    type: "text",
                    disabled: _plugin.settings.disabled
                });
                _plugin.data.type = "input";
                _plugin.data.element = textInput;

                if (_plugin.settings.multiSelect === false) {
                    // SingleSelect
                    $this.append(textInput);
                    textInput.prop('value', _plugin.settings.currentValue[0]);
                    textInput.keyup(function (event) {
                        _plugin.settings.currentValue = [event.currentTarget.value];
                        _plugin.settings.onUpdate($this.insmInputString('getValue'));
                        $this.insmInput('validate');
                    });
                } else {
                    $this.append(textInput);

                    var myAddButton = newButton("Add", "#");
                    $this.append(myAddButton);

                    var selectedValueContainer = $("<div/>", {
                        class: "selected"
                    }).appendTo($this);
                    textInput.keyup(function (event) {
                        if (event.keyCode == '13') {
                            if (event.currentTarget.value != "") {
                                if (_plugin.settings.uniqueValues) {
                                    if ($.inArray(textInput.val(), _plugin.settings.currentValue) > -1) {
                                        $.insmNotification({
                                            type: 'information',
                                            text: 'Tag already exist.'
                                        });
                                        return false;
                                    }
                                }
                                var myButton = newButton(event.currentTarget.value, "#", true);
                                addButton(myButton, selectedValueContainer, function (thisButton) {
                                    // update current value
                                    _plugin.settings.currentValue = jQuery.grep(_plugin.settings.currentValue, function (value) {
                                        return value != $(thisButton).attr('value');
                                    });
                                    
                                    _plugin.settings.onUpdate($this.insmInputString('getValue'));
                                    removeButton(thisButton);
                                });
                                // update current value

                                _plugin.settings.currentValue.push(textInput.val());
                                _plugin.settings.onUpdate($this.insmInputString('getValue'));
                                this.value = '';
                            }
                        }
                    });
                    myAddButton.click(function (event) {
                        
                        var e = jQuery.Event("keyup");
                        e.keyCode = 13; // return key code value
                        textInput.trigger(e);
                    });

                    // MultiSelect
                    for (var l = 0; l < _plugin.settings.currentValue.length; l++) {
                        var myButton = newButton(_plugin.settings.currentValue[l], "#", true);
                        addButton(myButton, selectedValueContainer, function (thisButton) {
                            // update current value
                            _plugin.settings.currentValue = jQuery.grep(_plugin.settings.currentValue, function (value) {
                                return value != $(thisButton).attr('value');
                            });
                            _plugin.settings.onUpdate($this.insmInputString('getValue'));

                            removeButton(thisButton);
                        });
                    }
                }

            } else {
                // Dropdown
                var dropDown = $("<select/>", {
                    disabled: _plugin.settings.disabled
                });
                _plugin.data.type = "dropdown";
                _plugin.data.element = dropDown;

                // Default Value
                var defaultValue = 'select';
                dropDown.append($('<option selected="selected" value="select">select</select>'));

                if (_plugin.settings.multiSelect === false) {
                    // Single Select
                    for (var i = 0; i < _plugin.settings.values.length; i++) {
                        dropDown.append($("<option/>", {
                            value: _plugin.settings.values[i],
                            text: _plugin.settings.values[i]
                        }));
                    }
                    $this.append(dropDown);

                    if (_plugin.settings.currentValue[0]) {
                        dropDown.val(_plugin.settings.currentValue[0]);
                    }

                    dropDown.change(function (event) {
                        if (event.currentTarget.value !== defaultValue) {
                            _plugin.settings.currentValue = [event.currentTarget.value];
                        } else {
                            _plugin.settings.currentValue = [];
                        }
                        _plugin.settings.onUpdate($this.insmInputString('getValue'));
                    });
                } else {
                    // Multi Select
                    var selectableValues = [];

                    $.grep(_plugin.settings.values, function (el) {
                        if (jQuery.inArray(el, _plugin.settings.currentValue) === -1) {
                            selectableValues.push(el);
                        }
                    });

                    for (var j = 0; j < selectableValues.length; j++) {
                        dropDown.append($("<option/>", {
                            value: selectableValues[j],
                            text: selectableValues[j]
                        }));
                    }
                    $this.append(dropDown);
                    sortList(dropDown);
                    dropDown.val(defaultValue);

                    var selectedValueContainer = $("<div/>", {
                        class: "selected"
                    }).appendTo($this);

                    for (var k = 0; k < _plugin.settings.currentValue.length; k++) {
                        var myButton = newButton(_plugin.settings.currentValue[k], "#", true);
                        addButton(myButton, selectedValueContainer, function (thisButton) {
                            addOptionToDropdown($(thisButton).attr('value'), dropDown);
                            updateDropdownValue($(thisButton).attr('value'));
                            sortList(dropDown);
                            removeButton(thisButton);

                            dropDown.val(defaultValue);
                            // update current value
                            _plugin.settings.currentValue = jQuery.grep(_plugin.settings.currentValue, function (value) {
                                return value != $(thisButton).attr('value');
                            });
                            
                            _plugin.settings.onUpdate($this.insmInputString('getValue'));
                        });
                    }

                    dropDown.change(function (event) {
                        if (event.currentTarget.value !== defaultValue) {
                            // Add MultiSelect
                            var myButton = newButton(event.currentTarget.value, "#", true);
                            addButton(myButton, selectedValueContainer, function (thisButton) {
                                addOptionToDropdown($(thisButton).attr('value'), dropDown);
                                updateDropdownValue($(thisButton).attr('value'));
                                sortList(dropDown);
                                removeButton(thisButton);
                                dropDown.val(defaultValue);
                            });

                            // Add to current value
                            _plugin.settings.currentValue.push(event.currentTarget.value);
                            _plugin.settings.onUpdate($this.insmInputString('getValue'));

                            // Remove from dropdown
                            dropDown.children().eq(event.currentTarget.selectedIndex).remove();
                        }
                    });
                }
            }
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
                    onClick: 'return false',
                    text: text,
                    value: text,
                    class: myClass + " " + closable
                }
                        );
            }

            function addButton(button, parent, callback) {
                if (callback && typeof (callback) === "function") {
                    button.click(function (event) {
                        event.preventDefault();
                        callback(this);
                    });
                }
                parent.append(button);
            }

            function removeButton(button) {
                $(button).remove();
            }

            function addOptionToDropdown(value, dropdown) {
                dropDown.append($("<option/>", {
                    value: value,
                    text: value
                }));
            }

            function updateDropdownValue(ignoreValue) {
                var selectedValueTemp = [];
                $.grep(_plugin.settings.currentValue, function (el) {
                    if (el !== ignoreValue) {
                        selectedValueTemp.push(el);
                    }
                });
                _plugin.settings.currentValue = selectedValueTemp;
                _plugin.settings.onUpdate($this.insmInputString('getValue'));
            }

            function sortList(dropDown) {
                dropDown.children().eq(0).remove();
                var items = dropDown.children();
                items.sort(function (a, b) {
                    return (a.innerHTML > b.innerHTML) ? 1 : -1;
                });
                dropDown.empty().append($("<option/>", {
                    value: defaultValue,
                    text: defaultValue
                })).append(items);

                // Select default
                dropDown.children().eq(0).prop("selected", "selected");
            }
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            if (_plugin.settings.multiSelect) {
                return _plugin.settings.currentValue;
            } else {
                if (typeof _plugin.settings.currentValue[0] === "undefined") {
                    return "";
                } else {
                    return _plugin.settings.currentValue[0];
                }
            }
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');
            if (_plugin.data.type == "input") {
                _plugin.settings.currentValue = value;
                _plugin.data.element.val(_plugin.settings.currentValue[0])
                _plugin.settings.onUpdate($this.insmInputString('getValue'));
            } else {
                throw new Exception("setValue missing implementation!");
            }
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            if (_plugin.settings.multiSelect) {
                if (_plugin.settings.required === true && $this.insmInputString("getValue").length === 0) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else {
                    _plugin.data.element.css({
                        border: ''
                    });
                    return true;
                }
            }
            else {
                if (_plugin.settings.required === true && !$this.insmInputString("getValue")) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else {
                    var foundNotAllowed = false;
                    $.each(_plugin.settings.doNotAllow, function (index, value) {
                        if ($this.insmInputString("getValue").indexOf(value) != -1) {
                            foundNotAllowed = value;
                        }
                    });
                    if (foundNotAllowed) {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    } else {
                        _plugin.data.element.css({
                            border: ''
                        });
                        return true;
                    }
                }
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

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
            $this.find(".selected").children().remove();
            return $this;

        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            _plugin.settings.currentValue = _plugin.data.previousValue;
            _plugin.settings.onUpdate($this.insmInputString('getValue'));

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputString', null);

            return $this;
        }
    };

    $.fn.insmInputString = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputString');
        }
    };
})(jQuery);