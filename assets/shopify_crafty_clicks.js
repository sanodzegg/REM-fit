/**
 * Postcode Lookup by Fetchify
 *
 * @author      ClearCourse Business Services Ltd t/a Fetchify
 * @link        https://fetchify.com
 * @copyright   Copyright (c) 2022, ClearCourse Business Services Ltd
 * @version     1.3.2
 */

_cp_add_crafty();
let _cp_idx = 0;
let c2a_obj = null;

// set defaults
cc_config._cp_hide_fields = cc_config._cp_hide_fields ? cc_config._cp_hide_fields : false;
cc_config._cp_button_below_postcode = cc_config._cp_button_below_postcode ? cc_config._cp_button_below_postcode : false;
cc_config._cp_button_text = cc_config._cp_button_text ? cc_config._cp_button_text : 'Find Address';
cc_config._cp_button_class = cc_config._cp_button_class ? cc_config._cp_button_class : '';
cc_config._cp_busy_img_url = cc_config._cp_busy_img_url ? cc_config._cp_busy_img_url : '';
cc_config._enable_phone_validation = cc_config._enable_phone_validation ? cc_config._enable_phone_validation : false;
cc_config._enable_email_validation = cc_config._enable_email_validation ? cc_config._enable_email_validation : false;

function _cp_add_crafty() {
  if (typeof CraftyPostcodeCreate === 'undefined') {
    const _cc_js = document.createElement('script');
    _cc_js.type = 'text/javascript';
    _cc_js.onload = function onload() { _cp_look_for_forms(); };
    _cc_js.src = 'https://cc-cdn.com/legacy/scripts/v4.9.2/crafty_clicks.class.min.js';
    document.getElementsByTagName('head')[0].appendChild(_cc_js);
  } else {
    _cp_look_for_forms();
  }
}

