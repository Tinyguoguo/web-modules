/*
* INSM Admin Role Management
* This file contains the INSM Admin Role Management plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmAdminRoleManagement(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Admin Role Management',
                        header: true,
                        modules: []
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        top: {
                            container: $('<div />'),                           
                            saveButton: $('<button />'),
                            cancelButton: $('<button />'),
                            addGroupButton:$('<button />'),
                            text: $('<h2 />')
                        },
                        groups: {
                            container: $('<div />'),   
                        },
                        addGroup:{
                            container: $('<div />'),
                            saveButton: $('<button />').text('Save'),
                            cancelButton: $('<button />').text('Cancel'),
                            inputDiv: $('<div />')
                        },
                        modules: {
                            container: $('<div />'),
                            title: $('<h2 />')
                        },
                        popupLoading:$('<div />'),
                    },
                    data: {
                        deploymentValue: [],
                        fullscreenInitialized: false,
                        groups: [],
                        selectedGroup: {},
                        tmpModuleList: [],
                        originalModuleList:[],
                        moduleList: [],
                        moduleName: [],
                        reloadMenuCallback: function () {

                        }
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    permissions: {

                    }
                };
               
                $this.data('insmAdminRoleManagement', _plugin);
            }
            return $this;
        },
        generateModules: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');
            _plugin.htmlElements.modules.container.children().remove();
            $.each(options.moduleList, function (index, module) {
                var moduleCopy = $.extend(true, {}, module);
                _plugin.data.tmpModuleList.push(moduleCopy);
            });
            
            $.each(_plugin.data.tmpModuleList, function (index, module) {
                if (module.active) {
                    module.element = $('<a />').insmModuleStyle({
                        text: module.name,
                        onClick: function () {
                            $.each(module.permissions, function (index, group) {
                                if (group.name == _plugin.data.selectedGroup.name) {
                                    if (group.access) {
                                        group.access = false;
                                    } else {
                                        group.access = true;
                                    }
                                }
                            });
                        }
                    });
                    $.each(module.permissions, function (index, group) {
                        if (group.name == _plugin.data.selectedGroup.name) {
                            if (group.access) {
                                module.element.insmModuleStyle('isSelected');
                            }
                        }
                    });
                    _plugin.htmlElements.modules.container.append(module.element);
                }
           });
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmAdminRoleManagement('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            // Init HTML

           
            _plugin.settings.target.addClass('insmAdminRoleManagement').fadeIn();
            _plugin.settings.target.empty();
            _plugin.htmlElements.popupLoading.insmFullScreenLoading();
            var goBackView = function () {
                _plugin.htmlElements.groups.container.children().fadeIn();
                _plugin.htmlElements.modules.container.children().remove();
                _plugin.data.selectedGroup = {};
                _plugin.htmlElements.top.addGroupButton.fadeIn();
                _plugin.htmlElements.top.saveButton.hide();
                _plugin.htmlElements.top.cancelButton.hide();
                _plugin.htmlElements.top.text.text('Roles');
                _plugin.htmlElements.modules.title.hide();

            }
            _plugin.htmlElements.addGroup.saveButton.click(function () {
                var tableValue = _plugin.htmlElements.addGroup.inputDiv.insmInput('getValue');
                if (!_plugin.htmlElements.addGroup.inputDiv.insmInput('validate')) {
                    return;
                }
                $.insmFramework('addGroup', {
                    group: tableValue.name,
                    success: function () {
                        $this.insmAdminRoleManagement('setModule');
                    }
                });
                _plugin.htmlElements.addGroup.container.insmPopup('close');
            }),
            _plugin.htmlElements.addGroup.cancelButton.click(function () {
                _plugin.htmlElements.addGroup.container.insmPopup('close');
            }),
            _plugin.htmlElements.addGroup.container.append(
                _plugin.htmlElements.addGroup.inputDiv,
                _plugin.htmlElements.addGroup.saveButton,
                _plugin.htmlElements.addGroup.cancelButton
            )
            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    ),
                    _plugin.htmlElements.top.container.addClass('top-container').append(

                        
                        _plugin.htmlElements.top.saveButton.text('Save').click(function () {
                            _plugin.htmlElements.popupLoading.insmFullScreenLoading('popUp');
                            _plugin.data.moduleList = [];
                           
                            $.each(_plugin.data.tmpModuleList, function (index, module) {
                                var moduleCopy = $.extend(true, {}, module);
                                delete moduleCopy.element;
                                _plugin.data.moduleList.push(moduleCopy);
                            });
                            _plugin.data.tmpModuleList = [];
                            $.insmFramework('setModuleSettings', {
                                namespace: 'insmMenu',
                                key: 'items',
                                value: _plugin.data.moduleList,
                                success: function (items) {
                                    _plugin.data.reloadMenuCallback();
                                    _plugin.htmlElements.popupLoading.insmFullScreenLoading('close');
                                    goBackView();
                                }
                            });
                        }).hide(),
                        _plugin.htmlElements.top.cancelButton.text('Cancel').click(function () {
                            goBackView();
                            _plugin.data.tmpModuleList = [];                           
                        }).hide(),
                        _plugin.htmlElements.top.addGroupButton.text('Add New Role').click(function () {
                            _plugin.htmlElements.addGroup.inputDiv.insmInput('destroy').insmInput({
                                type: 'table',
                                objectDefinition: {
                                    name: {
                                        displayName: 'Role Name',
                                        type: 'string',
                                        required: true,
                                        validateFunction: function (value) {
                                            var groupNameArray = [];
                                            $.each(_plugin.data.groups, function (index, group) {
                                                groupNameArray.push(group.name);
                                            });
                                            if (groupNameArray.indexOf(value) > -1) {
                                                $.insmNotification({
                                                    type: 'warning',
                                                    message: 'Group "' + value + '" already exists'
                                                })
                                                return false;
                                            } else if ($.trim(value).length > 0) {
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }).insmInput('edit');
                            _plugin.htmlElements.addGroup.container.insmPopup({
                                backdropTransparency: true,
                                backdropClickClose: false,
                                showCloseButton: false,
                                content: _plugin.htmlElements.addGroup.container,
                                backdropClickCallback: function () {
                                    //_plugin.data.clickedWebLink = {};
                                },
                                //autoCenter: true
                            });
                        }),
                        _plugin.htmlElements.top.text.text('Roles').addClass('title')
                    ),
                   
                    _plugin.htmlElements.groups.container.addClass('groups-container'),
                    _plugin.htmlElements.modules.title.text('Module Access').addClass('title').hide(),
                    _plugin.htmlElements.modules.container.addClass('modules-container')
                );
            }      
            $this.insmAdminRoleManagement('resize');
            return $this;
        },
        setModules: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');
            _plugin.data.groups = [];
         
            _plugin.htmlElements.groups.container.children().remove();
            $.insmFramework('getGroups', {
                success: function (groups) {
                    if ($.isArray(groups)) {
                        $.each(groups, function (index, group) {                          
                            _plugin.data.groups.push(group);
                            var groupElement = $('<a />').insmGroupStyle({
                                isToggled:false,
                                text: group.name,
                                onClick: function () {
                                    if ($.isEmptyObject(_plugin.data.selectedGroup)) {
                                        _plugin.data.selectedGroup = group;
                                        _plugin.htmlElements.groups.container.children().hide();
                                        _plugin.htmlElements.top.addGroupButton.hide();
                                        _plugin.htmlElements.top.saveButton.fadeIn();
                                        _plugin.htmlElements.top.cancelButton.fadeIn();
                                        _plugin.htmlElements.top.text.text(group.name);
                                        _plugin.htmlElements.modules.title.fadeIn();
                                        groupElement.fadeIn();
                                       
                                        $this.insmAdminRoleManagement('generateModules', {
                                            moduleList: _plugin.data.moduleList
                                        });
                                    }
                                }
                            });
                            _plugin.htmlElements.groups.container.append(groupElement);
                            if (!$.isEmptyObject(_plugin.data.selectedGroup.name) && group.name != _plugin.data.selectedGroup.name) {
                                groupElement.hide();
                            }
                        });
                    }

                    if ($.isArray(options.modules)) {
                        _plugin.data.moduleList = [];
                        _plugin.data.tmpModuleList = [];
                        $.each(options.modules, function (index, item) {
                            _plugin.data.moduleList.push(item);
                            if (!item.permissions) {
                                item.permissions = [];
                                $.each(_plugin.data.groups, function (index, group) {
                                    item.permissions.push({
                                        name: group.name,
                                        access: false
                                    });
                                });
                            } else {
                                $.each(_plugin.data.groups, function (index, group) {
                                    $.each(item.permissions, function (index, groupPermission) {
                                        if (groupPermission.name == group.name) {
                                            group.access = groupPermission.access;
                                        }
                                    });
                                });
                                item.permissions = [];
                                $.each(_plugin.data.groups, function (index, group) {
                                    var groupCopy = $.extend(true, {}, group);                                 
                                    item.permissions.push(groupCopy);
                                   
                                    delete group.access;
                                });
                            }
                        });
                    }
                    if (_plugin.data.selectedGroup.name) {
                        $this.insmAdminRoleManagement('generateModules', {
                            moduleList: _plugin.data.moduleList
                        });
                    }
                }
            });
            _plugin.data.reloadMenuCallback = options.saveCallback;
            
        },
        hasSettings: function (options) {
            return false;
        },
        onClose: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');
            var originalModuleString = JSON.stringify(_plugin.data.moduleList);
            var moduleList = [];
            $.each(_plugin.data.tmpModuleList, function (index, module) {
                var moduleCopy = $.extend(true, {}, module);
                delete moduleCopy.element;
                moduleList.push(moduleCopy);
            });
            var finalModuleString = JSON.stringify(moduleList);
            if (originalModuleString === finalModuleString || $.isEmptyObject(_plugin.data.tmpModuleList)) {
                options.success();
            } else {
                $.insmDialog({
                    type: 'confirm',
                    title: 'Are you sure to leave this page without saving?',
                    message: 'Unsaved Changing exist.',
                    accept: function () {
                        options.success();
                    }
                });
            }
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview insmAdminRoleManagement');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Role Management')
            );

            return _plugin.settings.previewTarget;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');
            if (_plugin) {
                var totalHeight = $this.height();
                //var headerHeight = _plugin.htmlElements.header.outerHeight(true);
                //_plugin.htmlElements.content.container.css({
                //    height: parseInt(totalHeight - headerHeight) + 'px'
                //});

            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            _plugin.subscriptions.start = function () {
                // Subscribe on region tree
            };

            $this.insmAdminRoleManagement('stopSubscriptions');
            $this.insmAdminRoleManagement('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                // Stop subscription of region tree
            };

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminRoleManagement');

            $this.insmAdminRoleManagement('stopSubscriptions');
            $this.data('insmAdminRoleManagement', null).empty();

            return $this;
        }
    };

    $.fn.insmAdminRoleManagement = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAdminRoleManagement');
        }
    };

})(jQuery);