/*
* INSM Admin Module Selector
* This file contains the INSM Admin Module Selector plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmAdminModuleSelector(settings);
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
            var _plugin = $this.data('insmAdminModuleSelector');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Admin Module Selector',
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        content: $('<div />'),
                        top: {
                            container: $('<div />'),
                            saveButton: $('<button />'),
                            text: $('<h3 />').text('Highlight all modules you want to activate')
                        },
                        modules: {
                            container: $('<div />')
                        },
                        addWebLink: $('<div />').addClass('is-clickable'),
                        popupLoading:$('<div />'),
                        webLink: {
                            webLinkContaniner: $('<div />').addClass('weblink-container'),
                            webLinkPopupContaniner: $('<div />'),
                            inputDiv: $('<div />'),
                            saveButton: $('<button />').text('Done'),
                            cancelButton: $('<button />').text('Cancel'),
                            editButton: $('<button />').text('Edit'),
                            activeButton: $('<button />').text('Activate'),
                            removeButton: $('<button />').text('Remove')
                        }
                    },
                    data: {
                        deploymentValue: [],
                        fullscreenInitialized: false,
                        originalModulelist: [],
                        moduleList: [],
                        moduleName: [],
                        clickedWebLink: {},
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
                $this.data('insmAdminModuleSelector', _plugin);
            }
            return $this;
        },
        generateModule: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
            var element = $('<a />').insmModuleStyle({
                text: options.module.name,
                onClick: function () {
                    if (_plugin.data.moduleName.indexOf(options.module.name) > -1) {
                        _plugin.data.moduleName.splice(_plugin.data.moduleName.indexOf(options.module.name), 1);
                        $.each(_plugin.data.moduleList, function (index, mod) {
                            if (mod.name == options.module.name) {
                                _plugin.data.moduleList[index].active = false;
                            }
                        });
                    } else {
                        _plugin.data.moduleName.push(options.module.name);
                        $.each(_plugin.data.moduleList, function (index, mod) {
                            if (mod.name == options.module.name) {
                                _plugin.data.moduleList[index].active = true;
                            }
                        });
                    }
                }

            });
            if (options.module.active) {
                element.insmModuleStyle('isSelected');
                _plugin.data.moduleName.push(options.module.name);
            }
            _plugin.htmlElements.addWebLink.before(element);
        },
        generateWebLinkModule: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
            var element = $('<a />').insmModuleStyle({
                webLinkPopup: true,
                text: options.module.name,
                onClick: function () {
                    $.each(_plugin.data.moduleList, function (index, module) {
                        if (module.name == options.module.name) {
                            if (module.active) {
                                _plugin.htmlElements.webLink.activeButton.text('Deactivate');
                            } else {
                                _plugin.htmlElements.webLink.activeButton.text('Activate');
                            }
                        }
                    });
                    _plugin.data.clickedWebLink = options.module;
                    _plugin.data.clickedWebLink.element = $.extend(true, {}, element);                
                    _plugin.htmlElements.webLink.webLinkPopupContaniner.insmPopup({
                        backdropTransparency: true,
                        backdropClickClose: true,
                        showCloseButton: false,
                        content: _plugin.htmlElements.webLink.webLinkPopupContaniner,
                        backdropClickCallback: function () {
                            _plugin.data.clickedWebLink = {};
                        },
                        //autoCenter: true
                    });
                }
            });
            if (options.module.active) {
                element.insmModuleStyle('isSelected');
                _plugin.data.moduleName.push(options.module.name);
            }
            _plugin.htmlElements.addWebLink.before(element);
            if (options.newWebLinkModule) {
                // Not working well with current background image...
               // element.insmHighlight();
            }
        },
        setModules: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
            _plugin.data.moduleList = [];
            _plugin.data.originalModulelist = [];
            _plugin.data.reloadMenuCallback = options.saveCallback;
            $.each(options.modules, function (index, module) {
                _plugin.data.moduleList.push({
                    name: module.name,
                    plugin: module.plugin,
                    active: module.active,
                    settings: module.settings,
                    permissions: module.permissions
                });
            });
            $.each(_plugin.data.moduleList, function (index,module) {
                var moduleCopy = $.extend(true, {}, module);
                _plugin.data.originalModulelist.push(moduleCopy);
            });
        },
        renderModuleButtons: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
            _plugin.htmlElements.addWebLink.detach();
            _plugin.htmlElements.modules.container.empty();
            _plugin.htmlElements.modules.container.append(_plugin.htmlElements.addWebLink);           
            $.each(_plugin.data.moduleList, function (index, module) {
                if (module.plugin != 'insmWebLink') {
                    $this.insmAdminModuleSelector('generateModule', { module: module });
                } else {
                    $this.insmAdminModuleSelector('generateWebLinkModule', { module: module });
                }
            });
            return $this;
        },
        webLinkInputFormat: function(validatefunction){
            var objectDefiniton = {
                name: {
                    displayName: 'Module Name',
                    type: 'string',
                    required: true,
                    validateFunction: validatefunction
                },
                url: {
                    displayName: 'URL',
                    type: 'string',
                    required: true
                },
                externalModule: {
                    displayName: 'External Module',
                    type: 'boolean',
                    required: false,
                },               
            }
            return objectDefiniton;
        },
    
        fullscreen: function (options) {
            
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmAdminModuleSelector('resize');
                }, 1);
                return $this;
            }
            _plugin.data.fullscreenInitialized = true;
            _plugin.settings.target.addClass('insmAdminModuleSelector').fadeIn();        
            _plugin.settings.target.empty();
            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }
            _plugin.htmlElements.popupLoading.insmFullScreenLoading();
            _plugin.settings.target.append(
                _plugin.htmlElements.content.append(
                    _plugin.htmlElements.top.container.addClass('top-container').append(
                        _plugin.htmlElements.top.saveButton.text('Save').click(function () {
                            _plugin.htmlElements.popupLoading.insmFullScreenLoading('popUp');
                            var moduleList = [];
                            $.each(_plugin.data.moduleList, function (index, module) {
                                var moduleCopy = $.extend(true, {}, module);
                                delete moduleCopy.element;
                                moduleList.push(moduleCopy);
                            });
                            
                            $.insmFramework('setModuleSettings', {
                                namespace: 'insmMenu',
                                key: 'items',
                                value: moduleList,
                                success: function (items) {
                                    _plugin.data.reloadMenuCallback();
                                    $.each(moduleList, function (index, module) {
                                        var moduleCopy = $.extend(true, {}, module);
                                        _plugin.data.originalModulelist.push(moduleCopy);
                                    });
                                    _plugin.htmlElements.popupLoading.insmFullScreenLoading('close');
                                   

                                    /*$.insmNotification({
                                        type: 'info',
                                        message: 'Module status saved'
                                    })*/
                                }
                            });
                        }),
                        _plugin.htmlElements.top.text    
                     ),
                    _plugin.htmlElements.modules.container.addClass('module-container')
                ),
                // init  Add&Edit new webLink page
                _plugin.htmlElements.webLink.webLinkContaniner.append(
                    _plugin.htmlElements.webLink.saveButton.click(function () {
                        var tableValue = _plugin.htmlElements.webLink.inputDiv.insmInput('getValue');
                        if (!_plugin.htmlElements.webLink.inputDiv.insmInput('validate')) {
                            return;
                        }
                        if (_plugin.data.clickedWebLink.name) {
                            _plugin.data.clickedWebLink.element.find('span').text(tableValue.name);
                            $.each(_plugin.data.moduleList, function (index, module) {
                                if (module.name == _plugin.data.clickedWebLink.name) {
                                    module.name = tableValue.name;
                                    module.settings.url = tableValue.url;
                                    module.settings.externalModule = tableValue.externalModule;
                                }
                            $this.insmAdminModuleSelector('renderModuleButtons');
                            });
                            if (_plugin.data.moduleName.indexOf(_plugin.data.clickedWebLink.name) > -1) {
                                _plugin.data.moduleName.splice(_plugin.data.moduleName.indexOf(_plugin.data.clickedWebLink.name), 1);
                                _plugin.data.moduleName.push(tableValue.name);
                            }                            
                        } else {
                            var newmodule = {
                                name: tableValue.name,
                                plugin: 'insmWebLink',
                                active: true,
                                settings: {
                                    url: tableValue.url,
                                    session: tableValue.session,
                                    externalModule: tableValue.externalModule
                                }
                            }
                            _plugin.data.moduleList.push(newmodule);                            
                            $this.insmAdminModuleSelector('generateWebLinkModule', {
                                module: newmodule,
                                newWebLinkModule:true
                            });
                        }
                        _plugin.htmlElements.content.show();
                        _plugin.htmlElements.webLink.webLinkContaniner.hide();
                        _plugin.data.clickedWebLink = {};
                    }),
                    _plugin.htmlElements.webLink.cancelButton.click(function () {
                        _plugin.htmlElements.content.show();
                        _plugin.htmlElements.webLink.webLinkContaniner.hide();
                        _plugin.data.clickedWebLink = {};
                    }),
                    _plugin.htmlElements.webLink.inputDiv.addClass('input-table')
                ).hide()               
            );          
            // init add WebLink Button
            var validateFunctionForAdd = function (value) {
                var moduleNameArray = [];
                $.each(_plugin.data.moduleList, function (index, module) {
                    moduleNameArray.push(module.name);
                });
                if (moduleNameArray.indexOf(value) > -1) {
                    $.insmNotification({
                        type: 'warning',
                        message: 'Module "' + value + '" already exists'
                    })
                    return false;
                } else if ($.trim(value).length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
            var validateFunctionForEdit = function (value) {
                var moduleNameArray = [];
                $.each(_plugin.data.moduleList, function (index, module) {
                    moduleNameArray.push(module.name);                                               
                });
                if (moduleNameArray.indexOf(value) > -1 && value != _plugin.data.clickedWebLink.name ) {
                    $.insmNotification({
                        type: 'warning',
                        message: 'Module "' + value + '" already exists'
                    })
                    return false;
                } else if ($.trim(value).length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
            _plugin.htmlElements.addWebLink.addClass('addWebLinkButton').click(function () {
                _plugin.htmlElements.webLink.inputDiv.insmInput('destroy').insmInput({
                    type: 'table',
                    objectDefinition: $this.insmAdminModuleSelector('webLinkInputFormat', validateFunctionForAdd)                                      
                }).insmInput('edit');
                _plugin.htmlElements.content.hide();
                _plugin.htmlElements.webLink.webLinkContaniner.show();
            })
            _plugin.htmlElements.modules.container.append(
                 _plugin.htmlElements.addWebLink
            )

            // init WebLink popup Content

            _plugin.htmlElements.webLink.webLinkPopupContaniner.addClass('weblink-popup-container').append(
                _plugin.htmlElements.webLink.editButton.click(function () {
                    _plugin.htmlElements.content.hide();
                    _plugin.htmlElements.webLink.webLinkContaniner.show();
                    _plugin.htmlElements.webLink.webLinkPopupContaniner.insmPopup('close');
                    $.each(_plugin.data.moduleList, function (index, module) {
                        if (module.name == _plugin.data.clickedWebLink.name) {
                            _plugin.htmlElements.webLink.inputDiv.insmInput('destroy').insmInput({
                                type: 'table',
                                value: {
                                    name: module.name,
                                    url: module.settings.url,
                                    externalModule: module.settings.externalModule
                                },
                                objectDefinition: $this.insmAdminModuleSelector('webLinkInputFormat', validateFunctionForEdit)
                            }).insmInput('edit');
                            
                        }
                    });
                }),
               
                _plugin.htmlElements.webLink.activeButton.click(function () {
 
                    if (_plugin.htmlElements.webLink.activeButton.text() == 'Activate') {
                        _plugin.htmlElements.webLink.activeButton.text('Deactivate');
                    } else {
                        _plugin.htmlElements.webLink.activeButton.text('Activate');
                    }
                    _plugin.data.clickedWebLink.element.insmModuleStyle('toggleSelected');
                    if (_plugin.data.moduleName.indexOf(_plugin.data.clickedWebLink.name) > -1) {

                        _plugin.data.moduleName.splice(_plugin.data.moduleName.indexOf(_plugin.data.clickedWebLink.name), 1);
                        $.each(_plugin.data.moduleList, function (index, mod) {

                            if (mod.name == _plugin.data.clickedWebLink.name) {
                                _plugin.data.moduleList[index].active = false;
                            }
                        });

                    } else {
                        _plugin.data.moduleName.push(_plugin.data.clickedWebLink.name);
                        $.each(_plugin.data.moduleList, function (index, mod) {
                            if (mod.name == _plugin.data.clickedWebLink.name) {
                                _plugin.data.moduleList[index].active = true;
                            }
                        });
                    }
                    _plugin.htmlElements.webLink.webLinkPopupContaniner.insmPopup('close');
                    _plugin.data.clickedWebLink = {};                  
                }),
                _plugin.htmlElements.webLink.removeButton.click(function () {
                    _plugin.htmlElements.webLink.webLinkPopupContaniner.insmPopup('close');
                    _plugin.data.clickedWebLink.element.remove();
                    var removeIndex;
                    $.each(_plugin.data.moduleList, function (index, module) {
                        if (module.name == _plugin.data.clickedWebLink.name) {
                            removeIndex = index;
                            _plugin.data.clickedWebLink = {};                            
                        }                       
                    });
                    _plugin.data.moduleList.splice(removeIndex, 1);
                })
            )            
            $this.insmAdminModuleSelector('renderModuleButtons');
            $this.insmAdminModuleSelector('resize');
            return $this;
        },
        hasSettings: function (options) {
            return false;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview insmAdminModuleSelector');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Module Selector')
            );

            return _plugin.settings.previewTarget;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
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
            var _plugin = $this.data('insmAdminModuleSelector');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');

            _plugin.subscriptions.start = function () {
                // Subscribe on region tree
            };

            $this.insmAdminModuleSelector('stopSubscriptions');
            $this.insmAdminModuleSelector('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                // Stop subscription of region tree
            };

            return $this;
        },
        onClose: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');
            var moduleList = [];
            $.each(_plugin.data.moduleList, function (index, module) {
                var moduleCopy = $.extend(true, {}, module);
                delete moduleCopy.element;
                moduleList.push(moduleCopy);
            });
            var originalModuleString = JSON.stringify(_plugin.data.originalModulelist);           
            var finalModuleString = JSON.stringify(moduleList);           
            if (originalModuleString == finalModuleString) {
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
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmAdminModuleSelector');

            $this.insmAdminModuleSelector('stopSubscriptions');
            $this.data('insmAdminModuleSelector', null).empty();

            return $this;
        }
    };

    $.fn.insmAdminModuleSelector = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAdminModuleSelector');
        }
    };

})(jQuery);