function _cp_look_for_forms() {
  const callback = () => {
    if (document.querySelectorAll('#checkout_billing_address_zip').length) {
      setInterval(() => {
        if (!document.querySelectorAll('[id*="_cc_button"]').length) _cp_add_lookup('checkout_billing_address_', '');
      }, 200);
    }
    if (document.querySelectorAll('#checkout_shipping_address_zip').length) {
      setInterval(() => {
        if (!document.querySelectorAll('[id*="_cc_button"]').length) _cp_add_lookup('checkout_shipping_address_', '');
      }, 200);
    }
    if (document.querySelectorAll('input[id*="AddressZip"]').length) {
      document.querySelectorAll('input[id*="AddressZip"]').forEach((zip_input, key) => {
        if (document.querySelectorAll('input[id*="AddressZip"]')[key].id === 'AddressZipNew') {
          _cp_add_lookup('Address', 'New');
        } else {
          _cp_add_lookup('Address', `_${document.querySelectorAll('input[id*="AddressZip"]')[key].id.split('_')[1]}`);
        }
      });
    }
    setTimeout(() => {
      if (typeof clickToAddress === 'function') {
        c2a_obj = new clickToAddress({
          accessToken: cc_config._cp_access_token,
        });
        if (cc_config._enable_phone_validation) {
          try {
            c2a_obj.addPhoneVerify({
              phone: 'checkout_email_or_phone',
              country() {
                return document.querySelectorAll('#checkout_shipping_address_country > option:selected')[0].dataset.code;
              },
              offset: { left: -40 },
            });
          } catch (e) {
            // do nothing
          }
          try {
            c2a_obj.addPhoneVerify({
              phone: 'checkout_shipping_address_phone',
              country() {
                return document.querySelectorAll('#checkout_shipping_address_country > option:selected')[0].dataset.code;
              },
              offset: { left: -40 },
            });
          } catch (e) {
            // do nothing
          }
        }
      }
    }, 500);
  };

  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

function _cp_add_lookup(prefix, suffix) {
  if (typeof _cp_idx !== 'number') { // Needed on account/addresses page
    setTimeout(() => {
      _cp_add_lookup(prefix, suffix);
    }, 20);
    return;
  }

  const idx = _cp_idx;
  _cp_idx += 1;
  const cp_obj = CraftyPostcodeCreate();

  let tmp_elems;
  if (prefix !== 'Address') {
    tmp_elems = ['company', 'address1', 'address2', 'city', 'province', 'zip', 'country'];
  } else {
    tmp_elems = ['Company', 'Address1', 'Address2', 'City', 'Province', 'Zip', 'Country'];
  }
  const dom = {};
  const elems = tmp_elems;
  const ids = {};
  for (let i = 0; i < elems.length; i += 1) {
    dom[elems[i].toLowerCase()] = document.querySelectorAll(`#${prefix}${elems[i]}${suffix}`);
    if (dom[elems[i].toLowerCase()].length !== 0) {
      ids[elems[i].toLowerCase()] = prefix + elems[i] + suffix;
    } else ids[elems[i].toLowerCase()] = '';
  }
  // Country alignment fix
  (dom.country[0].closest('div.field')).style.clear = 'both';

  // Add button
  let button_html;

  let _cp_result_box_width = '';

  if (prefix === 'Address') {
    _cp_result_box_width = '100%'; // Restrict width on account/addresses page
    if (typeof dom.company[0] === 'undefined') { // Company field for new address has no id
      dom.company = document.querySelectorAll('#AddressNewForm')[0].querySelectorAll('input[name="address[company]"]');
      dom.company[0].id = `${prefix}Company${suffix}`;
      ids.company = `${prefix}Company${suffix}`;
    }
    const input = document.createElement('input');
    input.className = `btn ${cc_config._cp_button_class}`;
    input.id = `_cc_button_${idx}`;
    input.type = 'button';
    input.value = `${cc_config._cp_button_text}`;
    input.style.marginLeft = '10px';
    input.style.float = 'right';
    button_html = input;
  } else {
    const button = document.createElement('button');
    button.className = `btn ${cc_config._cp_button_class}`;
    button.id = `_cc_button_${idx}`;
    button.type = 'button';
    button.innerText = cc_config._cp_button_text;
    button_html = button;
    if (!cc_config._cp_button_below_postcode || window.screen.width >= 1024) {
      dom.zip[0].classList.add('field--half');
      dom.zip[0].style.float = 'left';
      button_html.style.marginLeft = '5px';
      button_html.style.fontSize = '1em';
      button_html.style.padding = '1em 0.8em';
      button_html.style.width = '46%';
      button_html.style.float = 'right';
    } else {
      dom.zip[0].classList.add('field--half');
      dom.zip[0].style.float = 'left';
      button_html.style.fontSize = '1em';
      button_html.style.padding = '1em 0.8em';
      button_html.style.width = '100%';
    }
  }

  button_html.addEventListener('click', () => {
    cp_obj.doLookup();
    const result = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0];
    result.classList.remove('field__input-wrapper--select');
    result.style.color = '';
  });

  let button_elem = dom.zip[0];
  if (prefix !== 'Address') {
    if (button_elem.nextElementSibling) {
      button_elem = button_elem.nextElementSibling;
    }
    button_elem.after(button_html);
  } else {
    button_elem.before(button_html);
  }
  if (cc_config._cp_button_below_postcode && window.screen.width < 1024) {
    button_elem.after(document.createElement('br'));
  }

  // Rearrange fields
  const dom_parent = {};
  const parent_elem = 'div.field';
  Object.keys(dom).forEach((key) => {
    dom_parent[key] = dom[key][0]?.closest(parent_elem);
  });
  if (prefix === 'Address') {
    dom_parent.zip = dom.zip;
  }
  // Country and county and in one tr, separate them first
  if (dom_parent.province === dom_parent.country) {
    let label = dom_parent.country.querySelectorAll('label');
    let row = document.createElement('tr');
    let column = document.createElement('td');
    column.classList.add('lbl');
    column.appendChild(label[0]);
    row.appendChild(column);
    column = document.createElement('td');
    column.appendChild(dom.country[0]);
    row.appendChild(column);
    dom_parent.country = row;
    label = dom_parent.province.querySelectorAll('label');
    row = document.createElement('tr');
    column = document.createElement('td');
    column.classList.add('lbl');
    column.appendChild(label[0]);
    row.appendChild(column);
    column = document.createElement('td');
    column.appendChild(dom.province[0]);
    row.appendChild(column);
    dom_parent.province = row;
    dom_parent.country.remove();
    dom_parent.city.after(dom_parent.province);
  }

  // Hide fields
  if (cc_config._cp_hide_fields && prefix !== 'Address') {
    Object.keys(dom_parent).forEach((key) => {
      if (typeof dom_parent[key] !== 'undefined') {
        if (!['country', 'zip', 'province'].includes(key)) {
          (dom_parent[key]).classList.add(`${prefix}cc_hide${suffix}`);
        }
      }
    });
    const manual_addr_html = document.createElement('div');
    manual_addr_html.id = `cc_manual_${prefix}`;
    manual_addr_html.classList.add('field');
    const manual_addr_lbl = document.createElement('label');
    manual_addr_lbl.innerText = 'Enter address manually';
    manual_addr_html.appendChild(manual_addr_lbl);
    manual_addr_html.style.fontSize = '0.8em';
    manual_addr_html.style.paddingRight = '0.5em';
    manual_addr_html.style.display = 'none';
    manual_addr_lbl.style.float = 'right';
    manual_addr_lbl.style.cursor = 'pointer';
    manual_addr_lbl.addEventListener('click', function onclick() {
      (this.closest('div.field')).style.display = 'none';
      (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.style.display = 'block';
      });
    });
    dom.country[0].closest('div.field').before(manual_addr_html);
    if (dom.address1[0].value === '') {
      (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.style.display = 'none';
      });
      (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.style.display = 'block';
      });
    }
  }
  // Add result box
  const result = document.createElement('div');
  result.id = `crafty_postcode_result_display_${idx}`;
  if (prefix === 'Address') {
    dom_parent.zip.after(result);
  } else {
    const resultContainer = document.createElement('div');
    resultContainer.classList.add('field', 'field--required', 'field--show-floating-label');
    resultContainer.style.display = 'none';
    result.classList.add('field__input-wrapper');
    resultContainer.appendChild(result);
    dom_parent.zip.after(resultContainer);
  }

  cp_obj.set('access_token', cc_config._cp_access_token);
  cp_obj.set('res_autoselect', '0');
  cp_obj.set('result_elem_id', `crafty_postcode_result_display_${idx}`);
  if (ids.company !== '') {
    cp_obj.set('elem_company', ids.company);
  } else {
    cp_obj.set('elem_company', ids.address1);
  }
  cp_obj.set('elem_street1', ids.address1);
  cp_obj.set('elem_street2', ids.address2);
  cp_obj.set('elem_town', ids.city);
  cp_obj.set('elem_county', ids.province); // optional
  cp_obj.set('elem_postcode', ids.zip);
  cp_obj.set('single_res_autoselect', 1); // don't show a drop down box if only one matching address is found
  cp_obj.set('max_width', _cp_result_box_width);
  cp_obj.set('first_res_line', 'Please, select your address');
  cp_obj.set('max_lines', 1);
  cp_obj.set('busy_img_url', cc_config._cp_busy_img_url);
  cp_obj.set('hide_result', 1);
  cp_obj.set('traditional_county', 1);

  cp_obj.set('on_result_ready', () => {
    const result_elem = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0];
    result_elem.classList.add('field__input-wrapper--select');
    result_elem.style.color = '';
    if (prefix === 'Address') {
      result_elem.closest('tr').style.display = 'block';
    } else {
      (result_elem.closest('div.field')).style.display = 'block';
      const label = document.createElement('label');
      label.classList.add('field__label');
      label.textContent = 'Select Address';
      result_elem.prepend(label);
      result_elem.querySelectorAll('select')[0].classList.add('field__input', 'field__input--select');

    }
  });
  cp_obj.set('on_result_selected', () => {
    if (prefix === 'Address') {
      document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('tr').style.display = 'none';
    } else {
      (document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('div.field')).style.display = 'none';
    }
    // UK sub-country selector
    const postcode_inital = dom.zip[0].value.substring(0, 2);
    const uk_sub_countries = [
      ['JE', 'Jersey'],
      ['GY', 'Guernsey'],
      ['IM', 'Isle Of Man'],
    ];
    dom.country[0].value = 'United Kingdom';
    for (let i = 0; i < uk_sub_countries.length; i += 1) {
      if (postcode_inital === uk_sub_countries[i][0] && dom.country[0].querySelectorAll(`option[value="${uk_sub_countries[i][1]}"]`).length) {
        // eslint-disable-next-line prefer-destructuring
        dom.country[0].value = uk_sub_countries[i][1];
      }
    }
    dom.country[0].dispatchEvent(new Event('change'));
    setup_for_uk(idx, dom_parent, dom, prefix, suffix);

    // Address line merger
    if (dom.address1[0].value.length < 5) {
      dom.address1[0].value = `${dom.address1[0].value}, ${dom.address2[0].value}`;
      dom.address2[0].value = '';
    }

    (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.style.display = 'block';
    });
    (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.style.display = 'none';
    });
  });
  cp_obj.set('on_error', () => {
    let elem;
    if (prefix === 'Address') {
      elem = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('tr');
      elem.style.color = 'red';
    } else {
      elem = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('div.field');
      const elemParent = elem.parentElement;
      const errorDiv = document.createElement('div');
      errorDiv.style.color = 'red';
      errorDiv.style.margin = '1.25em 0em';
      errorDiv.appendChild(elem);
      elemParent.appendChild(errorDiv);
    }
    elem.style.display = 'block';
    (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.style.display = 'block';
    });
    (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.style.display = 'none';
    });
  });

  dom.country[0].addEventListener('change', function change() {
    const curr_country = this.value;
    if (curr_country === 'United Kingdom'
      || curr_country === 'Jersey'
      || curr_country === 'Guernsey'
      || curr_country === 'Isle Of Man') {
      setup_for_uk(idx, dom_parent, dom, prefix, suffix);
    } else {
      setup_for_non_uk(idx, dom_parent, dom, prefix, suffix);
    }
  });
  dom.country[0].dispatchEvent(new Event('change'));
}

