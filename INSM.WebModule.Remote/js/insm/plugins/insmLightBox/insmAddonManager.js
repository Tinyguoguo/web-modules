var addonTemplatePluginRef;
var rightSideFirstPlugin;
var rightSideLastPlugin;
var selectTemplatePluginRef;
var selectTemplateInfoPlugin;
var selectTemplateMessagePlugin;

var AddOnManager = {

    options: {
        onok: null,
        oncancel: null
    },

    //Start rendering for plugin
    _init: function () {
        rootUI_addOnManager = this.element;
        ContextObject_addOnManager = this;
    },

    //Call this function when initialize plugin
    _create: function () {
        rootUI_addOnManager = this.element;
        ContextObject_addOnManager = this;
    },

    //Invoke  dailogBox
    InvokeDialog: function () {

        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                backdrop: $("<div />").addClass("insm-servercall-backdrop").attr("id", "divbackdropforaddon"),
                dialog: {
                    container: $("<div />").addClass("insm-addon-fb-box"),
                    header: {
                        container: $("<div />").addClass("insm-servercall-header-box").attr("id", "divboxforaddon").text("Add-on management"),
                        close: $("<div />").addClass("insm-servercall-close").attr("id", "closeforpublish")
                    },
                    body: {
                        container: $("<div />"),
                        maincontainer: {
                            container: $("<div />").addClass("insm-playlist-manager-addon-maincontaner"),
                            content: {
                                container: $("<div />").addClass("insm-playlist-manager-addonstartupui-maincontainer"),
                                leftsideSection: {
                                    container: $("<section />").addClass("insm-playlist-manager-addonstartupui-container"),
                                    addontemplatelist: $("<span />")
                                },
                                rightsideSection: {
                                    container: $("<section />").addClass("insm-playlist-manager-addonstartupui-container insm-playlist-manager-addonstartupui-container-rightside"),
                                    templateInfo: {
                                        container: $("<section />").addClass("insm-playlist-manager-addonstartupui-container-rightside-cell"),
                                        addontemplateinfo: $("<span />")
                                    },
                                    staticInfo: {
                                        container: $("<section />").addClass("insm-playlist-manager-addonstartupui-container-rightside-cell"),
                                        activetemplateinfo: $("<span />")
                                    }
                                },
                            }
                        },
                        secondContainer: {
                            container: $("<div />").addClass("insm-playlist-manager-addon-maincontaner insm-playlist-manager-addon-modifiedScreen"),
                        },
                        thirdContainer: {
                            container: $("<div />").addClass("insm-playlist-manager-addon-maincontaner insm-playlist-manager-addonstartupui-thirdscreen-container"),
                            content: {
                                leftsideSection: {
                                    container: $("<span />").addClass("insm-playlist-manager-addonstartupui-thirdscreen-cell insm-thirdscreen-cell")
                                },
                                rightsideSection: {
                                    container: $("<div />").addClass("insm-playlist-manager-addonstartupui-thirdscreen-cell insm-playlist-manager-addonstartupui-thirdscreen-cell-layout"),
                                    templateInfo: {
                                        container: $("<div />").addClass("insm-playlist-manager-addonstartupui-thirdscreen-rightside-cell"),
                                    },
                                    staticInfo: {
                                        container: $("<div />").addClass("insm-playlist-manager-addonstartupui-thirdscreen-rightside-cell")
                                    }
                                },
                            }
                        },
                        extraComponenets: {
                            container: $("<div />"),
                            fileforImport: $("<input id='files' type='file' accept='application/zip' />").addClass('insm-playlist-manager-import-playlist').css('display', 'none'),
                            templateUI: $("<div />").addClass("insm-playlist-manager-templateUI"),
                            output: $("<output id='showresult' />"),
                        },
                        buttonGroup: {
                            container: $("<div />"),
                            uploadButton: $("<div />").addClass("button").attr("id", "cmduploadforaddon").text("Upload file.."),
                            removeButton: $("<button />").addClass("button").attr("id", "cmdremoveforaddon").attr("disabled", "disabled").css('margin-right', '5px').text("Remove"),
                            modifyButton: $("<button />").addClass("button").attr("id", "cmdmodifyforaddon").attr("disabled", "disabled").text("Modify"),
                            spanfiller: $("<span />").addClass("insm-playlist-manager-addon-spanfiller"),
                            cancel: $("<div />").addClass("button insm-right-btn").attr("id", "cmdCancelforpublish").text("Close"),
                        },
                        buttonGroupSecondScreen: {
                            container: $("<div />"),
                            backButton: $("<div />").addClass("button").attr("id", "cmdBack").text("Back"),
                            revertToDefaultButton: $("<div />").addClass("button").attr("id", "cmdreverttodefault").text("Revert to default"),
                            copyButton: $("<div />").addClass("button").attr("id", "cmdcopyproperties").text("Copy Properties from...."),
                            spanSelectedTemplate: $("<span />").attr('id', 'spanSelectedTemplate').addClass('insm-currently-editing-template'),
                            spanfiller: $("<span />").addClass("insm-playlist-manager-addon-spanfiller"),
                            saveButton: $("<div />").addClass("button insm-right-btn").attr("id", "cmdmodifySave").text("Save"),
                            cancel: $("<div />").addClass("button insm-right-btn").attr("id", "cmdCancel").text("Cancel"),
                        },
                        buttonGroupThirdScreen: {
                            container: $("<div />"),
                            backButton: $("<div />").addClass("button").attr("id", "cmdBack").text("Back"),
                            checkbox: $('<input/>').attr({ type: 'checkbox', id: 'chkShowOldPlaylist', text: 'Show previous version only', checked: "yes" }).css("margin-top", "10px"),
                            label: $('<div for="chkShowOldPlaylist">Show previous version only</div>').css("margin-top", "10px").css("display", "inline-block"),
                            spanfiller: $("<span />").addClass("insm-playlist-manager-addon-spanfiller"),
                            selectButton: $("<button />").addClass("button insm-right-btn").attr("id", "cmdSelect").attr("disabled", "disabled").text("Select"),
                            cancel: $("<div />").addClass("button insm-right-btn").attr("id", "cmdCancel").text("Cancel"),
                        }
                    }
                }
            }
        };

        rootUI_addOnManager.append(_plugin.htmlElements.content.backdrop)
            .append(_plugin.htmlElements.content.dialog.container
                .append(_plugin.htmlElements.content.dialog.header.container
                    .append(_plugin.htmlElements.content.dialog.header.close))
                .append(_plugin.htmlElements.content.dialog.body.container
                    .append(_plugin.htmlElements.content.dialog.body.maincontainer.container
                        .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.container
                            .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.leftsideSection.container
                                .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.leftsideSection.addontemplatelist))
                            .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.container
                                .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.templateInfo.container
                                    .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.templateInfo.addontemplateinfo))
                                .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.staticInfo.container
                                    .append(_plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.staticInfo.activetemplateinfo)))))
                      .append(_plugin.htmlElements.content.dialog.body.secondContainer.container)
                     .append(_plugin.htmlElements.content.dialog.body.thirdContainer.container
                        .append(_plugin.htmlElements.content.dialog.body.thirdContainer.content.leftsideSection.container)
                        .append(_plugin.htmlElements.content.dialog.body.thirdContainer.content.rightsideSection.container
                            .append(_plugin.htmlElements.content.dialog.body.thirdContainer.content.rightsideSection.templateInfo.container)
                            .append(_plugin.htmlElements.content.dialog.body.thirdContainer.content.rightsideSection.staticInfo.container)))
                    .append(_plugin.htmlElements.content.dialog.body.extraComponenets.container
                        .append(_plugin.htmlElements.content.dialog.body.extraComponenets.fileforImport)
                        .append(_plugin.htmlElements.content.dialog.body.extraComponenets.templateUI)
                        .append(_plugin.htmlElements.content.dialog.body.extraComponenets.output))
                    .append(_plugin.htmlElements.content.dialog.body.buttonGroup.container
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroup.uploadButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroup.removeButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroup.modifyButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroup.spanfiller)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroup.cancel))
                    .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.backButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.revertToDefaultButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.copyButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.spanSelectedTemplate)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.spanfiller)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.saveButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.cancel))
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.container
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.backButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.checkbox)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.label)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.spanfiller)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.selectButton)
                        .append(_plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.cancel))));

        _plugin.htmlElements.content.dialog.body.secondContainer.container.hide();
        _plugin.htmlElements.content.dialog.body.thirdContainer.container.hide();
        _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.hide();
        _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.container.hide();

        $('#divbackdropforaddon, #divboxforaddon').animate({ 'opacity': '.50' }, 300, 'linear');
        $('#divboxforaddon').animate({ 'opacity': '1' }, 300, 'linear');
        $('#divbackdropforaddon, #divboxforaddon').css('display', 'block');


        rightSideFirstPlugin = _plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.templateInfo.addontemplateinfo;
        rightSideLastPlugin = _plugin.htmlElements.content.dialog.body.maincontainer.content.rightsideSection.staticInfo.activetemplateinfo;
        addonTemplatePluginRef = _plugin.htmlElements.content.dialog.body.maincontainer.content.leftsideSection.addontemplatelist;

        selectTemplatePluginRef = _plugin.htmlElements.content.dialog.body.thirdContainer.content.leftsideSection.container;
        selectTemplateInfoPlugin = _plugin.htmlElements.content.dialog.body.thirdContainer.content.rightsideSection.templateInfo.container;
        selectTemplateMessagePlugin = _plugin.htmlElements.content.dialog.body.thirdContainer.content.rightsideSection.staticInfo.container;


        ContextObject_addOnManager.doServerCallForAddOnManagerTemplate(rightSideFirstPlugin, rightSideLastPlugin, addonTemplatePluginRef);

        _plugin.htmlElements.content.dialog.body.buttonGroup.uploadButton.on("click", function (e) {
            this.value = null;
            _plugin.htmlElements.content.dialog.body.extraComponenets.fileforImport.trigger('click');
        });

        $("#files").change(function (e) {
            ContextObject_addOnManager.doUploadFile(e);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.removeButton.on("click", function () {
            addonTemplatePluginRef.AddOnsTemplate("onRemove");
        });

        // click on modify button for template editing and reach in second screen
        _plugin.htmlElements.content.dialog.body.buttonGroup.modifyButton.on("click", function () {
            _plugin.htmlElements.content.dialog.header.container.text("Edit template");
            _plugin.htmlElements.content.dialog.body.buttonGroup.container.hide();
            _plugin.htmlElements.content.dialog.body.maincontainer.container.hide();
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.show();
            _plugin.htmlElements.content.dialog.body.secondContainer.container.show();
            // show currently editing template information - name,displayname and version
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.spanSelectedTemplate.empty();
            var TemplateName = $.data(document, "templateItemResult")[0].TemplateName;
            var displayName = $.data(document, "templateItemResult")[0].DisplayName;
            var displayText = displayName.split(';');
            var version = $.data(document, "templateItemResult")[0].Version;
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.spanSelectedTemplate.append($("<span/>").text('Currently editing:  ' + TemplateName).addClass('insm-currently-edited-Template'));
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.spanSelectedTemplate.append($("<span/>").text(displayText[0]).append($("<span/>").text(version).addClass('insm-version')));
            //
            _plugin.htmlElements.content.dialog.body.secondContainer.container
                .append($("<table class='insm-playlist-manager-modified-ui' ></table>")
                .append($("<tr style='height: 35px;'><th><div>Hidden</div></th><th><div>Advanced</div></th><th style='border-right: 0px;width:70%;'><div>Properties</div></th></tr>")));
            $.each($.data(document, "templatePropertyList"), function (index, item) {
                var strRow = '<tr><td style="text-align:center"><input type="checkbox" ' + (item.hidden == true ? 'checked' : '') + ' /></td><td style="text-align:center"><input type="checkbox" ' + (item.advance == true ? 'checked' : '') + '/></td><td style="border-right:0px"><div data-id="templateUI"></div></td></tr>';
                $('.insm-playlist-manager-modified-ui').append(strRow);
            });
            $.each($('.insm-playlist-manager-modified-ui td div'), function (index, item) {
                if ($(item).attr('data-id') == 'templateUI') {
                    $(item).TemplatePropertyElementUI({ uiInformation: $.data(document, "templatePropertyList")[index] });
                }
            });
        });

        // second screen back button
        _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.backButton.on("click", function () {
            $('.insm-playlist-manager-addon-modifiedScreen').empty();
            _plugin.htmlElements.content.dialog.body.secondContainer.container.empty();
            _plugin.htmlElements.content.dialog.header.container.text("Add-on management");
            _plugin.htmlElements.content.dialog.body.maincontainer.container.show();
            _plugin.htmlElements.content.dialog.body.buttonGroup.container.show();
            _plugin.htmlElements.content.dialog.body.secondContainer.container.hide();
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.hide();

            // To show selected template information
            rightSideFirstPlugin.AddOnsTemplateInformation();
            //var result = $.data(document, "templateItemResult");
            //rightSideFirstPlugin.AddOnsTemplateInformation("showInfoOnSelectedTemplateItems", result);
            // right side below plugin
            rightSideLastPlugin.AddOnsRightPanelInformation();
            rightSideLastPlugin.AddOnsRightPanelInformation("showRightPanelTemplateInformation");
            //$.data(document, "templatePropertyList", []);
        });

        // click on copy to properties button for template selection in third screen
        _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.copyButton.on("click", function () {
            _plugin.htmlElements.content.dialog.header.container.text("Select template to copy from");
            _plugin.htmlElements.content.dialog.body.secondContainer.container.hide();
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.hide();
            _plugin.htmlElements.content.dialog.body.thirdContainer.container.show();
            _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.container.show();
            // To show selected template information
            selectTemplateInfoPlugin.AddOnsTemplateInformation();
            // "Addon Templates Message... plugin"
            selectTemplateMessagePlugin.AddOnsRightPanelInformation();
            selectTemplateMessagePlugin.AddOnsRightPanelInformation("showMessageInfoForSelectTemplate");
            // left side template information of same template name
            var value = $("#chkShowOldPlaylist").prop("checked");
            var templatedata = $.data(document, "templateDataObjects");
            // Third screen - on copy to properties select template 
            selectTemplatePluginRef.AddOnsSelectTemplate({
                getSelectTemplateData: templatedata,
                selectTemplateInfoPlugin: selectTemplateInfoPlugin,
                selectTemplateMessagePlugin: selectTemplateMessagePlugin,
                onselectrow: function (e, data) {
                    selectTemplateInfoPlugin.AddOnsTemplateInformation("showInfoOnSelectedTemplateItems", data);
                },
                isChecekOn: value
            });
        });

        // third screen back button
        _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.backButton.on("click", function () {
            _plugin.htmlElements.content.dialog.header.container.text("Edit template");
            _plugin.htmlElements.content.dialog.body.secondContainer.container.show();
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.show();
            _plugin.htmlElements.content.dialog.body.thirdContainer.container.hide();
            _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.container.hide();
            ContextObject_addOnManager.backAndCancelButtonOnThirdScreen();
        });

        _plugin.htmlElements.content.dialog.body.buttonGroup.cancel.on("click", function () {
            ContextObject_addOnManager._trigger("oncancel");
            closeDialog();
        });

        _plugin.htmlElements.content.dialog.header.close.click(function () {
            closeDialog();
        });
        // second screen cancel button
        _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.cancel.on("click", function () {
            $('.insm-playlist-manager-addon-modifiedScreen').empty();
            _plugin.htmlElements.content.dialog.body.secondContainer.container.empty();
            _plugin.htmlElements.content.dialog.header.container.text("Add-on management");
            _plugin.htmlElements.content.dialog.body.maincontainer.container.show();
            _plugin.htmlElements.content.dialog.body.buttonGroup.container.show();
            _plugin.htmlElements.content.dialog.body.secondContainer.container.hide();
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.hide();

            // To show selected template information
            rightSideFirstPlugin.AddOnsTemplateInformation();
            // right side below plugin
            rightSideLastPlugin.AddOnsRightPanelInformation();
            rightSideLastPlugin.AddOnsRightPanelInformation("showRightPanelTemplateInformation");
            //$.data(document, "templatePropertyList", []);
        });

        _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.revertToDefaultButton.on("click", function () {
            console.log('Revert Code');
        });

        //Third screen cancel button
        _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.cancel.on("click", function () {
            _plugin.htmlElements.content.dialog.header.container.text("Edit template");
            _plugin.htmlElements.content.dialog.body.secondContainer.container.show();
            _plugin.htmlElements.content.dialog.body.buttonGroupSecondScreen.container.show();
            _plugin.htmlElements.content.dialog.body.thirdContainer.container.hide();
            _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.container.hide();
            ContextObject_addOnManager.backAndCancelButtonOnThirdScreen();
        });


        //Third screen check box event for show only previous version data
        _plugin.htmlElements.content.dialog.body.buttonGroupThirdScreen.checkbox.on("change", function () {
            var value = $("#chkShowOldPlaylist").prop("checked");
            var templatedata = $.data(document, "templateDataObjects");
            // Third screen - on copy to properties select template 
            selectTemplatePluginRef.AddOnsSelectTemplate({
                getSelectTemplateData: templatedata,
                selectTemplateInfoPlugin: selectTemplateInfoPlugin,
                selectTemplateMessagePlugin: selectTemplateMessagePlugin,
                onselectrow: function (e, data) {
                    selectTemplateInfoPlugin.AddOnsTemplateInformation("showInfoOnSelectedTemplateItems", data);
                },
                isChecekOn: value
            });
        });

        function closeDialog(index) {
            $('#divbackdropforpublish, #divbackdropforpublish').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('#divbackdropforpublish, #divbackdropforpublish').css('display', 'none');
            });
            ContextObject_addOnManager._destroy();
            if (index == 1) {
                ContextObject_addOnManager._trigger("onok");
            }
        };
    },

    backAndCancelButtonOnThirdScreen: function () {
        $('.insm-thirdscreen-cell').empty();
        $("#chkShowOldPlaylist").prop("checked", true);
        $("#cmdSelect").attr("disabled", true);
    },
    doServerCallForAddOnManagerTemplate: function (rightSideFirstPlugin, rightSideLastPlugin, addonTemplatePluginRef) {
        // Get add on template data from server
        $.data(document, "loader").insmServerProcessingLoader({ text: 'Loading add on templates data....' });
        $.data(document, "loader").insmServerProcessingLoader("InvokeDialog");
        $.insmFramework('getDirectoryInformation', {
            regionid: 1,
            contentDirectoryName: 'Templates',
            success: function (e) {
                $.insmFramework('getPlayList', {
                    contentdirectoryid: e.Id,
                    success: function (data) {
                        $.data(document, "templateDataObjects", data);
                        addonTemplatePluginRef.AddOnsTemplate({
                            getTemplateData: data,
                            rightSideFirstPlugin: rightSideFirstPlugin,
                            rightSideLastPlugin: rightSideLastPlugin,
                            onItemClicked: function (evt, result) {
                                rightSideFirstPlugin.AddOnsTemplateInformation("showInfoOnSelectedTemplateItems", result);
                            }
                        });
                        $.data(document, "loader").insmServerProcessingLoader("closeDialog");
                    }
                });
            }
        });
    },

    doUploadFile: function (e) {
        $.data(document, "loader").insmServerProcessingLoader({ text: 'Uploading....' });
        $.data(document, "loader").insmServerProcessingLoader("InvokeDialog");

        $.insmFramework('uploadFileInner', {
            fileInputElement: $(e.currentTarget),
            name: e.target.files[0].name,
            progress: function (data) { },
            contentDirectoryId: 4,
            properties: e.currentTarget,
            done: function (resultData) {
                $.insmFramework('getDirectoryInformation', {
                    regionid: 1,
                    contentDirectoryName: 'Templates',
                    success: function (e) {
                        $.insmFramework('getPlayList', {
                            contentdirectoryid: e.Id,
                            success: function (data) {
                                $.data(document, "loader").insmServerProcessingLoader("closeDialog");
                                $.data(document, "templateDataObjects", data);
                                addonTemplatePluginRef.AddOnsTemplate("getOnInnerTemplateData");
                                $("#cmdmodifyforaddon").attr("disabled", true);
                                $("#cmdremoveforaddon").attr("disabled", true);
                            }
                        });
                    }
                });
            }
        });
    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI_addOnManager.empty();
    }
};

(function ($, undefiend) {
    var rootUI_addOnManager_addOnManager, ContextObject_addOnManager_addOnManager;
    $.widget("insm.insmAddOnManager", AddOnManager);
})(jQuery);