/*
* INSM Flip
* This file contain the INSM Flip function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFlip(options);
*
* Author:
* Guo Yang
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmLogin');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({

                    }, options),
                    htmlElements: {
                        container: $('<div />').addClass('insm-login-container'),
                        backdrop: $('<div />').addClass('backdrop solid'),
                        content: $('<div />').addClass('content'),
                        usernameInput : $('<input class="username" type="text" name="username" />'),
                        passwordInput : $('<input class="password" type="password" name="password" />'),
                        loginButton : $('<button />').text('Login'),
                        submitButton : $('<input class="hidden" type="submit" />'),
                        loginForm: $('<div />').addClass('inputFields'),
                        info: $('<h3 />'),
                        applicationName: $('<h5 />'),
                        insmLoginForm:$('<div class="insmLoginForm" />')
                    },
                    data: {
                        loginInProgress: false,
                        successCallbacks: []
                    }
                };

                $this.data('insmLogin', _plugin);

                _plugin.htmlElements.loginForm.append(
                    $('<div />').addClass('row').append(
                        $('<label />').text('Username'),
                        _plugin.htmlElements.usernameInput
                    ),
                    $('<div />').addClass('row').append(
                        $('<label />').text('Password'),
                        _plugin.htmlElements.passwordInput
                    )
                );
                _plugin.htmlElements.insmLoginForm.append(
                    $('<div />').addClass('header').append(
                        $('<div />').addClass('logo'),
                        $('<h2 />').text('Login'),
                        _plugin.htmlElements.info
                    ),
                    _plugin.htmlElements.loginForm,
                    $('<div />').addClass('footer').append(
                        _plugin.htmlElements.submitButton,
                        _plugin.htmlElements.loginButton,
                        _plugin.htmlElements.applicationName
                    )
                );
                _plugin.htmlElements.usernameInput.keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        _plugin.htmlElements.loginButton.trigger('click');
                        return false;
                    }
                    return true;
                });
                _plugin.htmlElements.passwordInput.keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        _plugin.htmlElements.loginButton.trigger('click');
                        return false;
                    }
                    return true;
                });

                _plugin.htmlElements.loginButton.click(function () {
                    _plugin.htmlElements.submitButton.trigger('submit');
                });


                _plugin.htmlElements.submitButton.submit(function () {
                    _plugin.htmlElements.loginButton.attr('disabled', 'disabled');
                    _plugin.htmlElements.usernameInput.attr('disabled', 'disabled');
                    _plugin.htmlElements.passwordInput.attr('disabled', 'disabled');

                    $.insmFramework('login', {
                        username: _plugin.htmlElements.usernameInput.val(),
                        password: _plugin.htmlElements.passwordInput.val(),
                        success: function () {
                            $.insmLogin('close');
                            // TODO: Fetch everything in an success array and while it until empty.
                            while (_plugin.data.successCallbacks.length > 0) {
                                _plugin.data.successCallbacks[0]();
                                _plugin.data.successCallbacks.shift();
                            }
                            _plugin.htmlElements.usernameInput.val('');
                            _plugin.htmlElements.passwordInput.val('');
                            _plugin.htmlElements.loginButton.removeAttr('disabled');
                            _plugin.htmlElements.usernameInput.removeAttr('disabled');
                            _plugin.htmlElements.passwordInput.removeAttr('disabled');
                            _plugin.data.loginInProgress = false;
                        },
                        denied: function () {
                            _plugin.htmlElements.usernameInput.insmHighlight({
                                type: 'error'
                            });
                            _plugin.htmlElements.passwordInput.val('').insmHighlight({
                                type: 'error'
                            });
                            _plugin.htmlElements.loginButton.removeAttr('disabled');
                            _plugin.htmlElements.usernameInput.removeAttr('disabled');
                            _plugin.htmlElements.passwordInput.removeAttr('disabled');
                        }
                    });
                });


                _plugin.htmlElements.container.append(
                    _plugin.htmlElements.backdrop,
                    _plugin.htmlElements.content.append(
                        _plugin.htmlElements.insmLoginForm
                    )
                );

                var systemInfo = $.insmFramework('getSystemInformation');
                _plugin.htmlElements.info.text(systemInfo.type + ' ' + systemInfo.target + ' ' + systemInfo.version);

                _plugin.htmlElements.applicationName.text(systemInfo.application.name + ' ' + systemInfo.application.version);
            };

            _plugin.data.successCallbacks.push(options.success);

            if (_plugin.data.loginInProgress) {
                return $;
            }
            _plugin.data.loginInProgress = true;

                
            $this.append(_plugin.htmlElements.container);

            return $;
        },
        close: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmLogin');

            _plugin.htmlElements.container.detach();

            return $;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmLogin');

            if (_plugin) {
                $this.data('insmLogin', null);
            }
           // $this.children().detach();
            return $;
        }
    };
     
    $.insmLogin = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmLogin');
        }
    };
})(jQuery);