function setup_for_uk(idx, dom_parent, dom, prefix, suffix) {
  (document.querySelectorAll(`#_cc_button_${idx}`)).forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'block';
  });
  (document.querySelectorAll(`#crafty_postcode_lookup_result_option${idx + 1}`)).forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'block';
  });
  let display_parent;
  if (prefix === 'Address') {
    // eslint-disable-next-line prefer-destructuring
    display_parent = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0];
    // eslint-disable-next-line no-param-reassign
    dom_parent.zip.style.width = '75%';
  } else {
    display_parent = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('div.field');
    if (!cc_config._cp_button_below_postcode || window.screen.width >= 1024) {
      // eslint-disable-next-line no-param-reassign
      dom_parent.zip.querySelectorAll('input')[0].style.width = '50%';
    }
  }
  // Rearrange the fields
  setTimeout(() => {
    dom_parent.city.after(dom_parent.province);
    if (prefix === 'Address') {
      let anchor_element = null;
      if (suffix === 'New') {
        anchor_element = dom.address1[0].parentElement.parentElement;
      } else {
        // eslint-disable-next-line prefer-destructuring
        anchor_element = document.querySelectorAll(`#address_form${suffix} div`)[0];
      }
      anchor_element.before(dom.country[0]);
      dom.country[0].before(document.querySelectorAll(`label[for='${dom.country[0].id}']`)[0]);
      anchor_element.before(dom.zip[0]);
      dom.zip[0].before(document.querySelectorAll(`label[for='${dom.zip[0].id}']`)[0]);
      anchor_element.before(display_parent);
      document.querySelectorAll(`label[for='${dom.address1[0].id}']`)[0].before(dom.company[0]);
      dom.zip[0].before(document.querySelectorAll(`#_cc_button_${idx}`)[0]);
      dom.city[0].parentElement.classList.remove('medium-up--one-half');
    } else {
      dom_parent.address1.before(dom_parent.country);
      dom_parent.address1.before(dom_parent.zip);
      dom_parent.address1.before(display_parent);
      if (typeof dom_parent.company !== 'undefined') {
        dom_parent.address1.before(dom_parent.company);
      }
    }
  }, 200);
  // Hide fields
  if (dom_parent.address1.querySelectorAll('input')[0].value === '') {
    (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.style.display = 'none';
    });
    (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.style.display = 'block';
    });
  }
}

