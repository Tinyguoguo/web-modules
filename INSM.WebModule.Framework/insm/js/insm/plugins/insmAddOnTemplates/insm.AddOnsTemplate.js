var templateAddOnDataArray = new Array();
var matchValue = "";
var AddOnTemplateManager = {
    version: "0.0.1",

    options: {
        getTemplateData: null,
        rightSideFirstPlugin: null,
        rightSideLastPlugin: null,
        onItemClicked: null
    },

    _create: function () {
        contextObject_template = this;
        rootUI_Template = this.element;
        $(rootUI_Template).empty();
    },

    _init: function () {
        //console.log("AddOnsTemplate");
        rightSideFirstPlugin = this.options.rightSideFirstPlugin;
        rightSideLastPlugin = this.options.rightSideLastPlugin;
        contextObject_template.getOnInnerTemplateData();
        templates = $("<div  id='insm-AddOn-Outer-Template' class='insm-template-outer'/>");
    },

    // Get inner data to split out the zip file xml while do server call - downloadinnerfile
    getOnInnerTemplateData: function () {
        $(rootUI_Template).empty();
        templateAddOnDataArray = new Array();
        var templateDataObjects = $.data(document, "templateDataObjects");
        $.each(templateDataObjects, function (index, templateItems) {
            $.each(templateItems, function (itemindex, items) {
                $.insmFramework('downloadInnerFile', {
                    fileId: items.Id,
                    filename: 'start.xml', // filename should be "start.xml".  
                    success: function (xmldatatobeparse) {
                        contextObject_template._xmlParsing(xmldatatobeparse, items);
                    }
                });
            });
        });
    },

    //Reload all template data once upload new template zip - success
    //getTemplateDataAgain: function () {
    //    templateAddOnDataArray = new Array();
    //    //$('.insm-template-outer').empty();
    //    //$('.insm-template-select-outer').empty();

    //    var templateDataObjects = $.data(document, "templateDataObjects");
    //    console.log(templateDataObjects);
    //    $.each(templateDataObjects, function (index, templateItems) {
    //        $.each(templateItems, function (itemindex, items) {

    //            $.insmFramework('downloadInnerFile', {
    //                fileId: items.Id,
    //                filename: 'start.xml', // filename should be "start.xml".  
    //                success: function (xmldatatobeparse) {
    //                    contextObject_template._xmlParsing(xmldatatobeparse, items);
    //                }
    //            });
    //        });
    //    });
    //},

    // XML parser
    _xmlParsing: function (xmldatatobeparse, items) {
        contextObject_template._parseXML(xmldatatobeparse, items);
        contextObject_template._showList();
    },

    // Parsing the xml with parsexml method
    _parseXML: function (getxml, items) {
        var $xml = $.parseXML(getxml);
        mediaTemplateObj = new Object();
        $($xml).find("dataset").each(function () {
            if ($(this).attr("id") == "Manifest") {
                $(this).find("item").each(function () {
                    mediaTemplateObj[$(this).attr("id")] = $(this).text();
                });
            }
        });
        var insmXML;

        $($xml).each(function () {
            insmXML = $(this).find("TemplateItem").children();
            contextObject_template._showAddOnTemplateList(insmXML, items);
        });
    },

    // Get ready the html with data and contain
    _showAddOnTemplateList: function (xmldata, items) {
        $('.insm-template-select-outer').empty();
        $('.insm-template-outer').empty();
        // zip xml data of row server data of download inner file server call
        $.each(xmldata, function (index, templateItems) {
            mediaTemplateObj[templateItems.nodeName] = xmldata.contents().get(index).nodeValue;
        });

        // Outer data of row server data
        $.each(items, function (index, templateItems) {
            mediaTemplateObj["TemplateFileId"] = items["Id"];
            // TODO BELOW IS STATIC DATA HAVE TO CHENGE ONCE GET IT FROM SERVER
            mediaTemplateObj["TemplateHidden"] = "False";
            mediaTemplateObj["TemplateUsedModifiedVersion"] = "False";
            mediaTemplateObj["TemplateModifiedVersionDisplayName"] = "";
        });

        templateAddOnDataArray.push(mediaTemplateObj);
    },


    _showList: function () {
        templateAddOnDataArray.sort(contextObject_template.dynamicSort("TemplateName"));
        $.each(templateAddOnDataArray, function (i, items) {
            var innerTemplate = $("<div class='insm-template-inner insm-template-active' />").attr('id', 'insm-AddOn-Inner-Template' + i);
            innerTemplate.text(items.TemplateName);
            var displayName = items.DisplayName;
            displayName = displayName.split(';');
            var templateDisplayName = $("<span/>").text(displayName[0]);
            innerTemplate.append(templateDisplayName);
            var templateVersion = $("<span/>").text(items.Version);
            innerTemplate.append(templateVersion);

            if (matchValue == items.TemplateName + displayName[0]) {
                innerTemplate.css('color', '#d1d3d4');
                templateAddOnDataArray[i]["TemplateActive"] = "False";
            } else {
                templateAddOnDataArray[i]["TemplateActive"] = "True";
            }

            matchValue = items.TemplateName + displayName[0];
            templates.append(innerTemplate);
            innerTemplate.click(function (e) {
                selectedListElement = e.currentTarget.id;
                contextObject_template._resetSelecedListItem();
                contextObject_template._showSelected();
                contextObject_template.removeSelectedItem = items.TemplateFileId;
                $.data(document, "SelectedTemplateFileId", items.TemplateFileId);
                var result = $.grep(templateAddOnDataArray, function (item) {
                    return item.TemplateFileId == items.TemplateFileId;
                });
                $.data(document, "templateItemResult", result);
                contextObject_template._trigger('onItemClicked', e, result);
                $("#cmdmodifyforaddon").attr("disabled", false);
                $("#cmdremoveforaddon").attr("disabled", false);
                $.insmFramework('downloadInnerFile', {
                    fileId: items.TemplateFileId,
                    filename: 'start.xml',
                    success: function (xmldatatobeparse) {
                        var $xdoc = $.parseXML(xmldatatobeparse);
                        var $properties = $($xdoc).find('Property');
                        var ar = [];
                        $.each($properties, function (index, item) {
                            var obj = new Object();
                            obj.Id = items.TemplateFileId;
                            obj.hidden = contextObject_template._getHiddenProperty(item);
                            obj.uiXML = $(item);
                            obj.advance = contextObject_template._getAdvanceProperty(item);
                            obj.type = $(item).attr('xsi:type');
                            ar.push(obj);
                        });
                        $.data(document, "templatePropertyList", ar);
                    }
                });

            });
        });

        rootUI_Template.append(templates);
        // To show selected template information
        rightSideFirstPlugin.AddOnsTemplateInformation();

        // "Addon Templates Used... plugin"
        var sortedTemplateArray = templateAddOnDataArray.sort(contextObject_template.dynamicSort("TemplateName"));
        rightSideLastPlugin.AddOnsRightPanelInformation({ templateData: sortedTemplateArray });
        $.data(document, "templateVersionInformationData", sortedTemplateArray);
        rightSideLastPlugin.AddOnsRightPanelInformation("showRightPanelTemplateInformation");
    },

    _getHiddenProperty: function (item) {
        var hidden = $(item).find('Hidden');
        var result;
        if (hidden.length == 0) {
            result = false;
        } else {
            result = true;
        }
        return result;
    },

    _getAdvanceProperty: function (item) {
        var hidden = $(item).find('Advanced');
        var result;
        if (hidden.length == 0) {
            result = false;
        } else {
            result = true;
        }
        return result;
    },
    // Delete selected template data
    onRemove: function () {
        $.data(document, "loader").insmServerProcessingLoader({ text: 'Please wait..' });
        $.data(document, "loader").insmServerProcessingLoader("InvokeDialog");
        $.insmFramework('RemovePlayList', {
            fileId: contextObject_template.removeSelectedItem,
            success: function (e) {
                $.insmFramework('getDirectoryInformation', {
                    regionid: 1,
                    contentDirectoryName: 'Templates',
                    success: function (e) {
                        $.insmFramework('getPlayList', {
                            contentdirectoryid: e.Id,
                            success: function (data) {
                                $.data(document, "templateDataObjects", data);
                                templateAddOnDataArray = new Array();
                                contextObject_template.getOnInnerTemplateData();
                                $.data(document, "loader").insmServerProcessingLoader("closeDialog");
                                $("#cmdmodifyforaddon").attr("disabled", true);
                                $("#cmdremoveforaddon").attr("disabled", true);
                            }
                        });
                    }
                });
            },
            denied: function () {
                alert("error");
            }
        });
    },

    // Set selection on current thumb element
    _showSelected: function () {
        $("#" + selectedListElement).removeClass('insm-template-inner');
        $("#" + selectedListElement).addClass('insm-template-inner-selected');
    },

    //Reset normal view for div 
    _resetSelecedListItem: function () {
        var outer = $('#insm-AddOn-Outer-Template').children();
        outer.each(function (i, index) {
            $(index).removeClass('insm-template-inner-selected');
            $(index).addClass('insm-template-inner');
        });
    },
    
    // Dynamic sorting on array of object - property
    dynamicSort: function (property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        };
    },

    _destroy: function () {
        templateAddOnDataArray = new Array();
        rootUI_Template.empty();
    },
};

(function ($, undefined) {
    var contextObject_template, rootUI_Template, selectedListElement, rightSideFirstPlugin, rightSideLastPlugin, templates, removeSelectedItem;
    var mediaTemplateObj;
    $.widget("insm.AddOnsTemplate", AddOnTemplateManager);
})(jQuery);