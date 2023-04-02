/*! jquery.cookie v1.4.1 | MIT */ ! function(a) { "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? a(require("jquery")) : a(jQuery) }(function(a) {
    function b(a) { return h.raw ? a : encodeURIComponent(a) }

    function c(a) { return h.raw ? a : decodeURIComponent(a) }

    function d(a) { return b(h.json ? JSON.stringify(a) : String(a)) }

    function e(a) { 0 === a.indexOf('"') && (a = a.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\")); try { return a = decodeURIComponent(a.replace(g, " ")), h.json ? JSON.parse(a) : a } catch (b) {} }

    function f(b, c) { var d = h.raw ? b : e(b); return a.isFunction(c) ? c(d) : d }
    var g = /\+/g,
        h = a.cookie = function(e, g, i) {
            if (void 0 !== g && !a.isFunction(g)) {
                if (i = a.extend({}, h.defaults, i), "number" == typeof i.expires) {
                    var j = i.expires,
                        k = i.expires = new Date;
                    k.setTime(+k + 864e5 * j)
                }
                return document.cookie = [b(e), "=", d(g), i.expires ? "; expires=" + i.expires.toUTCString() : "", i.path ? "; path=" + i.path : "", i.domain ? "; domain=" + i.domain : "", i.secure ? "; secure" : ""].join("")
            }
            for (var l = e ? void 0 : {}, m = document.cookie ? document.cookie.split("; ") : [], n = 0, o = m.length; o > n; n++) {
                var p = m[n].split("="),
                    q = c(p.shift()),
                    r = p.join("=");
                if (e && e === q) { l = f(r, g); break }
                e || void 0 === (r = f(r)) || (l[q] = r)
            }
            return l
        };
    h.defaults = {}, a.removeCookie = function(b, c) { return void 0 === a.cookie(b) ? !1 : (a.cookie(b, "", a.extend({}, c, { expires: -1 })), !a.cookie(b)) }
});

/*! jQuery Validation Plugin - v1.10.0 - 9/7/2012
 * https://github.com/jzaefferer/jquery-validation
 * Copyright (c) 2012 JÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rn Zaefferer; Licensed MIT, GPL */

(function($) {

    $.extend($.fn, {
        // http://docs.jquery.com/Plugins/Validation/validate
        validate: function(options) {

            // if nothing is selected, return nothing; can't chain anyway
            if (!this.length) {
                if (options && options.debug && window.console) {
                    console.warn("nothing selected, can't validate, returning nothing");
                }
                return;
            }

            // check if a validator for this form was already created
            var validator = $.data(this[0], 'validator');
            if (validator) {
                return validator;
            }

            // Add novalidate tag if HTML5.
            this.attr('novalidate', 'novalidate');

            validator = new $.validator(options, this[0]);
            $.data(this[0], 'validator', validator);

            if (validator.settings.onsubmit) {

                this.validateDelegate(":submit", "click", function(ev) {
                    if (validator.settings.submitHandler) {
                        validator.submitButton = ev.target;
                    }
                    // allow suppressing validation by adding a cancel class to the submit button
                    if ($(ev.target).hasClass('cancel')) {
                        validator.cancelSubmit = true;
                    }
                });

                // validate the form on submit
                this.submit(function(event) {
                    if (validator.settings.debug) {
                        // prevent form submit to be able to see console output
                        event.preventDefault();
                    }

                    function handle() {
                        var hidden;
                        if (validator.settings.submitHandler) {
                            if (validator.submitButton) {
                                // insert a hidden input as a replacement for the missing submit button
                                hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
                            }
                            validator.settings.submitHandler.call(validator, validator.currentForm, event);
                            if (validator.submitButton) {
                                // and clean up afterwards; thanks to no-block-scope, hidden can be referenced
                                hidden.remove();
                            }
                            return false;
                        }
                        return true;
                    }

                    // prevent submit for invalid forms or custom submit handlers
                    if (validator.cancelSubmit) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if (validator.form()) {
                        if (validator.pendingRequest) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }

            return validator;
        },
        // http://docs.jquery.com/Plugins/Validation/valid
        valid: function() {
            if ($(this[0]).is('form')) {
                return this.validate().form();
            } else {
                var valid = true;
                var validator = $(this[0].form).validate();
                this.each(function() {
                    valid &= validator.element(this);
                });
                return valid;
            }
        },
        // attributes: space seperated list of attributes to retrieve and remove
        removeAttrs: function(attributes) {
            var result = {},
                $element = this;
            $.each(attributes.split(/\s/), function(index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        },
        // http://docs.jquery.com/Plugins/Validation/rules
        rules: function(command, argument) {
            var element = this[0];

            if (command) {
                var settings = $.data(element.form, 'validator').settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch (command) {
                    case "add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        staticRules[element.name] = existingRules;
                        if (argument.messages) {
                            settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                        }
                        break;
                    case "remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        var filtered = {};
                        $.each(argument.split(/\s/), function(index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                        });
                        return filtered;
                }
            }

            var data = $.validator.normalizeRules($.extend({}, $.validator.metadataRules(element), $.validator.classRules(element), $.validator.attributeRules(element), $.validator.staticRules(element)), element);

            // make sure required is at front
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({
                    required: param
                }, data);
            }

            return data;
        }
    });

    // Custom selectors
    $.extend($.expr[":"], {
        // http://docs.jquery.com/Plugins/Validation/blank
        blank: function(a) {
            return !$.trim("" + a.value);
        },
        // http://docs.jquery.com/Plugins/Validation/filled
        filled: function(a) {
            return !!$.trim("" + a.value);
        },
        // http://docs.jquery.com/Plugins/Validation/unchecked
        unchecked: function(a) {
            return !a.checked;
        }
    });

    // constructor for validator
    $.validator = function(options, form) {
        this.settings = $.extend(true, {}, $.validator.defaults, options);
        this.currentForm = form;
        this.init();
    };

    $.validator.format = function(source, params) {
        if (arguments.length === 1) {
            return function() {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply(this, args);
            };
        }
        if (arguments.length > 2 && params.constructor !== Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor !== Array) {
            params = [params];
        }
        $.each(params, function(i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };

    $.extend($.validator, {

        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: ":hidden",
            ignoreTitle: false,
            onfocusin: function(element, event) {
                this.lastActive = element;

                // hide error label and remove error class on focus if enabled
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    if (this.settings.unhighlight) {
                        this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.addWrapper(this.errorsFor(element)).hide();
                }
            },
            onfocusout: function(element, event) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                    this.element(element);
                }
            },
            onkeyup: function(element, event) {
                if (event.which === 9 && this.elementValue(element) === '') {
                    return;
                } else if (element.name in this.submitted || element === this.lastActive) {
                    this.element(element);
                }
            },
            onclick: function(element, event) {
                // click on selects, radiobuttons and checkboxes
                if (element.name in this.submitted) {
                    this.element(element);
                }
                // or option elements, check parent select in that case
                else if (element.parentNode.name in this.submitted) {
                    this.element(element.parentNode);
                }
            },
            highlight: function(element, errorClass, validClass) {
                if (element.type === 'radio') {
                    this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                } else {
                    $(element).addClass(errorClass).removeClass(validClass);
                }
            },
            unhighlight: function(element, errorClass, validClass) {
                if (element.type === 'radio') {
                    this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                } else {
                    $(element).removeClass(errorClass).addClass(validClass);
                }
            }
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
        setDefaults: function(settings) {
            $.extend($.validator.defaults, settings);
        },

        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: $.validator.format("Please enter no more than {0} characters."),
            minlength: $.validator.format("Please enter at least {0} characters."),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
            range: $.validator.format("Please enter a value between {0} and {1}."),
            max: $.validator.format("Please enter a value less than or equal to {0}."),
            min: $.validator.format("Please enter a value greater than or equal to {0}.")
        },

        autoCreateRanges: false,

        prototype: {

            init: function() {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();

                var groups = (this.groups = {});
                $.each(this.settings.groups, function(key, value) {
                    $.each(value.split(/\s/), function(index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function(key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator"),
                        eventType = "on" + event.type.replace(/^validate/, "");
                    if (validator.settings[eventType]) {
                        validator.settings[eventType].call(validator, this[0], event);
                    }
                }


                $(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, " + "[type='number'], [type='search'] ,[type='tel'], [type='url'], " + "[type='email'], [type='datetime'], [type='date'], [type='month'], " + "[type='week'], [type='time'], [type='datetime-local'], " + "[type='range'], [type='color'] ", "focusin focusout keyup", delegate).validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

                if (this.settings.invalidHandler) {
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/form
            form: function() {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid()) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
                this.showErrors();
                return this.valid();
            },

            checkForm: function() {
                this.prepareForm();
                for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                    this.check(elements[i]);
                }
                return this.valid();
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/element
            element: function(element) {
                element = this.validationTargetFor(this.clean(element));
                this.lastElement = element;
                this.prepareElement(element);
                this.currentElements = $(element);
                var result = this.check(element) !== false;
                if (result) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if (!this.numberOfInvalids()) {
                    // Hide error containers on last error
                    this.toHide = this.toHide.add(this.containers);
                }
                this.showErrors();
                return result;
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/showErrors
            showErrors: function(errors) {
                if (errors) {
                    // add items to error list and map
                    $.extend(this.errorMap, errors);
                    this.errorList = [];
                    for (var name in errors) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    // remove items from success list
                    this.successList = $.grep(this.successList, function(element) {
                        return !(element.name in errors);
                    });
                }
                if (this.settings.showErrors) {
                    this.settings.showErrors.call(this, this.errorMap, this.errorList);
                } else {
                    this.defaultShowErrors();
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/resetForm
            resetForm: function() {
                if ($.fn.resetForm) {
                    $(this.currentForm).resetForm();
                }
                this.submitted = {};
                this.lastElement = null;
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass).removeData("previousValue");
            },

            numberOfInvalids: function() {
                return this.objectLength(this.invalid);
            },

            objectLength: function(obj) {
                var count = 0;
                for (var i in obj) {
                    count++;
                }
                return count;
            },

            hideErrors: function() {
                this.addWrapper(this.toHide).hide();
            },

            valid: function() {
                return this.size() === 0;
            },

            size: function() {
                return this.errorList.length;
            },

            focusInvalid: function() {
                if (this.settings.focusInvalid) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus()
                            // manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
                            .trigger("focusin");
                    } catch (e) {
                        // ignore IE throwing errors when focusing hidden elements
                    }
                }
            },

            findLastActive: function() {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function(n) {
                    return n.element.name === lastActive.name;
                }).length === 1 && lastActive;
            },

            elements: function() {
                var validator = this,
                    rulesCache = {};

                // select all valid inputs inside the form (no submit or reset buttons)
                return $(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function() {
                    if (!this.name && validator.settings.debug && window.console) {
                        console.error("%o has no name assigned", this);
                    }

                    // select only the first element for each name, and only those with rules specified
                    if (this.name in rulesCache || !validator.objectLength($(this).rules())) {
                        return false;
                    }

                    rulesCache[this.name] = true;
                    return true;
                });
            },

            clean: function(selector) {
                return $(selector)[0];
            },

            errors: function() {
                var errorClass = this.settings.errorClass.replace(' ', '.');
                return $(this.settings.errorElement + "." + errorClass, this.errorContext);
            },

            reset: function() {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.currentElements = $([]);
            },

            prepareForm: function() {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            },

            prepareElement: function(element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },

            elementValue: function(element) {
                var type = $(element).attr('type'),
                    val = $(element).val();

                if (type === 'radio' || type === 'checkbox') {
                    return $('input[name="' + $(element).attr('name') + '"]:checked').val();
                }

                if (typeof val === 'string') {
                    return val.replace(/\r/g, "");
                }
                return val;
            },

            check: function(element) {
                element = this.validationTargetFor(this.clean(element));

                var rules = $(element).rules();
                var dependencyMismatch = false;
                var val = this.elementValue(element);
                var result;

                for (var method in rules) {
                    var rule = {
                        method: method,
                        parameters: rules[method]
                    };
                    try {

                        result = $.validator.methods[method].call(this, val, element, rule.parameters);

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if (result === "dependency-mismatch") {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if (result === "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }

                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        if (this.settings.debug && window.console) {
                            console.log("exception occured when checking element " + element.id + ", check the '" + rule.method + "' method", e);
                        }
                        throw e;
                    }
                }
                if (dependencyMismatch) {
                    return;
                }
                if (this.objectLength(rules)) {
                    this.successList.push(element);
                }
                return true;
            },

            // return the custom message for the given element and validation method
            // specified in the element's "messages" metadata
            customMetaMessage: function(element, method) {
                if (!$.metadata) {
                    return;
                }
                var meta = this.settings.meta ? $(element).metadata()[this.settings.meta] : $(element).metadata();
                return meta && meta.messages && meta.messages[method];
            },

            // return the custom message for the given element and validation method
            // specified in the element's HTML5 data attribute
            customDataMessage: function(element, method) {
                return $(element).data('msg-' + method.toLowerCase()) || (element.attributes && $(element).attr('data-msg-' + method.toLowerCase()));
            },

            // return the custom message for the given element name and validation method
            customMessage: function(name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor === String ? m : m[method]);
            },

            // return the first defined argument, allowing empty strings
            findDefined: function() {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        return arguments[i];
                    }
                }
                return undefined;
            },

            defaultMessage: function(element, method) {
                return this.findDefined(this.customMessage(element.name, method), this.customDataMessage(element, method), this.customMetaMessage(element, method),
                    // title is never undefined, so handle empty string as undefined
                    !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[method], "<strong>Warning: No message defined for " + element.name + "</strong>");
            },

            formatAndAdd: function(element, rule) {
                var message = this.defaultMessage(element, rule.method),
                    theregex = /\$?\{(\d+)\}/g;
                if (typeof message === "function") {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, '{$1}'), rule.parameters);
                }
                this.errorList.push({
                    message: message,
                    element: element
                });

                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },

            addWrapper: function(toToggle) {
                if (this.settings.wrapper) {
                    toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
                }
                return toToggle;
            },

            defaultShowErrors: function() {
                var i, elements;
                for (i = 0; this.errorList[i]; i++) {
                    var error = this.errorList[i];
                    if (this.settings.highlight) {
                        this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    for (i = 0; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    for (i = 0, elements = this.validElements(); elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            },

            validElements: function() {
                return this.currentElements.not(this.invalidElements());
            },

            invalidElements: function() {
                return $(this.errorList).map(function() {
                    return this.element;
                });
            },

            showLabel: function(element, message) {
                var label = this.errorsFor(element);
                if (label.length) {
                    // refresh error/success class
                    label.removeClass(this.settings.validClass).addClass(this.settings.errorClass);

                    // check if we have a generated label, replace the message then
                    if (label.attr("generated")) {
                        label.html(message);
                    }
                } else {
                    // create label
                    label = $("<" + this.settings.errorElement + "/>").attr({
                        "for": this.idOrName(element),
                        generated: true
                    }).addClass(this.settings.errorClass).html(message || "");
                    if (this.settings.wrapper) {
                        // make sure the element is visible, even in IE
                        // actually showing the wrapped element is handled elsewhere
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (!this.labelContainer.append(label).length) {
                        if (this.settings.errorPlacement) {
                            this.settings.errorPlacement(label, $(element));
                        } else {
                            label.insertAfter(element);
                        }
                    }
                }
                if (!message && this.settings.success) {
                    label.text("");
                    if (typeof this.settings.success === "string") {
                        label.addClass(this.settings.success);
                    } else {
                        this.settings.success(label, element);
                    }
                }
                this.toShow = this.toShow.add(label);
            },

            errorsFor: function(element) {
                var name = this.idOrName(element);
                return this.errors().filter(function() {
                    return $(this).attr('for') === name;
                });
            },

            idOrName: function(element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },

            validationTargetFor: function(element) {
                // if radio/checkbox, validate first element in group instead
                if (this.checkable(element)) {
                    element = this.findByName(element.name).not(this.settings.ignore)[0];
                }
                return element;
            },

            checkable: function(element) {
                return (/radio|checkbox/i).test(element.type);
            },

            findByName: function(name) {
                return $(this.currentForm).find('[name="' + name + '"]');
            },

            getLength: function(value, element) {
                switch (element.nodeName.toLowerCase()) {
                    case 'select':
                        return $("option:selected", element).length;
                    case 'input':
                        if (this.checkable(element)) {
                            return this.findByName(element.name).filter(':checked').length;
                        }
                }
                return value.length;
            },

            depend: function(param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            },

            dependTypes: {
                "boolean": function(param, element) {
                    return param;
                },
                "string": function(param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function(param, element) {
                    return param(element);
                }
            },

            optional: function(element) {
                var val = this.elementValue(element);
                return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
            },

            startRequest: function(element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },

            stopRequest: function(element, valid) {
                this.pendingRequest--;
                // sometimes synchronization fails, make sure pendingRequest is never < 0
                if (this.pendingRequest < 0) {
                    this.pendingRequest = 0;
                }
                delete this.pending[element.name];
                if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                    this.formSubmitted = false;
                } else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false;
                }
            },

            previousValue: function(element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, "remote")
                });
            }
        },

        classRuleSettings: {
            required: {
                required: true
            },
            email: {
                email: true
            },
            url: {
                url: true
            },
            date: {
                date: true
            },
            dateISO: {
                dateISO: true
            },
            number: {
                number: true
            },
            digits: {
                digits: true
            },
            creditcard: {
                creditcard: true
            }
        },

        addClassRules: function(className, rules) {
            if (className.constructor === String) {
                this.classRuleSettings[className] = rules;
            } else {
                $.extend(this.classRuleSettings, className);
            }
        },

        classRules: function(element) {
            var rules = {};
            var classes = $(element).attr('class');
            if (classes) {
                $.each(classes.split(' '), function() {
                    if (this in $.validator.classRuleSettings) {
                        $.extend(rules, $.validator.classRuleSettings[this]);
                    }
                });
            }
            return rules;
        },

        attributeRules: function(element) {
            var rules = {};
            var $element = $(element);

            for (var method in $.validator.methods) {
                var value;

                // support for <input required> in both html5 and older browsers
                if (method === 'required') {
                    value = $element.get(0).getAttribute(method);
                    // Some browsers return an empty string for the required attribute
                    // and non-HTML5 browsers might have required="" markup
                    if (value === "") {
                        value = true;
                    }
                    // force non-HTML5 browsers to return bool
                    value = !!value;
                } else {
                    value = $element.attr(method);
                }

                if (value) {
                    rules[method] = value;
                } else if ($element[0].getAttribute("type") === method) {
                    rules[method] = true;
                }
            }

            // maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }

            return rules;
        },

        metadataRules: function(element) {
            if (!$.metadata) {
                return {};
            }

            var meta = $.data(element.form, 'validator').settings.meta;
            return meta ? $(element).metadata()[meta] : $(element).metadata();
        },

        staticRules: function(element) {
            var rules = {};
            var validator = $.data(element.form, 'validator');
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },

        normalizeRules: function(rules, element) {
            // handle dependency check
            $.each(rules, function(prop, val) {
                // ignore rule when param is explicitly false, eg. required:false
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case "string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });

            // evaluate parameters
            $.each(rules, function(rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });

            // clean number parameters
            $.each(['minlength', 'maxlength', 'min', 'max'], function() {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength', 'range'], function() {
                if (rules[this]) {
                    rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                }
            });

            if ($.validator.autoCreateRanges) {
                // auto-create ranges
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }

            // To support custom messages in metadata ignore rule methods titled "messages"
            if (rules.messages) {
                delete rules.messages;
            }

            return rules;
        },

        // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
        normalizeRule: function(data) {
            if (typeof data === "string") {
                var transformed = {};
                $.each(data.split(/\s/), function() {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/addMethod
        addMethod: function(name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },

        methods: {

            // http://docs.jquery.com/Plugins/Validation/Methods/required
            required: function(value, element, param) {
                // check if dependency is met
                if (!this.depend(param, element)) {
                    return "dependency-mismatch";
                }
                if (element.nodeName.toLowerCase() === "select") {
                    // could be an array for select-multiple or a string, both are fine this way
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                if (this.checkable(element)) {
                    return this.getLength(value, element) > 0;
                }
                return $.trim(value).length > 0;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/remote
            remote: function(value, element, param) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }

                var previous = this.previousValue(element);
                if (!this.settings.messages[element.name]) {
                    this.settings.messages[element.name] = {};
                }
                previous.originalMessage = this.settings.messages[element.name].remote;
                this.settings.messages[element.name].remote = previous.message;

                param = typeof param === "string" && {
                    url: param
                } || param;

                if (this.pending[element.name]) {
                    return "pending";
                }
                if (previous.old === value) {
                    return previous.valid;
                }

                previous.old = value;
                var validator = this;
                this.startRequest(element);
                var data = {};
                data[element.name] = value;
                $.ajax($.extend(true, {
                    url: param,
                    mode: "abort",
                    port: "validate" + element.name,
                    dataType: "json",
                    data: data,
                    success: function(response) {
                        validator.settings.messages[element.name].remote = previous.originalMessage;
                        var valid = response === true || response === "true";
                        if (valid) {
                            var submitted = validator.formSubmitted;
                            validator.prepareElement(element);
                            validator.formSubmitted = submitted;
                            validator.successList.push(element);
                            delete validator.invalid[element.name];
                            validator.showErrors();
                        } else {
                            var errors = {};
                            var message = response || validator.defaultMessage(element, "remote");
                            errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                            validator.invalid[element.name] = true;
                            validator.showErrors(errors);
                        }
                        previous.valid = valid;
                        validator.stopRequest(element, valid);
                    }
                }, param));
                return "pending";
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/minlength
            minlength: function(value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length >= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/maxlength
            maxlength: function(value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length <= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/rangelength
            rangelength: function(value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || (length >= param[0] && length <= param[1]);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/min
            min: function(value, element, param) {
                return this.optional(element) || value >= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/max
            max: function(value, element, param) {
                return this.optional(element) || value <= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/range
            range: function(value, element, param) {
                return this.optional(element) || (value >= param[0] && value <= param[1]);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/email
            email: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/url
            url: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/date
            date: function(value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
            dateISO: function(value, element) {
                return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/number
            number: function(value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/digits
            digits: function(value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
            // based on http://en.wikipedia.org/wiki/Luhn
            creditcard: function(value, element) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                // accept only spaces, digits and dashes
                if (/[^0-9 \-]+/.test(value)) {
                    return false;
                }
                var nCheck = 0,
                    nDigit = 0,
                    bEven = false;

                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9) {
                            nDigit -= 9;
                        }
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) === 0;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
            equalTo: function(value, element, param) {
                // bind to the blur event of the target in order to revalidate whenever the target field is updated
                // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
                var target = $(param);
                if (this.settings.onfocusout) {
                    target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
                        $(element).valid();
                    });
                }
                return value === target.val();
            }
        }

    });

    // deprecated, use $.validator.format instead
    $.format = $.validator.format;

}(jQuery));

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
(function($) {
    var pendingRequests = {};
    // Use a prefilter if available (1.5+)
    if ($.ajaxPrefilter) {
        $.ajaxPrefilter(function(settings, _, xhr) {
            var port = settings.port;
            if (settings.mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = xhr;
            }
        });
    } else {
        // Proxy ajax
        var ajax = $.ajax;
        $.ajax = function(settings) {
            var mode = ("mode" in settings ? settings : $.ajaxSettings).mode,
                port = ("port" in settings ? settings : $.ajaxSettings).port;
            if (mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                return (pendingRequests[port] = ajax.apply(this, arguments));
            }
            return ajax.apply(this, arguments);
        };
    }
}(jQuery));

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
(function($) {
    // only implement if not provided by jQuery core (since 1.4)
    // TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
    if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
        $.each({
            focus: 'focusin',
            blur: 'focusout'
        }, function(original, fix) {
            $.event.special[fix] = {
                setup: function() {
                    this.addEventListener(original, handler, true);
                },
                teardown: function() {
                    this.removeEventListener(original, handler, true);
                },
                handler: function(e) {
                    var args = arguments;
                    args[0] = $.event.fix(e);
                    args[0].type = fix;
                    return $.event.handle.apply(this, args);
                }
            };

            function handler(e) {
                e = $.event.fix(e);
                e.type = fix;
                return $.event.handle.call(this, e);
            }

        });
    }
    $.extend($.fn, {
        validateDelegate: function(delegate, type, handler) {
            return this.bind(type, function(event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        }
    });
}(jQuery));

// Mailing list js
var activeSignUpForm;
/*Default callback function /*DO NOT DISTURB*/
function signupFormCallback(data) {
    activeSignUpForm.signupFormCallback(data);
}(function($) {
    /* Mailing list plugin default configuration options*/
    /* overwrite while 'init' the plugin if needed */
    /* ensure the object properties are matched as below */
    var defaults = {
        containers: {
            ajaxLoaderField: '#ajaxLoader',
            serverErrorMessageField: '#serverError',
            validationErrorMessageField: '#errorMsg',
            labelcheckbox: '.secondary-list-values .global-list-checkbox',
            thankYouMessageField: '#thankyouBlock',
        },
        exactTargetSignupUrl: "https://signup.wmg.com/register",
        /*Exact target default values - All the hardcoded exact target values list here*/
        newsLetterConfigValues: [{
            "newsletterId": ''
        }],
        /*Validator plugin configurations*/
        errorLabelContainer: "#errorMsg",
        /*Callback functions*/
        callBacks: {
            onLoad: function() {
                // Extend if needed
            },
            onSubmit: function() {
                // Extend if needed
            },
            onSuccess: function() {
                // Extend if needed
            }
        },
        customPageName: "",
        validatorSettings: {}
    };
    $.fn.wmgSignUpForm = function(options) {
        var settings = {};
        var customName = "";
        if (typeof options !== 'undefined') {
            if (typeof options.customPageName !== 'undefined') {
                customName = options.customPageName;
            }
        }
        var callbackCompleted = 0;
        /*omniture parameters*/
        // var omniConfig = {};
        var validator;

        var $currentElement;
        var joinbutton = false;
        var userEmailId = "";


        // Current webform
        var $this = $(this);
        // current instance of plugin
        var self = this;
        var $mainListFields = $this.find(".mlist-field:not(.contest-field)");
        var $contestListFields = $this.find(".mlist-field.contest-field");
        var hasTwoLayers;
        var isInSecondLayer;
        var hideLightbox = function() {
            var $frontPage = jQuery('body.front #page');
            jQuery(".splash_overall").fadeOut();
            $frontPage.css('overflow', 'hidden');
            $this.parents(".mlist-outer-wrapper").removeClass("lightboxActive");
        };
        var getListParameters = function(selectorClass) {
            var listParameters = "";
            var etValues = {};
            if (selectorClass == ".secondary-list-values" || selectorClass == ".data-source-value") {
                $currentElement = $this.closest(".mlist-outer-wrapper").find("#thankyouBlock");
            } else {
                $currentElement = $this;
            }
            $currentElement.find(selectorClass).each(function() {
                $(this).find("input").each(function() {
                    if ($(this).attr("type") == "checkbox" && $(this).is(':checked') == false) {} else {
                        var exactTargetKey = $(this).attr("name");
                        var exactTargetValue = $(this).val();
                        if (exactTargetValue != "" && (exactTargetKey != "_ext" || exactTargetKey != "_trigger")) {
                            if (exactTargetKey in etValues) {
                                etValues[exactTargetKey] += ',' + exactTargetValue;
                            } else {
                                etValues[exactTargetKey] = exactTargetValue;
                            }
                        }
                        if (exactTargetKey == "email") {
                            userEmailId = exactTargetValue;
                        }
                    }
                });
                $(this).find("select").each(function() {
                    var exactTargetKey = $(this).attr("name");
                    var exactTargetValue = $(this).val();
                    etValues[exactTargetKey] = exactTargetValue;
                });
            });
            $.each(etValues, function(key, value) {
                // To check whether coppa cookie is added for this mail
                if (key === "email") {
                    //var coppaCookie = CryptoJS.MD5("coppa_lite_" + value).toString();
                    if ($.cookie('coppa_deny_all')) {
                        signUpFailure();
                        return;
                    }
                }
                if (key === "postalcode") {
                    value = encodeURIComponent(value);
                }
                listParameters += '&' + key + "=" + value;
            });
            return listParameters;
        };
        var submitRequest = function() {
            var returnVal = onSubmit();
            if (returnVal === false) {
                return false;
            }
            activeSignUpForm = self;
            sendExactTargetRequest();
        };
        var resetThankYouScreen = function() {
            $this.parents(".mlist-wrapper").fadeOut(500, function() {
                $this[0].reset();
                $this.fadeIn();
                $this.parents(".mlist-outer-wrapper").find('.mlist-join-wrap').show();
                $this.parent().find("#thankyouBlock").hide();
                if ($this.parent().find("#thankyouthankyouBlock .secondary-list-values").length > 0) {
                    $this.parent().find("input.agree-checkbox").removeAttr('checked');
                    $this.parent().find("#thankyoublock-innerwrapper").fadeIn();
                    $this.parent().find(".secondarylist-thankyou").css("display", "none");
                }
            });
        };
        var reloadForm = function() {
            var currentFocus = jQuery($currentElement[0]).attr("id");
            var currentBlock = jQuery($currentElement[0]);
            if ($this.parent().parent().find(".mlist-join-wrap").length > 0) {
                joinbutton = true;
            }
            if (currentFocus == "thankyouBlock") {
                if (currentBlock.find(".thankyou-message").hasClass("embed")) {
                    currentBlock.find("#thankyoublock-innerwrapper").fadeOut();
                } else {
                    resetThankYouScreen();
                }
            } else {
                $this.find(settings.containers.serverErrorMessageField).fadeOut();
                $this[0].reset();
                $this.parent().find(settings.containers.thankYouMessageField).fadeOut(1000, function() {
                    if (joinbutton) {
                        $this.parents().find(".mlist-wrapper").fadeOut(500, function() {
                            $this.fadeIn();
                            $this.parents().find(".mlist-join-wrap").toggle();
                        });
                    } else {
                        if ($this.find(".agreepopup").length > 0) {
                            $this.find(".agreepopup").fadeOut();
                        }
                        $this.fadeIn();
                    }
                });
            }
        };


        /* Getting omniture paramaters starts*/
        // var setOmniConfig = function() {
        // 	omniConfig.artist = digitalData.content.artist;
        // 	omniConfig.artisthost = digitalData.page.pageInfo.pageName;
        // };
        var getclosestregion = function() {
            var classArray = $this.closest(".region").attr('class');
            if (typeof classArray == 'undefined' || classArray == '') {
                return "content";
            } else {
                return $this.closest(".region").attr('class').split(' ')[1];
            }
        };
        var getLabelId = function() {
            var labelID = $this.parent().find(settings.containers.thankYouMessageField).find(settings.containers.labelcheckbox).val();
            return labelID;
        };
        // var omniVarsConfig = function(event, screenNumber) {
        // 	setOmniConfig();
        // 	var mainListID = getMailingListID();
        // 	var closestreg = getclosestregion();
        // 	var artisthost = omniConfig.artisthost;
        // 	var omniVars = {};
        // 	var labelid;
        // 	var datasource = getDatasouce();
        // 	if ($this.parent().find('#thankyouBlock .secondary-list-values').length > 0) {
        // 		hasTwoLayers = true;
        // 	}
        // 	if (hasTwoLayers === true) {
        // 		screenNumber = screenNumber + "/2" + ":";
        // 	} else {
        // 		screenNumber = "";
        // 	}
        // 	switch (event) {
        // 		case ('signupIntent'):
        // 			omniVars.pageName = artisthost;
        // 			break;
        // 		case ('firstFormSubmit'):
        // 			omniVars.pageName = artisthost + ":Signup Success";
        // 			omniVars.events = "event3";
        // 			omniVars.eVar16 = mainListID;
        // 			if(datasource != null){
        // 				omniVars.eVar87 = datasource;
        // 			}
        // 			break;
        // 		case ('noLabelSubscription'):
        // 			omniVars.pageName = artisthost + ":Save Success";
        // 			omniVars.events = "event3";
        // 			omniVars.eVar16 = mainListID;
        // 			if(datasource != null){
        // 				omniVars.eVar87 = datasource;
        // 			}
        // 			break;
        // 		case ('labelSubscription'):
        // 			labelid = getLabelId();
        // 			omniVars.pageName = artisthost + ":Save Success";
        // 			omniVars.events = "event3";
        // 			omniVars.eVar16 = mainListID;
        // 			if(datasource != null){
        // 				omniVars.eVar87 = datasource;
        // 			}
        // 			break;
        // 		default:
        // 			omniVars.pageName = artisthost + ":Save Success";
        // 			break;
        // 	}
        // 	if ($this.parents(".mlist-outer-wrapper").hasClass("customPageName")) {
        // 		if (event === "noLabelSubscription" || event === "labelSubscription") {
        // 			omniVars.pageName = omniConfig.artist + ":" + customName + ":Save Success";
        // 		} else {
        // 			omniVars.pageName = omniConfig.artist + ":" + customName + ":Signup Success";
        // 		}
        // 	} else if ($this.parents(".mlist-outer-wrapper").hasClass("tkOmniture")) {
        // 		if (event === "noLabelSubscription" || event === "labelSubscription") {
        // 			omniVars.pageName = artisthost + ":" + settings.customPageName + ":Lightbox:Save Success";
        // 		} else {
        // 			omniVars.pageName = artisthost + ":" + settings.customPageName + ":Lightbox:Signup Success";
        // 		}
        // 	}
        // 	s_dtm.t(omniVars);
        // };
        /*Getting omniture paramaters ends*/


        var $thisOuterWrapper = jQuery(this).closest(".mlist-outer-wrapper");
        /*var requiredFieldModifier = function () {

            if ($thisOuterWrapper.find("#country").val() === "" || $thisOuterWrapper.find("#country").val() === undefined) {

                $thisOuterWrapper.find("#errorLabelContainer2").css("display", "block");

                $thisOuterWrapper.find('#country').addClass("error");

                return false;

            } else {

                $thisOuterWrapper.find("#errorLabelContainer2").css("display", "none");

                $thisOuterWrapper.find('#country').removeClass("error");

                return true;

            }

        };*/
        if ($thisOuterWrapper.hasClass("country-detect")) {
            //$thisOuterWrapper.find("#country").blur(requiredFieldModifier);
            $thisOuterWrapper.find(".secondFormCloseWrap a").click(function() {
                $thisOuterWrapper.find("#thankyouBlock").addClass("final-screen");
                $thisOuterWrapper.find("#thankyoublock-innerwrapper").css("display", "none");
                $thisOuterWrapper.find(".termsWrapper a").removeClass('showing');
                $thisOuterWrapper.find(".termsWrapper").css("display", "none");
                hideLightbox();
            });
            $thisOuterWrapper.find('.termsWrapper a.terms').click(function() {
                jQuery(this).toggleClass('showing');
                jQuery(this).parents('.termsWrapper').find('.termsContent').slideToggle();
                //$thisOuterWrapper.find("#terms").slideToggle();
            });
        }
        $thisOuterWrapper.find("#thankyouBlock .mlist-submit-new").click(function(e) {
            isInSecondLayer = true;
            if ($thisOuterWrapper.hasClass("country-detect")) {
                // if (!$thisOuterWrapper.find("label.error").is(":visible")) {
                e.preventDefault();
                var signUpRequestUrlnew = settings.exactTargetSignupUrl;
                var signlabelURL = signUpRequestUrlnew + getListParameters(".mlist-field") + getListParameters(".secondary-list-values");
                if ($thisOuterWrapper.find(".secondary-list-values input.global-list-checkbox").is(":checked")) {
                    //  omniVarsConfig('labelSubscription', 2);
                    signlabelURL = signlabelURL + getListParameters(".data-source-value") + "&global_optin=TRUE";
                } else {
                    //  omniVarsConfig('noLabelSubscription', 2);
                }
                signlabelURL = signlabelURL.replace(signlabelURL[signlabelURL.indexOf("&")], "?");
                sendRequest(signlabelURL);
                // }
            } else if ($thisOuterWrapper.find(".secondary-list-values input.agree-checkbox").is(":checked")) {
                //  omniVarsConfig('labelSubscription', 2);
                var signUpRequestUrlnew = settings.exactTargetSignupUrl;
                var signlabelURL = signUpRequestUrlnew + getListParameters(".mlist-field") + getListParameters(".secondary-list-values");
                if ($thisOuterWrapper.find(".secondary-list-values input.global-list-checkbox").is(":checked")) {
                    signlabelURL = signlabelURL + getListParameters(".data-source-value") + "&global_optin=TRUE";
                }
                signlabelURL = signlabelURL.replace(signlabelURL[signlabelURL.indexOf("&")], "?");
                sendRequest(signlabelURL);
            } else {
                //  omniVarsConfig('noLabelSubscription', 2);
            }
        });
        jQuery("#thankyouBlock .mlist-submit-new").click(function(e) {
            $currentElement = jQuery(this).closest(".mlist-outer-wrapper").find("#thankyouBlock");
        });
        $thisOuterWrapper.find(".mlist-popup").click(function() {
            $this.validate();
            if ($this.valid() == true) {
                $thisOuterWrapper.find(".agreepopup").show();
            }
        });
        $thisOuterWrapper.find(".mlist-disagree").click(function() {
            $thisOuterWrapper.find(".agreepopup").hide();
        });
        $thisOuterWrapper.find(".mlist-join").click(function() {
            $thisOuterWrapper.find('.mlist-join-wrap').hide();
            $thisOuterWrapper.find('.mlist-wrapper').slideToggle();
            //  omniVarsConfig('signupIntent', 1);
        });
        $thisOuterWrapper.find(".mlist-close").click(function() {
            $thisOuterWrapper.find('.mlist-wrapper').slideToggle();
            resetThankYouScreen();
        });
        $thisOuterWrapper.find(".mlist-checks label[for='global-list']").click(function() {
            var $checkbox = jQuery(this).parent().find('.global-list-checkbox');
            if (!$checkbox.is(':checked')) {
                $checkbox.attr('checked', 'checked');
            } else {
                $checkbox.removeAttr('checked');
            }
        });
        var updateCurrentEmailAddress = function() {
            if ($this.parents(".mlist-outer-wrapper").find('.emailAddress')) {
                $this.parents(".mlist-outer-wrapper").find('.emailAddress').text(userEmailId.split('@')[0]);
            }
        };
        var signUpSuccess = function(data) {
            var tempElement = jQuery($currentElement[0]).attr("id");
            if (tempElement == "thankyouBlock") {
                if ($currentElement.find(".secondary-list-values").length > 0) {
                    $currentElement.find("#thankyoublock-innerwrapper").fadeOut(1000, function() {
                        //For flyout version
                        if ($this.parents(".mlist-outer-wrapper").hasClass('lightbox')) {
                            hideLightbox();
                        }
                        jQuery("#terms").fadeOut();
                        $currentElement.find(".secondarylist-thankyou").fadeIn();
                        $currentElement.addClass("final-screen");
                    });
                    setTimeout(reloadForm, 4000);
                }
            } else {
                $this.fadeOut(500, function() {
                    //lightbox variant
                    if ($this.parents(".mlist-outer-wrapper").hasClass('lightbox')) {
                        $this.parents(".mlist-outer-wrapper").addClass("lightboxActive");
                        var parentWrapper = $this.parents(".mlist-outer-wrapper.lightboxActive");
                        var parentWrapperWidth = 600;
                        var parentWrapperHeight = 400;
                        jQuery('body').append("<div class='splash_overall'></div>");
                        jQuery('body.front #page').css('overflow', 'visible');
                        jQuery(".splash_overall").fadeIn();
                        var win_height = document.documentElement.clientHeight;
                        var set_height = (win_height - parentWrapperHeight) / 2;
                        var win_width = document.documentElement.clientWidth;
                        var set_width = (win_width - parentWrapperWidth) / 2;
                        parentWrapper.css('top', set_height + 'px');
                        parentWrapper.css('left', set_width + 'px');
                        jQuery(".splash_overall").click(function() {
                            hideLightbox();
                        });
                    }
                    //flyout variant
                    if (jQuery("#" + tempElement).parents(".mlist-outer-wrapper").hasClass('flyout')) {
                        $this.parents(".mlist-outer-wrapper").addClass("flyoutActive");
                    }
                    $this.find(settings.containers.serverErrorMessageField).fadeOut();
                    $this.parent().find(settings.containers.thankYouMessageField).fadeIn(500);
                    $this.parent().find("#thankyoublock-innerwrapper").show();
                    $this.parent().find("#secondForm").validate();
                    $this.parent().find('.agree-checkbox').removeAttr('checked');
                    $this.parent().find(".secondarylist-thankyou").hide();
                    if ($thisOuterWrapper.hasClass("country-detect")) {
                        $this.parent().find("#terms").css("display", "none");
                    }
                    if ((data.geocountry !== undefined) && (data.geocountry !== "")) {
                        $this.parent().find("#country").val(data.geocountry);
                    } else {
                        $this.parent().find("#country").val("");
                    }
                    /*if ((data.geozip !== undefined) && (data.geozip !== "")) {

                     $this.parent().find("#postalcode").val(data.geozip)

                     } else {

                     $this.parent().find("#postalcode").val("");

                     }*/
                });
            }
        };
        var signUpFailure = function() {
            $this.find(settings.containers.serverErrorMessageField).fadeTo(1, 500);
            setTimeout(function() {
                reloadForm();
            }, 5000);
        };
        var sendRequest = function(signUpListUrl) {
            try {
                signUpListUrl += "&jsoncallback=?";
                $.getJSON(signUpListUrl, {
                    jsonp: "signupFormCallback"
                });
            } catch (err) {
                signUpFailure();
            }
        };
        var getMailingListID = function() {
            var mainListID;
            var _country = $this.find("#country").val();
            var mailingListObj = WMG.MailingList.EmailListIds;
            if (_country in mailingListObj) {
                mainListID = WMG.MailingList.EmailListIds[_country];
            } else {
                mainListID = WMG.MailingList.EmailListIds["United States"];
            }
            return mainListID;
        };
        var getDatasouce = function() {
            if ($this.find("input[name~='Datasource']") != undefined) {
                return $this.find("input[name~='Datasource']").val()
            } else {
                return null;
            }
        }
        var sendExactTargetRequest = function() {
            var mainlistflag = "off";
            var mainListID;
            var signUpRequestUrl = settings.exactTargetSignupUrl;
            var mainlist_signupURL;
            var contestlist_signupURL;
            mainListID = getMailingListID();
            $this.find(".mainlist-hidden-options #mainListId").attr("value", mainListID);
            if ($this.find(".agree-checkbox").is(":checked")) {
                mainlistflag = "on";
            }
            // var adobe_ecid = s_dtm.visitor.getMarketingCloudVisitorID();
            primary_signupURL = signUpRequestUrl + "?geoip=true" + getListParameters(".mlist-field") + getListParameters(".primary-list-values");
            primary_signupURL = primary_signupURL;
            if ($this.find(".primary-list-values input.global-list-checkbox").is(":checked")) {
                primary_signupURL += "&global_optin=TRUE";
            }
            if ($this.find(".secondary-list-values").length > 0) {
                secondary_signupURL = signUpRequestUrl + getListParameters(".mlist-field:not('.contest-field')") + getListParameters(".secondary-list-values");
                secondary_signupURL.replace(secondary_signupURL[secondary_signupURL.indexOf("&")], "?")
            }
            updateCurrentEmailAddress();
            if ($this.hasClass("contest-form")) {
                if ($this.is(".secondary-list-required")) {
                    sendRequest(primary_signupURL);
                    sendRequest(secondary_signupURL);
                } else if ($this.is(".secondary-list-optional")) {
                    if (mainlistflag == "on") {
                        sendRequest(secondary_signupURL);
                        sendRequest(primary_signupURL);
                    } else {
                        sendRequest(primary_signupURL);
                    }
                } else {
                    sendRequest(primary_signupURL);
                }
            } else {
                sendRequest(primary_signupURL);
            }
        };
        this.signupFormCallback = function(data) {
            callbackCompleted++;
            if (callbackCompleted == 1) {
                $this.parent().find(settings.containers.ajaxLoaderField).fadeOut();
                if (data.status == 'success') {
                    onSuccess();
                    signUpSuccess(data);
                } else { // status== 'error'
                    signUpFailure();
                }
            }
            if ((settings.newsLetterConfigValues.length) == callbackCompleted) {
                callbackCompleted = 0;
            }
        };
        var init = function(options) {
            if (options) {
                settings = $.extend(defaults, options);
            } else {
                settings = defaults;
            }
            var validatorSettings;
            if (Object.keys(settings.validatorSettings).length > 0) {
                validatorSettings = settings.validatorSettings;
            } else {
                validatorSettings = {
                    rules: {},
                    messages: {}
                };
            }

            function getValidatorRulesandMessages($this) {
                var rulesKey = $this.attr("id");
                var rulesClass = $this.attr('class');
                if (rulesClass != undefined) {
                    var rulesElement = rulesClass.split(/\s+/);
                    validatorSettings.rules[rulesKey] = {};
                    validatorSettings.messages[rulesKey] = {};
                    $.each(rulesElement, function(index, item) {
                        if (item.match('^m-')) {
                            item = item.replace('m-', '');
                            validatorSettings.rules[rulesKey][item] = true;
                            validatorSettings.messages[rulesKey][item] = "";
                        }
                    });
                }
            }
            $this.find(".mlist-field input").each(function() {
                if (Object.keys(validatorSettings.rules).length == 0) {
                    getValidatorRulesandMessages($(this));
                }
            });
            $this.find(".mlist-field select").each(function() {
                if (Object.keys(validatorSettings.rules).length == 0) {
                    getValidatorRulesandMessages($(this));
                }
            });
            $.validator.setDefaults({
                rules: validatorSettings.rules,
                messages: validatorSettings.messages,
                submitHandler: function() {
                    isInSecondLayer = false;
                    /*On click of form1 sign up button */
                    //  omniVarsConfig('firstFormSubmit', 1);
                    submitRequest();
                    return false;
                }
            });
            validator = $this.validate({
                onkeyup: false
            });
        };
        var onLoad = function() {
            settings.callBacks.onLoad();
        };
        var onSubmit = function() {
            if (typeof settings.callBacks.onSubmit != "undefined") {
                return settings.callBacks.onSubmit();
            }
        };

        var onSuccess = function() {
            if (typeof settings.callBacks.onSuccess != "undefined") {
                settings.callBacks.onSuccess();
            }
        };
        init(options);
        return this.each(function() {
            _this = this;
        });
    };
}(jQuery));