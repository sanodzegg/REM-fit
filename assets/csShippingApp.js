window.csCdnSbzJs = 1;
if (typeof window.csServerSbzJs === 'undefined' && window.csServerSbzJs != 1) {
    var csShippingAppBaseUrl = "https://sbz.cirkleinc.com/",
        cssbz = "cssbz",
        csCurrentPageUrl = window.location.href,
        csCurrentPagePath = window.location.pathname,
        csShopify = window.Shopify,
        csAppendMainDiv = "csShippingAppCode",
        csAppendMainDivSelector = "#csShippingAppCode",
        csCartFormSelector = 'form[action="/cart"]:not(.cart-notification form[action="/cart"]), form[action="/cart?locale=en"]:not(.cart-notification form[action="/cart"]), form[action*="/cart"]:not(.cart-notification form[action="/cart"]), form[action*="/cart"]:not(.sbzForm)',
        csCartData = null,
        csProductIds = [],
        csSetProductIds = [],
        csProductVendorArr = [],
        csProductTypeArr = [],
        csProductRateVisibility = null,
        htmlData = "",
        result_data = "",
        csTimeSettingStatus = "",
        csJq = null,
        csShopData = null,
        csCartContent = "",
        csCartAttributes = "",
        csCartProperties = "",
        csPostalCode = "",
        getShippingPickup = "",
        shippingDateDisable = 0,
        varianIds = [],
        csDateFormat = "",
        items_length = "",
        cart_tags = [],
        cart_collections = [],
        cart_call_timeout = 10000,
        normal_cart_ajax = 'ToCancelPrevReq';
    var csMarkers = [];
    var csMap;
    var csGeocoder;
    (csCommonError = "Something went to wrong, Please try again!"), (checkout_selectors = "input[name='checkout']:not(.csapps-ignore), input[value='Checkout']:not(.csapps-ignore), button[name='checkout']:not(.csapps-ignore), [href$='checkout']:not(.csapps-ignore), button[value='Checkout']:not(.csapps-ignore), input[name='goto_pp'], button[name='goto_pp'], input[name='goto_gc'], button[name='goto_gc'],.csapps_checkout");
    fetch("/cart.js").then((csResponse) => {
        return csResponse.json();
    }).then((csCart) => {
        if (csCart.attributes != "" && csCart.attributes != null) {
            csCartAttributes = csCart.attributes;
        }
        csCartContent = csCart;
        csCart.items.forEach((csCartData, csIndex) => {
            varianIds.push(csCartData.id);
            csProductIds.push(csCartData.product_id);
            if (csCartData.properties != "" && csCartData.properties != null) {
                if (csCartData.properties["_odd"] != undefined && csCartData.properties["_odd"] != null && csCartData.properties["_odd"] != "") {
                    csCartProperties = csCartData.properties;
                }
            }
        });
    });
    window.onload = function() {
        if (window.jQuery) {
            csJq = window.jQuery;
            if (typeof csShopify !== "undefined") {
                csDatePickerMinJs(csJq);
            }
        } else {
            csLoadScript(csShippingAppBaseUrl + "assets/js/jquery-3.4.1.js", function() {
                csJq = jQuery.noConflict(true);
                if (typeof csShopify !== "undefined") {
                    csDatePickerMinJs(csJq);
                }
            });
        }
    };
    window.csLoadScript = function(url, callback) {
        var jqTag = document.createElement("script");
        jqTag.type = "text/javascript";
        jqTag.src = url;
        document.getElementsByTagName("head")[0].appendChild(jqTag);
        if (jqTag.readyState) {
            jqTag.onreadystatechange = function() {
                if (jqTag.readyState == "loaded" || jqTag.readyState == "complete") {
                    jqTag.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            jqTag.onload = function() {
                callback();
            };
        }
    };
    function csLoadCss(url) {
        var headTag = document.getElementsByTagName("head")[0];
        var csTag = document.createElement("link");
        csTag.rel = "stylesheet";
        csTag.href = url;
        headTag.appendChild(csTag);
    }
    function csLoadJs(url) {
        var headTag = document.getElementsByTagName("head")[0];
        var jqTag = document.createElement("script");
        jqTag.type = "text/javascript";
        jqTag.src = url;
        headTag.appendChild(jqTag);
    }
    function csDatePickerMinJs(csJq) {
        csLoadCss(csShippingAppBaseUrl + "assets/css/datepicker/datepicker.css");
        csLoadCss(csShippingAppBaseUrl + "assets/css/front/csShippingApp.css");
        if (typeof csJq.fn.datepicker != "undefined") {
            langJs(csJq);
        } else {
            csLoadScript(csShippingAppBaseUrl + "assets/js/datepicker/datepicker.js", function() {
                langJs(csJq);
            });
        }
    }
    function langJs(csJq) {
        MainCode(csJq);
    }
    function MainCode(csJq) {
        if (!csJq('#csShippingAppCode').length) {
            return false;
        }
        (function(ns, fetch) {
            if (typeof fetch !== "function") return;
            ns.fetch = function() {
                const response = fetch.apply(this, arguments);
                response.then((res) => {
                    if (res.url.toString().indexOf("https://" + csShopify.shop + "/cart/change?t=") > -1 || res.url.toString().indexOf("https://" + csShopify.shop + "/cart/change") > -1 || res.url.toString().indexOf("https://" + csShopify.shop + "/cart/change.js?line=") > -1 || res.url.toString().indexOf("https://" + csShopify.shop + "/cart/update.js") > -1 || res.url.toString().indexOf("https://" + csShopify.shop + "/cart/change.js") > -1 || res.url.toString().indexOf("/cart/change") > -1) {
                        if (res.url.indexOf("/cart/change.js?csapp=shipcs") == -1) {
                            csUpdateCart(1);
                        }
                    }
                });
                return response;
            };
        })(window, window.fetch);
        csJq(document).ajaxComplete(function(event, xhr, settings) {
            if (settings != undefined) {
                if (settings.url.toString().indexOf("/cart/change?t=") > -1 || settings.url.toString().indexOf("/cart/change") > -1 || settings.url.toString().indexOf("/cart/change.js?line=") > -1 || settings.url.toString().indexOf("/cart/update.js") > -1 || settings.url.toString().indexOf("/cart/change.js") > -1) {
                    if (settings.url.indexOf("/cart/change.js?csapp=shipcs") == -1) {
                        csUpdateCart(1);
                    }
                }
            }
        });
        csPostalCode = localStorage.getItem("_cspcod_");
        var csExitOrNot = true;
        if (1) {
            if (csJq('.csLoader').length == 0) {
                csJq(csCartFormSelector).append('<div class="csLoader"><img src="' + csShippingAppBaseUrl + 'assets/images/loading.gif"></div>');
            }
            csExitOrNot = false;
        } else {
            if (csCurrentPagePath.search("/cart") != -1) {
                csJq(csCartFormSelector).append('<div id="' + csAppendMainDiv + '" style="display:none;"><div class="csLoader"><img src="' + csShippingAppBaseUrl + 'assets/images/loading.gif"></div></div>');
                csExitOrNot = false;
            }
        }
        if (csExitOrNot) return false;
        csJq.getJSON("/cart.js", function(cart) {
            csCartContent = cart;
            getAppData();
        });
        csJq(document).on("click", ".cs-time-picker", function() {
            var csTimeValue = csJq(".cs-tab_last[rel='cs-tab2']").hasClass("active") ? "#csDeliveryTimeValue" : csJq(".cs-tab_last[rel='cs-tab3']").hasClass("active") ? "#csPickupTimeValue" : '#csShippingTimeValue';
            csJq(".cs-time-picker").removeClass("active");
            csJq(this).addClass("active");
            csJq(csTimeValue).val(csJq(this).text().trim());
            csJq("#csTimePicker,#csTimePicker1,#csTimeShippingPicker").val(csJq(this).text().trim());
            csJq(".time-block").hide();
            csUpdateCart(0);
            csJq("#required-error").html("");
            csJq(checkout_selectors).attr("disabled", false);
        });
        csJq(document).on("click", "#csTimePicker,#csTimePicker1,#csTimeShippingPicker", function() {
            csJq(".time-block").show();
        });
        csJq(document).on("click", ".close-time-slot", function() {
            csJq(".time-block").hide();
        });
        csJq(document).mouseup(function(e) {
            var container = csJq(".time-block");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
        csJq(document).on("keypress", "#postal_code", function(e) {
            e.preventDefault;
            if (e.which == 13) {
                csSearchOrSelect(csCartContent);
                if (csJq("#csDatepicker").val() != "" || csJq("#csTimePicker").val() != "") {
                    csUpdateCart(0);
                }
                csJq('#csDatepicker').val("");
                return false;
            }
        });
        csJq(document).on("click", "#zip_search", function() {
            csSearchOrSelect(csCartContent);
            if (csJq("#csDatepicker").val() != "" || csJq("#csTimePicker").val() != "") {
                csUpdateCart(0);
            }
            csJq('#csDatepicker').val("");
        });
        csJq(document).on("click", ".cs-tab_last,.tab_drawer_heading", function() {
            csTabRefresh(this);
        });
        csJq(document).on("click", "ul.cs-tabs li", function() {
            csJq(this).closest(".tab-view").find(".cs-tab_content").hide();
            var activeTab = csJq(this).attr("rel");
            csJq("#" + activeTab).fadeIn();
            csJq(this).closest(".tab-view").find("ul.cs-tabs li").removeClass("active");
            csJq(this).addClass("active");
            if (activeTab == "cs-tab2") {
                csJq("#csLocationId,#csDeliveryLocationValue,#csLocationAddress1,#csPickupDateValue,#csPickupTimeValue,#csPickupDayValue,#csShippingDateValue,#csShippingDayValue,#csShippingTimeValue").val("");
            }
            if (activeTab == "cs-tab3") {
                csJq("#csDeliveryDateValue,#csDeliveryTimeValue,#csDeliveryDayValue,#csDeliveryZipValue,#csShippingDateValue,#csShippingDayValue,#csShippingTimeValue").val("");
                if (result_data.generalSettingData.gen_date_time_selection == 0) {
                    csJq("#required-error").html("");
                }
                if (csJq('.cs-radio-card').length == 1 && csJq('.cs-tab_last[rel="cs-tab3"]').hasClass('active') == true) {
                    csJq('.cs-radio-card:first-child').trigger('click');
                }
            }
            if (activeTab == "cs-tab1") {
                csJq("#no-found-location").text(" ").hide();
                csJq(checkout_selectors).attr("disabled", false);
                csJq("#csDeliveryDateValue,#csDeliveryTimeValue,#csDeliveryDayValue,#csDeliveryZipValue,#csLocationId,#csDeliveryLocationValue,#csLocationAddress1,#csPickupDateValue,#csPickupTimeValue,#csPickupDayValue,#csShippingpicker,#csTimeShippingPicker").val("");
                csDateAndTimePicker(result_data.shippingDeliveryDateSettingData, "shipping");
                csCheckValidation(1);
                csJq('#csShippingpicker').show();
                if (result_data.shippingDeliveryDateSettingData.date_status == 0) {
                    csJq('#csShippingpicker,#csTimeShippingPicker').hide();
                    csJq('#csShippingDateValue,#csTimeShippingPicker').val("");
                    csJq(checkout_selectors).attr("disabled", false);
                    csJq("#required-error").html("");
                } else if (result_data.shippingDeliveryDateSettingData.status == 0) {
                    csJq('.cs-tab_last[rel="cs-tab1"]').hide();
                }
            }
            if (activeTab == "cs-tab1" || activeTab == "cs-tab2") {
                get_url = '/cart?';
                if (get_url.includes('contact_information') == false) action_url = `${get_url}step=contact_information&checkout[shipping_address][address1]=&checkout[shipping_address][address2]=&checkout[shipping_address][city]=&checkout[shipping_address][zip]=&checkout[shipping_address][country]=&checkout[shipping_address][province]=`;
                if (window.unsetCheckoutInfo == undefined) {
                    csJq(csCartFormSelector).attr("action", action_url);
                }
            }
            if (typeof sbzMethodChange != 'undefined') {
                sbzMethodChange(activeTab);
            }
        });
        csJq(document).on("click", "#cs-location-list .cs-radio-card", function() {
            var get_url = csJq(csCartFormSelector).attr("action");
            csJq("#cs-location-list .cs-radio-card").removeClass("csactive");
            csJq(this).addClass("csactive");
            index = csJq(this).attr("data-location-id");
            localStorage.setItem("_cslocationid_", index);
            csJq("#csLocationId").val(csJq(this).attr("data-location-mainid"));
            csJq("#csTimePicker1").parent().hide();
            csJq("#csDatepicker1").datepicker().data("datepicker").clear();
            csJq("#csTimePicker1,#csDeliveryDayValue,#csDeliveryZipValue,#csDeliveryDateValue,#csDeliveryTimeValue,#csShippingDateValue,#csShippingDayValue,#csPickupDateValue,#csPickupTimeValue").val("");
            Adress2 = result_data.locations[index].address2 != undefined ? result_data.locations[index].address2 : "";
            city1 = result_data.locations[index].city != undefined ? result_data.locations[index].city : "";
            state_code1 = result_data.locations[index].state_code != undefined ? result_data.locations[index].state_code : "";
            last_name = csJq('input[name=pickup-last-name]').val();
            phone_number = csJq('input[name=pickup-number]').val();
            email = csJq('input[name=pickup-email]');
            csJq("#csShippingAddress1").val(result_data.locations[index].address1);
            csJq("#csLocationAddress1").val(result_data.locations[index].address1 + ', ' + city1 + ', ' + state_code1 + ', ' + result_data.locations[index].country_code + ', ' + result_data.locations[index].zip);
            csJq("#csShippingAddress2").val(Adress2);
            csJq("#csShippingCity").val(result_data.locations[index].city);
            csJq("#csShippingZip").val(result_data.locations[index].zip);
            csJq("#csDeliveryLocationValue").val(result_data.locations[index].name);
            if (typeof get_url == 'undefined') get_url = '/cart'
            get_url = get_url.indexOf("locale=") > -1 ? get_url + "&" : get_url + "?";
            if (get_url.includes('contact_information') == false) action_url = `${get_url}step=contact_information&checkout[shipping_address][address1]=${result_data.locations[index].address1}&checkout[shipping_address][address2]=${Adress2}&checkout[shipping_address][city]=${city1}&checkout[shipping_address][zip]=${result_data.locations[index].zip}&checkout[shipping_address][country]=${result_data.locations[index].country_code}&checkout[shipping_address][province]=${state_code1}`;
            if (window.unsetCheckoutInfo == undefined) {
                csJq(csCartFormSelector).attr("action", action_url);
            }
            csDateAndTimePicker(result_data.locations[index].pickupSettingData, "storepickup");
            hastime = csJq(this).closest(".cs-tab_content").find(".select-block").is(":hidden") ? 0 : 1;
            csCheckValidation(1, hastime);
            if (csJq("#csDatepicker1").val() != "" || csJq("#csTimePicker1").val() != "") {
                csUpdateCart(0);
            }
            csJq('#customer-information').show();
        });
        csJq('input[name="update"]').on("click", function(e) {
            e.preventDefault()
            var self = csJq(this);
            self.closest('form').attr('action', '/cart');
            csJq('.csIgnoreCngEvent').remove();
            setTimeout(function() {
                self.unbind('click').click();
            }, 100);
        });
        csJq(document).on("click", checkout_selectors, function(e) {
            localStorage.removeItem("__ui");
            csJq('#csShippingAppCode').addClass('sbzdeactive');
            var planStatus = false;
            if (result_data.shopData.plan_display_name == "Developer Preview" || result_data.shopData.plan_display_name == "Development" || (result_data.shopData.plan_id == 2 && result_data.shopData.plan_status == "active")) {
                planStatus = true;
            } else if (result_data.shopData.plan_id == 4 && result_data.shopData.plan_status == "active" && csJq('.cs-tab_last[rel="cs-tab3"]').hasClass('active') == true) {
                planStatus = true;
            }
            if (result_data.generalSettingData.gen_shipping_price_setting == 1 && planStatus) {
                e.preventDefault();
                var first_name = csJq('input[name=pickup-first-name]'),
                    last_name = csJq('input[name=pickup-last-name]'),
                    phone_number = csJq('input[name=pickup-number]'),
                    email = csJq('input[name=pickup-email]'),
                    self = this;
                var hasError = true;
                csJq('#customer-information input').css('border', '1px solid');
                if (csJq('.cs-tab_last[rel="cs-tab3"]').hasClass('active') == true) {
                    if (csJq('input[name=pickup-first-name]').length) {
                        if (csJq('input[name=pickup-first-name]').val() == '') {
                            hasError = false;
                            csJq('input[name=pickup-first-name]').css('border', '1px solid red');
                        }
                    }
                    if (csJq('input[name=pickup-last-name]').length) {
                        if (csJq('input[name=pickup-last-name]').val() == '') {
                            hasError = false;
                            csJq('input[name=pickup-last-name]').css('border', '1px solid red');
                        }
                    }
                    if (csJq('input[name=pickup-number]').length) {
                        if (csJq('input[name=pickup-number]').val() == '') {
                            hasError = false;
                            csJq('input[name=pickup-number]').css('border', '1px solid red');
                        }
                    }
                    if (csJq('input[name=pickup-email]').length) {
                        var validateEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/i;
                        if (!validateEmail.test(csJq('input[name=pickup-email]').val())) {
                            hasError = false;
                            csJq('input[name=pickup-email]').css('border', '1px solid red');
                        }
                    }
                    Adress2 = result_data.locations[index].address2 != undefined ? result_data.locations[index].address2 : "";
                    city1 = result_data.locations[index].city != undefined ? result_data.locations[index].city : "";
                    state_code1 = result_data.locations[index].state_code != undefined ? result_data.locations[index].state_code : "";
                    last_name1 = last_name.val() != undefined ? last_name.val() : "";
                    first_name1 = first_name.val() != undefined ? first_name.val() : "";
                    email1 = email.val() != undefined ? email.val() : "";
                    phone_number1 = phone_number.val() != undefined ? phone_number.val() : ""
                    var get_url = csJq(csCartFormSelector).attr("action");
                    if (typeof get_url == 'undefined') get_url = '/cart'
                    get_url = get_url.indexOf("locale=") > -1 ? get_url + "&" : get_url + "?";
                    if (get_url.includes('contact_information') == false) action_url = `${get_url}step=contact_information&checkout[shipping_address][address1]=${result_data.locations[index].address1}&checkout[shipping_address][address2]=${Adress2}&checkout[shipping_address][city]=${city1}&checkout[shipping_address][zip]=${result_data.locations[index].zip}&checkout[shipping_address][country]=${result_data.locations[index].country_code}&checkout[shipping_address][province]=${state_code1}&checkout[shipping_address][first_name]=${first_name1}&checkout[shipping_address][last_name]=${last_name1}&checkout[shipping_address][phone]=${phone_number1}&checkout[email_or_phone]=${email1}`;
                    if (window.unsetCheckoutInfo == undefined) {
                        csJq(csCartFormSelector).attr("action", action_url);
                    }
                }
                csJq.getJSON("/cart.js", function(cart) {
                    var formsub = csJq(self).closest('form').length != 0 ? csJq(self).closest('form') : csJq(csCartFormSelector);
                    if (result_data.generalSettingData.gen_shipping_price_setting == 1 && planStatus && hasError) {
                        dataLocation1 = {};
                        customer = {};
                        dataLocation1.shop = csShopify.shop;
                        dataLocation1.cart = cart;
                        customer['first_name'] = first_name.val()
                        customer['last_name'] = last_name.val()
                        customer['contact_number'] = phone_number.val()
                        customer['email'] = email.val()
                        dataLocation1.cart.customer = customer;
                        dataLocation1 = JSON.stringify(dataLocation1);
                        csJq.ajax({
                            url: csShippingAppBaseUrl + "cs-sbz-draft-order",
                            type: "POST",
                            data: dataLocation1,
                            dataType: "JSON",
                            error: function(error) {
                                console.log('error', error);
                                formsub.submit();
                            }
                        }).done(function(result) {
                            if (result.success) {
                                window.location.href = result.checkout_url;
                            } else {
                                formsub.submit();
                            }
                        });
                    } else if (hasError) {
                        formsub.submit();
                    }
                });
            }
        });
    }
    function csDateFormatter(fmt, date) {
        var dmyArr = ["d", "m", "y"];
        var dmyValArr = [("0" + date.getDate()).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), "" + date.getFullYear()];
        var fmtArr = fmt.indexOf("-") != -1 ? fmt.split("-") : fmt.split("/");
        var returnDate = [];
        for (var i = 0; i < fmtArr.length; i++) {
            if (dmyArr.indexOf(fmtArr[i].toLowerCase().charAt(0)) != -1) {
                returnDate[i] = dmyValArr[dmyArr.indexOf(fmtArr[i].toLowerCase().charAt(0))];
            }
        }
        returnDateVal = fmt.indexOf("-") != -1 ? returnDate.join("-") : returnDate.join("/");
        return returnDateVal;
    }
    function csYmdDateFormate(fmt, date) {
        var dateFormat = fmt;
        var dateFormatArray = dateFormat.includes("/") ? dateFormat.split("/") : dateFormat.split("-");
        var dArray = date.includes("/") ? date.split("/") : date.split("-");
        var m = dateFormatArray.indexOf("mm");
        var d = dateFormatArray.indexOf("dd");
        var y = dateFormatArray.indexOf("yyyy");
        var dt = dArray[y] + "/" + dArray[m] + "/" + dArray[d];
        return dt;
    }
    function dislayLocationBasedProduct() {
        if (result_data.generalSettingData.gen_display_same_location_product == 1) {
            csJq('.cs-tab_last[rel="cs-tab3"]').hide();
            variant_ids = varianIds.join(",");
            dataLocation = {};
            dataLocation.shop = csShopify.shop;
            dataLocation.variant_ids = variant_ids;
            csJq.ajax({
                url: csShippingAppBaseUrl + "variant-based-location",
                type: "POST",
                data: dataLocation,
                dataType: "JSON",
                success: function(result) {
                    hasLocationShow = true;
                    csJq('.cs-radio-card').each(function() {
                        csJq(this).addClass('show');
                        if (csJq(this).attr('data-locatioid') != 'null') {
                            hasLocation = true;
                            locationId = csJq(this).attr('data-locatioid');
                            csJq(result.variantLocationData).each(function(index, data) {
                                if (data.location_id.indexOf(locationId) == -1) {
                                    hasLocation = false;
                                }
                            });
                            if (hasLocation == false) {
                                csJq('.cs-radio-card[data-locatioid="' + locationId + '"]').hide().removeClass('show');
                                csJq('.cs-radio-card[data-locatioid="' + locationId + '"]').parent('.google-map-label').hide();
                                if (csJq('.cs-radio-card[data-locatioid="' + locationId + '"]').hasClass('csactive')) {
                                    csJq('.cs-radio-card[data-locatioid="' + locationId + '"]').removeClass('csactive');
                                    csJq('#cs-tab3 .select-block,#cs-tab3 .datepicker-block ').hide();
                                }
                            }
                            csJq("#cs-tab3 .tab-inner-content").show();
                            csJq(".csLoader1").hide();
                        }
                        if (csJq(this).hasClass("show")) {
                            hasLocationShow = false;
                        }
                        csJq(".csLoader1").hide();
                    })
                    if (hasLocationShow) {
                        csJq("#cs-tab3 .tab-inner-content").hide();
                        csJq('.cs-tab_last[rel="cs-tab3"]').hide();
                    } else {
                        csJq("#cs-tab3 .tab-inner-content").show();
                        csJq('.cs-tab_last[rel="cs-tab3"]').show();
                    }
                }
            })
        } else {
            csJq("#cs-tab3 .tab-inner-content").show();
            csJq(".csLoader1").hide();
        }
    }
    function getWidget(result_data, csCartContent) {
        csResponseData = htmlDataWidget(result_data);
        csGeneralSettingData = result_data.generalSettingData;
        csLocations = result_data.locations;
        (hasDelieverylocation = false), (hasStorePickuplocation = false);
        var locationHtml = "",
            locationcollect = [],
            deliverycollect = [];
        normal_cart_ajax = csJq.ajax({
            url: 'https://' + window.location.host + '/apps/' + cssbz + '?view=cart',
            dataType: 'json',
            type: 'POST',
            beforeSend: function() {
                if (normal_cart_ajax != 'ToCancelPrevReq' && normal_cart_ajax.readyState < 4) {
                    normal_cart_ajax.abort();
                }
            },
            success: function(vdata) {
                csJq('#cart_data').remove();
                csJq('<script id="cart_data">' + vdata.collection + vdata.cs_cart_count + '</script>').appendTo(document.body);
                csJq(csLocations).each(function(index, location) {
                    getDelivery = csCheckProductDeliveryStatus(location.deliverySettingData, csCartContent, "localdelivery");
                    getStorePickup = csCheckProductDeliveryStatus(location.pickupSettingData, csCartContent, "storepickup");
                    hasDelieverylocation = getDelivery == true ? true : hasDelieverylocation;
                    hasStorePickuplocation = getStorePickup == true ? true : hasStorePickuplocation;
                    locationAdress2 = location.address2 != "" ? location.address2 : "";
                    if (getStorePickup) locationcollect.push(index);
                    if (getDelivery) deliverycollect.push(index);
                });
                getShippingPickup = csCheckProductDeliveryStatus(result_data.shippingDeliveryDateSettingData, csCartContent, "shipping");
                var csGoogleMapLocations = [];
                csJq(locationcollect).each(function(location1, locateItem) {
                    location1 = result_data.locations[locateItem];
                    Adress2 = location1.address2 != undefined ? "<p class='sbzadd2'>" + location1.address2 + "</p>" : " ";
                    city1 = location1.city != undefined ? location1.city + "," : " ";
                    state_code1 = location1.state_code != undefined ? location1.state_code + "," : " ";
                    more_information_text = strip(location1.more_information_text).replace(/<[^>]*>?/gm, '').trim();
                    gen_more_information_text = '';
                    if (more_information_text != '' && more_information_text != 'null')
                        gen_more_information_text = csGeneralSettingData.gen_more_information_text != undefined && csGeneralSettingData.gen_more_information_text != '' && csGeneralSettingData.gen_more_information_text != null ? "<p><a href='javascript:' onclick='moreInformationText(this);' data-more_information='" + location1.more_information_text + "'>" + csGeneralSettingData.gen_more_information_text + "</a>" : "<a href='javascript:' onclick='moreInformationText(this);' data-more_information='More Information'>More Information</a></p>";
                    if (csGeneralSettingData.gen_google_api_key != undefined && csGeneralSettingData.gen_google_api_key != "" && csGeneralSettingData.gen_google_api_key != null) {
                        csGoogleMapLocations.push({
                            ...result_data.locations[locateItem],
                            html: `<div class="cs-radio-card" data-location-id="${locateItem}"  data-location-mainid="${location1.id}" data-locatioId="${location1.location_id}">
                                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" aria-labelledby="circleOkIconTitle" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000">  <polyline points="7 13 10 16 17 9"></polyline> <circle cx="12" cy="12" r="10"></circle> </svg><div class="top-row"><label for="location-${locateItem}"><h6>${location1.name}</h6><p class="sbzadd1">${location1.address1} </p>${Adress2}<p>${city1} ${state_code1} <span>${location1.country_code},</span> ${location1.zip}</p>${gen_more_information_text}</label></div></div>`,
                        });
                    }
                    locationHtml += `<div class="cs-radio-card" data-location-id="${locateItem}"  data-location-mainid="${location1.id}" data-locatioId="${location1.location_id}"><svg role="img" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" aria-labelledby="circleOkIconTitle" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000">  <polyline points="7 13 10 16 17 9"></polyline> <circle cx="12" cy="12" r="10"></circle> </svg><div class="top-row"><label for="location-${locateItem}"><h6>${location1.name}</h6><p>${location1.address1} </p>${Adress2}<p>${city1} ${state_code1} <span>${location1.country_code},</span> ${location1.zip}</p>${gen_more_information_text}</label></div></div>`;
                });
                csJq(csAppendMainDivSelector).hide().html(' ');
                csJq(csCartContent.items).each(function(index, csCartData) {
                    if (csCartData.vendor != '') csProductVendorArr.push(csCartData.vendor);
                    if (csCartData.product_type != '') csProductTypeArr.push(csCartData.product_type);
                });
                csHasCondition = checkProductcondition(result_data.generalSettingData, csProductTypeArr, csProductVendorArr, 1)
                if ((getShippingPickup && result_data.shippingDeliveryDateSettingData.status == 0 && result_data.shippingDeliveryDateSettingData.date_status == 1) && (hasDelieverylocation || hasStorePickuplocation)) getShippingPickup = false;
                if ((hasDelieverylocation || hasStorePickuplocation || getShippingPickup) && csHasCondition) {
                    csJq(csAppendMainDivSelector).html(csResponseData).show();
                } else {
                    csJq(csAppendMainDivSelector).html(csResponseData).hide();
                    csJq('#csOrderTypeValue').val("");
                    csUpdateCart(0, 1);
                }
                csJq('#cs-tab3').append('<div class="csLoader1"><img src="' + csShippingAppBaseUrl + 'assets/images/loading.gif"></div>');
                csJq("#cs-location-list").html(locationHtml);
                csJq("#cs-tab3 .tab-inner-content").hide();
                if (csHasCondition) {
                    csJq('.cs-tab_last[rel="cs-tab1"]').hide();
                    if (hasDelieverylocation == true) csJq('.cs-tab_last[rel="cs-tab2"]').show();
                    if (getShippingPickup == true) {
                        csCartPropertiesCheck = false;
                        csJq(csAppendMainDivSelector).show();
                        csJq('.cs-tab_last[rel="cs-tab1"]').show().trigger('click');
                    }
                    if (hasStorePickuplocation == true) {
                        csJq('.cs-tab_last[rel="cs-tab3"]').show();
                        dislayLocationBasedProduct()
                    }
                }
                csJq(".csLoader").hide();
                csDefaultSelectedValue(hasDelieverylocation, hasStorePickuplocation, getShippingPickup);
                if (csGeneralSettingData.gen_google_api_key != undefined && csGeneralSettingData.gen_google_api_key != "" && csGeneralSettingData.gen_google_api_key != null && csGoogleMapLocations.length != 0) {
                    csLoadScript("https://polyfill.io/v3/polyfill.min.js?features=default", () => {
                        csLoadScript("https://maps.googleapis.com/maps/api/js?key=" + csGeneralSettingData.gen_google_api_key + "&v=weekly&libraries=geometry", () => {
                            if (google != undefined) {
                                if (result_data.generalSettingData.gen_display_same_location_product == 1) {
                                    csJq('.csLoader1').remove();
                                    csJq('#cs-tab3').append('<div class="csLoader1"><img src="' + csShippingAppBaseUrl + 'assets/images/loading.gif"></div>');
                                    csJq("#cs-tab3 .tab-inner-content").hide();
                                }
                                csLoadMapCanvas(csGoogleMapLocations);
                            }
                        });
                    });
                }
                if (csJq('.cs-radio-card').length == 1 && csJq('.cs-tab_last[rel="cs-tab3"]').hasClass('active') == true) {
                    csJq('.cs-radio-card:first-child').trigger('click');
                }
                if (typeof csOuterfunction != 'undefined') {
                    csOuterfunction();
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    }
    async function getAppData() {
        var csResponseData = false;
        var csFormData = new FormData();
        csFormData.append("shop", csShopify.shop);
        csFormData.append("product_ids", csProductIds);
        await csJq.ajax({
            url: csShippingAppBaseUrl + "cs-sbz-front-data",
            type: "POST",
            data: csFormData,
            dataType: "JSON",
            contentType: false,
            processData: false,
            success: function(result) {
                if (result.msg == 200) {
                    if (result.success) {
                        result_data = result;
                        getWidget(result_data, csCartContent);
                        if (csGeneralSettingData) {
                            if (csGeneralSettingData.gen_hide_additional_checkout_button == 1) {
                                csJq(".additional-checkout-buttons").hide();
                            }
                        }
                        csCreateCustomDropdown();
                    }
                    if (result.error) {
                        csJq(csAppendMainDivSelector).html("");
                    }
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            },
        });
        return csResponseData;
    }
    function csSearchOrSelect(csCartContent) {
        csProductIds = [], varianIds = [], cart = csCartContent
        csJq(cart.items).each(function(index, csCartData) {
            csProductIds.push(csCartData.product_id);
            varianIds.push(csCartData.id);
        });
        var csPostalCode1 = csJq("#postal_code").val();
        if (csPostalCode1 != '' && csPostalCode1 != undefined) {
            var csPostalCode = csPostalCode1.replace(/-|\s/g, "");
        }
        localStorage.setItem("_cspcod_", csPostalCode);
        if (result_data.msg == 200) {
            var notshow = 0,
                deliveryCollect = [],
                haswidget = false;
            if (result_data.success) {
                csJq(checkout_selectors).attr("disabled", false);
                csLocations = result_data.locations;
                csJq(csLocations).each(function(index, location) {
                    getDelivery = csCheckProductDeliveryStatus(location.deliverySettingData, cart, "localdelivery");
                    var getzip = zipCodeMatch(location.deliverySettingData.zip_codes, csPostalCode, location.country_code, location);
                    if (getzip && getDelivery) {
                        notshow++;
                        deliveryCollect.push(index);
                    }
                    if (notshow == 1) {
                        csDateAndTimePicker(location.deliverySettingData, "localdelivery");
                        csJq("#csLocationId").val(location.id);
                        csCheckValidation(1);
                        if (typeof sbzZipcodeUpdate != 'undefined') sbzZipcodeUpdate(csPostalCode);
                        csJq("form[action*='/cart']:not(.sbzForm),form[action='/cart?locale=en']").attr("action", '/cart');
                        var get_url = csJq("form[action*='/cart']:not(.sbzForm),form[action='/cart?locale=en']").attr("action");
                        if (typeof get_url == 'undefined') get_url = '/cart'
                        get_url = get_url.indexOf("locale=") > -1 ? get_url + "&" : get_url + "?";
                        if (get_url.includes('contact_information') == false) var action_url = `${get_url}step=contact_information&checkout[shipping_address][address1]=&checkout[shipping_address][address2]=&checkout[shipping_address][city]=&checkout[shipping_address][zip]=${csJq("#postal_code").val()}&checkout[shipping_address][country]=&checkout[shipping_address][province]=`;
                        if (window.unsetCheckoutInfo == undefined) {
                            csJq("form[action*='/cart']:not(.sbzForm),form[action='/cart?locale=en'],form[action='/checkout']").attr("action", action_url);
                        }
                        return false;
                    }
                });
                csJq("#postal-code-error").parent().hide();
            }
            if (result_data.error || notshow == 0) {
                csJq("form[action*='/cart']:not(.sbzForm),form[action='/cart?locale=en']").attr("action", '/cart');
                csJq("#postal-code-error").text(result_data.generalSettingData.gen_loc_zip_error_message_text).parent().show();
                csJq("#postal-code-error").show();
                csJq("#csDatepicker, #csTimePicker, .time-block").parent().hide().val("");
                csJq("#csDeliveryDateValue,#csDeliveryTimeValue,#csDeliveryDayValue,#csDeliveryZipValue,#csDeliveryLocationValue,#csLocationAddress1,#csPickupDateValue,#csPickupTimeValue,#csPickupDayValue,#csShippingDateValue,#csShippingDayValue").val("");
                if (result_data.generalSettingData.gen_date_time_required == 1 || csJq("#required-error #postal-code-error").length > 0) {
                    csJq(checkout_selectors).attr("disabled", true);
                    csJq('#required-error').hide();
                    csJq('#csDatepicker').val("");
                }
            }
        }
    }
    function zipCodeMatchForUK(destPostalCode, zipCodes) {
        destPostalCode = destPostalCode.replace(/\s/g, "");
        var regex = /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/i;
        if (regex.test(destPostalCode) == false) {
            return -1;
        }
        customerZip = destPostalCode.slice(0, -3).toLowerCase();
        codes = zipCodes.split(",");
        customerZipTrueFalse = false;
        destPostalCode = destPostalCode.toLowerCase();
        common_codes = [];
        csJq(codes).each(function(index, code) {
            code = code.replace(/-|\s/g, "");
            is_found_start = code.indexOf('*');
            is_found_len = code.indexOf('#');
            if (is_found_start > -1) {
                if (is_found_len > -1 && is_found_start > -1 && code.length == destPostalCode.length) {
                    code = code.replace(/#/g, "");
                }
                code = code.replace("*", "");
                if (customerZipTrueFalse != true) {
                    switch (code.length) {
                        case 4:
                            if (customerZip == code) {
                                customerZipTrueFalse = true;
                            }
                            break;
                        case 3:
                            if (isNaN(code[2]) == false) {
                                if (isNaN(code.substr(0, 2)) == true && isNaN(code[2]) == false && customerZip == code) {
                                    customerZipTrueFalse = true;
                                } else if (isNaN(code[0]) == true && isNaN(code.substr(1, 2)) == false && customerZip.substr(0, 3) == code) {
                                    customerZipTrueFalse = true;
                                } else if (isNaN(code[0]) == true && isNaN(code[1]) == false && isNaN(code[2]) == true && customerZip == code) {
                                    customerZipTrueFalse = true;
                                }
                            } else {
                                if (isNaN(code.substr(0, 2)) == true && customerZip == code) {
                                    customerZipTrueFalse = true;
                                }
                            }
                            break;
                        case 2:
                            if (isNaN(code.substr(0, 2)) == true && isNaN(destPostalCode[2]) == false && customerZip == code) {
                                customerZipTrueFalse = true;
                            } else if (isNaN(code[0]) == true && customerZip[1] != undefined && isNaN(customerZip[1]) == false && customerZip == code) {
                                customerZipTrueFalse = true;
                            } else if (isNaN(code[0]) == true && isNaN(customerZip[1]) == true && customerZip.substr(0, 2) == code) {
                                customerZipTrueFalse = true;
                            }
                            break;
                        case 1:
                            if (isNaN(code[0]) == true && isNaN(destPostalCode[1]) == false && customerZip[0] == code) {
                                customerZipTrueFalse = true;
                            }
                            break;
                    }
                }
            } else {
                if (code.indexOf("=") > -1) {
                    min = code.split("=")[0], max = code.split("=")[1], range_codes = range(min, max);
                    csJq(range_codes).each(function(index, v) {
                        common_codes.push(v)
                    });
                } else {
                    common_codes.push(code);
                }
            }
            if (customerZipTrueFalse == false && common_codes.includes(destPostalCode) != false) {
                customerZipTrueFalse = true;
            }
        });
        return customerZipTrueFalse;
    }
    function zipCodeMatch(zipCodes = "", dest_postal_code = "", country_code, location) {
        if (zipCodes != null && zipCodes != "" && dest_postal_code != "") {
            zipCodes = zipCodes.toLowerCase();
            if (country_code == 'GB') {
                is_found_code = zipCodeMatchForUK(dest_postal_code, zipCodes)
                if (is_found_code == -1) {
                    return false;
                }
            } else {
                dest_postal_code = dest_postal_code.toLowerCase();
                is_found_code = false;
                var common_codes = [],
                    common_codes_star = [],
                    common_codes_star_5 = [],
                    common_codes_star_4 = [],
                    common_codes_star_3 = [],
                    common_codes_star_2 = [],
                    common_codes_star_1 = [];
                codes = zipCodes.split(",");
                csJq(codes).each(function(index, code) {
                    var code = code.replace(/-|\s/g, ""),
                        is_found_start = code.indexOf("*"),
                        is_found_len = code.indexOf("#");
                    if (is_found_start > -1) {
                        if (is_found_len > -1 && is_found_start > -1 && code.length == dest_postal_code.length) code = code.replace(/#/g, "");
                        code = code.replace("*", "");
                        if (code.indexOf("#") == -1) {
                            common_codes_star.push(code);
                            if (code.length == 5) {
                                common_codes_star_5.push(code);
                            } else if (code.length == 4) {
                                common_codes_star_4.push(code);
                            } else if (code.length == 3) {
                                common_codes_star_3.push(code);
                            } else if (code.length == 2) {
                                common_codes_star_2.push(code);
                            } else if (code.length == 1) {
                                common_codes_star_1.push(code);
                            }
                        }
                    } else {
                        if (code.indexOf("=") > -1) {
                            var min = code.split("=")[0],
                                max = code.split("=")[1],
                                range_codes = range(min, max);
                            csJq(range_codes).each(function(index, v) {
                                common_codes.push(v.toString());
                            });
                        } else {
                            common_codes.push(code);
                        }
                    }
                });
                if (common_codes.includes(dest_postal_code) != false) is_found_code = true;
                if (is_found_code === false && common_codes_star != "" && common_codes_star.length > 0) {
                    common_codes_star = common_codes_star.filter(onlyUnique);
                    csJq(common_codes_star).each(function(index, code) {
                        var search_zipcode_5 = dest_postal_code.substr(0, 5);
                        var search_zipcode_4 = dest_postal_code.substr(0, 4);
                        var search_zipcode_3 = dest_postal_code.substr(0, 3);
                        var search_zipcode_2 = dest_postal_code.substr(0, 2);
                        var search_zipcode_1 = dest_postal_code.substr(0, 1);
                        if (code.includes(dest_postal_code) != false && is_found_code != true && code.length > 0) is_found_code = true;
                        if (common_codes_star_5.includes(search_zipcode_5) != false && is_found_code != true && common_codes_star_5.length > 0) is_found_code = true;
                        if (common_codes_star_4.includes(search_zipcode_4) != false && is_found_code != true && common_codes_star_4.length > 0) is_found_code = true;
                        if (common_codes_star_3.includes(search_zipcode_3) != false && is_found_code != true && common_codes_star_3.length > 0) is_found_code = true;
                        if (common_codes_star_2.includes(search_zipcode_2) != false && is_found_code != true && common_codes_star_2.length > 0) is_found_code = true;
                        if (common_codes_star_1.includes(search_zipcode_1) != false && is_found_code != true && common_codes_star_1.length > 0) is_found_code = true;
                    });
                }
            }
            if (is_found_code == true && location.deliverySettingData.zip_code_status == 1) {
                is_found_code = false;
            } else if (is_found_code == false && location.deliverySettingData.zip_code_status == 1) {
                is_found_code = true;
            }
            return is_found_code;
        }
        return false;
    }
    function csDateAndTimePicker(csGetData, ordertype) {
        csShopData = csGetData;
        if (typeof csJq.fn.datepicker != "undefined") {
            var csDeliverySetting = csGetData,
                csGeneralSetting = result_data.generalSettingData,
                csFullDaysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                csDaysArr = csGeneralSetting.gen_days_text.split(","),
                csDaysArrNew = [],
                csMonthsArr = csGeneralSetting.gen_months_text.split(","),
                csNextPervArr = csGeneralSetting.gen_next_previous_text.split(","),
                csGenHideAdditionalCheckoutButton = parseInt(csGeneralSetting.gen_hide_additional_checkout_button),
                csDateFormat = csGeneralSetting.gen_date_format,
                csTimeFormat = "hh:ii aa",
                csFirstDay = parseInt(csDeliverySetting.first_day_calender),
                csCurrentDate = new Date(csDeliverySetting.current_date),
                csCurrentTime = csDeliverySetting.current_time,
                csTimeSettingStatus = parseInt(csDeliverySetting.time_status),
                csTimeSettingStatus = csGeneralSetting.gen_hide_front_time_slot == 1 ? 0 : csTimeSettingStatus,
                date_availability = ordertype == "localdelivery" ? csDeliverySetting.delivery_date_availability : ordertype == "storepickup" ? csDeliverySetting.pickup_date_availability : csDeliverySetting.shipping_date_availability,
                csDisabled_days = ordertype == "localdelivery" ? csDeliverySetting.disable_delivery_date : ordertype == "storepickup" ? csDeliverySetting.disable_pickup_date : csDeliverySetting.disable_shipping_date,
                csenabled_days = ordertype == "localdelivery" ? csDeliverySetting.enable_delivery_date : ordertype == "storepickup" ? csDeliverySetting.enable_pickup_date : csDeliverySetting.enable_shipping_date,
                csDisabledDays = ordertype == "localdelivery" ? csDeliverySetting.delivery_day : ordertype == "storepickup" ? csDeliverySetting.pickup_day : csDeliverySetting.shipping_day,
                disable_limit_per_day = csDeliverySetting.disable_limit_per_day,
                cut_off_date = csDeliverySetting.cut_off_date,
                minimum_interval_day = ordertype == "localdelivery" ? csDeliverySetting.minimum_delivery_interval_day != null ? csDeliverySetting.minimum_delivery_interval_day : 0 : ordertype == "storepickup" ? csDeliverySetting.minimum_pickup_interval_day != null ? csDeliverySetting.minimum_pickup_interval_day : 0 : csDeliverySetting.minimum_shipping_interval_day != null ? csDeliverySetting.minimum_shipping_interval_day : 0,
                minimum_interval_day = (window.setMaxDays) ? window.setMaxDays : minimum_interval_day,
                maximum_day = ordertype == "localdelivery" ? csDeliverySetting.maximum_delivery_day != null ? csDeliverySetting.maximum_delivery_day : 0 : ordertype == "storepickup" ? csDeliverySetting.maximum_pickup_day != null ? csDeliverySetting.maximum_pickup_day : 0 : csDeliverySetting.maximum_shipping_day != null ? csDeliverySetting.maximum_shipping_day : 0,
                csMinDate = parseInt(minimum_interval_day) > 0 ? new Date(new Date(csCurrentDate).getTime() + minimum_interval_day * 24 * 60 * 60 * 1000) : csCurrentDate,
                csMaxDate = parseInt(maximum_day) > 0 ? new Date(new Date(csMinDate).getTime() + (maximum_day - 1) * 24 * 60 * 60 * 1000) : "",
                csDatepicker = ordertype == "localdelivery" ? "#csDatepicker" : ordertype == "storepickup" ? "#csDatepicker1" : "#csShippingpicker",
                csTimepicker = ordertype == "localdelivery" ? "#csTimePicker" : ordertype == "storepickup" ? "#csTimePicker1" : "#csTimeShippingPicker",
                csDayValue = ordertype == "localdelivery" ? "#csDeliveryDayValue" : ordertype == "storepickup" ? "#csPickupDayValue" : "#csShippingDayValue",
                csDateValue = ordertype == "localdelivery" ? "#csDeliveryDateValue" : ordertype == "storepickup" ? "#csPickupDateValue" : "#csShippingDateValue",
                csTimeValue = ordertype == "localdelivery" ? "#csDeliveryTimeValue" : ordertype == "storepickup" ? "#csPickupTimeValue" : "#csShippingTimeValue",
                csGeneralcutoftime = ordertype == "localdelivery" && csGeneralSetting.gen_local_delivery_cut_off != null ? csGeneralSetting.gen_local_delivery_cut_off[csCurrentDate.getDay()] : ordertype == "storepickup" && csGeneralSetting.gen_local_delivery_cut_off != null ? csGeneralSetting.gen_store_pickup_cut_off[csCurrentDate.getDay()] : ordertype == "shipping" && csGeneralSetting.gen_local_delivery_cut_off != null ? csGeneralSetting.gen_shipping_delivery_date_cut_off[csCurrentDate.getDay()] : '',
                cut_off_time = csDeliverySetting.active_cut_off == 1 ? csDeliverySetting.cut_off_time : csGeneralcutoftime != '' && csGeneralcutoftime != null && csGeneralcutoftime != "undefined" ? csGeneralcutoftime : '',
                gen_disable_holidays = csGeneralSetting.gen_disable_holidays != null ? csGeneralSetting.gen_disable_holidays.split(',') : "";
            if (csGenHideAdditionalCheckoutButton == 1) {
                csJq(".additional-checkout-buttons").hide();
            }
            csJq(csDatepicker).parent().show();
            if (csGeneralSetting.gen_date_time_selection == 0 && ordertype == 'storepickup') {
                csJq(csDatepicker).parent().hide();
                csUpdateCart(0);
                if (csGeneralSetting.gen_date_time_required == 1) {
                    csJq(checkout_selectors).attr("disabled", false);
                }
            }
            csDisableDateArray = [], csDisableLimitPerDay = [], csDisableCutoffDate = [], csEnableDateArray = [];
            if (csGeneralSetting.gen_disable_holidays != null && csGeneralSetting.gen_disable_holidays != "") {
                csJq(gen_disable_holidays).each(function(csIndex, holiday) {
                    csDisableDate1 = new Date(holiday.replace(/\-/g, "/") + ' ' + csCurrentTime);
                    csDisableDateArray.push(csDateFormatter(csDateFormat, csDisableDate1));
                });
            }
            csJq(csDisabled_days).each(function(csIndex, csDisableDate) {
                csDisableDate1 = new Date(csDisableDate.replace(/\-/g, "/") + ' ' + csCurrentTime);
                csDisableDateArray.push(csDateFormatter(csDateFormat, csDisableDate1));
            });
            csJq(disable_limit_per_day).each(function(csIndex, csDisableDate) {
                csDisableDate1 = new Date(csDisableDate.replace(/\-/g, "/") + ' ' + csCurrentTime);
                csDisableLimitPerDay.push(csDateFormatter(csDateFormat, csDisableDate1));
            });
            csJq(cut_off_date).each(function(csIndex, csDisableDate) {
                csDisableDate1 = new Date(csDisableDate.replace(/\-/g, "/") + ' ' + csCurrentTime);
                csDisableCutoffDate.push(csDateFormatter(csDateFormat, csDisableDate1));
            });
            csJq(csenabled_days).each(function(csIndex, csenableDate) {
                csenableDate1 = new Date(csenableDate.replace(/\-/g, "/") + ' ' + csCurrentTime);
                csenableDate = csDateFormatter(csDateFormat, csenableDate1);
                csEnableDateArray.push(csenableDate);
            });
            var cutoffdate = csMinDate;
            var weekDayArr = csDisabledDays == null || csDisabledDays == 'all' ? "0,1,2,3,4,5,6".split(',') : csDisabledDays.split(',');
            csMinDate = dateBetweenWorkingDays(weekDayArr, csDisableDateArray, csDeliverySetting.current_date, csDeliverySetting.current_time, minimum_interval_day, cut_off_time, cutoffdate);
          console.log('csMinDate-----', csMinDate);  
          csJq(csDaysArr).each(function(csIndex, csDays) {
                if (csDays.includes('|')) {
                    csDays = csDays.split("|");
                    csDays = csDays[0]
                }
                csDaysArrNew.push(csDays);
            })
            csJq(csDatepicker).datepicker({
                language: {
                    days: csDaysArrNew,
                    daysShort: csDaysArrNew,
                    daysMin: csDaysArrNew,
                    months: csMonthsArr,
                    monthsShort: csMonthsArr,
                    today: "Today",
                    clear: "Clear",
                    dateFormat: csDateFormat,
                    timeFormat: csTimeFormat,
                    firstDay: csFirstDay,
                },
                position: "top left",
                minDate: csMinDate,
                maxDate: csMaxDate,
                prevText: csNextPervArr[0],
                nextText: csNextPervArr[1],
                autoClose: true,
                onRenderCell: function(csDate, csCellType) {
                    var disabled = false,
                        fulldate = '',
                        attrText = '';
                    if (csCellType == "day") {
                        var csDay = csDate.getDay();
                        if (disabled != true) {
                            csPrettyDate = csDateFormatter(csDateFormat, csDate);
                            if ((csDisabledDays != "all" && csDisabledDays.indexOf(csDay) == -1) || (csDisableDateArray.indexOf(csPrettyDate) != -1 && csenabled_days.length == 0) || (csDisableCutoffDate.indexOf(csPrettyDate) != -1)) {
                                disabled = true;
                            }
                            if (csDisableLimitPerDay.indexOf(csPrettyDate) != -1) {
                                disabled = true;
                                fulldate = 'cs-disable-limit-per-day', attrText = window.hasAddFullText == true && window.AddFullText == '' ? 'full' : window.AddFullText != '' ? window.AddFullText : '';
                            }
                            if (csEnableDateArray.indexOf(csPrettyDate) <= -1 && date_availability == 1 && csenabled_days.length != 0) {
                                disabled = true;
                            }
                        } else {
                            disabled = false;
                        }
                    }
                    return {
                        disabled: disabled,
                        classes: fulldate,
                        html: attrText
                    };
                },
                onSelect: function(dateText, fullDate) {
                    var csSelectedDay = new Date(fullDate);
                    csSelectedDay = csSelectedDay.getDay();
                    csJq(csDayValue).val(csFullDaysArr[csSelectedDay]);
                    csJq(csDateValue).val(dateText);
                    if (csTimeSettingStatus == 1) {
                        csJq(csTimeValue).val("");
                        csJq(csTimepicker).val("");
                        getDate = csYmdDateFormate(csDateFormat, dateText);
                        timeHtmlCode = csCheckTimeSlotHtml(csDeliverySetting, csSelectedDay, csFullDaysArr, getDate, ordertype, 1);
                        hastime = csJq(csDatepicker).closest(".cs-tab_content").find(".select-block").is(":hidden") ? 0 : 1;
                        csCheckValidation(1, hastime);
                    } else {
                        csJq(csTimeValue).val("");
                        csUpdateCart(0);
                        hastime = csJq(csDatepicker).closest(".cs-tab_content").find(".select-block").is(":hidden") ? 0 : 1;
                        csCheckValidation(1, hastime);
                    }
                    if (csJq(".cs-tab_last[rel='cs-tab2']").hasClass("active") == true) csJq("#csDeliveryZipValue").val(csJq("#postal_code").val());
                    if (csTimeSettingStatus == 1 && csDeliverySetting.time_format == 1 && csDeliverySetting.is_number_of_orders == true) {
                        csJq(csTimePickerVal).append('<div class="csLoaderTime"><img src="' + csShippingAppBaseUrl + 'assets/images/loading.gif"></div>')
                        csJq('.cs-time-picker').hide();
                        var csshippingDateValue = csJq("#csShippingDateValue").val(),
                            csDeliveryDateValue = csJq("#csDeliveryDateValue").val(),
                            csPickupDateValue = csJq("#csPickupDateValue").val(),
                            shop = csShopify.shop,
                            location_id = csJq('#csLocationId').val(),
                            order_type = csJq('#csOrderTypeValue').val(),
                            dataTime = {};
                        selected_date = csDeliveryDateValue != "" ? csDeliveryDateValue : csPickupDateValue != "" ? csPickupDateValue : csshippingDateValue;
                        order_type_val = order_type == "Shipping" ? 0 : order_type == "Local Delivery" ? 1 : 2;
                        dataTime.shop = shop;
                        dataTime.order_type = order_type_val;
                        if (csJq('#csLocationId').val() != '') dataTime.location_id = location_id;
                        if (selected_date != '') {
                            dataTime.selected_date = selected_date;
                            csJq.ajax({
                                url: csShippingAppBaseUrl + "get-date-wise-slot-data",
                                type: "POST",
                                data: dataTime,
                                dataType: "JSON",
                                success: function(result) {
                                    if (typeof result.success != 'undefined') {
                                        if (result.dateTimeSlotData.length != 0) {
                                            hideSlot = [];
                                            csJq(result.dateTimeSlotData[csSelectedDay]).each(function(index, data) {
                                                if (parseInt(data.orders_count) >= parseInt(data.number_of_orders) && parseInt(data.number_of_orders) != 0) {
                                                    hideSlot.push(data.slot_value_label);
                                                }
                                            })
                                            if (hideSlot.length > 0) {
                                                csJq(hideSlot).each(function(index, data) {
                                                    csJq('.cs-time-picker').show();
                                                    csJq('.cs-time-picker[data-value="' + data + '"]').hide();
                                                });
                                            } else {
                                                csJq('.cs-time-picker').show();
                                            }
                                        } else {
                                            csJq('.cs-time-picker').show();
                                        }
                                    } else {
                                        csJq('.cs-time-picker').show();
                                    }
                                    csJq('.csLoaderTime').hide();
                                    if (typeof sbzDateUpdate != 'undefined') {
                                        sbzDateUpdate(dateText);
                                    }
                                    if (typeof csCheckTimeSlotHtmlUpdate != 'undefined') {
                                        csCheckTimeSlotHtmlUpdate(csDeliverySetting, csSelectedDay, csFullDaysArr, getDate, ordertype, 1);
                                    }
                                },
                                error: function(xhr, ajaxOptions, thrownError) {
                                    console.log(xhr.status);
                                    console.log(thrownError);
                                },
                            });
                        }
                    } else {
                        csJq('.csLoaderTime').hide();
                        if (typeof sbzDateUpdate != 'undefined') {
                            sbzDateUpdate(dateText);
                        }
                        if (typeof csCheckTimeSlotHtmlUpdate != 'undefined') {
                            csCheckTimeSlotHtmlUpdate(csDeliverySetting, csSelectedDay, csFullDaysArr, getDate, ordertype, 1);
                        }
                    }
                },
            });
            if ((csGeneralSetting.gen_date_time_selection == 1 && ordertype == 'storepickup' && csTimeSettingStatus == 1) || (ordertype == 'localdelivery' && csTimeSettingStatus == 1) || (ordertype == 'shipping' && csTimeSettingStatus == 1)) {
                csJq(csTimepicker).html();
                csJq(csTimepicker).parent().show();
            } else {
                csJq(csTimepicker).parent().hide();
            }
        }
    }
    function csCreateCustomDropdown() {
        csJq(".cs-tab_content").hide();
        csJq(".cs-tab_content:first").show();
    }
    function csTabRefresh(_this) {
        var csTabVal = csJq(_this).attr("rel"),
            csTabClass = csJq(_this).attr("class"),
            typeOfOrder = "";
        if (csTabVal == "cs-tab1") {
            typeOfOrder = "Shipping";
            csUpdateCart(0);
        } else if (csTabVal == "cs-tab2") {
            typeOfOrder = "Local Delivery";
        } else if (csTabVal == "cs-tab3") {
            typeOfOrder = "Store Pickup";
        }
        csJq("#csDatepicker,#csDatepicker1,#csTimePicker,#csTimePicker1,#csTimeShippingPicker,#postal-code-error").parent().hide();
        csJq("#csDatepicker,#csDatepicker1,#csShippingpicker").datepicker().data("datepicker").clear();
        csJq("#csOrderTypeValue").val(typeOfOrder);
        csJq("#csDeliveryDayValue,#csDeliveryZipValue,#csDeliveryDateValue,#csDeliveryTimeValue,#csTimePicker,#csTimePicker1,#postal_code,#csShippingDateValue,#csShippingDayValue").val("");
    }
    function csCheckValidation(notshow = "", csTimeSettingStatus = 1) {
        csShopData = result_data, hasError = false, csDateValue = csJq(".cs-tab_last[rel='cs-tab2']").hasClass("active") ? "#csDeliveryDateValue" : csJq(".cs-tab_last[rel='cs-tab3']").hasClass("active") ? "#csPickupDateValue" : "#csShippingDateValue", csTimeValue = csJq(".cs-tab_last[rel='cs-tab2']").hasClass("active") ? "#csDeliveryTimeValue" : csJq(".cs-tab_last[rel='cs-tab3']").hasClass("active") ? "#csPickupTimeValue" : "#csShippingTimeValue";
        if (csJq(".cs-tab_last[rel='cs-tab1']").hasClass("active") == true || csJq(".cs-tab_last[rel='cs-tab2']").hasClass("active") == true || (csJq(".cs-tab_last[rel='cs-tab3']").hasClass("active") == true && csJq("#no_location").text() == "")) {
            if (notshow == 1) {
                if (csShopData != null) {
                    if (csShopData.generalSettingData.gen_date_time_required == 1) {
                        csJq("#required-error").html('<div class="error-cls"><span id="postal-code-error">' + csShopData.generalSettingData.gen_date_time_required_msg + "</span></div>").hide();
                        csJq(checkout_selectors).attr("disabled", true);
                        if (csTimeSettingStatus == 1 && csJq(csDateValue).val().length > 0 && csJq(csTimeValue).val().length > 0) {
                            hasError = true;
                        } else if (csTimeSettingStatus == 0 && csJq(csDateValue).val().length > 0) {
                            hasError = true;
                        }
                    } else {
                        hasError = true;
                    }
                }
            }
        } else {
            hasError = true;
        }
        if (hasError == true || csJq("#csShippingAppCode").is(':visible') == false) {
            csJq(checkout_selectors).attr("disabled", false);
            csJq("#required-error").html("");
        } else {
            if (csJq(".cs-tab_last[rel='cs-tab1']").hasClass("active") == true || (csJq('#postal_code').val() != '' && csJq(".cs-tab_last[rel='cs-tab2']").hasClass("active") == true) || (csJq('.cs-radio-card').hasClass('csactive') == true && csJq(".cs-tab_last[rel='cs-tab3']").hasClass("active") == true)) csJq('#required-error').show()
        }
    }
    function csUpdateCart(haswidget, hasnoattr = 0) {
        csJq.getJSON("/cart.js", function(cart) {
            if (haswidget == 1) {
                csCartContent = cart;
                getWidget(result_data, csCartContent);
                csSearchOrSelect(csCartContent);
            }
            if (hasnoattr == 1) {
                csJq('#csOrderTypeValue').val("");
            }
            if (cart.item_count > 0) {
                var csOrderTypeValue = csJq("#csOrderTypeValue").val(),
                    csLocationIdName = csJq("#csLocationId").attr("name"),
                    csLocationValue = csJq("#csLocationId").val(),
                    csLocationName = csJq('.cs-radio-card[data-location-mainid="' + csLocationValue + '"] h6').text().trim(),
                    csLocationAttr = csJq("#csDeliveryLocationValue").attr("name"),
                    csDeliveryZipValue = csJq("#csDeliveryZipValue").val(),
                    csDeliveryZipAttr = csJq("#csDeliveryZipValue").attr("name"),
                    csOrderTypeAttr = csJq("#csOrderTypeValue").attr("name"),
                    csDeliveryDayValue = csJq("#csDeliveryDayValue").val(),
                    csDeliveryDateValue = csJq("#csDeliveryDateValue").val(),
                    csDeliveryTimeValue = csJq("#csDeliveryTimeValue").val(),
                    csDeliveryDayAttr = csJq("#csDeliveryDayValue").attr("name"),
                    csDeliveryDateAttr = csJq("#csDeliveryDateValue").attr("name"),
                    csDeliveryTimeAttr = csJq("#csDeliveryTimeValue").attr("name"),
                    csPickupDayValue = csJq("#csPickupDayValue").val(),
                    csPickupDateValue = csJq("#csPickupDateValue").val(),
                    csPickupTimeValue = csJq("#csPickupTimeValue").val(),
                    csPickupTimeAttr = csJq("#csPickupTimeValue").attr("name"),
                    csPickupDayAttr = csJq("#csPickupDayValue").attr("name"),
                    csPickupDateAttr = csJq("#csPickupDateValue").attr("name"),
                    csshippingDateValue = csJq("#csShippingDateValue").val(),
                    csshippingDateAttr = csJq("#csShippingDateValue").attr("name"),
                    csshippingDayValue = csJq("#csShippingDayValue").val(),
                    csshippingDayAttr = csJq("#csShippingDayValue").attr("name"),
                    csShippingTimeValue = csJq("#csShippingTimeValue").val(),
                    csShippingTimeAttr = csJq("#csShippingTimeValue").attr("name"),
                    csLoactionAddressAttr = csJq("#csLocationAddress1").attr("name"),
                    csLoactionAddressValue = csJq("#csLocationAddress1").val(),
                    csPostData = {},
                    csLineProp = cart.items[0].properties != null && cart.items[0].properties != undefined ? cart.items[0].properties : {};
                csPostData = {
                    line: 1,
                    quantity: cart.items[0].quantity,
                    properties: ''
                };
                if (csShopify.shop == "hello.myshopify.com" || window.notAddProperty == true) {
                    console.log('notAddProperty')
                    csLineProp = csLineProp;
                } else {
                    csLineProp["_odd"] = csDeliveryDayValue != "" ? csDeliveryDayValue : csPickupDayValue != "" ? csPickupDayValue : csshippingDayValue;
                    csLineProp["_odate"] = csDeliveryDateValue != "" ? csDeliveryDateValue : csPickupDateValue != "" ? csPickupDateValue : csshippingDateValue;
                    csLineProp["_odm"] = csOrderTypeValue != "" ? csOrderTypeValue : " ";
                    csLineProp["_odt"] = csDeliveryTimeValue != "" ? csDeliveryTimeValue : csPickupTimeValue != "" ? csPickupTimeValue : csShippingTimeValue;
                    csLineProp["_LocationId"] = csLocationValue;
                }
                csPostData.properties = csLineProp;
                (csPostData[csLocationAttr] = csOrderTypeValue == "Store Pickup" ? csLocationName : ""), (csPostData[csOrderTypeAttr] = csOrderTypeValue), (csPostData[csDeliveryZipAttr] = csDeliveryZipValue), (csPostData[csDeliveryDateAttr] = csDeliveryDateValue), (csPostData[csDeliveryDayAttr] = csDeliveryDayValue), (csPostData[csDeliveryTimeAttr] = csDeliveryTimeValue), (csPostData[csPickupDateAttr] = csPickupDateValue), (csPostData[csPickupDayAttr] = csPickupDayValue), (csPostData[csPickupTimeAttr] = csPickupTimeValue), (csPostData[csshippingDateAttr] = csshippingDateValue), (csPostData[csshippingDayAttr] = csshippingDayValue), (csPostData[csShippingTimeAttr] = csShippingTimeValue), (csPostData[csLoactionAddressAttr] = csLoactionAddressValue), (csPostData[csLocationIdName] = csLocationValue);
                csJq.ajax({
                    url: "/cart/change.js?csapp=shipcs",
                    type: "post",
                    dataType: "json",
                    data: csPostData,
                    async: !1,
                    success: function(csCart) {
                        if (typeof AfterUpdate != 'undefined') {
                            AfterUpdate(csCart, csLineProp);
                        }
                    },
                });
            }
        });
    }
    function csDefaultSelectedValue(hasDelieverylocation, hasStorePickuplocation, getShippingPickup) {
        if ((csCartAttributes != "" && csCartAttributes != undefined && csCartProperties._odd != "" && csCartProperties._odd != undefined) || (csCartAttributes != "" && csCartAttributes != undefined && csCartAttributes["Type Of Order"] == "Store Pickup")) {
            if ((csCartAttributes["Type Of Order"] == "Local Delivery" && hasDelieverylocation == true)) {
                if (csJq(".cs-tab_last[rel='cs-tab2']").hasClass('active') == false) {
                    csJq(".cs-tab_last[rel='cs-tab2']").trigger("click");
                }
                if (csPostalCode != "" && csPostalCode != undefined && csPostalCode != null && csPostalCode != 'undefined') {
                    csJq("#postal_code").val(csPostalCode);
                    csSearchOrSelect(csCartContent);
                }
                csJq("#csOrderTypeValue").val("Local Delivery");
                csJq("#csDeliveryDateValue").val(csCartProperties._odate);
                csJq("#csDeliveryTimeValue").val(csCartProperties._odt);
                csJq("#csDeliveryDayValue").val(csCartProperties._odd);
                csJq("#csLocationId").val(csCartProperties._LocationId);
            } else if ((csCartAttributes["Type Of Order"] == "Store Pickup" && hasStorePickuplocation == true)) {
                if (csJq(".cs-tab_last[rel='cs-tab3']").hasClass('active') == false) {
                    csJq(".cs-tab_last[rel='cs-tab3']").addClass("active").trigger("click");
                    csJq("#cs-tab3").show();
                }
                Adress2 = result_data.locations[localStorage.getItem("_cslocationid_")].address2 != undefined ? result_data.locations[localStorage.getItem("_cslocationid_")].address2 : " ";
                csJq("#csShippingAddress1").val(result_data.locations[localStorage.getItem("_cslocationid_")].address1);
                csJq("#csShippingAddress2").val(Adress2);
                csJq("#csShippingCity").val(result_data.locations[localStorage.getItem("_cslocationid_")].city);
                csJq("#csShippingZip").val(result_data.locations[localStorage.getItem("_cslocationid_")].zip);
                csJq("#csOrderTypeValue").val("Store Pickup");
                csJq("#csPickupDateValue").val(csCartProperties._odate);
                csJq("#csPickupTimeValue").val(csCartProperties._odt);
                csJq("#csPickupDayValue").val(csCartProperties._odd);
                csJq("#csLocationId").val(csCartProperties._LocationId);
                csJq("#csDeliveryLocationValue").val(result_data.locations[localStorage.getItem("_cslocationid_")].name);
            } else if ((csCartAttributes["Type Of Order"] == "Shipping" && getShippingPickup == true && result_data.shippingDeliveryDateSettingData.status == 1)) {
                if (csJq(".cs-tab_last[rel='cs-tab1']").hasClass('active') == false) {
                    csJq(".cs-tab_last[rel='cs-tab1']").addClass("active").trigger("click");
                    csJq("#cs-tab1").show();
                }
                csJq("#csOrderTypeValue").val("Shipping");
                csJq("#csShippingDateValue").val(csCartProperties._odate);
                csJq("#csShippingTimeValue").val(csCartProperties._odt);
                csJq("#csShippingDayValue").val(csCartProperties._odd);
            } else {
                csJq(".cs-tabs .cs-tab_last:visible").eq(0).trigger('click');
            }
        } else {
            if (result_data.shippingDeliveryDateSettingData.status == 0 && getShippingPickup == false) {
                csJq(".cs-tab_last[rel='cs-tab2']").trigger("click");
            } else if (getShippingPickup == true) {
                if (csJq(".cs-tab_last[rel='cs-tab1']").hasClass('active') == false) {
                    csJq('.cs-tab_last[rel="cs-tab1"]').show();
                    csJq(".cs-tab_last[rel='cs-tab1']").addClass("active").trigger("click");
                    csJq("#cs-tab1").show();
                }
                csPostalCode = "";
                localStorage.removeItem("_cspcod_");
            } else {
                csJq(".cs-tabs .cs-tab_last:visible").eq(0).trigger('click');
            }
        }
    }
    function checkProductcondition(SettingData, csProductTypeArr, csProductVendorArr, hasComman) {
        var cartConditionalArr = [],
            matchProductCondition = 0,
            csHasCondition = false,
            condition_name = hasComman == 0 ? SettingData.condition_name : SettingData.gen_condition_name,
            conditional_activations = hasComman == 0 ? SettingData.conditional_activations : SettingData.gen_conditional_activations,
            cartProductVendorsArr = hasComman == 0 ? SettingData.conditional_activation_contains : SettingData.gen_conditional_activation_contains,
            activation_conditional_checkbox = hasComman == 0 ? SettingData.activation_conditional_checkbox : SettingData.gen_activation_conditional_checkbox,
            conditional_activation_status = hasComman == 0 ? SettingData.conditional_activation_status : SettingData.gen_conditional_activation_status,
            condition_total_weight_price = condition_name == 0 ? csCartContent.total_price : csCartContent.total_weight,
            condition_type = hasComman == 0 ? SettingData.condition_type : SettingData.gen_condition_type,
            set_condition = hasComman == 0 ? SettingData.set_condition : SettingData.gen_set_condition;
        if (hasComman == 0) {
            condition_price = condition_name == 0 ? SettingData.condition_price * 100 : SettingData.condition_price * 1000;
        } else {
            condition_price = condition_name == 0 ? SettingData.gen_condition_price * 100 : SettingData.gen_condition_price * 1000;
        }
        if (set_condition != 0) {
            if (condition_type == 0 && condition_total_weight_price > condition_price) {
                csHasCondition = true;
            } else if (condition_type == 1 && condition_total_weight_price < condition_price) {
                csHasCondition = true;
            }
            if (activation_conditional_checkbox != 0 && csHasCondition == true) {
                matchProductId = 0, notmatchProductId = 0, csHasCondition = false;
                if (conditional_activations == 3 || conditional_activations == 1) {
                    cartConditionalArr1 = []
                    cartConditionalArr = conditional_activations == 1 ? csProductTypeArr : csProductVendorArr;
                    cartConditionalArr1 = cartConditionalArr.filter(onlyUnique)
                    cartProductVendor = cartProductVendorsArr.split(',');
                    csJq(cartConditionalArr1).each(function(index, proItem) {
                        if (cartProductVendor.includes(proItem)) {
                            matchProductId++;
                        } else {
                            notmatchProductId++;
                        }
                    })
                } else {
                    cartProductVendor = cartProductVendorsArr.split(',');
                    cartConditionalArr1 = csCartContent.items;
                    csJq(csCartContent.items).each(function(index, proItem) {
                        id_item = csCartContent.items[index].id.toString();
                        proItem = conditional_activations == 0 ? cart_collections[id_item] : cart_tags[id_item];
                        if (cartProductVendor.some(r => proItem.includes(r))) {
                            matchProductId++;
                        } else {
                            notmatchProductId++;
                        }
                    })
                }
                if (conditional_activation_status == 0 && matchProductId <= 0) {
                    csHasCondition = true;
                }
                if (conditional_activation_status == 1 && matchProductId != 0) {
                    csHasCondition = true;
                }
                if (conditional_activation_status == 2 && notmatchProductId != 0) {
                    csHasCondition = true;
                }
                if (conditional_activation_status == 3 && matchProductId != 0 && notmatchProductId == 0) {
                    csHasCondition = true;
                }
            }
        } else {
            csHasCondition = true;
        }
        return csHasCondition;
    }
    function csCheckProductDeliveryStatus(SettingData, csCartContent, ordertype) {
        var csHasWidget = false,
            csProductIdArr = [],
            csDeliveryStatus = SettingData.status,
            csDeliveryDate = result_data.shippingDeliveryDateSettingData.date_status,
            csProductSelectionStatus = SettingData.products_selection,
            csProductRateVisibility = SettingData.product_rate_visibility,
            csSetProductIds = SettingData.product_id;
        if (csDeliveryStatus == 0 && csDeliveryDate == 1 && ordertype == 'shipping') {
            csDeliveryStatus = 1;
        }
        if ((csDeliveryStatus != 0 && csDeliveryStatus != undefined)) {
            csProductVendorArr = [], csProductTypeArr = [];
            csJq(csCartContent.items).each(function(index, csCartData) {
                csProductIdArr.push(csCartData.product_id);
                if (csCartData.vendor != '') csProductVendorArr.push(csCartData.vendor);
                if (csCartData.product_type != '') csProductTypeArr.push(csCartData.product_type);
            });
            csProductIdArr = csProductIdArr.filter(onlyUnique);
            csHasCondition = checkProductcondition(SettingData, csProductTypeArr, csProductVendorArr, 0)
            if (csHasCondition == true) {
                if (csProductSelectionStatus != 0) {
                    if (csProductIdArr.length > 0 && csSetProductIds.length > 0) {
                        matchProductId = 0, notmatchProductId = 0;
                        csJq(csProductIdArr).each(function(index, items) {
                            items = items.toString();
                            if (csSetProductIds.includes(items)) {
                                matchProductId++;
                            } else {
                                notmatchProductId++
                            }
                        });
                        if (csProductRateVisibility == 3) {
                            if (matchProductId != 0 && notmatchProductId == 0) {
                                csHasWidget = true;
                            }
                        } else if (csProductRateVisibility == 2) {
                            if (matchProductId == 0) {
                                csHasWidget = true;
                            }
                        } else if (csProductRateVisibility == 1) {
                            if (notmatchProductId == 0) {
                                csHasWidget = true;
                            }
                        } else if (csProductRateVisibility == 0) {
                            if (matchProductId <= csSetProductIds.length && matchProductId != 0) {
                                csHasWidget = true;
                            }
                        }
                    }
                } else {
                    csHasWidget = true;
                }
            }
            if (csDeliveryStatus == 1 && csDeliveryDate == 0 && ordertype == 'shipping') {
                csHasWidget = true;
            }
        }
        return csHasWidget;
    }
    function convertTime12to24(time12h) {
        var [time, modifier] = time12h.split(" ");
        var [hours, minutes, second] = time.split(":");
        if (hours === "12") hours = "00";
        if (modifier === "PM") hours = parseInt(hours, 10) + 12;
        if (second == undefined) second = "00";
        return `${hours}:${minutes}:${second}`;
    }
    function csCheckTimeSlotHtml(csDeliverySetting, csSelectedDay, csFullDaysArr, dateText, ordertype, hasdate) {
        csTimePickerVal = ordertype == "localdelivery" ? "#csTimePickerVal" : ordertype == "storepickup" ? "#csTimePickerVal1" : "#csTimeShippingVal", csDayValue = ordertype == "localdelivery" ? "#csDeliveryDayValue" : ordertype == "storepickup" ? "#csPickupDayValue" : "#csShippingDayValue", csDateValue = ordertype == "localdelivery" ? "#csDeliveryDateValue" : ordertype == "storepickup" ? "#csPickupDateValue" : "#csShippingDateValue";
        var csSlotWiseData = csDeliverySetting.slot_wise_data,
            csDefaultTime = csDeliverySetting.default_time,
            csHideSlots = parseInt(csDeliverySetting.is_hide_slots),
            csHideSlotsTime = parseInt(csDeliverySetting.hide_slots_time),
            csCurrentTime = csDeliverySetting.current_time,
            csCurrentDateMDY = csDeliverySetting.current_date,
            csActivepaddingTime = csDeliverySetting.active_padding_time,
            csPaddingTimeMinute = csDeliverySetting.padding_time_minute,
            selected_date = dateText;
        csJq(csDayValue).val(csFullDaysArr[csSelectedDay]);
        var timeHtmlCode = "";
        (changeTimestamp = new Date(dateText).getTime()), (csCurrentTimeStamp_only = new Date(csCurrentDateMDY).getTime());
        if (dateText) {
            if (csDeliverySetting.time_format == 1) {
                csJq.each(csSlotWiseData[csSelectedDay], function(index, csSlotWiseDataValue) {
                    hasdate = 0;
                    startStampformat = result_data.generalSettingData.gen_time_format == 0 ? convertTime12to24(csSlotWiseDataValue.start_time) : csSlotWiseDataValue.start_time + ":00";
                    endStampformat = result_data.generalSettingData.gen_time_format == 0 ? convertTime12to24(csSlotWiseDataValue.end_time) : csSlotWiseDataValue.end_time + ":00";
                    csCurrentTimeStamp = new Date(csCurrentDateMDY + " " + csCurrentTime).getTime(), csstart_time = new Date(selected_date + " " + startStampformat).getTime(), csend_time = new Date(selected_date + " " + endStampformat).getTime(), csgGetCurrentTimeStamp = new Date(csCurrentDateMDY + " " + csCurrentTime);
                    csnextend_time = csend_time + 3600000;
                    var csFirstTimeSelected = "";
                    if (hasdate == 0) {
                        csFirstTimeSelected = timeHtmlCode == "" ? "active" : "";
                    }
                    if (csHideSlots == 1 || csActivepaddingTime == 1) {
                        if (csActivepaddingTime == 1) {
                            if (csCurrentTimeStamp_only == changeTimestamp) {
                                csCurrentTimeStamp = csCurrentTimeStamp + csPaddingTimeMinute * 60000;
                            } else {
                                csCurrentTimeStamp12 = new Date(csCurrentDateMDY + " " + csCurrentTime);
                                csCurrentTimeStamp = csCurrentTimeStamp12.setHours(csCurrentTimeStamp12.getHours() + csPaddingTimeMinute / 60);
                            }
                        }
                        if (csHideSlotsTime == 1) {
                            if (csCurrentTimeStamp <= csend_time || csstart_time > csCurrentTimeStamp) {
                                timeHtmlCode += '<label for="t' + index + '" class="t cs-time-picker ' + csFirstTimeSelected + '" data-value="' + csSlotWiseDataValue.slot_value_label + '"> ' + csSlotWiseDataValue.slot_value_label + " </label>";
                            }
                        } else {
                            if (csstart_time > csCurrentTimeStamp) {
                                timeHtmlCode += '<label for="t' + index + '" class="t cs-time-picker ' + csFirstTimeSelected + '" data-value="' + csSlotWiseDataValue.slot_value_label + '"> ' + csSlotWiseDataValue.slot_value_label + " </label>";
                            }
                        }
                    } else if (csCurrentTimeStamp <= csend_time || csstart_time > csCurrentTimeStamp) {
                        timeHtmlCode += '<label for="t' + index + '" class="t cs-time-picker ' + csFirstTimeSelected + '" data-value="' + csSlotWiseDataValue.slot_value_label + '"> ' + csSlotWiseDataValue.slot_value_label + " </label>";
                    }
                });
            } else {
                csJq.each(csDefaultTime, function(index, value) {
                    valuestampformat = result_data.generalSettingData.gen_time_format == 0 ? convertTime12to24(value) : value.split("-")[0].trim() + ":00";
                    var csFirstTimeSelected = "";
                    if (hasdate == 0) {
                        csFirstTimeSelected = timeHtmlCode == "" ? "active" : "";
                    }
                    csCurrentTimeStamp = new Date(csCurrentDateMDY + " " + csCurrentTime).getTime(), valueStamp = new Date(selected_date + " " + valuestampformat).getTime();
                    valueStampNext = valueStamp + 3600000;
                    csgGetCurrentTimeStamp = new Date(csCurrentDateMDY + " " + csCurrentTime);
                    if (csHideSlots == 1 || csActivepaddingTime == 1) {
                        if (csActivepaddingTime == 1) {
                            if (csCurrentTimeStamp_only == changeTimestamp) {
                                csCurrentTimeStamp = csCurrentTimeStamp + csPaddingTimeMinute * 60000;
                            } else {
                                csCurrentTimeStamp12 = new Date(csCurrentDateMDY + " " + csCurrentTime);
                                csCurrentTimeStamp = csCurrentTimeStamp12.setHours(csCurrentTimeStamp12.getHours() + csPaddingTimeMinute / 60);
                            }
                        }
                        if (csHideSlotsTime == 1) {
                            if (csCurrentTimeStamp <= valueStampNext || valueStamp > csCurrentTimeStamp) {
                                timeHtmlCode += '<label for="t' + index + '" class="t cs-time-picker ' + csFirstTimeSelected + '" data-value="' + value + '"> ' + value + " </label>";
                            }
                        } else {
                            if (valueStamp > csCurrentTimeStamp) {
                                timeHtmlCode += '<label for="t' + index + '" class="t cs-time-picker ' + csFirstTimeSelected + '" data-hour="' + value + '" data-value="' + value + '"> ' + value + " </label>";
                            }
                        }
                    } else if (csCurrentTimeStamp <= valueStampNext || valueStamp > csCurrentTimeStamp) {
                        timeHtmlCode += '<label for="t' + index + '" class="t cs-time-picker ' + csFirstTimeSelected + '" data-value="' + value + '"> ' + value + " </label>";
                    }
                });
            }
        }
        if (timeHtmlCode != "") {
            csJq(csTimePickerVal).html(timeHtmlCode);
        } else {
            timeHtmlCode += '<span class="timeslot">Time slot not available</span>';
            csJq(csTimePickerVal).html(timeHtmlCode);
        }
        if (csJq(csTimePickerVal + ' .cs-time-picker').length == 1) csJq('.time-body ' + csTimePickerVal + ' .t[for="t0"]').trigger('click');
        return timeHtmlCode;
    }
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    function range(start, end) {
        var j = [];
        var i = start;
        for (i = start; i <= end; i++) {
            if (start.charAt(0) == 0 && i != start) {
                j.push('0' + i);
            } else {
                j.push(i);
            }
        }
        return j;
    }
    csLoadMapCanvas = async (csLocations) => {
        csGeocoder = new google.maps.Geocoder();
        const csInfowindow = new google.maps.InfoWindow();
        var csCordinates = {};
        let map;
        csJq(".cs-map-content").show();
        const setMapCanvas = async () => {
            if (csCordinates.lat === undefined) {
                let csAddress = `${csLocations[0].name} ${csLocations[0].city} ${csLocations[0].address1} ${csLocations[0].address2}`;
                const {
                    results
                } = await csGeocoder.geocode({
                    address: csAddress
                });
                csCordinates.lat = results[0].geometry.location.lat();
                csCordinates.lng = results[0].geometry.location.lng();
            }
            const mapOptions = {
                center: csCordinates,
                zoom: 10,
            };
            map = new google.maps.Map(document.getElementById("cs-map"), mapOptions);
            csMap = map;
            sortLocation(map, csCordinates, csGeocoder, csInfowindow, csLocations);
        };
        navigator.geolocation.getCurrentPosition((position) => {
            csCordinates.lat = position.coords.latitude;
            csCordinates.lng = position.coords.longitude;
            setMapCanvas();
        }, (error) => {
            if (error.code == 1) {
                setMapCanvas();
            }
        });
    };
    sortLocation = async (map, csCordinates, csGeocoder, csInfowindow, csLocations) => {
        await Promise.all(csLocations.map(async (location, i) => {
            const address = `${location.name} ${location.city} ${location.address1} ${location.address2}`;
            const {
                results
            } = await csGeocoder.geocode({
                address: address
            });
            let distance = getDistanceFromLatLonInKm(csCordinates.lat, csCordinates.lng, results[0].geometry.location.lat(), results[0].geometry.location.lng());
            csLocations[i].distance = distance;
            csLocations[i].position = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
            };
            csGoogleMapLocations = csLocations;
        }));
        csLocations.sort((a, b) => {
            return a.distance - b.distance;
        });
        addMarkerToMap(map, csInfowindow, csLocations, csCordinates);
    };
    addMarkerToMap = (map, csInfowindow, csLocations, csCordinates) => {
        var csLocationDataHtml = "";
        csLocations.map((location, i) => {
            let window_data = `<div>
                                <h3>${location.name}</h3>
                                <p>${location.address1}</p>
                                <p>${location.country_code}, ${location.state_code}, ${location.zip}</p>
                                <a href="https://www.google.com/maps/dir/${csCordinates.lat},${csCordinates.lng}/${location.position.lat},${location.position.lng}" target="_blank">Get Direction</a>
                            </div>`;
            csLocationDataHtml += `<div onClick="markerClick(${i})" id="google-map-label-${i}" class="google-map-label">${location.html}</div>`;
            var marker = new google.maps.Marker({
                position: location.position,
                label: String(++i),
                html: window_data,
            });
            marker.setMap(map);
            csMarkers.push(marker);
            google.maps.event.addListener(marker, "click", ((marker) => {
                return () => {
                    csInfowindow.setContent(marker.html);
                    csInfowindow.open(map, marker);
                    map.setCenter(marker.getPosition());
                    map.setZoom(15);
                };
            })(marker));
        });
        csJq("#cs-location-list").html(csLocationDataHtml);
        dislayLocationBasedProduct();
        if (csJq('.cs-radio-card').length == 1 && csJq('.cs-tab_last[rel="cs-tab3"]').hasClass('active') == true) {
            csJq('.cs-radio-card:first-child').trigger('click');
        }
    };
    markerClick = (id) => {
        csMap.setCenter(csMarkers[id].getPosition());
        csMap.setZoom(15);
    };
    getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        var R = 6371;
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    };
    deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };
    zipCodeSearch = async () => {
        const zipcode = csJq("#map-zipcode").val();
        var csKmOrMi = csJq("#cs-measurement_type").val();
        if (csKmOrMi != 'km' && csKmOrMi != 'mi') {
            csKmOrMi = 'km';
        }
        const radius = parseInt(csJq("#map-search-radius").val(), 10) * parseFloat(csKmOrMi == 'mi' ? 1609.34 : 1000);
        var hasLocationmap = false;
        if (csJq("#map-zipcode").val()) {
            csJq("#map-zipcode").css("border", "solid thin #dadada");
            csJq(".google-map-label").hide();
            csMarkers.map((marker) => {
                marker.setMap(null);
            });
            var result = await csGeocoder.geocode({
                address: zipcode
            });
            var zipCodePosition = {
                lat: result.results[0].geometry.location.lat(),
                lng: result.results[0].geometry.location.lng()
            };
            var marker = new google.maps.Marker({
                map: csMap,
                position: zipCodePosition,
            });
            marker.setMap(null);
            zipCodePosition = marker.getPosition();
            csMap.setCenter(zipCodePosition);
            for (var i = 0; i < csGoogleMapLocations.length; i++) {
                let aMarker = csMarkers[i];
                let position = csMarkers[i].getPosition();
                if (google.maps.geometry.spherical.computeDistanceBetween(zipCodePosition, position) < radius) {
                    hasLocationmap = true;
                    csJq(`#google-map-label-${i}`).show();
                    aMarker.setMap(csMap);
                }
            }
            if (hasLocationmap == false) {
                csJq("#required-error #postal-code-error").hide();
                csJq('#no-found-location').remove();
                csJq("#required-error").append("<div class='error-cls'><span id='no-found-location'>There were no locations found!</span></div>");
                csJq('#cs-tab3').find('.search-content-wrap').hide();
                csJq(checkout_selectors).attr("disabled", false);
                if (csJq("#required-error #postal-code-error").length > 0) {
                    csJq(checkout_selectors).attr("disabled", true);
                }
            } else {
                csJq('#cs-tab3').find('.search-content-wrap').show();
                csJq('#no-found-location').remove();
                if (csJq("#required-error #postal-code-error").length > 0) {
                    csJq("#required-error #postal-code-error").show();
                    csJq(checkout_selectors).attr("disabled", true);
                }
            }
        } else {
            csJq("#map-zipcode").css("border", "solid red thin");
        }
    };
    zipCodeClear = () => {
        csMarkers.map((marker) => {
            marker.setMap(csMap);
        });
        csJq(".google-map-label").show();
        csJq("#map-zipcode").val("");
        csJq("#map-search-radius").val(5);
    };
    function moreInformationText(_this) {
        var csMoreInformation = csJq(_this).data("more_information");
        var csLocationNameText = "<h2>" + csJq(_this).parents("label").find("h6").html() + "</h2>";
        var csLocationAddressText = "<p>" + csJq(_this).parents("label").find("p:first").html() + "</p><p>" + csJq(_this).parents("label").find("p:first").next().html() + "</p>";
        csJq(".cs-more-information-popup .csp-content").html(csMoreInformation);
        csJq(".cs-more-information-popup .csp-title-text").html(csLocationNameText);
        csJq(".cs-more-information-popup .csp-info-text").html(csLocationAddressText);
        csJq(".cs-more-information-popup").show();
        csJq("body").css("overflow", "hidden");
    }
    function removeMoreInformationText() {
        csJq("body").css("overflow", "");
        csJq(".cs-more-information-popup").hide();
    }
    function strip(html) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }
    function htmlDataWidget(result_data) {
        if (result_data == '' || result_data == null || result_data == undefined) return false;
        var generalData = result_data.generalSettingData;
        var kmOrMi = generalData && generalData.gen_search_measurement_type != '' ? 'mi' : 'km';
        var htmlData = `<style>
    .CS-custom-tab-section .cs-tab_container .tab_drawer_heading, .CS-custom-tab-section .cs-crawler-tabs li,#cs-location-list .radio-card {
        background-color: ${generalData!=''&&generalData.gen_default_background_color!=''?generalData.gen_default_background_color:'#d9d9d9'};
        color:  ${generalData!=''&&generalData.gen_default_text_color!=''?generalData.gen_default_text_color:'#000000'};
    }
    .CS-custom-tab-section .tab_drawer_heading.d_active, 
    .CS-custom-tab-section .cs-crawler-tabs li.active,
    #cs-location-list .cs-radio-card.csactive{
        background-color: ${generalData!=''&&generalData.gen_active_background_color!=''?generalData.gen_active_background_color:'#ffffff'};
        color:${generalData!=''&&generalData.gen_active_text_color!=''?generalData.gen_active_text_color:'#000000'};
    }
    .CS-custom-tab-section .cs-crawler-tabs li:hover,
    #cs-location-list .cs-radio-card:hover {
        background-color: ${generalData!=''&&generalData.gen_hover_background_color!=''?generalData.gen_hover_background_color:'#faeeee'};
        color: ${generalData!=''&&generalData.gen_hover_text_color!=''?generalData.gen_hover_text_color:'#000000'};
    }
    .CS-custom-tab-section .cs-tab_container svg path, .CS-custom-tab-section .cs-crawler-tabs svg path,.cs-map-content svg,.cs-map-content svg path {
        fill: ${generalData!=''&&generalData.gen_default_text_color!=''?generalData.gen_default_text_color:'#000000'};
    }
    .CS-custom-tab-section .tab_drawer_heading.d_active svg path, .CS-custom-tab-section .cs-crawler-tabs li.active svg path {
        fill: ${generalData!=''&&generalData.gen_active_text_color!=''?generalData.gen_active_text_color:'#000000'};
    }
    .CS-custom-tab-section .cs-crawler-tabs li:hover svg path,.cs-map-content button.csIgnoreCngEvent:hover svg ,.cs-map-content button.csIgnoreCngEvent:hover svg path {
        fill: ${generalData!=''&&generalData.gen_hover_text_color!=''?generalData.gen_hover_text_color:'#000000'};
    }
    .CS-custom-tab-section .cs-tab_container .cs-check-icon svg , .CS-custom-tab-section .cs-crawler-tabs .cs-check-icon svg  {
        stroke: ${generalData!=''&&generalData.gen_default_text_color!=''?generalData.gen_default_text_color:'#000000'};
    }
    .CS-custom-tab-section .tab_drawer_heading.d_active .cs-check-icon svg, .CS-custom-tab-section .cs-crawler-tabs li.active .cs-check-icon svg{
        stroke: ${generalData!=''&&generalData.gen_active_text_color!=''?generalData.gen_active_text_color:'#000000'};
    }
    .CS-custom-tab-section .cs-crawler-tabs li:hover .cs-check-icon svg {
        stroke: ${generalData!=''&&generalData.gen_hover_text_color!=''?generalData.gen_hover_text_color:'#000000'};
    }
    
    .postal-code button,.cs-map-content button.csIgnoreCngEvent {
        background-color:  ${generalData!=''&&generalData.gen_default_background_color!=''?generalData.gen_default_background_color:'#d9d9d9'};
        color: ${generalData!=''&&generalData.gen_default_text_color!=''?generalData.gen_default_text_color:'#000000'};
    }
    .postal-code button:hover,.cs-map-content button.csIgnoreCngEvent:hover {
        background-color: ${generalData!=''&&generalData.gen_hover_background_color!=''?generalData.gen_hover_background_color:'#faeeee'};
        color: ${generalData!=''&&generalData.gen_hover_text_color!=''?generalData.gen_hover_text_color:'#000000'};
    }
</style>
<div class="CS-custom-tab-section tab-view quality-sticker-tab ${generalData.layout_style_selection!=''?'cs-layout-tab-'+generalData.layout_style_selection:'cs-layout-tab-0'}">
    <ul class="cs-tabs cs-crawler-tabs cs-text-center">
        <li class="cs-tab_last active" rel="cs-tab1">
            <div class="cs-check-icon">
                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" aria-labelledby="circleOkIconTitle" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000">  <polyline points="7 13 10 16 17 9"/> <circle cx="12" cy="12" r="10"/> </svg>
             </div>
            <svg width="30" height="30" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M397.832 378.785L493.547 283.074C441.957 231.484 414.781 204.312 372.102 161.625H350.363V176.625H365.887L376.902 187.641L302.402 262.141L291.387 251.129V190.867L305.625 176.625H310.227V161.625H299.41L276.387 184.652V257.34L397.832 378.785ZM387.508 198.25L472.332 283.074L397.832 357.574L313.008 272.75L387.508 198.25Z"
                    fill="black"
                ></path>
                <path
                    d="M413.922 228.789L379.035 229.574L380.105 277.406L357.738 275.008L354.023 309.707L415.883 316.332L413.922 228.789ZM370.535 296.387L371.059 291.52L395.484 294.137L394.367 244.234L399.262 244.125L400.504 299.598L370.535 296.387Z"
                    fill="black"
                ></path>
                <path
                    d="M447.395 375.344L248.199 490.348V260.188L267.633 248.98L260.141 235.984L240.699 247.195L181.949 213.32L220.445 191.094C231.754 202.621 245.777 212.395 261.285 218.129L266.488 204.059C254.973 199.801 243.762 192.656 233.922 183.312L312.25 138.09C323.535 157.406 328.84 183.949 313.738 199.051C311.031 201.762 307.793 203.914 304.121 205.453L309.922 219.289C315.398 216.992 320.254 213.754 324.348 209.66C344.812 189.195 340.055 156.016 325.23 130.594L381.059 98.3672L439.891 132.336L391.273 160.371L398.766 173.363L447.395 145.32V230.027H462.398V128.012L240.699 0L19 128.012V384.004L240.695 512L462.395 384.004V336.121H447.391V375.344H447.395ZM107.844 187.902C117.711 193.594 145.977 209.891 159.355 217.605V261.645L107.844 232.297V187.902ZM166.938 204.664C154.105 197.262 128.934 182.75 115.398 174.941L257.262 93.0391C275.367 98.5586 291.879 111.113 303.68 125.715L166.938 204.664ZM211.973 101.863C216.727 95.9258 223.344 92.3398 230.969 90.8945L211.973 101.863ZM316.805 118.137C305.664 103.766 290.688 91.2109 273.918 83.418L314.539 59.9688L366.051 89.707L316.805 118.137ZM299.547 51.3008L255.094 76.9688C219.672 69.125 195.5 87.3203 190.742 114.121L100.391 166.289C72.8789 150.426 46.9688 135.484 41.5078 132.336L240.699 17.3203L299.547 51.3008ZM34 145.324C39.3906 148.43 65.4219 163.441 92.8438 179.254V241.012L174.355 287.453V226.254L233.195 260.188V490.348L34 375.344V145.324Z"
                    fill="black"
                ></path>
                <path
                    d="M151.098 434.918L125.117 419.918L132.617 406.93L158.598 421.93L151.098 434.918ZM116.457 414.918L103.465 407.418L110.965 394.43L123.957 401.93L116.457 414.918ZM94.8047 402.418L81.8125 394.918L89.3125 381.926L102.305 389.43L94.8047 402.418Z"
                    fill="black"
                ></path>
            </svg> <span>${generalData!=''&&generalData.gen_shipping_heading!=''?generalData.gen_shipping_heading:'Shipping'}</span>
        </li>
        <li rel="cs-tab2" class="cs-tab_last" style="display: none;">
            <div class="cs-check-icon">
                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" aria-labelledby="circleOkIconTitle" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000">  <polyline points="7 13 10 16 17 9"/> <circle cx="12" cy="12" r="10"/> </svg>
             </div>
            <svg width="30" height="30" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M476.158 231.363L462.899 178.328C466.524 177.558 469.244 174.342 469.244 170.489V161.938C469.244 143.372 454.139 128.268 435.574 128.268H375.182V110.63C375.182 101.494 367.75 94.062 358.614 94.062H50.772C41.636 94.062 34.204 101.494 34.204 110.63V256C34.204 260.427 37.793 264.017 42.221 264.017C46.648 264.017 50.238 260.428 50.238 256V110.63C50.238 110.335 50.477 110.096 50.772 110.096H358.613C358.908 110.096 359.147 110.335 359.147 110.63V256.002C359.147 260.429 362.736 264.019 367.164 264.019C371.591 264.019 375.181 260.43 375.181 256.002V246.914H469.75C469.758 246.914 469.764 246.916 469.771 246.916C469.779 246.916 469.786 246.915 469.793 246.915C481.43 246.923 491.311 254.561 494.705 265.086H469.777C465.35 265.086 461.76 268.675 461.76 273.103V290.205C461.76 304.056 473.028 315.324 486.879 315.324H495.965V350.597H475.003C468.117 330.714 449.216 316.392 427.021 316.392C404.826 316.392 385.924 330.714 379.039 350.597H375.179V290.204C375.179 285.777 371.59 282.187 367.162 282.187C362.735 282.187 359.145 285.776 359.145 290.204V350.595H192.817C185.931 330.712 167.03 316.39 144.835 316.39C122.64 316.39 103.738 330.712 96.853 350.595H50.772C50.477 350.595 50.238 350.356 50.238 350.061V332.424H84.977C89.404 332.424 92.994 328.835 92.994 324.407C92.994 319.979 89.405 316.39 84.977 316.39H8.017C3.59 316.39 0 319.979 0 324.407C0 328.835 3.589 332.424 8.017 332.424H34.205V350.061C34.205 359.197 41.637 366.629 50.773 366.629H94.077C94.075 366.807 94.063 366.984 94.063 367.163C94.063 395.159 116.84 417.935 144.835 417.935C172.83 417.935 195.607 395.159 195.607 367.163C195.607 366.983 195.595 366.807 195.593 366.629H376.263C376.261 366.807 376.249 366.984 376.249 367.163C376.249 395.159 399.026 417.935 427.021 417.935C455.016 417.935 477.793 395.159 477.793 367.163C477.793 366.983 477.781 366.807 477.779 366.629H503.982C508.409 366.629 511.999 363.04 511.999 358.612V273.101C512 251.989 496.423 234.448 476.158 231.363ZM375.182 144.301H435.574C445.299 144.301 453.211 152.213 453.211 161.938V162.472H375.182V144.301ZM375.182 230.881V178.505H446.417L459.511 230.881H375.182ZM144.835 401.904C125.68 401.904 110.096 386.321 110.096 367.165C110.096 348.009 125.68 332.426 144.835 332.426C163.99 332.426 179.574 348.009 179.574 367.165C179.574 386.321 163.99 401.904 144.835 401.904ZM427.023 401.904C407.868 401.904 392.284 386.321 392.284 367.165C392.284 348.009 407.868 332.426 427.023 332.426C446.178 332.426 461.762 348.009 461.762 367.165C461.762 386.321 446.178 401.904 427.023 401.904ZM495.967 299.29H486.881C481.871 299.29 477.795 295.214 477.795 290.204V281.118H495.966V299.29H495.967Z"
                    fill="black"
                ></path>
                <path
                    d="M144.835 350.597C135.699 350.597 128.267 358.029 128.267 367.165C128.267 376.301 135.699 383.733 144.835 383.733C153.971 383.733 161.403 376.301 161.403 367.165C161.403 358.029 153.971 350.597 144.835 350.597Z"
                    fill="black"
                ></path>
                <path
                    d="M427.023 350.597C417.887 350.597 410.455 358.029 410.455 367.165C410.455 376.301 417.887 383.733 427.023 383.733C436.159 383.733 443.591 376.301 443.591 367.165C443.591 358.029 436.159 350.597 427.023 350.597Z"
                    fill="black"
                ></path>
                <path
                    d="M332.96 316.393H213.244C208.817 316.393 205.227 319.982 205.227 324.41C205.227 328.838 208.816 332.427 213.244 332.427H332.96C337.387 332.427 340.977 328.838 340.977 324.41C340.977 319.982 337.388 316.393 332.96 316.393Z"
                    fill="black"
                ></path>
                <path
                    d="M127.733 282.188H25.1191C20.6921 282.188 17.1021 285.777 17.1021 290.205C17.1021 294.633 20.6911 298.222 25.1191 298.222H127.733C132.16 298.222 135.75 294.633 135.75 290.205C135.75 285.777 132.16 282.188 127.733 282.188Z"
                    fill="black"
                ></path>
                <path
                    d="M278.771 173.37C275.641 170.24 270.564 170.24 267.434 173.371L196.142 244.662L159.055 207.575C155.924 204.444 150.848 204.444 147.718 207.575C144.587 210.706 144.587 215.781 147.718 218.912L190.474 261.668C192.039 263.234 194.091 264.016 196.142 264.016C198.193 264.016 200.246 263.234 201.81 261.668L278.77 184.708C281.901 181.576 281.901 176.501 278.771 173.37Z"
                    fill="black"
                ></path>
            </svg><span> ${generalData!=''&&generalData.gen_local_delivery_heading!=''?generalData.gen_local_delivery_heading:'Local Delivery'}</span>
        </li>
        <li rel="cs-tab3" class="cs-tab_last"style="display: none;">
            <div class="cs-check-icon">
                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" aria-labelledby="circleOkIconTitle" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000">  <polyline points="7 13 10 16 17 9"/> <circle cx="12" cy="12" r="10"/> </svg>
            </div>
            <svg width="30" height="30" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M502.417 492.834H463.045V240.169C476.666 237.768 489.01 230.657 497.919 220.077C506.827 209.498 511.734 196.123 511.781 182.292C511.781 182.084 511.737 181.893 511.721 181.69C511.707 181.42 511.679 181.152 511.639 180.885C511.566 180.401 511.456 179.923 511.31 179.456C511.261 179.308 511.255 179.149 511.201 179.001L447.992 6.2865C447.317 4.4433 446.092 2.85193 444.482 1.7276C442.873 0.603271 440.958 0.000220853 438.995 0H73.0052C71.0418 0.00144666 69.1261 0.6049 67.5164 1.72899C65.9067 2.85308 64.6803 4.44374 64.0027 6.2865L0.821388 179.001C0.766629 179.149 0.76115 179.302 0.711867 179.456C0.56648 179.924 0.454855 180.401 0.377841 180.885C0.339509 181.153 0.317606 181.433 0.301178 181.69C0.28475 181.947 0.235461 182.084 0.235461 182.292C0.26117 196.479 5.40989 210.179 14.734 220.87C24.0581 231.562 36.9301 238.526 50.981 240.481V492.834H9.58289C7.04135 492.834 4.60391 493.843 2.80677 495.641C1.00963 497.438 0 499.875 0 502.417C0 504.958 1.00963 507.396 2.80677 509.193C4.60391 510.99 7.04135 512 9.58289 512H502.417C504.959 512 507.396 510.99 509.193 509.193C510.99 507.396 512 504.958 512 502.417C512 499.875 510.99 497.438 509.193 495.641C507.396 493.843 504.959 492.834 502.417 492.834V492.834ZM452.975 221.933C444.124 221.926 435.528 218.965 428.549 213.521C421.57 208.076 416.607 200.459 414.446 191.875H491.432C489.248 200.433 484.288 208.025 477.33 213.464C470.371 218.902 461.806 221.881 452.975 221.933V221.933ZM295.301 172.709H216.699L222.109 19.1552H289.885L295.301 172.709ZM294.474 191.875C292.334 200.463 287.383 208.088 280.409 213.537C273.435 218.986 264.839 221.946 255.989 221.946C247.139 221.946 238.543 218.986 231.569 213.537C224.595 208.088 219.644 200.463 217.504 191.875H294.474ZM432.325 19.1552L488.514 172.709H411.873L402.563 115.063L387.05 19.1552H432.325ZM367.665 19.1552L376.974 76.8016L392.477 172.709H314.483L309.593 34.1651L309.045 19.1662L367.665 19.1552ZM392.986 191.875C390.848 200.466 385.897 208.093 378.923 213.545C371.948 218.996 363.351 221.957 354.498 221.957C345.646 221.957 337.049 218.996 330.074 213.545C323.1 208.093 318.149 200.466 316.011 191.875H392.986ZM202.423 34.1651L197.539 172.709H119.545L135.048 76.8016L144.357 19.1552H202.949L202.423 34.1651ZM196.017 191.875C193.878 200.466 188.928 208.093 181.953 213.545C174.979 218.996 166.381 221.957 157.529 221.957C148.677 221.957 140.079 218.996 133.105 213.545C126.13 208.093 121.18 200.466 119.041 191.875H196.017ZM79.7022 19.1552H124.95L109.448 115.063L100.138 172.709H23.5137L79.7022 19.1552ZM20.5348 191.875H97.4717C95.3486 200.223 90.5775 207.659 83.8732 213.067C77.169 218.475 68.8927 221.565 60.2846 221.873C59.9725 221.873 59.3318 221.873 59.0251 221.933C50.1779 221.927 41.5864 218.966 34.6134 213.521C27.6405 208.075 22.6856 200.457 20.5348 191.875V191.875ZM109.113 492.834V291.408H208.54V492.834H109.113ZM227.706 492.834V281.825C227.704 279.284 226.694 276.847 224.897 275.05C223.101 273.254 220.664 272.243 218.123 272.242H99.5306C96.9895 272.243 94.5529 273.254 92.7561 275.05C90.9593 276.847 89.9492 279.284 89.9477 281.825V492.834H70.1303V239.977C77.8952 238.549 85.2883 235.555 91.8594 231.179C98.4304 226.802 104.042 221.134 108.352 214.519C113.698 222.699 121.001 229.415 129.599 234.059C138.197 238.704 147.818 241.128 157.589 241.114C167.361 241.1 176.975 238.647 185.559 233.979C194.144 229.31 201.427 222.572 206.749 214.377C212.078 222.584 219.374 229.33 227.974 233.999C236.573 238.669 246.203 241.115 255.989 241.115C265.775 241.115 275.405 238.669 284.005 233.999C292.604 229.33 299.9 222.584 305.229 214.377C310.557 222.584 317.853 229.33 326.453 233.999C335.052 238.669 344.683 241.115 354.468 241.115C364.254 241.115 373.884 238.669 382.484 233.999C391.083 229.33 398.379 222.584 403.708 214.377C408.218 221.269 414.123 227.139 421.043 231.607C427.962 236.075 435.742 239.042 443.879 240.317V492.834H227.706Z"
                    fill="black"
                ></path>
                <path
                    d="M412.551 272.242H258.831C256.289 272.242 253.852 273.252 252.055 275.049C250.258 276.846 249.248 279.284 249.248 281.825V395.486C249.247 396.745 249.495 397.991 249.976 399.154C250.457 400.317 251.163 401.374 252.053 402.264C252.943 403.154 254 403.86 255.163 404.341C256.326 404.823 257.572 405.07 258.831 405.069H412.551C413.81 405.07 415.056 404.823 416.219 404.341C417.382 403.86 418.439 403.154 419.329 402.264C420.219 401.374 420.925 400.317 421.406 399.154C421.888 397.991 422.135 396.745 422.134 395.486V281.825C422.134 279.284 421.125 276.846 419.328 275.049C417.53 273.252 415.093 272.242 412.551 272.242ZM402.969 385.903H268.414V291.408H402.969V385.903Z"
                    fill="black"
                ></path>
            </svg> <span>${generalData!=''&&generalData.gen_store_pickup_heading!=''?generalData.gen_store_pickup_heading:'Store Pickup'}</span>
        </li>
    </ul>
    <div class="cs-tab_container">
        <div id="cs-tab1" class="cs-tab_content">
            <div class="tab-inner-content">
                <p>${generalData!=''&&generalData.gen_shipping_instruction!=''?generalData.gen_shipping_instruction:'Please click checkout button and continue.'}</p>`
        if (generalData != '' && generalData.calendar_display_style == 1) {
            htmlData += ` <div class="input-block datePicker csIgnoreCngEvent" id="csShippingpicker">
                                    <div class="date-picker-heading">
                                        <span>${generalData.gen_loc_calendar_heading!=''?generalData.gen_loc_calendar_heading:'Select Delivery Date'}</span>
                                    </div>
                                    </div>`
        } else {
            htmlData += `<input type="text" class="input-block datePicker csIgnoreCngEvent" id="csShippingpicker" placeholder="${generalData.gen_shipping_calendar_heading!=''?generalData.gen_shipping_calendar_heading:'Select Shipping Delivery Date'}" readonly style="background-image:url('${csShippingAppBaseUrl}assets/images/calender.svg') "/>`
        }
        htmlData += ` <div class="select-block" style="display: none;">
                        <input type="text" class="timePicker csIgnoreCngEvent" id="csTimeShippingPicker" value="" placeholder="${generalData.gen_shipping_timer_heading!=''?generalData.gen_shipping_timer_heading:'Select Shipping Delivery Time'}" readonly style="background-image:url('${csShippingAppBaseUrl}assets/images/down-arrow.svg')"/>
                        <div class="time-block" style="display: none;">
                        <div class="time-header">
                        <a class="close-time-slot">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </a>
                        </div>
                        <div class="time-body">
                        <div class="multiple-input" id="csTimeShippingVal">
                        </div>
                        </div>
                        </div>
                        </div>
                    <div class="error-cls" style="display: none;">
                            <span id="shippingpostal-code-error">${generalData.gen_loc_zip_error_message_text!=''?generalData.gen_loc_zip_error_message_text:'Entered postal/zip code is not available for Local delivery'}</span>
                        </div>
                <div class="error-cls" style="display: none;">
                    <span class="shipping-time-error"></span>
                </div>
            </div>
        </div>
        <div id="cs-tab2" class="cs-tab_content" style="display: none;">
            <div class="local-delivery-block">
                <div class="tab-inner-content">
                    <p>${generalData!=''&&generalData.gen_local_delivery_instruction!=''?generalData.gen_local_delivery_instruction:'Enter your postal code into the field below to check if you are eligible for local delivery.'}</p>                        
                    <div class="shipping-option">
                        <div class="postal-code">
                            <input type="text" id="postal_code" value="" class="csIgnoreCngEvent" placeholder="${generalData.gen_loc_zip_textbox_placeholder_title!=''?generalData.gen_loc_zip_textbox_placeholder_title:'Enter your postal/zip code'}" autocomplete="off"/>
                            <button type="button" name="zip_search" id="zip_search">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="error-cls" style="display: none;">
                            <span id="postal-code-error">${generalData.gen_loc_zip_error_message_text!=''?generalData.gen_loc_zip_error_message_text:'Entered postal/zip code is not available for Local delivery'}</span>
                        </div>
                        <div class="search-content-wrap">
                            <div class="input-content-block datepicker-block" style="display: none;">`
        if (generalData != '' && generalData.calendar_display_style == 1) {
            htmlData += `<div class="date-picker-heading">
                                        <span>${generalData.gen_loc_calendar_heading!=''?generalData.gen_loc_calendar_heading:'Select Delivery Date'}</span>
                                    </div>
                                    <div class="input-block datePicker csIgnoreCngEvent" id="csDatepicker"></div>`
        } else {
            htmlData += `<input type="text" class="input-block datePicker csIgnoreCngEvent" id="csDatepicker" placeholder="${generalData.gen_loc_calendar_heading!=''?generalData.gen_loc_calendar_heading:'Select Delivery Date'}" readonly style="background-image:url('${csShippingAppBaseUrl}assets/images/calender.svg');"/>`
        }
        htmlData += `</div>
                            <div class="error-cls" style="display: none;">
                                <span class="delivery-date-error"></span>
                            </div>
                            <div class="select-block" style="display: none;">
                                <input type="text" class="timePicker csIgnoreCngEvent" id="csTimePicker" value="" placeholder="${generalData.gen_loc_timer_heading!=''?generalData.gen_loc_timer_heading:'Select Pickup Time'}" readonly style="background-image:url('${csShippingAppBaseUrl}assets/images/down-arrow.svg');"/>
                                <div class="time-block" style="display: none;">
                                    <div class="time-header">
                                        <a class="close-time-slot">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </a>
                                    </div>
                                    <div class="time-body">
                                         <div class="multiple-input" id="csTimePickerVal">
                                         </div>
                                    </div>
                                </div>
                            </div>
                            <div class="error-cls" style="display: none;">
                                <span class="delivery-time-error"></span>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </div>
        <div id="cs-tab3" class="cs-tab_content" style="display: none;">
            <div class="tab-inner-content">
                <p>${generalData!=''&&generalData.gen_store_pickup_instruction!=''?generalData.gen_store_pickup_instruction:'Find your nearest pickup location.'}</p>
                <div class="cs-map-content" style="display: none;">
                    <div id="cs-map" style="height: 250px;"></div>
                    <div style="display: flex; margin-bottom: 10px;">
                        <input type="text" class="csIgnoreCngEvent" id="map-zipcode" placeholder="${generalData!=''&&generalData.gen_zipcode_search_text!=''?generalData.gen_zipcode_search_text:'Enter postal/zip code'}">
                    <input type="hidden" id="cs-measurement_type" value="${kmOrMi}" class="csIgnoreCngEvent">
                        <select id="map-search-radius" class="csIgnoreCngEvent">
                            <option value="5">5 ${kmOrMi}</option>
                            <option value="10">10 ${kmOrMi}</option>
                            <option value="50">50 ${kmOrMi}</option>
                            <option value="100">100 ${kmOrMi}</option>
                        </select>
                        <button type="button" class="csIgnoreCngEvent" value="Search" onclick="zipCodeSearch()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style="width: 17px;"><path d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6zm17.707 10.293l-5.395-5.396A7.946 7.946 0 0016 8c0-4.411-3.589-8-8-8S0 3.589 0 8s3.589 8 8 8a7.954 7.954 0 004.897-1.688l5.396 5.395A.998.998 0 0020 19a1 1 0 00-.293-.707z" fill="#5C5F62"/></svg>
                        </button>
                        <button type="button" class="csIgnoreCngEvent" value="Reset" onclick="zipCodeClear()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style="width: 17px;"><path d="M17 9a1 1 0 01-1-1c0-.551-.448-1-1-1H5.414l1.293 1.293a.999.999 0 11-1.414 1.414l-3-3a.999.999 0 010-1.414l3-3a.997.997 0 011.414 0 .999.999 0 010 1.414L5.414 5H15c1.654 0 3 1.346 3 3a1 1 0 01-1 1zM3 11a1 1 0 011 1c0 .551.448 1 1 1h9.586l-1.293-1.293a.999.999 0 111.414-1.414l3 3a.999.999 0 010 1.414l-3 3a.999.999 0 11-1.414-1.414L14.586 15H5c-1.654 0-3-1.346-3-3a1 1 0 011-1z" fill="#5C5F62"/></svg>
                        </button>
                    </div>
                </div>
                <div class="cs-radio-card-block" id="cs-location-list"></div>
                <div class="search-content-wrap">
                    <div class="input-content-block datepicker-block" style="display: none;">`
        if (generalData != '' && generalData.calendar_display_style == 1) {
            htmlData += `<div class="date-picker-heading"><span>${ generalData.gen_pickup_calendar_heading!=''?generalData.gen_pickup_calendar_heading:'Select Delivery Date'}</span></div>
                            <div class="input-block datePicker csIgnoreCngEvent" id="csDatepicker1"></div>`
        } else {
            htmlData += `<input type="text" class="input-block datePicker csIgnoreCngEvent" id="csDatepicker1" placeholder="${generalData.gen_pickup_calendar_heading!=''?generalData.gen_pickup_calendar_heading:'Select Pickup Date'}" readonly style="background-image:url('${csShippingAppBaseUrl}assets/images/calender.svg');"/>`
        }
        htmlData += `</div>
                    <div class="error-cls" style="display: none;">
                        <span class="delivery-date-error"></span>
                    </div>
                    <div class="select-block" style="display: none;">
                        <input type="text" class="timePicker csIgnoreCngEvent" id="csTimePicker1" value="" placeholder="${generalData.gen_pickup_timer_heading!=''?generalData.gen_pickup_timer_heading:'Select Pickup Time'}" readonly style="background-image:url('${csShippingAppBaseUrl}assets/images/down-arrow.svg');"/>
                        <div class="time-block" style="display: none;">
                            <div class="time-header">
                                <a class="close-time-slot">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </a>
                            </div>
                            <div class="time-body">
                                    <div class="multiple-input" id="csTimePickerVal1">
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div class="error-cls" style="display: none;">
                        <span class="delivery-time-error"></span>
                    </div>`
        htmlData += `<div id="customer-information" style="display:none">`
        if (generalData.gen_pickup_first_name_text != null && generalData.gen_pickup_first_name_text.trim() != '') {
            htmlData += `<div class="info-outer"><input type="text" class="customerinfo"  name="pickup-first-name" placeholder="${generalData.gen_pickup_first_name_text}"></div>`
        }
        if (generalData.gen_pickup_last_name_text != null && generalData.gen_pickup_last_name_text.trim() != '') {
            htmlData += `<div class="info-outer"><input type="text" class="customerinfo" name="pickup-last-name" placeholder="${generalData.gen_pickup_last_name_text}"></div>`
        }
        if (generalData.gen_pickup_phone_text != null && generalData.gen_pickup_phone_text.trim() != '') {
            htmlData += `<div class="info-outer"><input type="text" class="customerinfo" name="pickup-number" placeholder="${generalData.gen_pickup_phone_text}"></div>`
        }
        if (generalData.gen_pickup_email_text != null && generalData.gen_pickup_email_text.trim() != '') {
            htmlData += `<div class="info-outer"><input type="email" class="customerinfo" name="pickup-email" placeholder="${generalData.gen_pickup_email_text}"></div>`
        }
        htmlData += `</div>
                </div>
            </div>
        </div>
    </div>
    <div id="required-error"></div>
    <input type="hidden" name="attributes[Type Of Order]" class="csIgnoreCngEvent" id="csOrderTypeValue" value="Shipping">
    <input type="hidden" name="attributes[${generalData.gen_loc_day_text}]" class="csIgnoreCngEvent" id="csDeliveryDayValue">
    <input type="hidden" name="attributes[${generalData.gen_loc_date_text}]" class="csIgnoreCngEvent" id="csDeliveryDateValue">
    <input type="hidden" name="attributes[${generalData.gen_loc_time_text}]" class="csIgnoreCngEvent" id="csDeliveryTimeValue">
    <input type="hidden" name="attributes[${generalData.gen_pickup_day_text}]" class="csIgnoreCngEvent" id="csPickupDayValue">
    <input type="hidden" name="attributes[${generalData.gen_pickup_date_text}]" class="csIgnoreCngEvent" id="csPickupDateValue">
    <input type="hidden" name="attributes[${generalData.gen_pickup_time_text}]" class="csIgnoreCngEvent" id="csPickupTimeValue">
    <input type="hidden" name="attributes[${generalData.gen_shipping_day_text}]" class="csIgnoreCngEvent" id="csShippingDayValue">
    <input type="hidden" name="attributes[${generalData.gen_shipping_date_text}]" class="csIgnoreCngEvent" id="csShippingDateValue">
    <input type="hidden" name="attributes[${generalData.gen_shipping_time_text}]" class="csIgnoreCngEvent" id="csShippingTimeValue">
    <input type="hidden" name="attributes[Pickup Address]" class="csIgnoreCngEvent" id="csLocationAddress1">
    <input type="hidden" name="checkout[shipping_address][address1]" class="csIgnoreCngEvent" id="csShippingAddress1">
    <input type="hidden" name="checkout[shipping_address][address2]" class="csIgnoreCngEvent" id="csShippingAddress2">
    <input type="hidden" name="checkout[shipping_address][city]" class="csIgnoreCngEvent" id="csShippingCity">
    <input type="hidden" name="checkout[shipping_address][country]" class="csIgnoreCngEvent" id="csShippingCountry">
    <input type="hidden" name="checkout[shipping_address][province]" class="csIgnoreCngEvent" id="csShippingProvince">
    <input type="hidden" name="checkout[shipping_address][zip]" class="csIgnoreCngEvent" id="csShippingZip">
    <input type="hidden" class="csIgnoreCngEvent" name="attributes[LocationId]" id="csLocationId">
    <input type="hidden" name="attributes[zip]" class="csIgnoreCngEvent" id="csDeliveryZipValue">
    <input type="hidden" name="attributes[Pickup Location]" class="csIgnoreCngEvent" id="csDeliveryLocationValue" value="">
    <div class="cs-more-information-popup" style="display:none;">
        <div class="cs-bg">&nbsp;</div> 
        <div class="cs-pop-up">
            <div class="cs-pop-up-wrp">
                <div class="cs-title-wrap">
                    <div class="csp-title">
                    <div class="csp-title-text"></div>
                    <div class="csp-close-btn" onclick="removeMoreInformationText();">
                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11.414 10l6.293-6.293a1 1 0 10-1.414-1.414L10 8.586 3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293A.998.998 0 0018 17a.999.999 0 00-.293-.707L11.414 10z" fill="#5C5F62"/></svg>
                    </div>
                    </div>
                    <div class="csp-info-text"></div>
                </div>
                <div class="csp-content"></div>
            </div>
        </div>
    </div>
</div>`;
        return htmlData;
    }
    function dateBetweenWorkingDays(weekDayArr, gen_disable_holidays, currentDate, currentTime, minimum_interval_day, cut_off_time, cutoffdate) {

        var currentDateTime = currentDate + ' ' + currentTime;
        currentTime = result_data.generalSettingData.gen_time_format == 0 ? convertTime12to24(currentTime) : currentTime;
        var holidayArr = gen_disable_holidays != '' ? gen_disable_holidays : [];
        var cutOffTime = result_data.generalSettingData.gen_time_format == 0 && cut_off_time != '' ? convertTime12to24(cut_off_time) : result_data.generalSettingData.gen_time_format == 1 && cut_off_time != '' ? cut_off_time + ":00" : currentTime;
        var oldCurrentDate = new Date(currentDateTime);
        cutOffTime = cutOffTime != '' ? new Date(oldCurrentDate.getFullYear() + '-' + (("0" + (oldCurrentDate.getMonth() + 1)).slice(-2)) + '-' + (("0" + (oldCurrentDate.getDate())).slice(-2)) + 'T' + cutOffTime) : '';
        currentDateTime = oldCurrentDate;
        var d1 = (cut_off_time != '' && cutOffTime.getTime() <= oldCurrentDate.getTime() && minimum_interval_day == 0) || (cut_off_time != '' && cutOffTime.getTime() <= oldCurrentDate.getTime() && result_data.generalSettingData.gen_cut_off_time_setting == 1 && minimum_interval_day != 0) ? parseFloat(minimum_interval_day) + 1 : parseFloat(minimum_interval_day);
        var startDate = new Date(currentDateTime);
        var endDate = new Date(currentDateTime);
        endDate.setDate(endDate.getDate() + d1);
        if ((result_data.generalSettingData.gen_working_day_setting == 1) && (csDisableDateArray.length != 0 || weekDayArr.length < 7)) {
            WorkDateCheck: while (true) {
                var weekDay = startDate.getDay();
                var weekDate = startDate.getFullYear() + '-' + (("0" + (startDate.getMonth() + 1)).slice(-2)) + '-' + (("0" + (startDate.getDate())).slice(-2));
                weekDate = csDateFormatter(result_data.generalSettingData.gen_date_format, startDate)
                if (weekDayArr.includes(weekDay.toString()) === false || holidayArr.includes(weekDate.toString()) !== false) {
                    startDate.setDate(startDate.getDate() + 1);
                    endDate = new Date(endDate.setDate(endDate.getDate() + 1));
                    continue WorkDateCheck;
                } else {
                    if (startDate < endDate) {
                        startDate.setDate(startDate.getDate() + 1);
                        continue WorkDateCheck;
                    }
                }
                break WorkDateCheck;
            }
        }
        return endDate;
    }
}
