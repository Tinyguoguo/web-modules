var AddOnsSelectTemplate = {
    version: "0.0.1",

    options: {
        getSelectTemplateData: null,
        selectTemplateInfoPlugin: null,
        selectTemplateMessagePlugin: null,
        onselectrow: null,
        isChecekOn: false
    },

    _create: function () {
        contextObject_selectTemplate = this;
        rootUI_SelectTemplate = this.element;

        $(rootUI_SelectTemplate).empty();
    },

    _init: function () {
        //console.log("rootUI_SelectTemplate");
        selectTemplateInfoPlugin = this.options.selectTemplateInfoPlugin;
        isChecekOn = this.options.isChecekOn;
        selectTemplateMessagePlugin = this.options.selectTemplateMessagePlugin;
        rootUI_SelectTemplate.html("<p style='display:none'>data</p>");
        contextObject_selectTemplate.showSelectTemplateData();
        selectTemplateUI = $("<div  id='insm-AddOn-Select-Template' class='insm-template-select-outer'/>");
    },

    // Get inner data to split out the zip file xml while do server call - downloadinnerfile
    showSelectTemplateData: function () {
        selectedTemplateData = new Array();
        var templateDataObjects = $.data(document, "templateDataObjects");
        $.each(templateDataObjects, function (index, templateItems) {
            $.each(templateItems, function (itemindex, items) {
                $.insmFramework('downloadInnerFile', {
                    fileId: items.Id,
                    filename: 'start.xml', // filename should be "start.xml".  
                    success: function (xmldatatobeparse) {
                        contextObject_selectTemplate._xmlParsing(xmldatatobeparse, items);
                    }
                });
            });
        });
    },

    // XML parser
    _xmlParsing: function (xmldatatobeparse, items) {
        contextObject_selectTemplate._parseXML(xmldatatobeparse, items);
        contextObject_selectTemplate._showList();
    },

    // Parsing the xml with parsexml method
    _parseXML: function (getxml, items) {
        var $xml = $.parseXML(getxml);
        selectTemplateObj = new Object();
        $($xml).find("dataset").each(function () {
            if ($(this).attr("id") == "Manifest") {
                $(this).find("item").each(function () {
                    selectTemplateObj[$(this).attr("id")] = $(this).text();
                });
            }
        });
        var insmXML;
        $($xml).each(function () {
            insmXML = $(this).find("TemplateItem").children();
            contextObject_selectTemplate._showAddOnTemplateList(insmXML, items);
        });
    },

    // Get ready the html with data and contain
    _showAddOnTemplateList: function (xmldata, items) {
        $(".insm-template-select-outer").empty();
        // zip xml data of row server data of download inner file server call
        $.each(xmldata, function (index, templateItems) {
            selectTemplateObj[templateItems.nodeName] = xmldata.contents().get(index).nodeValue;
        });

        // Outer data of row server data
        $.each(items, function (index, templateItems) {
            selectTemplateObj["TemplateFileId"] = items["Id"];
            // TODO BELOW IS STATIC DATA HAVE TO CHENGE ONCE GET IT FROM SERVER
            selectTemplateObj["TemplateHidden"] = "False";
            selectTemplateObj["TemplateUsedModifiedVersion"] = "False";
            selectTemplateObj["TemplateModifiedVersionDisplayName"] = "";
        });
        selectedTemplateData.push(selectTemplateObj);
    },


    _showList: function () {
        selectedTemplateData.sort(contextObject_selectTemplate.dynamicSort("TemplateName"));
        $.each(selectedTemplateData, function (i, items) {
            var innerTemplate = $("<div class='insm-template-inner insm-template-active' />").attr('id', 'insm-AddOn-Select-Inner-Template' + i);
            innerTemplate.text(items.TemplateName);
            var displayName = items.DisplayName;
            displayName = displayName.split(';');
            var templateDisplayName = $("<span/>").text(displayName[0]);
            innerTemplate.append(templateDisplayName);
            var templateVersion = $("<span/>").text(items.Version);
            innerTemplate.append(templateVersion);

            if (matchValue == items.TemplateName + displayName[0]) {
                innerTemplate.css('color', '#d1d3d4');
                selectedTemplateData[i]["TemplateActive"] = "False";
            } else {
                selectedTemplateData[i]["TemplateActive"] = "True";
            }

            if (items.TemplateFileId == $.data(document, "SelectedTemplateFileId")) {
                contextObject_selectTemplate.matchValueByFileId = items.TemplateName + displayName[0];
            }

            if (isChecekOn) {
                if (matchValue == items.TemplateName + displayName[0]) {
                    if (contextObject_selectTemplate.matchValueByFileId != undefined) {
                        if (items.TemplateName + displayName[0] == contextObject_selectTemplate.matchValueByFileId) {
                            selectTemplateUI.append(innerTemplate);
                        }
                    }
                }
            } else {
                selectTemplateUI.append(innerTemplate);
            }
            
            matchValue = items.TemplateName + displayName[0];
            
            innerTemplate.click(function (e) {
                selectedListElement = e.currentTarget.id;
                contextObject_selectTemplate._resetSelecedListItem();
                contextObject_selectTemplate._showSelected();

                var result = $.grep(selectedTemplateData, function (item) {
                    return item.TemplateFileId == items.TemplateFileId;
                });
                contextObject_selectTemplate._trigger('onselectrow', e, result);
                $("#cmdSelect").attr("disabled", false);
            });
        });

        rootUI_SelectTemplate.append(selectTemplateUI);
        // To show selected template information
        selectTemplateInfoPlugin.AddOnsTemplateInformation();
        // "Addon Templates Message... plugin"
        selectTemplateMessagePlugin.AddOnsRightPanelInformation();
        selectTemplateMessagePlugin.AddOnsRightPanelInformation("showMessageInfoForSelectTemplate");
    },
    
    // Set selection on current thumb element
    _showSelected: function () {
        $("#" + selectedListElement).removeClass('insm-template-inner');
        $("#" + selectedListElement).addClass('insm-template-inner-selected');
    },

    //Reset normal view for div 
    _resetSelecedListItem: function () {
        var outer = $('#insm-AddOn-Select-Template').children();
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
        selectedTemplateData = new Array();
        rootUI_SelectTemplate.empty();
    },
};

(function ($, undefined) {
    var contextObject_selectTemplate, rootUI_SelectTemplate, selectedListElement, selectTemplateUI;
    var selectTemplateObj, selectTemplateInfoPlugin, selectTemplateMessagePlugin;
    var selectedTemplateData = new Array();
    var matchValue = "";
    var matchValueByFileId = "";
    var isChecekOn = false;
    $.widget("insm.AddOnsSelectTemplate", AddOnsSelectTemplate);
})(jQuery);