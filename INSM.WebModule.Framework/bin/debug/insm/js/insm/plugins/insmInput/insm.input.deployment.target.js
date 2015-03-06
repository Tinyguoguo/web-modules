/*
* INSM Asset
* This file contain the INSM Input Deployment Target function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDeploymentTarget(settings);
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
            var _plugin = $this.data('insmInputDeploymentTarget');
            _plugin = {
                settings: $.extend({
                    type: 'deployment',
                    defaultValue: '',
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: '',
                    availableValues: null,
                    defaultValue: '',
                    maxChars: null,
                    onChange: function(previousValue, currentValue) {

                    },
                    validateFunction: function (value) {
                        if (value.length == 0)
                            return false;
                        else
                            return true;
                    },
                    targets: []
                }, options),
                data: {
                    type: null,
                    previousValue: null,
                    targetList: {},
                    selectedTarget: {}
                },
                htmlElements: {
                    input: null,
                    dropdown: $('<select />'),
                    playerIdFields: $('<div />')
                }
            };

            if (typeof _plugin.settings.value === "number") {
                _plugin.settings.value = _plugin.settings.value.toString();
            }

            $this.data('insmInputDeploymentTarget', _plugin);

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');

            $this.text('View not implemented in insm input deployment');

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');
            
            _plugin.settings.targets.sort(function (targetA, targetB) {
                if (targetA.title > targetB.title) {
                    return 1;
                }
                else if (targetA.title < targetB.title) {
                    return -1;
                }
                else {
                    return 0;
                }
            });

            $.each(_plugin.settings.targets, function (index, target) {
                _plugin.htmlElements.dropdown.append($('<option value="' + target.id + '" />').text(target.title));
            });

            _plugin.htmlElements.dropdown.prepend($('<option value="0" />').text('Select'));

            _plugin.htmlElements.dropdown.change(function (event) {
                if (_plugin.htmlElements.dropdown.val() > 0) {
                    $.each(_plugin.settings.targets, function (index, target) {
                        if (target.id == _plugin.htmlElements.dropdown.val()) {
                            _plugin.data.selectedTarget = target;
                        }
                    });
                }
                else {
                    _plugin.data.selectedTarget = {};
                }

                _plugin.settings.onChange(parseInt(_plugin.htmlElements.dropdown.data('previousValue')), _plugin.htmlElements.dropdown.val());
                _plugin.htmlElements.dropdown.data('previousValue', _plugin.htmlElements.dropdown.val());
            });
            
            function addInputField() {
                var inputField = $('<input type="text" />');
                _plugin.htmlElements.playerIdFields.append(
                    $('<br />'),
                    inputField
                );
                inputField.insmInputPlaceholder({
                    text: 'Player ID'
                });
                inputField.keydown(function (event) {
                    var keyId = event.which || event.keyCode;

                    if (keyId == 13 || keyId == 9) {
                        if (inputField.parent().is(':last-child') && inputField.val() != "") {
                            event.preventDefault();
                            addInputField();
                        }
                    }
                }).blur(function () {
                    if (inputField.parent().is(':last-child') && inputField.val() != "") {
                        event.preventDefault();
                        addInputField();
                    }
                    else if (!inputField.parent().is(':last-child') && inputField.val() == "") {
                        inputField.insmInputPlaceholder('destroy');
                        inputField.prev().remove();
                        inputField.remove();
                    }
                }).focus();
            }

            addInputField();

            $this.html(
                _plugin.htmlElements.dropdown
            ).append(
                _plugin.htmlElements.playerIdFields.addClass('player-input-fields-container')
            );

            
            

            return $this;
        },
        updateTargetList: function(targetList) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');
            
            _plugin.settings.targets = targetList.slice();
            _plugin.settings.targets.push(_plugin.data.selectedTarget);

            _plugin.htmlElements.dropdown.empty();
            _plugin.settings.targets.sort(function (targetA, targetB) {
                if (targetA.title > targetB.title) {
                    return 1;
                }
                else if (targetA.title < targetB.title) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
            $.each(_plugin.settings.targets, function (index, target) {
                _plugin.htmlElements.dropdown.append($('<option value="' + target.id + '" />').text(target.title));
            });

            _plugin.htmlElements.dropdown.prepend($('<option value="0" />').text('Select'));

            _plugin.htmlElements.dropdown.val(_plugin.data.selectedTarget.id);

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');
            
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');

            if (!_plugin.data.selectedTarget.id) {
                return null;
            }

            var value = {
                targetId: _plugin.data.selectedTarget.id,
                targetTitle: _plugin.data.selectedTarget.title,
                playerIds: []
            };
            
            $.each(_plugin.htmlElements.playerIdFields.find('input'), function(index, inputField) {
                if ($(inputField).val() != "") {
                    value.playerIds.push($(inputField).val());
                }
            });

            return value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');

            

            return $this;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');

            _plugin.settings.value = value;

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');

            var isValid = true;

            var playerIdCount = 0;
            $.each(_plugin.htmlElements.playerIdFields.find('input'), function (index, inputField) {
                playerIdCount++;
                if ($(inputField).val() != "" && !$(inputField).val().match(/^[0-9A-F]{12}$/i)) {
                    $(inputField).insmHighlight({
                        type: 'error',
                        message: 'Player ID must contain 12 case insensative alphanumeric characters (A-F0-9).'
                    });
                    isValid = false;
                }
            });

            if (!_plugin.data.selectedTarget.id) {
                if (playerIdCount > 1) {
                    isValid = false;
                    _plugin.htmlElements.dropdown.insmHighlight({
                        type: 'error',
                        message: 'You must select a target.'
                    });
                }
                else {
                    // Nothing selected - treat as ok
                    isValid = true;
                }
            }

            return isValid;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');


            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeploymentTarget');
            
            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputDeploymentTarget', null).empty();

            return $this;
        }
    };

    $.fn.insmInputDeploymentTarget = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDeploymentTarget');
        }
    };
})(jQuery);