var PreviewUI = {
    version: "0.0.1",

    options: {
        filename: "",
        onStopAudio: null,
        onplay: null,
        ontimeupdate: null,
        player: {}
    },
    //Start rendering for plugin
    _init: function () {
        contextObjectPreview = this;
        rootUI_Preview = this.element;
    },

    //Call this function when initialize plugin
    _create: function () {

    },

    //Play Movie by this public function
    PreviewMoviePlay: function () {
        videoElement.get(0).play();
    },

    //Pause Movie by this public function
    PreviewMoviePause: function () {
        videoElement.get(0).pause();
    },

    //Stop Movie by this public function
    PreviewMovieStop: function () {
        videoElement.get(0).currentTime = 0;
        videoElement.get(0).pause();
    },

    //Start Movie by this public function
    previewMovie: function (url, message) {
        mediaType = 1;
        var loaderMessage = $("<div/>");
        loaderMessage.addClass("insm-playlist-manager-preview-loading-audio-text-position");
        loaderMessage.text(message);
        rootUI_Preview.html(loaderMessage);
        videoElement = $("<video />");
        videoElement.css("height", "100%");
        videoElement.css("width", "100%");
        videoElement.attr("preload", "auto");
        videoElement.attr("src", url);
        rootUI_Preview.append(videoElement);

        videoElement.get(0).ontimeupdate = function (e) {
            //var playdata = contextObjectPreview._convertSecondsInTotalDuration(videoElement.get(0).currentTime);
            var playdata = {
                current: contextObjectPreview._convertSecondsInTotalDuration(videoElement.get(0).currentTime),
                currentforslider: videoElement.get(0).currentTime
            };
            contextObjectPreview._trigger("ontimeupdate", e, playdata);
        }
        videoElement.get(0).onloadeddata = function (e) {
            var playdata = {
                total: contextObjectPreview._convertSecondsInTotalDuration(videoElement.get(0).duration),
                totalforslider: videoElement.get(0).duration
            };
            $(".insm-playlist-manager-preview-loading-audio-text-position").remove();
            contextObjectPreview._trigger("onplay", e, playdata);
            videoElement.get(0).play();
        };
        videoElement.get(0).error = function () {
            alert("some issue while play video");
        };
    },

    //Convert second in perticular format
    _convertSecondsInTotalDuration: function (timeInSeconds) {
        var sec_num = parseInt(timeInSeconds, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }

        var totalDurationTime = minutes + ':' + seconds;
        return totalDurationTime;
    },

    //Preview For Flash
    previewFlash: function (url, message) {
        mediaType = 0;
        var loaderMessage = $("<div/>");
        loaderMessage.addClass("insm-playlist-manager-preview-loading-media-position");
        loaderMessage.text(message);
        rootUI_Preview.html(loaderMessage);
    },

    //Play Music by this public function
    PreviewAudioPlay: function () {
        audioElement.get(0).play();
    },

    //Pause Music by this public function
    PreviewAudioPause: function () {
        try {
            audioElement.get(0).pause();
        } catch (e) {
            
        }
    },

    //Stop Music by this public function
    PreviewAudioStop: function () {
        audioElement.get(0).currentTime = 0;
        contextObjectPreview._trigger("onStopAudio");
    },

    //Start Music by this public function
    previewAudio: function (url, message) {
        mediaType = 2;
        var loaderMessage = $("<div/>");
        loaderMessage.addClass("insm-playlist-manager-preview-loading-audio-text-position");
        loaderMessage.text(message);
        rootUI_Preview.html(loaderMessage);
        audioElement = $("<audio />");
        audioElement.attr("src", url);
        audioElement.attr("autoplay", "autoplay");
        rootUI_Preview.append(audioElement);

        audioElement.get(0).ontimeupdate = function (e) {
            var playdata = {
                current: contextObjectPreview._convertSecondsInTotalDuration(audioElement.get(0).currentTime),
                currentforslider: audioElement.get(0).currentTime
            };

            contextObjectPreview._trigger("ontimeupdate", e, playdata);
        }
        audioElement.on("canplay", function (e) {
            var playdata = {
                total: contextObjectPreview._convertSecondsInTotalDuration(audioElement.get(0).duration),
                totalforslider: audioElement.get(0).duration
            };
            audioElement.get(0).play();
            contextObjectPreview._trigger("onplay", e, playdata);
            $(".insm-playlist-manager-preview-loading-audio-text-position").remove();
        });
        audioElement.on("error", function () {
            alert("some issue while play audio");
        });

    },

    //Get Current Media type
    getCurrentMediaType: function () {
        return mediaType;
    },

    //Preview image by this public function
    previewImage: function (url, filename) {
        mediaType = 0;
        var loaderMessage = $("<div/>");
        loaderMessage.addClass("insm-playlist-manager-preview-loading-media-position insm-playlist-manager-preview-loading-text");
        loaderMessage.text(filename);
        rootUI_Preview.html(loaderMessage);
      
        var img = $("<img />");
        img.attr("src", url);
        img.css("display", "none");

        img.on("load", function (e) {
            img.css("display", "");
            rootUI_Preview.append(img);
            rootUI_Preview.addClass('insm-playlist-manager-preview-loading-media-position-new');
            rootUI_Preview.css("background-image", 'url(' + url + ')');
            
            if (img.width() > rootUI_Preview.width()) {
                rootUI_Preview.css("background-size", 'contain');
            } else {
                var size = img.width() + 'px ' + img.height() + 'px';
                rootUI_Preview.css("background-size", size);
            }
            img.css("display", "none");
            loaderMessage.css("display", "none");
        });
    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI_Preview.empty();
    },

    //Trace on cosole window
    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    var contextObjectPreview, rootUI_Preview;
    var audioElement, videoElement,mediaType;
    $.widget("insm.previewUI", PreviewUI);
})(jQuery);