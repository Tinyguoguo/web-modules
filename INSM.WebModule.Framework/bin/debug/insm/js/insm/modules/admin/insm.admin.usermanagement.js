/*
* INSM Admin Role Management
* This file contains the INSM Admin Role Management plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmAdminUserManagement(settings);
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
            var _plugin = $this.data('insmAdminUserManagement');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Admin User Management',
                        header: true,
                        modules: []
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        top: {
                            container: $('<div />'),                           
                            saveButton: $('<button />'),
                            cancelButton: $('<button />'),
                            addUserButton:$('<button />'),
                            text: $('<h2 />')
                        },
                        users: {
                            container: $('<div />'),   
                        },
                        addUser:{
                            container: $('<div />'),
                            saveButton: $('<button />').text('Save'),
                            cancelButton: $('<button />').text('Cancel'),
                            inputDiv: $('<div />')
                        },
                        groups: {
                            container: $('<div />'),
                            title: $('<h2 />')
                        },
                        popupLoading:$('<div />'),
                    },
                    data: {
                        deploymentValue: [],
                        fullscreenInitialized: false,
                        users: [],
                        selectedUser: {},
                        tmpGroups: [],
                        groups: [],
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
               
                $this.data('insmAdminUserManagement', _plugin);
            }
            return $this;
        },
        generateGroups: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');
            $.insmFramework('getGroups', {
                success: function (groups) {
                    
                    if ($.isArray(groups)) {

                        $.each(groups, function (index, group) {
                            _plugin.data.groups.push(group);
                            var groupElement = $('<a />').insmGroupStyle({
                                text: group.name,
                                onClick: function () {
                                    
                                }
                            });

                            $.each(_plugin.data.selectedUser.groups, function (index, usergroup) {
                                if (usergroup.name == group.name) {
                                    groupElement.insmGroupStyle('isSelected');
                                }
                            });
                            _plugin.htmlElements.groups.container.append(groupElement);
                        });
                    }                
                }
            });
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmAdminUserManagement('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;
            _plugin.settings.target.addClass('insmAdminUserManagement').fadeIn();
            _plugin.settings.target.empty();
            _plugin.htmlElements.popupLoading.insmFullScreenLoading();
            var goBackView = function () {
                _plugin.htmlElements.users.container.children().fadeIn();
                _plugin.htmlElements.groups.container.children().remove();
                _plugin.htmlElements.top.text.text('Users');
                _plugin.data.selectedUser = {};
                _plugin.htmlElements.top.addUserButton.fadeIn();
                _plugin.htmlElements.top.saveButton.hide();
                _plugin.htmlElements.top.cancelButton.hide();
                _plugin.htmlElements.groups.title.hide();

            }
            _plugin.htmlElements.addUser.saveButton.click(function () {
                var tableValue = _plugin.htmlElements.addUser.inputDiv.insmInput('getValue');
                if (!_plugin.htmlElements.addUser.inputDiv.insmInput('validate')) {
                    return;
                }
                $.insmFramework('addUser', {
                    user: tableValue.name,
                    success: function () {
                        $this.insmAdminUserManagement('setGroup');
                    }
                });
                _plugin.htmlElements.addUser.container.insmPopup('close');
            }),
            _plugin.htmlElements.addUser.cancelButton.click(function () {
                _plugin.htmlElements.addUser.container.insmPopup('close');
            }),
            _plugin.htmlElements.addUser.container.append(
                _plugin.htmlElements.addUser.inputDiv,
                _plugin.htmlElements.addUser.saveButton,
                _plugin.htmlElements.addUser.cancelButton
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
                            _plugin.data.groups = [];
                           
                            $.each(_plugin.data.tmpGroups, function (index, group) {
                                var groupCopy = $.extend(true, {}, group);
                                delete groupCopy.element;
                                _plugin.data.group.push(groupCopy);
                            });
                            _plugin.data.tmpGroups = [];
                            //$.insmFramework('setModuleSettings', {
                            //   namespace: 'insmMenu',
                            //   key: 'items',
                            //   value: _plugin.data.moduleList,
                            //   success: function (items) {
                            //       _plugin.data.reloadMenuCallback();
                            //       _plugin.htmlElements.popupLoading.insmFullScreenLoading('close');
                            //       goBackView();
                            //   }
                            //});
                        }).hide(),
                        _plugin.htmlElements.top.cancelButton.text('Cancel').click(function () {
                            goBackView();
                            _plugin.data.tmpGroups = [];
                            
                        }).hide(),
                        _plugin.htmlElements.top.addUserButton.text('Add New User').click(function () {
                            _plugin.htmlElements.addUser.inputDiv.insmInput('destroy').insmInput({
                                type: 'table',
                                objectDefinition: {
                                    name: {
                                        displayName: 'User Name',
                                        type: 'string',
                                        required: true,
                                        validateFunction: function (value) {

                                            var userNameArray = [];
                                            $.each(_plugin.data.users, function (index, user) {
                                                userNameArray.push(user.name);
                                            });
                                            if (userNameArray.indexOf(value) > -1) {
                                                $.insmNotification({
                                                    type: 'warning',
                                                    message: 'User "' + value + '" already exists'
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
                            _plugin.htmlElements.addUser.container.insmPopup({
                                backdropTransparency: true,
                                backdropClickClose: false,
                                showCloseButton: false,
                                content: _plugin.htmlElements.addUser.container,
                                backdropClickCallback: function () {
                                    //_plugin.data.clickedWebLink = {};
                                },
                                //autoCenter: true
                            });
                        }),
                        _plugin.htmlElements.top.text.text('Users').addClass('title')
                    ),
                    _plugin.htmlElements.users.container.addClass('users-container'),
                    _plugin.htmlElements.groups.title.text('Roles').addClass('title').hide(),
                    _plugin.htmlElements.groups.container.addClass('groups-container')
                );
            }      
            $this.insmAdminUserManagement('resize');

            return $this;
        },
        setGroups: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');
            _plugin.data.users = [];
            
            _plugin.htmlElements.users.container.children().remove();
            $.insmFramework('getUsers', {
                success: function (users) {

                    if ($.isArray(users)) {
                        $.each(users, function (index, user) {                          
                            _plugin.data.users.push(user);
                            var userElement = $('<a />').insmUserStyle({
                                text: user.name,
                                onClick: function () {
                                    if ($.isEmptyObject(_plugin.data.selectedUser)) {
                                        _plugin.data.selectedUser = user;
                                        _plugin.htmlElements.users.container.children().hide();
                                        _plugin.htmlElements.top.addUserButton.hide();
                                        _plugin.htmlElements.top.saveButton.fadeIn();
                                        _plugin.htmlElements.top.cancelButton.fadeIn();
                                        _plugin.htmlElements.top.text.text(user.name);
                                        _plugin.htmlElements.groups.title.fadeIn();
                                        userElement.fadeIn();
                                        _plugin.htmlElements.groups.container.children().remove();
                                        $this.insmAdminUserManagement('generateGroups');
                                    }
                                }
                            });
                            _plugin.htmlElements.users.container.append(userElement);
                            if (!$.isEmptyObject(_plugin.data.selectedUser.name) && user.name != _plugin.data.selectedUser.name) {
                                userElement.hide();
                            }
                        });
                    }
                    if (_plugin.data.selectedUser.name) {
                        _plugin.htmlElements.groups.container.children().remove();
                        $this.insmAdminUserManagement('generateGroups');
                    }
                }
            });
            _plugin.data.reloadMenuCallback = options.saveCallback;
            
        },
        hasSettings: function (options) {
            return false;
        },
        onClose: function (options) {
            options.success();
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview insmAdminUserManagement');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('User Management')
            );

            return _plugin.settings.previewTarget;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');
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
            var _plugin = $this.data('insmAdminUserManagement');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');

            _plugin.subscriptions.start = function () {
                // Subscribe on region tree
            };

            $this.insmAdminUserManagement('stopSubscriptions');
            $this.insmAdminUserManagement('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                // Stop subscription of region tree
            };

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminUserManagement');

            $this.insmAdminUserManagement('stopSubscriptions');
            $this.data('insmAdminUserManagement', null).empty();

            return $this;
        }
    };

    $.fn.insmAdminUserManagement = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAdminUserManagement');
        }
    };

})(jQuery);