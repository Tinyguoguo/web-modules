
var TemplatePropertyElementUIManager = {
	version: "0.0.1",

	options: {
		uiInformation: {}
	},

	_init: function () {
		
	},

	_create: function () {
		contextObject_TemplatePropertyElementUI = this;
		rootUI_TemplatePropertyElementUI = this.element;
		contextObject_TemplatePropertyElementUI._log(contextObject_TemplatePropertyElementUI.options.uiInformation);
		rootUI_TemplatePropertyElementUI.html("<section>" + $(contextObject_TemplatePropertyElementUI.options.uiInformation.uiXML[0]).find('DisplayName').text().split('|')[0].replace(';en', '') + "</section><div></div>");
		contextObject_TemplatePropertyElementUI._renderElement(contextObject_TemplatePropertyElementUI.options.uiInformation);
	},
	_renderElement: function (item) {
	    var targetDiv=rootUI_TemplatePropertyElementUI.find('div'),strHtml;
	    switch (item.type) {
	        case 'FileProperty':
	            var uid = "insm-range-spinner-" + Math.uuid(15);
	            strHtml = $('<div id="' + uid + '" />');
	            targetDiv.append(strHtml);
	            $("#" + uid).BrowserTool();
	            $("#" + uid).css("margin-left", "15px").css("margin-top", "5px");
	            break;
	        case 'RangeProperty':
	            strHtml = $('<select />').addClass('insm-playlist-manager-modified-ui-Property');
	            $.each($(item.uiXML).find('RealValues string'), function (index, itemdata) {
	                strHtml.append('<option value="' + $(itemdata).text() + '">' + $(itemdata).text() + '</option>');
	            });
	            targetDiv.append(strHtml);

	            break;
	        case 'IntegerProperty':
	            var uid = "insm-range-spinner-" + Math.uuid(15);
	            strHtml = $('<input type="text" id="' + uid + '" />').attr('name', 'value').addClass('insm-spinner-input');
	            targetDiv.append(strHtml);
	            var rangeSpinner = $("#" + uid).spinner();
	            rangeSpinner.spinner("value", Number(item.uiXML.find('Value').text()));
	            rangeSpinner.spinner("option", "min", Number(item.uiXML.find('MinimumValue').text()));
	            rangeSpinner.spinner("option", "max", Number(item.uiXML.find('MaximumValue').text()));
	            $(rangeSpinner).parent().parent().css("margin-left", "15px").css("margin-top", "5px");
	            break;
	        case 'TextProperty':
	            strHtml = $('<input type="text" />').addClass('insm-playlist-manager-modified-ui-Property');
	            targetDiv.append(strHtml);
	            break;
	        case 'ColorProperty':
	            var uid = "insm-color-property-" + Math.uuid(15);
	            strHtml = $('<span id="'+uid+'" />').addClass('insm-playlist-manager-modified-ui-Property');
	            targetDiv.append(strHtml);
	            $("#" + uid).colorPicker({ selectedcolor: item.uiXML.find('Value').text(), currentColorValue: item.uiXML.find('Value').text() });
	            break;
	        case 'ExtendedTextProperty':
	            var uid = "insm-extended-textProperty-" + Math.uuid(15);
	            if (rootUI_TemplatePropertyElementUI.find('section').text().indexOf('Info Area Text')!=-1) {
	                strHtml = $('<div id="' + uid + '" /><textarea class="insm-playlist-manager-modified-ui-textArea"></textarea>');
	            } else {
	                strHtml = $('<div id="' + uid + '" />');
	            }
	            
	            targetDiv.append(strHtml);
	            var sizeOption = [], styleOption=[];

	            $.each(item.uiXML.find('FontSizes').text().split(','), function (index, item) {
	                sizeOption.push({ name: item, value: index });
	            })

	            $.each(item.uiXML.find('Fonts').text().split(','), function (index, item) {
	                styleOption.push({ name: item, value: (index+1).toString() });
	            });

	            $("#" + uid).fontStyleTool({
	                role: "toolBar-"+Math.uuid(15),
	                bold: item.uiXML.find('FontBold').text() == 'False' ? 0 : 1,
	                italic: item.uiXML.find('FontItalic').text() == 'False' ? 0 : 1,
	                shadow: item.uiXML.find('DropShadow').text() == 'False' ? 0 : 1,
	                align: false,
	                styleOption: styleOption,
	                styleSelectedOption: item.uiXML.find('Font').text(),
	                sizeOption: sizeOption,
	                sizeSelectedOption: item.uiXML.find('FontSize').text(),
	                selectedColor: contextObject_TemplatePropertyElementUI._rgbToHex(item.uiXML.find('R').text(), item.uiXML.find('G').text(), item.uiXML.find('B').text())
	            });
	            $("#" + uid).css("margin-left", "15px").css("margin-top", "5px");
	            break;
	        case "DataGridProperty":
	            var uid = "insm-extended-gridProperty-" + Math.uuid(15);
	            strHtml = $('<span id="' + uid + '" />');
	            targetDiv.addClass("insm-playlist-manager-modified-ui-TableGrid");
	            targetDiv.append(strHtml);
	            $("#" + uid).tableGridUI({
	                xmldata: new XMLSerializer().serializeToString(item.uiXML[0]),
	                elementId: "-"+Math.uuid(15)
	            });
	            break;
	        case "RichTextProperty":
	            var uid = "insm-extended-richTextProperty-" + Math.uuid(15);
	            strHtml = $('<textarea id="' + uid + '" />').addClass("insm-playlist-manager-modified-ui-RichTextEditor");
	            targetDiv.append(strHtml);
	            break;
	    }
	},

	_componentToHex:function (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

	_rgbToHex:function (r, g, b) {
	    return "#" + contextObject_TemplatePropertyElementUI._componentToHex(r) + contextObject_TemplatePropertyElementUI._componentToHex(g) + contextObject_TemplatePropertyElementUI._componentToHex(b);
	},

	_destroy: function () {
		
	},

	_log: function (msg) {
	}
};

(function ($, undefined) {
	var contextObject_TemplatePropertyElementUI, rootUI_TemplatePropertyElementUI;
	$.widget("insm.TemplatePropertyElementUI", TemplatePropertyElementUIManager);
})(jQuery);