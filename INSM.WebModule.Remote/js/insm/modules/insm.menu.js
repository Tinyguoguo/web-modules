/*
* INSM Menu
* This file contain the INSM Menu function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmMenu(settings);
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
            var _plugin = $this.data('insmMenu');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        menuItems: [
                            {
                                name: 'System Details',
                                plugin: 'insmSystemDetails',
                                div: $('<div />')
                            },
                            {
                                name: 'Playlist Editor',
                                plugin: 'insmPlaylistEditor',
                                div: $('<div />')
                            },
                            {
                                name: 'Asset Manager',
                                plugin: 'insmAssetManager',
                                div: $('<div />')
                            },
                            {
                                name: 'File Manager',
                                plugin: 'insmFileManager',
                                div: $('<div />'),
                                settings: {
                                    directoryName: 'Media'
                                }
                            },
                            {
                                name: 'Template Manager',
                                plugin: 'insmFileManager',
                                cssClass: 'template-manager',
                                div: $('<div />'),
                                settings: {
                                    directoryName: 'Templates'
                                }
                            },
                            {
                                name: 'Statistics',
                                plugin: 'insmStatistics',
                                div: $('<div />')
                            },
                            {
                                name: 'System Tuning',
                                plugin: 'insmSystemTuning',
                                div: $('<div />')
                            }
                        ],
                        adminMenuItems: {
                            moduleSelector: {
                                name: 'Module Selector',
                                plugin: 'insmAdminModuleSelector',
                                div: $('<div />'),
                                
                            },
                            roleManagement: {
                                name: 'Role Management',
                                plugin: 'insmAdminRoleManagement',
                                div: $('<div />')
                            },
                            userManagement: {
                                name: 'User Management',
                                plugin: 'insmAdminUserManagement',
                                div: $('<div />')
                            }
                        },
                        menuDiv: $('<div />').addClass('menu-container l-grid'),
                        adminMenuDiv: $('<div />').addClass('menu-container l-grid'),
                        menuControls: $('<div />').addClass('menu-controls').hide(),
                        footer: $('<div />').addClass('footer'),
                        liLogout: $('<li />'),
                        liAbout: $('<li />'),
                        settings: $('<div />').addClass('settings is-clickable'),
                        settingsMenu: $('<div />').addClass('menu'),
                        settingsOption: $('<li />'),
                        moduleDiv: $('<div />').addClass('module-container')
                    },
                    data: {
                        windows: [],
                        user: null,
                        singleMode: false,
                        customModules:[],
                        allModules: [],
                        webLink: [],
                        webLinkName: [],
                        selectedModule: {}
                    },
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Instoremedia Systems',
                        version: manifest.version,
                        customMenu: null
                    }, options)
                };

                if (_plugin.settings.customMenu) {
                    _plugin.htmlElements.menuItems = _plugin.settings.customMenu;
                }
                $this.data('insmMenu', _plugin);
            }
            if (!$.insmService('isInitialized')) {
                $.insmService({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            $.when($.insmService('initialized')).done(function () {
                _plugin.data.user = $.insmFramework('getUser');

                if (_plugin.data.user.regionTree == null) {
                    $('body').empty();
                    $.insmPopup({
                        backdropTransparency: false,
                        showCloseButton: false,
                        content: $('<p />').append(
                                $('<h3 />').text('Sorry, but your account has not been configured to access this system')
                            ).append(
                                $('<p />').text('Contact your system\'s administrator for more information.')
                            ).append(
                                $('<a class="is-bold" />').text('Try again\t').click(function () {
                                    window.location.reload();
                                })
                            ).append(
                                ' or '
                            ).append(
                                $('<a class="is-bold" />').text('switch user').click(function () {
                                    $.insmFramework('logout', {
                                        success: function () {
                                            window.location.reload();
                                        }
                                    })
                                })
                            )
                    });
                    return;
                }

                $this.append(
                    _plugin.htmlElements.menuDiv,
                    _plugin.htmlElements.adminMenuDiv,
                    _plugin.htmlElements.moduleDiv,
                    _plugin.htmlElements.footer,
                    _plugin.htmlElements.menuControls.append(
                        $('<div id="progressHandler" />')
                    )
                );
                _plugin.htmlElements.menuControls.append(
                     
                    $('<a />').addClass('back').click(function () {

                        if (!$.isEmptyObject(_plugin.data.selectedModule)) {
                            _plugin.data.selectedModule.div[_plugin.data.selectedModule.plugin]('onClose', {
                                success: function () {
                                    $.insmHashChange('updateHash', {});
                                }
                            });
                        } else {
                            $.insmHashChange('updateHash', {});
                        }
                    })
                );
                var system = $.insmFramework('getSystemInformation');
                var onLogOut = function () {
                    $.insmFramework('logout', {
                        success: function () {
                            var noHashUrl = location.href.substr(0, location.href.indexOf('#'));
                            //document.location.href = noHashUrl;
                            window.location = noHashUrl;
                            location.reload();
                        }
                    });
                    _plugin.htmlElements.settingsMenu.hide();
                }
                _plugin.htmlElements.liLogout = $('<li />').click(function () {
                    if (!$.isEmptyObject(_plugin.data.selectedModule)) {
                        _plugin.data.selectedModule.div[_plugin.data.selectedModule.plugin]('onClose', {
                            success: function () {
                                onLogOut();
                            }
                        });
                    } else {
                        onLogOut();
                    }                   
                }).text('Logout ' + $.insmFramework('getUser').name).addClass('is-clickable');

                _plugin.htmlElements.liAbout = $('<li />').click(function () {
                    var content = $('<div />').append(
                        $('<table />').addClass('vertical l-block').append(
                            $('<tr />').append(
                                $('<th />').text('System'),
                                $('<td />').text(system.application.name + ' ' + system.application.version)
                            ),
                            $('<tr />').append(
                                $('<th />').text('Server'),
                                $('<td />').text(system.type + ' ' + system.target + ' ' + system.version)
                            )
                        )
                    );
                    $.insmDialog({
                        type: 'alert',
                        title: 'Software Information',
                        message: content
                    });
                    _plugin.htmlElements.settingsMenu.hide();
                }).text('About').addClass('is-clickable');
                if (_plugin.data.user.admin) {
                    _plugin.htmlElements.settingsOption = $('<li />').text('Settings').addClass('is-clickable');
                    _plugin.htmlElements.settingsMenu.append(
                        $('<ul />').append(
                            _plugin.htmlElements.liAbout,
                            _plugin.htmlElements.settingsOption,
                            _plugin.htmlElements.liLogout
                        )
                    ).hide().click(function (e) {
                        e.stopPropagation();
                    });
                } else {
                    _plugin.htmlElements.settingsMenu.append(
                       $('<ul />').append(
                           _plugin.htmlElements.liAbout,
                           _plugin.htmlElements.liLogout
                       )
                    ).hide().click(function (e) {
                        e.stopPropagation();
                    });
                }
                _plugin.htmlElements.footer.append(
                    _plugin.htmlElements.settings,
                    _plugin.htmlElements.settingsMenu
                );
                var closeMeTimeout;
                _plugin.htmlElements.settings.click(function () {
                    clearTimeout(closeMeTimeout);
                    _plugin.htmlElements.settingsMenu.toggle();
                    function startTimeout() {
                        closeMeTimeout = setTimeout(function () {
                            _plugin.htmlElements.settingsMenu.fadeOut();
                        }, 2000);
                        _plugin.htmlElements.settingsMenu.unbind('mouseenter');
                        _plugin.htmlElements.settingsMenu.unbind('mouseleave');
                        _plugin.htmlElements.settingsMenu.mouseenter(function () {
                            clearTimeout(closeMeTimeout);
                        }).mouseleave(function () {
                            startTimeout();
                        });
                    };

                    startTimeout();
                });
                // Fix size of module and menu divs
                $(window).resize(function () {
                    var size = $this.insmUtilities('size');
                    var footerSize = _plugin.htmlElements.footer.insmUtilities('size');

                    _plugin.htmlElements.moduleDiv.css({
                        //width: size.width + 'px',
                        height: parseInt(size.height - footerSize.height) + 'px'
                    });

                    _plugin.htmlElements.menuDiv.css({
                        //width: size.width + 'px',
                        height: parseInt(size.height - footerSize.height) + 'px'
                    });

                    _plugin.htmlElements.adminMenuDiv.css({
                        //width: size.width + 'px',
                        height: parseInt(size.height - footerSize.height) + 'px'
                    });

                    $.each(_plugin.htmlElements.menuItems, function (index, item) {
                        // Each module needs to know about the size changes
                        item.div[item.plugin]('resize');
                    });
                });
                
                _plugin.htmlElements.moduleDiv.hide();

                $.insmHashChange({
                    applicationName: _plugin.settings.applicationName
                });
                $this.addClass('insmMenu');
                if (_plugin.htmlElements.menuItems.length === 1) {
                    _plugin.data.singleMode = true;
                    $this.insmMenu('update');

                    //_plugin.htmlElements.menuControls.show();
                }
                else {
                    $this.insmMenu('update');
                }
            });
            return $this;
        },
        update: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');
            _plugin.data.customModules = [];
            _plugin.data.allModules = [];
            $.each(_plugin.data.webLink, function (index,module) {
                if (module.div) {
                    var previewDiv = module.div['insmWebLink']('preview');
                    previewDiv.remove();
                }
            });
            _plugin.data.webLink = [];

            if (_plugin.data.singleMode) {
                _plugin.htmlElements.menuItems[0].div = $('<div />');
                $this.insmMenu('initModules');
                $this.insmMenu('initHashTag');
                _plugin.htmlElements.menuControls.show();
                $this.insmMenu('display');
                $(window).trigger('resize');
            }
            else {
                $.insmFramework('getModuleSettings', {
                    namespace: 'insmMenu',
                    key: 'items',
                    success: function (items) {

                        if ($.isArray(items)) {
                            var tmpMenuItemList = [];
                            $.each(_plugin.settings.customMenu, function (index, module) {
                                _plugin.data.customModules.push(module);
                            });
                            $.each(items, function (index, item) {
                                if (item.plugin === 'insmWebLink') {
                                    _plugin.data.webLink.push(item);
                                }
                                $.each(_plugin.data.customModules, function (index, module) {
                                    if (module.name == item.name) {
                                        if (item.active) {
                                            module.active = true;
                                        } else {
                                            module.active = false;
                                        }
                                        if (item.permissions) {
                                            module.permissions = item.permissions;
                                        }
                                    }
                                });
                            });
                            $.each(_plugin.data.customModules, function (index, module) {
                                _plugin.data.allModules.push(module);
                            });
                            $.each(_plugin.data.webLink, function (index, module) {
                                _plugin.data.allModules.push(module);
                            });
                            $.each(_plugin.data.allModules, function (index, module) {
                                if (module.active) {
                                    if (_plugin.data.user.admin) {
                                        if (!module.div) {
                                            module.div = $('<div />');
                                        }
                                        tmpMenuItemList.push(module);
                                    } else {
                                        $.each(_plugin.data.user.groups, function (index, group) {

                                            $.each(module.permissions, function (index, groupInModule) {

                                                if (group.Name == groupInModule.name) {
                                                    if (groupInModule.access) {
                                                        if (!module.div) {
                                                            module.div = $('<div />');
                                                        }
                                                        module.shouldAdd = true;
                                                    }
                                                }
                                            })
                                        })
                                        if (module.shouldAdd) {
                                            tmpMenuItemList.push(module);
                                        }

                                    }
                                }
                            });

                            _plugin.htmlElements.menuItems = tmpMenuItemList;

                            $this.insmMenu('initModules');
                            if (_plugin.data.user.admin) {
                                var moduleList = [];
                                $.each(_plugin.data.allModules, function (index, module) {
                                    var moduleCopy = $.extend(true, {}, module);
                                    delete moduleCopy.div;
                                    delete moduleCopy.shouldAdd;
                                    moduleList.push(moduleCopy);
                                });

                                _plugin.htmlElements.adminMenuItems.moduleSelector.div.insmAdminModuleSelector('setModules', {
                                    modules: moduleList,
                                    saveCallback: function () {
                                        $this.insmMenu('update');
                                    }
                                });
                                _plugin.htmlElements.adminMenuItems.roleManagement.div.insmAdminRoleManagement('setModules', {
                                    modules: moduleList,
                                    saveCallback: function () {
                                        $this.insmMenu('update');
                                    }
                                });
                                _plugin.htmlElements.adminMenuItems.userManagement.div.insmAdminUserManagement('setGroups', {
                                    
                                    saveCallback: function () {
                                        $this.insmMenu('update');
                                    }
                                });
                            }
                            $this.insmMenu('initHashTag');
                            _plugin.htmlElements.menuControls.show();
                            $this.insmMenu('display');
                        }
                        else {
                            // Menu has not been initialized
                            _plugin.htmlElements.menuControls.hide();
                            $this.insmMenu('initModules');
                            $this.insmMenu('showFirstTimeUseScreen');
                        }
                        $(window).trigger('resize');
                    }
                });
            }
        },
        initHashTag: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');
            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (namespaces) {
                    if (!$.isEmptyObject(namespaces)) {
                        $.each(namespaces, function (key, namespace) {
                            if (key == 'adminMenu') {
                                $this.insmMenu('showAdminMenu');
                            }
                            else if (namespace.index === 0) {
                                $this.insmMenu('showItem', {
                                    name: [key]
                                });
                            }
                        });
                    }
                    else {
                        $.each(_plugin.htmlElements.menuItems, function (index, item) {
                            switch (item.type) {
                                case 'module':
                                    if (typeof $.fn[item.plugin] === 'function') {
                                        // Definition of module requires 'stopSubscription' function
                                        item.div[item.plugin]('stopSubscriptions');                                       
                                    }
                                    break;
                                default:
                                    break;
                            }
                        });
                        $this.insmMenu('showMenu');
                    }
                }
            });
        },
        showAdminMenu: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');
            $this.insmMenu('detachAllItems');
            $.each(_plugin.htmlElements.adminMenuItems, function (key, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    item.div[item.plugin]('getTarget').hide(function () {
                        item.div[item.plugin]('getTarget').detach();
                    });
                }
            });
            _plugin.htmlElements.moduleDiv.hide();
            _plugin.htmlElements.menuDiv.hide();
            _plugin.htmlElements.adminMenuDiv.show();
            return $this;
        },
        showMenu: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');

            if (_plugin.data.user.admin) {
                _plugin.htmlElements.settingsOption.show();
                _plugin.htmlElements.settingsOption.unbind('click');
                _plugin.htmlElements.settingsOption.click(function () {

                    _plugin.htmlElements.settingsMenu.hide();
                    $.insmHashChange('updateHash', 'adminMenu');
                });
            }
            else {
                _plugin.htmlElements.settingsOption.hide();
            }
            $.each(_plugin.htmlElements.menuItems, function (index, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    item.div[item.plugin]('getTarget').hide(function () {
                        item.div[item.plugin]('getTarget').detach();
                    });
                }
            });
            _plugin.htmlElements.moduleDiv.hide();
            _plugin.htmlElements.menuDiv.fadeIn();
            _plugin.htmlElements.adminMenuDiv.hide();
            return $this;
        },
        showFirstTimeUseScreen: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');
            // Bring up stuff
            $this.insmMenu('showAdminItem', {
                name: 'Module Selector',
                firstTimeUse: true
            });
            //$this.insmMenu('initModules');
            //$this.insmMenu('display');

            return $this;
        },
        initModules: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');      
            $.each(_plugin.htmlElements.menuItems, function (index, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    if (!item.settings) {
                        item.settings = {};
                    }
                    
                    item.div[item.plugin]($.extend(item.settings, {
                        show: function () {
                            $.insmHashChange('updateHash', item.name);
                        },
                        applicationName: item.name
                    }));
                    
                }
            });
            
            $.each(_plugin.htmlElements.adminMenuItems, function (key, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    if (!item.settings) {
                        item.settings = {};
                    }                    
                        item.div[item.plugin]($.extend(item.settings, {
                            show: function () {
                                _plugin.data.selectedModule = $.extend(true,{},item);
                                $.insmHashChange('updateHash', item.name);

                                
                            },
                            applicationName: item.name
                        }));
                    
                }
            });
            if (_plugin.data.singleMode) {
                var hash = $.insmHashChange('get');
                if (!hash[_plugin.htmlElements.menuItems[0].name]) {
                    $.insmHashChange('updateHash', _plugin.htmlElements.menuItems[0].name);
                }
                _plugin.htmlElements.menuControls.detach();
            }
            return $this;
        },
        detachAllItems: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');

            $.each(_plugin.htmlElements.menuItems, function (index, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    item.div[item.plugin]('getTarget').hide().detach();
                }
            });
            $.each(_plugin.htmlElements.adminMenuItems, function (key, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    item.div[item.plugin]('getTarget').hide().detach();
                }
            });

            return $this;
        },

        showAdminItem: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');

            _plugin.htmlElements.menuDiv.hide();
            _plugin.htmlElements.adminMenuDiv.hide();
            if (!options.firstTimeUse) {
                _plugin.htmlElements.menuControls.slideDown('slow');
            }
            _plugin.htmlElements.moduleDiv.fadeIn();

            $this.insmMenu('detachAllItems');

            $.each(_plugin.htmlElements.adminMenuItems, function (key, item) {
                if (item.name == options.name) {
                    var target = item.div[item.plugin]('getTarget');
                    if (typeof item.cssClass === 'string') {
                        target.addClass(item.cssClass);
                    }
                    target.appendTo(_plugin.htmlElements.moduleDiv).show();
                    item.div[item.plugin]('fullscreen');
                    _plugin.data.selectedModule = item;
                    // TODO: Check if we should show the settings option in the menu!
                    if (item.div[item.plugin]('hasSettings')) {
                        _plugin.htmlElements.settingsOption.show();
                        _plugin.htmlElements.settingsOption.unbind('click');
                        _plugin.htmlElements.settingsOption.click(function () {
                            _plugin.htmlElements.settingsMenu.hide();
                            item.div[item.plugin]('showSettings');
                        });
                    }
                    else {
                        _plugin.htmlElements.settingsOption.hide();
                    }
                }
            });

            return $this;
        },
        showItem: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');

            _plugin.htmlElements.menuDiv.hide();
            _plugin.htmlElements.adminMenuDiv.hide();
            _plugin.htmlElements.menuControls.slideDown('slow');
            _plugin.htmlElements.moduleDiv.fadeIn();
            $this.insmMenu('detachAllItems');
            var itemFound = false;

            $.each(_plugin.htmlElements.menuItems, function (index, item) {
                if (item.name == options.name) {
                    itemFound = true;
                    var target = item.div[item.plugin]('getTarget');
                    if (typeof item.cssClass === 'string') {
                        target.addClass(item.cssClass);
                    }
                    target.appendTo(_plugin.htmlElements.moduleDiv).show();
                    item.div[item.plugin]('fullscreen');
                    item.div[item.plugin]('resize');
                    _plugin.data.selectedModule = item;
                    // TODO: Check if we should show the settings option in the menu!
                    if (item.div[item.plugin]('hasSettings')) {
                        _plugin.htmlElements.settingsOption.show();
                        _plugin.htmlElements.settingsOption.unbind('click');
                        _plugin.htmlElements.settingsOption.click(function () {
                            _plugin.htmlElements.settingsMenu.hide();
                            item.div[item.plugin]('showSettings');
                        });
                    }
                    else {
                        _plugin.htmlElements.settingsOption.hide();
                    }
                }
                else {
                    // Update hash
                }
            });

            if (!itemFound && _plugin.data.user.admin) {
                $this.insmMenu('showAdminItem', {
                    name: [options.name]
                });
            }
            
            return $this;
        },
        display: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');
            
            $.each(_plugin.data.allModules, function (index, module) {  
                if (module.div ) {
                    var previewDiv = module.div[module.plugin]('preview');
                    previewDiv.detach();
                }
            });
           
            $.each(_plugin.htmlElements.menuItems, function (index, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    var previewDiv = item.div[item.plugin]('preview');
                    if (typeof item.cssClass === 'string') {
                        previewDiv.addClass(item.cssClass);
                    }
                    _plugin.htmlElements.menuDiv.append(
                        previewDiv
                    );
                }
            });
 
            $.each(_plugin.htmlElements.adminMenuItems, function (key, item) {
                if (typeof $.fn[item.plugin] === 'function') {
                    try {
                        var previewDiv = item.div[item.plugin]('preview');
                        if (typeof item.cssClass === 'string') {
                            previewDiv.addClass(item.cssClass);
                        }
                        _plugin.htmlElements.adminMenuDiv.append(
                            previewDiv
                        );
                    }
                    catch (err) {
                        throw new Error(item.name + ' has no method "preview".');
                    }
                }
            });

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmMenu');

            // Clean up all modules
            if (_plugin) {
                $.each(_plugin.htmlElements.adminMenuItems, function (index, item) {

                    if (item.type == 'module') {
                        item.div[item.plugin]('destroy');
                    }
                });
                $.each(_plugin.htmlElements.menuItems, function (index, item) {

                    if (item.type == 'module') {
                        item.div[item.plugin]('destroy');
                    }
                });
            }

            // Clean up the service and framework
            $.insmService('destroy');

            // Clean up the menu
            $this.data('insmMenu', null).empty();

            return $this;
        }
    };
    $.fn.insmMenu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmMenu');
        }
    };

    //$.insmMenu = function (method) {
    //    return $('html').insmMenu(arguments);
    //};
})(jQuery);