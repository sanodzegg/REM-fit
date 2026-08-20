/* ==========================================================================
   REM-Fit Mattress Finder
   Data-driven quiz engine. Everything it renders and every number it uses
   comes from the JSON config emitted by sections/mattress-finder.liquid.
   There is no quiz content in this file.

   createEngine()   pure quiz state, branching and matching — no DOM
   MattressFinder() DOM shell, rendering and events on top of an engine
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    /* Exported so the engine can be exercised headlessly in tests. */
    module.exports = api;
  } else {
    root.RemFitMattressFinder = api;
    api.autoInit();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KEY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* ---------------------------------------------------------------- utils */

  function num(value, fallback) {
    var n = parseFloat(value);
    return isNaN(n) ? fallback : n;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Merchant copy is rendered as-is so HTML entities and inline markup work.
     Whitespace is normalised so a blank token mid-sentence (an empty
     "{{build.token}}", say) doesn't leave a gap before the punctuation. */
  function tidy(str) {
    return String(str == null ? '' : str)
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .trim();
  }

  /* -------------------------------------------------- condition language
     who=couple                 equals
     position=back|combi        any of
     who!=couple                not equal
     partnerConflict>=1         numeric compare (>= <= > <)
     a=1,b=2                    AND  (comma)
     a=1;b=2                    OR   (semicolon, between AND-groups)
     (blank)                    always true
     ------------------------------------------------------------------- */

  var OPERATORS = ['!=', '>=', '<=', '=', '>', '<'];

  function matchClause(clause, ctx) {
    clause = clause.trim();
    if (!clause) return true;

    var op = null;
    var at = -1;
    for (var i = 0; i < OPERATORS.length; i++) {
      var pos = clause.indexOf(OPERATORS[i]);
      if (pos > -1) {
        op = OPERATORS[i];
        at = pos;
        break;
      }
    }

    if (!op) return !!ctx[clause];

    var key = clause.slice(0, at).trim();
    var expected = clause.slice(at + op.length).trim();
    var actual = ctx[key];

    if (op === '>=' || op === '<=' || op === '>' || op === '<') {
      var a = num(actual, NaN);
      var b = num(expected, NaN);
      if (isNaN(a) || isNaN(b)) return false;
      if (op === '>=') return a >= b;
      if (op === '<=') return a <= b;
      if (op === '>') return a > b;
      return a < b;
    }

    var actualStr = actual === undefined || actual === null ? '' : String(actual).toLowerCase();
    var wanted = expected.split('|').map(function (v) {
      return v.trim().toLowerCase();
    });
    var hit = wanted.indexOf(actualStr) > -1;
    return op === '!=' ? !hit : hit;
  }

  function evalCondition(expr, ctx) {
    if (!expr) return true;
    var groups = String(expr)
      .split(';')
      .filter(function (group) {
        return group.trim() !== '';
      });
    if (!groups.length) return true;

    return groups.some(function (group) {
      return group.split(',').every(function (clause) {
        return matchClause(clause, ctx);
      });
    });
  }

  /* -------------------------------------------------------- token replace */

  function lookupToken(path, tokens) {
    var parts = path.split('.');
    var node = tokens;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return '';
      node = node[parts[i]];
    }
    return node == null ? '' : String(node);
  }

  /* Tokens use [[ ]] rather than {{ }}: Shopify parses {{ ... }} inside JSON
     template settings as a dynamic source binding, which would reject these
     values before they ever reached us. */
  function interpolate(template, tokens) {
    if (!template) return '';
    return tidy(
      String(template).replace(/\[\[\s*([\w.]+)\s*\]\]/g, function (_, path) {
        return lookupToken(path, tokens);
      })
    );
  }

  /* ============================================================== engine
     Pure quiz state: no DOM, no network. Safe to run anywhere.
     ================================================================== */

  function createEngine(config) {
    config = config || {};

    var steps = config.steps || [];
    var products = config.products || [];
    var guides = config.guides || [];
    var reasons = config.reasons || [];
    var rules = config.rules || [];
    var sizeRules = config.sizeRules || [];
    var derived = config.derived || [];
    var weights = config.weights || {};
    var result = config.result || {};

    var RESULT_INDEX = steps.length;
    var sizeAnswerKey = config.sizeAnswerKey || 'size';

    var state = {
      answers: {},
      email: null,
      history: [],
      answered: 0,
      index: 0,
      match: null
    };

    /* ------------------------------------------------------ step access */

    function stepKey(step) {
      return step.saveAs || step.id;
    }

    function findStepByKey(key) {
      for (var i = 0; i < steps.length; i++) {
        if (stepKey(steps[i]) === key) return steps[i];
      }
      return null;
    }

    function chosenOption(step) {
      if (!step || !step.options) return null;
      var value = state.answers[stepKey(step)];
      if (value == null) return null;
      for (var i = 0; i < step.options.length; i++) {
        if (step.options[i].value === value) return step.options[i];
      }
      return null;
    }

    function indexOfStepId(id) {
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].id === id) return i;
      }
      return -1;
    }

    /* Distance between this sleeper's ideal tension and their partner's.
       Only used to choose which reason line to show. 0 when not applicable. */
    function partnerConflict() {
      for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        if (!step.conflictWith) continue;

        var theirs = chosenOption(step);
        if (!theirs || !theirs.tensionOp || theirs.tensionOp === 'none') continue;

        var mine = chosenOption(findStepByKey(step.conflictWith));
        if (!mine) continue;

        return Math.abs(num(mine.tensionValue, 0) - num(theirs.tensionValue, 0));
      }
      return 0;
    }

    function answerContext() {
      var ctx = {};
      Object.keys(state.answers).forEach(function (key) {
        ctx[key] = state.answers[key];
      });
      ctx.emailCaptured = !!state.email;
      ctx.partnerConflict = partnerConflict();
      return ctx;
    }

    function isVisible(step) {
      return evalCondition(step.showWhen, answerContext());
    }

    /* --------------------------------------------------------- navigation */

    function nextIndexFrom(from) {
      for (var i = from + 1; i < steps.length; i++) {
        if (isVisible(steps[i])) return i;
      }
      return RESULT_INDEX;
    }

    function firstIndex() {
      return steps.length && isVisible(steps[0]) ? 0 : nextIndexFrom(-1);
    }

    function setAnswer(step, value) {
      state.answers[stepKey(step)] = value;
      state.match = null;
    }

    function advance(fromIndex, option) {
      state.history.push(fromIndex);
      var step = steps[fromIndex];
      if (step && step.type === 'question') state.answered++;

      if (option && option.next) {
        var jump = indexOfStepId(option.next);
        if (jump > -1) return jump;
      }
      return nextIndexFrom(fromIndex);
    }

    function back() {
      if (!state.history.length) return state.index;
      var previous = state.history.pop();
      var step = steps[previous];
      if (step && step.type === 'question') {
        if (state.answered > 0) state.answered--;
        /* Drop the answer we are stepping back over — otherwise a branch the
           shopper has navigated away from keeps scoring. */
        delete state.answers[stepKey(step)];
      }
      state.match = null;
      return previous;
    }

    function reset() {
      state.answers = {};
      state.email = null;
      state.history = [];
      state.answered = 0;
      state.match = null;
      return firstIndex();
    }

    function visibleQuestionCount() {
      var total = 0;
      steps.forEach(function (step) {
        if (step.type === 'question' && isVisible(step)) total++;
      });
      return total;
    }

    /* ---------------------------------------------------- matching engine */

    function computeTarget() {
      var target = num(weights.defaultTension, 7);
      var ctx = answerContext();

      var applicable = [];
      steps.forEach(function (step, index) {
        if (step.type !== 'question') return;
        if (!evalCondition(step.showWhen, ctx)) return;
        var option = chosenOption(step);
        if (!option || !option.tensionOp || option.tensionOp === 'none') return;
        applicable.push({ order: num(step.tensionOrder, 0), index: index, option: option });
      });

      applicable.sort(function (a, b) {
        return a.order - b.order || a.index - b.index;
      });

      applicable.forEach(function (entry) {
        var option = entry.option;
        var value = num(option.tensionValue, 0);

        if (option.tensionOp === 'set') {
          target = value;
        } else if (option.tensionOp === 'add') {
          target += value;
        } else if (option.tensionOp === 'min') {
          target = Math.max(target, value);
        } else if (option.tensionOp === 'max') {
          target = Math.min(target, value);
        } else if (option.tensionOp === 'blend') {
          var weight = num(option.tensionWeight, 0.4);
          target = target * (1 - weight) + value * weight;
        }
      });

      var rounding = num(weights.rounding, 0.25);
      if (rounding > 0) target = Math.round(target / rounding) * rounding;
      return Math.round(target * 1000) / 1000;
    }

    function productHasAttr(product, attr) {
      if (!attr || attr === 'any') return true;
      if (attr === 'cooling') return !!product.cooling;
      if (attr === 'natural') return !!product.natural;
      if (attr === 'foam') return !!product.foam;
      if (attr === 'band1') return num(product.priceBand, 0) === 1;
      if (attr === 'band2') return num(product.priceBand, 0) === 2;
      if (attr === 'band3') return num(product.priceBand, 0) === 3;
      return false;
    }

    function computeMatch() {
      if (state.match) return state.match;

      var target = computeTarget();
      var base = answerContext();
      base.tension = target;
      base.sizeExtended = isExtendedSize(rawSizeAnswer());

      var scored = [];

      products.forEach(function (product) {
        var ctx = Object.assign({}, base, {
          productCooling: !!product.cooling,
          productNatural: !!product.natural,
          productFoam: !!product.foam,
          productBand: num(product.priceBand, 0)
        });

        if (product.excludeUnless && !evalCondition(product.excludeUnless, ctx)) return;

        var score = num(weights.baseScore, 10);
        score -= Math.abs(num(product.tension, 7) - target) * num(weights.tensionPenalty, 2.6);

        rules.forEach(function (rule) {
          if (!productHasAttr(product, rule.attr)) return;
          if (!evalCondition(rule.when, ctx)) return;
          score += num(rule.amount, 0);
        });

        (product.boosts || []).forEach(function (boost) {
          if (!boost.when) return;
          if (!evalCondition(boost.when, ctx)) return;
          score += num(boost.amount, 0);
        });

        scored.push({ product: product, score: score });
      });

      scored.sort(function (a, b) {
        return b.score - a.score;
      });

      state.match = {
        target: target,
        primary: scored.length ? scored[0].product : null,
        runner: scored.length > 1 ? scored[1].product : null,
        scored: scored
      };
      return state.match;
    }

    /* --------------------------------------------------------------- sizes
       The size map is derived from the size question's own options, so what
       a shopper picks from and what the result shows can never drift apart. */

    function sizeOptions() {
      var step = findStepByKey(sizeAnswerKey);
      return step && step.options ? step.options : [];
    }

    function sizeByValue(value) {
      var options = sizeOptions();
      for (var i = 0; i < options.length; i++) {
        if (options[i].value === value) return options[i];
      }
      return null;
    }

    function rawSizeAnswer() {
      return state.answers[sizeAnswerKey];
    }

    function isExtendedSize(value) {
      var option = sizeByValue(value);
      return !!(option && option.extended);
    }

    function recommendSize() {
      var chosen = rawSizeAnswer();
      if (chosen && chosen !== config.sizeHelpValue) return chosen;

      var ctx = answerContext();
      for (var i = 0; i < sizeRules.length; i++) {
        if (evalCondition(sizeRules[i].when, ctx)) return sizeRules[i].value;
      }
      return chosen;
    }

    /* -------------------------------------------------------------- tokens */

    function productTokens(product) {
      if (!product) return {};
      var feature1 = (product.features || [])[0] || '';
      return {
        name: product.name,
        short: product.short || product.name,
        tag: product.tag,
        url: product.url,
        blurb: product.blurb,
        tensionLabel: product.tensionLabel,
        tensionLabelLower: String(product.tensionLabel || '').toLowerCase(),
        feature1: feature1,
        feature1Lower: String(feature1).toLowerCase()
      };
    }

    function buildTokens(match, sizeOption, guide) {
      var tokens = {
        tension: match.target,
        code: (config.integrations || {}).discountCode,
        product: productTokens(match.primary),
        runner: productTokens(match.runner),
        size: sizeOption
          ? {
              label: sizeOption.label,
              labelLower: String(sizeOption.label || '').toLowerCase(),
              dims: sizeOption.hint,
              url: sizeOption.link
            }
          : {},
        guide: guide ? { title: guide.title, url: guide.url } : {}
      };

      /* Every answered step is addressable as {{stepKey.token}} /
         {{stepKey.label}} / {{stepKey.value}}. */
      steps.forEach(function (step) {
        if (step.type !== 'question') return;
        var option = chosenOption(step);
        tokens[stepKey(step)] = {
          value: option ? option.value : '',
          label: option ? option.label : '',
          token: option ? option.token || '' : ''
        };
      });

      return tokens;
    }

    function pickGuide(ctx) {
      for (var i = 0; i < guides.length; i++) {
        if (evalCondition(guides[i].when, ctx)) return guides[i];
      }
      return null;
    }

    function pickReasons(ctx, tokens) {
      var out = [];
      var limit = num(config.maxReasons, 5);
      for (var i = 0; i < reasons.length && out.length < limit; i++) {
        if (!evalCondition(reasons[i].when, ctx)) continue;
        var text = interpolate(reasons[i].text, tokens);
        if (text) out.push(text);
      }
      return out;
    }

    /* Everything the result screen needs, resolved in one pass. */
    function resultModel() {
      var match = computeMatch();
      var sizeKey = recommendSize();
      var sizeOption = sizeByValue(sizeKey);

      var ctx = answerContext();
      ctx.tension = match.target;
      ctx.match = match.primary ? match.primary.key : '';
      ctx.runner = match.runner ? match.runner.key : '';
      ctx.productCooling = !!(match.primary && match.primary.cooling);
      ctx.productNatural = !!(match.primary && match.primary.natural);
      ctx.productFoam = !!(match.primary && match.primary.foam);
      ctx.sizeExtended = isExtendedSize(rawSizeAnswer());
      ctx.sizeHelped = rawSizeAnswer() === config.sizeHelpValue;
      ctx.recommendedSize = sizeKey;

      var guide = pickGuide(ctx);
      var tokens = buildTokens(match, sizeOption, guide);

      var sizeNote;
      if (!ctx.sizeHelped) {
        sizeNote = interpolate(result.sizeSelectedNote, tokens);
      } else if (result.sizeCoupleNote && result.sizeCoupleNoteWhen && evalCondition(result.sizeCoupleNoteWhen, ctx)) {
        sizeNote = interpolate(result.sizeCoupleNote, tokens);
      } else {
        sizeNote = interpolate(result.sizeHelpedNote, tokens);
      }

      return {
        match: match,
        ctx: ctx,
        tokens: tokens,
        guide: guide,
        sizeKey: sizeKey,
        sizeOption: sizeOption,
        sizeNote: sizeNote,
        reasons: pickReasons(ctx, tokens)
      };
    }

    /* Answers keyed by their internal key — used for the on-device profile. */
    function answerSnapshot() {
      var out = {};
      steps.forEach(function (step) {
        if (step.type !== 'question') return;
        var key = stepKey(step);
        out[key] = state.answers[key] == null ? null : state.answers[key];
      });
      return out;
    }

    /* Answers keyed by their published field name. This is the wire contract
       for the stats sheet and Klaviyo, so it is deliberately independent of
       the internal keys the branching uses. */
    function exportSnapshot() {
      var out = {};
      steps.forEach(function (step) {
        if (step.type !== 'question') return;
        var key = stepKey(step);
        out[step.exportAs || key] = state.answers[key] == null ? null : state.answers[key];
      });
      return out;
    }

    /* Fields folded from several answers into one, e.g. pain_type taking
       whichever of the two pain questions the shopper was actually asked. */
    function derivedFields() {
      var out = {};
      derived.forEach(function (field) {
        if (!field.name) return;
        var sources = String(field.from || '').split(',');
        var value = null;
        for (var i = 0; i < sources.length; i++) {
          var key = sources[i].trim();
          if (!key) continue;
          if (state.answers[key] != null && state.answers[key] !== '') {
            value = state.answers[key];
            break;
          }
        }
        out[field.name] = value;
      });
      return out;
    }

    state.index = firstIndex();

    return {
      config: config,
      steps: steps,
      state: state,
      resultIndex: RESULT_INDEX,
      stepKey: stepKey,
      chosenOption: chosenOption,
      isVisible: isVisible,
      setAnswer: setAnswer,
      advance: advance,
      back: back,
      reset: reset,
      firstIndex: firstIndex,
      nextIndexFrom: nextIndexFrom,
      visibleQuestionCount: visibleQuestionCount,
      computeTarget: computeTarget,
      computeMatch: computeMatch,
      recommendSize: recommendSize,
      rawSizeAnswer: rawSizeAnswer,
      isExtendedSize: isExtendedSize,
      answerContext: answerContext,
      answerSnapshot: answerSnapshot,
      exportSnapshot: exportSnapshot,
      derivedFields: derivedFields,
      resultModel: resultModel
    };
  }

  /* ================================================================== DOM */

  function MattressFinder(root) {
    var configEl = root.querySelector('script[data-rf-config]');
    if (!configEl) return;

    var config;
    try {
      config = JSON.parse(configEl.textContent);
    } catch (err) {
      if (window.console) console.error('[mattress-finder] bad config JSON', err);
      return;
    }

    var stage = root.querySelector('[data-rf-stage]');
    if (!stage || !(config.steps || []).length) return;

    var engine = createEngine(config);
    var state = engine.state;
    var steps = engine.steps;
    var layout = config.layout || {};
    var integrations = config.integrations || {};
    var result = config.result || {};

    var progressFill = root.querySelector('[data-rf-progress-fill]');
    var backBtn = root.querySelector('[data-rf-back]');
    var counter = root.querySelector('[data-rf-counter]');

    var statsSent = false;

    /* ------------------------------------------------------- analytics */

    function track(event, data) {
      if (!integrations.analytics) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(
        Object.assign({ event: (integrations.analyticsPrefix || 'rf_quiz_') + event }, data || {})
      );
    }

    /* -------------------------------------------------------- rendering */

    function renderWelcome(step) {
      return [
        step.offerPill ? '<div class="rf-offer-pill">' + step.offerPill + '</div>' : '',
        step.heading ? '<h1>' + step.heading + '</h1>' : '',
        step.subtext ? '<p class="rf-sub">' + step.subtext + '</p>' : '',
        '<button class="rf-btn rf-btn--gold" type="button" data-rf-action="next">' +
          (step.buttonText || 'Start') +
          '</button>',
        step.enterHint ? '<span class="rf-enter-hint">' + step.enterHint + '</span>' : '',
        step.dataBadge ? '<div class="rf-data-badge">' + step.dataBadge + '</div>' : ''
      ].join('');
    }

    function renderQuestion(step) {
      var ctx = engine.answerContext();
      var proof = '';
      if (step.proofText && evalCondition(step.proofWhen, ctx)) {
        proof =
          '<div class="rf-proof">' +
          (step.proofPct ? '<span class="rf-proof__pct">' + step.proofPct + '</span>' : '') +
          '<span>' +
          step.proofText +
          (step.proofSub ? '<small>' + step.proofSub + '</small>' : '') +
          '</span></div>';
      }

      var options = (step.options || [])
        .map(function (option, i) {
          return (
            '<button class="rf-opt" type="button" data-rf-value="' +
            escapeHtml(option.value) +
            '">' +
            '<span class="rf-opt__key">' +
            (KEY_LETTERS[i] || i + 1) +
            '</span>' +
            (option.emoji ? '<span class="rf-opt__emoji">' + option.emoji + '</span>' : '') +
            '<span>' +
            (option.label || '') +
            (option.hint ? '<span class="rf-opt__hint">' + option.hint + '</span>' : '') +
            '</span></button>'
          );
        })
        .join('');

      return [
        step.eyebrow ? '<div class="rf-eyebrow">' + step.eyebrow + '</div>' : '',
        proof,
        step.title ? '<h2>' + step.title + '</h2>' : '',
        step.subtext ? '<p class="rf-sub">' + step.subtext + '</p>' : '',
        '<div class="rf-options">' + options + '</div>'
      ].join('');
    }

    function renderEmail(step) {
      return [
        step.eyebrow ? '<div class="rf-eyebrow">' + step.eyebrow + '</div>' : '',
        step.heading ? '<h2>' + step.heading + '</h2>' : '',
        step.subtext ? '<p class="rf-sub">' + step.subtext + '</p>' : '',
        '<div class="rf-email-row">',
        '<input type="email" data-rf-email placeholder="' +
          escapeHtml(step.placeholder) +
          '" autocomplete="email" aria-label="' +
          escapeHtml(step.placeholder || 'Email address') +
          '">',
        '<button class="rf-btn" type="button" data-rf-action="submit-email">' +
          (step.buttonText || 'Continue') +
          '</button>',
        '</div>',
        '<div class="rf-email-err" data-rf-email-error role="alert"></div>',
        step.fineprint ? '<p class="rf-fineprint">' + step.fineprint + '</p>' : '',
        step.allowSkip
          ? '<button class="rf-skip" type="button" data-rf-action="skip-email">' +
            (step.skipLabel || 'Skip') +
            '</button>'
          : ''
      ].join('');
    }

    function scalePercent(value) {
      var min = num(result.scaleMin, 4);
      var max = num(result.scaleMax, 10);
      if (max <= min) return 0;
      return Math.min(100, Math.max(0, ((num(value, min) - min) / (max - min)) * 100));
    }

    function renderResult() {
      var model = engine.resultModel();
      var match = model.match;

      if (!match.primary) return '<h2>' + (result.emptyText || '') + '</h2>';

      var product = match.primary;
      var tokens = model.tokens;

      persistProfile(model);
      sendStats(model);
      track('complete', {
        match: product.key,
        runner_up: match.runner ? match.runner.key : null,
        target_tension: match.target,
        size: model.sizeKey,
        email_captured: !!state.email
      });

      var media =
        result.showImage && product.image
          ? '<img class="rf-product-media" src="' +
            escapeHtml(product.image) +
            '" alt="' +
            escapeHtml(product.name) +
            '" loading="lazy">'
          : '';

      var price =
        result.showPrice && product.price
          ? '<p class="rf-product-price">' +
            product.price +
            (product.compareAtPrice ? '<s>' + product.compareAtPrice + '</s>' : '') +
            '</p>'
          : '';

      var reasonHtml = model.reasons
        .map(function (line) {
          return (
            '<li><svg class="rf-why__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<path d="M8 12.5l2.5 2.5L16 9.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg><span>' +
            line +
            '</span></li>'
          );
        })
        .join('');

      var sizeBox = model.sizeOption
        ? '<div class="rf-sizebox">' +
          interpolate(result.sizeTemplate, tokens) +
          ' ' +
          model.sizeNote +
          (model.sizeOption.link
            ? ' <a href="' +
              escapeHtml(model.sizeOption.link) +
              '" target="_top">' +
              interpolate(result.sizeLinkTemplate, tokens) +
              '</a>'
            : '') +
          (result.sizeFootnote
            ? '<br><span class="rf-sizebox__note">' +
              interpolate(result.sizeFootnote, tokens) +
              '</span>'
            : '') +
          '</div>'
        : '';

      var showCode =
        integrations.discountEnabled &&
        integrations.discountCode &&
        (!integrations.discountRequiresEmail || state.email);

      var codeBox = showCode
        ? '<div class="rf-code-box"><div><small>' +
          (integrations.discountLabel || '') +
          '</small><b>' +
          escapeHtml(integrations.discountCode) +
          '</b></div>' +
          '<button class="rf-copy-btn" type="button" data-rf-action="copy-code">' +
          (integrations.copyLabel || 'Copy') +
          '</button></div>'
        : '';

      var trust = (result.trustItems || [])
        .map(function (item) {
          return '<span>' + item + '</span>';
        })
        .join('');

      var runnerBox =
        match.runner && result.showRunner
          ? '<div class="rf-runner"><div>' +
            '<div class="rf-runner__label">' +
            (result.runnerLabel || '') +
            '</div>' +
            '<div class="rf-runner__name">' +
            match.runner.name +
            ' <span class="rf-runner__tension">· ' +
            (match.runner.tensionLabel || '') +
            '</span></div>' +
            (match.runner.runnerLine
              ? '<div class="rf-runner__why">' + match.runner.runnerLine + '</div>'
              : '') +
            '</div>' +
            (match.runner.url
              ? '<a href="' +
                escapeHtml(match.runner.url) +
                '" target="_top" rel="noopener">' +
                (result.runnerLinkText || 'View') +
                '</a>'
              : '') +
            '</div>'
          : '';

      return [
        '<div class="rf-result-card">',
        product.tag ? '<span class="rf-result-card__eyebrow">' + product.tag + '</span>' : '',
        '<h2>' + interpolate(result.headingTemplate, tokens) + '</h2>',
        media,
        product.blurb ? '<p class="rf-sub" style="margin-bottom:0">' + product.blurb + '</p>' : '',
        price,
        '<div class="rf-tension">',
        '<div class="rf-tension__labels"><span>' +
          (result.scaleSoftLabel || '') +
          '</span><span>' +
          (result.scaleFirmLabel || '') +
          '</span></div>',
        '<div class="rf-tension__track">',
        '<div class="rf-tension__fill" style="width:' + scalePercent(product.tension) + '%"></div>',
        '<div class="rf-tension__you" style="left:' +
          Math.min(97, Math.max(3, scalePercent(match.target))) +
          '%" title="' +
          escapeHtml(result.markerTitle || '') +
          '"></div>',
        '</div>',
        '<p class="rf-tension__caption">' + interpolate(result.tensionCaption, tokens) + '</p>',
        '</div>',
        reasonHtml ? '<ul class="rf-why">' + reasonHtml + '</ul>' : '',
        sizeBox,
        codeBox,
        product.url
          ? '<a class="rf-btn rf-btn--gold" href="' +
            escapeHtml(product.url) +
            '" target="_top" rel="noopener">' +
            interpolate(result.ctaTemplate, tokens) +
            '</a>'
          : '',
        trust ? '<div class="rf-trust-row">' + trust + '</div>' : '',
        result.guideText && model.guide
          ? '<span class="rf-guide-link">' +
            interpolate(result.guideText, tokens) +
            ' <a href="' +
            escapeHtml(model.guide.url) +
            '" target="_top">' +
            model.guide.title +
            '</a>.</span>'
          : '',
        '</div>',
        runnerBox,
        result.restartLabel
          ? '<button class="rf-skip rf-restart" type="button" data-rf-action="restart">' +
            result.restartLabel +
            '</button>'
          : ''
      ].join('');
    }

    function render() {
      var isResult = state.index >= engine.resultIndex;
      var step = isResult ? null : steps[state.index];

      var screen = document.createElement('div');
      screen.className = 'rf-screen';
      screen.setAttribute('tabindex', '-1');

      if (isResult) {
        track('step_view', { step: 'result' });
        screen.innerHTML = renderResult();
      } else {
        track('step_view', { step: step.id });
        if (step.type === 'welcome') screen.innerHTML = renderWelcome(step);
        else if (step.type === 'email') screen.innerHTML = renderEmail(step);
        else screen.innerHTML = renderQuestion(step);
      }

      stage.innerHTML = '';
      stage.appendChild(screen);

      if (layout.animate) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            screen.classList.add('is-in');
          });
        });
      } else {
        screen.classList.add('is-in');
      }

      updateChrome(step, isResult);

      var emailInput = screen.querySelector('[data-rf-email]');
      if (emailInput) {
        window.setTimeout(
          function () {
            emailInput.focus();
          },
          layout.animate ? 350 : 0
        );
      } else if (state.history.length) {
        /* Keyboard and screen-reader users need to land on the new screen. */
        screen.focus();
      }
    }

    function go(index) {
      var current = stage.querySelector('.rf-screen');
      if (current && layout.animate) {
        current.classList.remove('is-in');
        current.classList.add('is-out');
        window.setTimeout(function () {
          state.index = index;
          render();
        }, 220);
      } else {
        state.index = index;
        render();
      }
    }

    function updateChrome(step, isResult) {
      var total =
        layout.progressMode === 'fixed'
          ? num(layout.progressExpected, 8)
          : engine.visibleQuestionCount();
      if (total < 1) total = 1;

      if (progressFill) {
        progressFill.style.width =
          (isResult ? 100 : Math.min(95, Math.round((state.answered / total) * 100))) + '%';
      }

      if (backBtn) {
        backBtn.style.visibility = state.history.length && !isResult ? 'visible' : 'hidden';
      }

      if (counter) {
        counter.textContent =
          !isResult && step && step.type === 'question' && layout.showCounter
            ? interpolate(layout.counterTemplate, {
                n: Math.min(state.answered + 1, total),
                total: total
              })
            : '';
      }
    }

    /* ---------------------------------------------------- integrations */

    function persistProfile(model) {
      if (!integrations.storageEnabled || !integrations.storageKey) return;
      try {
        window.localStorage.setItem(
          integrations.storageKey,
          JSON.stringify(
            Object.assign({ v: 2, ts: Date.now() }, engine.answerSnapshot(), engine.derivedFields(), {
              size: model.sizeKey,
              targetTension: model.match.target,
              match: model.match.primary ? model.match.primary.key : null,
              runnerUp: model.match.runner ? model.match.runner.key : null,
              email: state.email || null
            })
          )
        );
      } catch (err) {
        /* private browsing or quota — the quiz still works without it */
      }
    }

    /* Fires once per completion for every finisher, with or without an email.
       Deliberately carries no PII: email is recorded as a boolean only. */
    function sendStats(model) {
      if (!integrations.statsEnabled || !integrations.statsWebhookUrl) return;
      if (statsSent) return;
      statsSent = true;

      var payload = Object.assign({}, engine.exportSnapshot(), {
        ts: new Date().toISOString(),
        quiz_version: integrations.quizVersion || '',
        size: model.sizeKey,
        size_helped: engine.rawSizeAnswer() === config.sizeHelpValue,
        target_tension: model.match.target,
        matched_product: model.match.primary
          ? model.match.primary.short || model.match.primary.name
          : null,
        runner_up: model.match.runner ? model.match.runner.short || model.match.runner.name : null,
        email_captured: !!state.email
      });

      var body = JSON.stringify(payload);
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            integrations.statsWebhookUrl,
            new Blob([body], { type: 'application/json' })
          );
        } else {
          window
            .fetch(integrations.statsWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: body,
              keepalive: true
            })
            ['catch'](function () {});
        }
      } catch (err) {
        /* never let analytics break the result screen */
      }
    }

    function quizProperties() {
      var match = engine.computeMatch();
      return Object.assign({}, engine.exportSnapshot(), engine.derivedFields(), {
        quiz_source: integrations.klaviyoSource || '',
        quiz_completed_at: new Date().toISOString(),
        recommended_size: engine.recommendSize(),
        recommended_mattress: match.primary ? match.primary.name : null,
        runner_up_mattress: match.runner ? match.runner.name : null,
        target_tension: match.target
      });
    }

    /* Retries on transport failure or a 5xx, with a fixed backoff.
       4xx responses are not retried — they mean the request itself is wrong. */
    function postWithRetry(url, options, attemptsLeft, delay) {
      return window
        .fetch(url, options)
        .then(function (response) {
          if (response && response.status >= 500) throw new Error('klaviyo ' + response.status);
          return response;
        })
        ['catch'](function (err) {
          if (attemptsLeft <= 1) return;
          return new Promise(function (resolve) {
            window.setTimeout(resolve, delay);
          }).then(function () {
            return postWithRetry(url, options, attemptsLeft - 1, delay);
          });
        });
    }

    function sendToKlaviyo(email) {
      if (!integrations.klaviyoEnabled) return;
      if (!integrations.klaviyoSiteId || !integrations.klaviyoListId) return;

      var props = quizProperties();

      var options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', revision: '2024-10-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: integrations.klaviyoSource || 'Mattress Finder Quiz',
              profile: {
                data: { type: 'profile', attributes: { email: email, properties: props } }
              }
            },
            relationships: { list: { data: { type: 'list', id: integrations.klaviyoListId } } }
          }
        })
      };

      /* A lost email capture is a lost lead, so unlike the stats beacon this
         call retries. It is never awaited — a Klaviyo outage must not stop a
         shopper seeing their match. */
      postWithRetry(
        'https://a.klaviyo.com/client/subscriptions/?company_id=' +
          encodeURIComponent(integrations.klaviyoSiteId),
        options,
        Math.max(1, num(integrations.klaviyoRetries, 3)),
        num(integrations.klaviyoRetryDelay, 1500)
      );

      try {
        var klaviyo = window.klaviyo || window._learnq;
        if (klaviyo && integrations.klaviyoEventName) {
          klaviyo.push(['identify', Object.assign({ $email: email }, props)]);
          klaviyo.push(['track', integrations.klaviyoEventName, props]);
        }
      } catch (err) {
        /* onsite object not loaded — the subscription call above still ran */
      }
    }

    function submitEmail() {
      var step = steps[state.index];
      var input = stage.querySelector('[data-rf-email]');
      var errorEl = stage.querySelector('[data-rf-email-error]');
      if (!input) return;

      var value = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        if (errorEl) errorEl.textContent = step.errorText || '';
        input.focus();
        return;
      }

      if (errorEl) errorEl.textContent = '';
      state.email = value;
      track('email_captured', {});
      sendToKlaviyo(value);
      go(engine.advance(state.index, null));
    }

    /* --------------------------------------------------------- events */

    root.addEventListener('click', function (event) {
      var optionEl = event.target.closest ? event.target.closest('.rf-opt') : null;
      if (optionEl && stage.contains(optionEl)) {
        var step = steps[state.index];
        if (!step) return;

        var value = optionEl.getAttribute('data-rf-value');
        engine.setAnswer(step, value);
        track('answer', { step: step.id, value: value });
        optionEl.classList.add('is-picked');

        var chosen = engine.chosenOption(step);
        var from = state.index;
        window.setTimeout(
          function () {
            go(engine.advance(from, chosen));
          },
          layout.animate ? 260 : 0
        );
        return;
      }

      var trigger = event.target.closest ? event.target.closest('[data-rf-action]') : null;
      if (!trigger) return;

      var action = trigger.getAttribute('data-rf-action');

      if (action === 'next') {
        go(engine.advance(state.index, null));
      } else if (action === 'skip-email') {
        state.email = null;
        track('email_skipped', {});
        go(engine.advance(state.index, null));
      } else if (action === 'submit-email') {
        submitEmail();
      } else if (action === 'restart') {
        /* statsSent is deliberately NOT reset: the stats store takes one
           anonymous row per page load, so retaking in the same session must
           not double-count it. */
        go(engine.reset());
      } else if (action === 'copy-code') {
        var code = integrations.discountCode || '';
        if (navigator.clipboard && code) {
          navigator.clipboard.writeText(code).then(function () {
            trigger.textContent = integrations.copiedLabel || 'Copied!';
            window.setTimeout(function () {
              trigger.textContent = integrations.copyLabel || 'Copy';
            }, 1600);
          });
        }
      }
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        go(engine.back());
      });
    }

    if (layout.keyboard) {
      root.addEventListener('keydown', function (event) {
        var step = steps[state.index];
        if (!step) return;

        if (event.key === 'Enter') {
          if (step.type === 'welcome') {
            go(engine.advance(state.index, null));
          } else if (
            step.type === 'email' &&
            document.activeElement === stage.querySelector('[data-rf-email]')
          ) {
            submitEmail();
          }
          return;
        }

        if (step.type !== 'question') return;
        var index = KEY_LETTERS.indexOf(String(event.key).toUpperCase());
        if (index > -1) {
          var buttons = stage.querySelectorAll('.rf-opt');
          if (buttons[index]) buttons[index].click();
        }
      });
    }

    render();
  }

  function init() {
    var roots = document.querySelectorAll('[data-rf-root]');
    for (var i = 0; i < roots.length; i++) {
      if (roots[i].getAttribute('data-rf-ready') === 'true') continue;
      roots[i].setAttribute('data-rf-ready', 'true');
      MattressFinder(roots[i]);
    }
  }

  function autoInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    /* The theme editor re-renders the section on every setting change. */
    document.addEventListener('shopify:section:load', init);
  }

  return {
    createEngine: createEngine,
    evalCondition: evalCondition,
    interpolate: interpolate,
    init: init,
    autoInit: autoInit
  };
});