function setup_for_non_uk(idx, dom_parent, dom, prefix, suffix) {
  (document.querySelectorAll(`#_cc_button_${idx}`)).forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'none';
  });
  
  (document.querySelectorAll(`#crafty_postcode_lookup_result_option${idx + 1}`)).forEach((element, index) => {
    // eslint-disable-next-line no-param-reassign
    if (index === 0) {
      element.style.fontWeight = 'bold';
    }
    element.style.display = 'none';
  });

  dom_parent.province.after(dom_parent.zip);
  let display_parent;
  if (prefix === 'Address') {
    display_parent = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('tr');
    // eslint-disable-next-line no-param-reassign
    dom_parent.zip.style.width = '';
  } else {
    display_parent = document.querySelectorAll(`#crafty_postcode_result_display_${idx}`)[0].closest('div.field');
    // eslint-disable-next-line no-param-reassign
    dom_parent.zip.querySelectorAll('input')[0].style.width = '100%';
  }
  display_parent.style.display = 'none';
  (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'block';
  });
  (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'none';
  });
}

setInterval(function() {
  if (
      document.querySelectorAll('[data-backup="contact_stored_addresses"]').length
      && document.querySelectorAll('[data-backup="contact_stored_addresses"]')[0].getAttribute("cc") !== "1"
  ) {
      document.querySelectorAll('[data-backup="contact_stored_addresses"]')[0].setAttribute("cc", "1");
      document.querySelectorAll('[data-backup="contact_stored_addresses"]')[0].addEventListener('input', function () {
          let prefix = "checkout_shipping_address_";
          if (document.getElementById('checkout_billing_address_zip')) {
              prefix = "checkout_billing_address_";
          }
          let suffix = "";
          const dom = {};
          const elems = ['company', 'address1', 'address2', 'city', 'province', 'zip', 'country'];
          const ids = {};
          for (let i = 0; i < elems.length; i += 1) {
              dom[elems[i].toLowerCase()] = document.querySelectorAll(`#${prefix}${elems[i]}${suffix}`);
              if (dom[elems[i].toLowerCase()].length !== 0) {
                  ids[elems[i].toLowerCase()] = prefix + elems[i] + suffix;
              } else ids[elems[i].toLowerCase()] = '';
          }
          // Country alignment fix
          (dom.country[0].closest('div.field')).style.clear = 'both';
          const dom_parent = {};
          const parent_elem = 'div.field';
          Object.keys(dom).forEach((key) => {
              dom_parent[key] = dom[key][0]?.closest(parent_elem);
          });
          Object.keys(dom_parent).forEach((key) => {
              if (typeof dom_parent[key] !== 'undefined') {
                  if (!['country', 'zip', 'province'].includes(key)) {
                      (dom_parent[key]).classList.add(`${prefix}cc_hide${suffix}`);
                  }
              }
          });
          if (
              cc_config._cp_hide_fields
              && document.querySelectorAll('[data-backup="contact_stored_addresses"]')[0].value === ''
          ) {
              setup_for_uk(0, dom_parent, dom, prefix, suffix);

              Object.keys(dom_parent).forEach((key) => {
                  if (!['zip', 'country'].includes(key)) {
                      if (dom[key][0] !== undefined) dom[key][0].value = "";
                  }
              });

              if (!document.getElementById(`cc_manual_${prefix}`)) {
                  const manual_addr_html = document.createElement('div');
                  manual_addr_html.id = `cc_manual_${prefix}`;
                  manual_addr_html.classList.add('field');
                  const manual_addr_lbl = document.createElement('label');
                  manual_addr_lbl.innerText = 'Enter address manually';
                  manual_addr_html.appendChild(manual_addr_lbl);
                  manual_addr_html.style.fontSize = '0.8em';
                  manual_addr_html.style.paddingRight = '0.5em';
                  manual_addr_html.style.display = 'none';
                  manual_addr_lbl.style.float = 'right';
                  manual_addr_lbl.style.cursor = 'pointer';
                  manual_addr_lbl.addEventListener('click', function onclick() {
                      (this.closest('div.field')).style.display = 'none';
                      (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
                          // eslint-disable-next-line no-param-reassign
                          element.style.display = 'block';
                      });
                  });

                  dom.country[0].closest('div.field').before(manual_addr_html);
              }
              (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
                  // eslint-disable-next-line no-param-reassign
                  element.style.display = 'none';
              });
              (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
                  // eslint-disable-next-line no-param-reassign
                  element.style.display = 'block';
              });
          } else {
              setup_for_non_uk(0, dom_parent, dom, prefix, suffix);
              (document.querySelectorAll(`.${prefix}cc_hide${suffix}`)).forEach((element) => {
                  // eslint-disable-next-line no-param-reassign
                  element.style.display = 'block';
              });
              (document.querySelectorAll(`#cc_manual_${prefix}`)).forEach((element) => {
                  // eslint-disable-next-line no-param-reassign
                  element.style.display = 'none';
              });
          }
      });
  }
}, 200)