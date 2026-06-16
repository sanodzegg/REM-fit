// adding the convert script to head
if (typeof _conv_host == 'undefined') {
  window['_conv_prevent_bodyhide'] = true
  window['_conv_page_type'] = 'order_confirmation'
  
  const isInjected = Array.prototype.slice.apply(document.getElementsByTagName('script')).some(el => el.src.includes('cdn-4.convertexperiments.com/js/10043513-10045053.js'));
  if (!isInjected) {
    let _conv_track = document.createElement('script')
    _conv_track.src = '//cdn-4.convertexperiments.com/js/10043513-10045053.js'
    document.getElementsByTagName('head')[0].appendChild(_conv_track)
  }
}

const currency_to_report = 'GBP'

// doing logic to submit track conversions
if (Shopify?.Checkout?.step === 'thank_you') {
  console.debug('Convert: We are on the thank you page')

  let convert_attributes = JSON.parse(
    localStorage.getItem('convert_attributes')
  )

  fetch('https://cdn.shopify.com/s/javascripts/currencies.js')
    .then(res => res.text())
    .then(jsCode => {
      try {
        const jsContext = {}; // provide custom context for JS code (i.e. "this" inside JS refers to jsContext instead of window)
        const Currency = Function(`"use strict"; ${jsCode} return Currency;`).call(jsContext);

        console.debug('Convert: Multicurrency method')
        if (convert_attributes) {
          console.debug('Convert: We have attributes')
          console.debug(convert_attributes)

          //build POST data to be sent
          const post = {
            cid: convert_attributes.cid,
            pid: convert_attributes.pid,
            seg: convert_attributes.defaultSegments,
            s: 'shopify',
            vid: convert_attributes.vid,
            ev: [
              {
                evt: 'tr',
                goals: [convert_attributes.goals],
                exps: convert_attributes.exps,
                vars: convert_attributes.vars,
                tid: Shopify?.checkout?.token,
                r: parseFloat(
                  Currency.convert(
                    Shopify?.checkout?.subtotal_price,
                    Shopify?.Checkout?.currency,
                    currency_to_report
                  )
                ),
                prc: Shopify?.checkout?.line_items?.reduce((acc, item) => {
                  return acc + item.quantity
                }, 0)
              },
              {
                evt: 'hitGoal',
                goals: [convert_attributes.goals],
                exps: convert_attributes.exps,
                vars: convert_attributes.vars
              }
            ]
          }

          const data = JSON.stringify(post)
          console.debug(post)

          fetch(
            `https://${convert_attributes.pid}.metrics.convertexperiments.com/track`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
              },
              body: data
            }
          )
            .then((response) => response.json())
            .then((_) => {
              console.debug('Convert: Conversion registered')
            })
            .catch(function (error) {
              console.error(error)
            })
        }
      } catch (error) {
        console.error(error)
      }
    })
} else {
  console.debug('Convert: We are not on the thank you page')
}
