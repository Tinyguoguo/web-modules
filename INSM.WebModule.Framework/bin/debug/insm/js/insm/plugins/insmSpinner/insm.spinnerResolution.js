var SpinnerUIManager = {
    version: "0.0.1",

    options: {
        selectTemplate: null,
    },

    _create: function () {
    },
    
    //Intialization of this plugin
    _init: function () {
        contextObjectOfSpinner = this;
        rootUI_spinner = this.element;
        //Generation of HTML 
        var selectHtml = '';
        selectHtml += '<select id="insm-resolution-dropdown">';
        $.each(this.options.selectTemplate, function (data, items) {
            selectHtml += '<option value=' + items.value + '>' + items.name + '</option>';
        });
        selectHtml += '</select>';
        rootUI_spinner.append(selectHtml);
        //
        $("#insm-resolution-info").text("Landscape");
        //Set Width of spinner
        spinnerLandscape = $("#insm-spinner-landscape").spinner();
        $(".insm-spinner-div").closest().parent('.ui-spinner').append(spinnerLandscape);
        spinnerLandscape.spinner("value", 1920);
        spinnerLandscape.spinner("option", "min", 0);
        spinnerLandscape.spinner("option", "max", 9999);
        SpinnerUIManager._getSpinnerWidthValue();
        //Set Height of spinner
        spinnerPortrait = $("#insm-spinner-portrait").spinner();
        $(".insm-spinner-div").closest().parent('.ui-spinner').append(spinnerPortrait);
        spinnerPortrait.spinner("value", 1080);
        spinnerPortrait.spinner("option", "min", 0);
        spinnerPortrait.spinner("option", "max", 9999);
        SpinnerUIManager._getSpinnerHeightValue();

        //Change event ot spinner dropdwon list
        $("#insm-resolutionFilter").change(function () {
            selectedResolutionValue = $('option:selected', this).val();
            switch (selectedResolutionValue) {
                case '1':
                    $("#insm-spinner-landscape").spinner("value", 1920);
                    $("#insm-spinner-portrait").spinner("value", 1080);
                    break;
                case '2':
                    $("#insm-spinner-landscape").spinner("value", 1080);
                    $("#insm-spinner-portrait").spinner("value", 1920);
                    break;
                case '3':
                    $("#insm-spinner-landscape").spinner("value", 1360);
                    $("#insm-spinner-portrait").spinner("value", 768);
                    break;
                case '4':
                    $("#insm-spinner-landscape").spinner("value", 768);
                    $("#insm-spinner-portrait").spinner("value", 1360);
                    break;
            }
        });
    },
    // Get spinner width value on mousewheel or change event
    _getSpinnerWidthValue: function () {
        $("#insm-spinner-landscape").spinner({
            spin: function (event) {
                SpinnerUIManager._setComboBoxValueAsPerSpinner();
            },
            change: function (event) {
                SpinnerUIManager._setComboBoxValueAsPerSpinner();
            }
        });
    },
    // Get spinner height value on mousewheel or change event
    _getSpinnerHeightValue: function () {
        $("#insm-spinner-portrait").spinner({
            spin: function (event) {
                SpinnerUIManager._setComboBoxValueAsPerSpinner();
            },
            change: function (event) {
                SpinnerUIManager._setComboBoxValueAsPerSpinner();
            }
        });
    },
    //Set Value in dropdown list as per spinner value
    _setComboBoxValueAsPerSpinner: function () {
        currentWidth = $("#insm-spinner-landscape").spinner("value");
        currentHeight = $("#insm-spinner-portrait").spinner("value");

        setResolution = currentWidth + 'X' + currentHeight;
        var fixresolution = false;

        $('#insm-resolutionFilter option').filter(function () {
            if ($(this).text() == setResolution) {
                $(this).attr('selected', 'selected');
                fixresolution = true;
            }
        });
        if (!fixresolution) {
            $('#insm-resolutionFilter option[value=5]').text('Custom');
            $('#insm-resolutionFilter option').filter(function () {
                if ($(this).text() == 'Custom') {
                    $(this).attr('selected', 'selected');
                }
            });
        }
        if (currentWidth > currentHeight) {
            $("#insm-resolution-info").text("Landscape");
        } else {
            $("#insm-resolution-info").text("Portrait");
        }
    },
    // Create json data to send set value for further process
    sendResolutionValue: function (jsonObj) {
        SpinnerUIManager._setComboBoxValueAsPerSpinner();
        var selectedDDValue = $("#insm-resolution-dropdown option:selected").text();
        var resolutionType = $("#insm-resolution-info").text();

        if (setResolution == selectedDDValue) {
            selectedDDValue = selectedDDValue;
        } else {
            selectedDDValue = setResolution;
        }
        var jsonObj = new Object();
        jsonObj.resolutionValue = selectedDDValue;
        jsonObj.resolutionType = resolutionType;
        $.data(document, "resolutionInfo", jsonObj);
        return jsonObj;
    },
    
    //Destroy this plugin
    _destroy: function () {
        rootUI_spinner.empty();
    },
};

(function ($, undefined) {
    var contextObjectOfSpinner, rootUI_spinner, spinnerPortrait, spinnerLandscape, getSpinValue, currentWidth, currentHeight, selectedResolutionValue, setResolution;
    $.widget("insm.insmSpinnerResolution", SpinnerUIManager);
})(jQuery);
