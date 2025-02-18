/*
|--------------------------------------------------------------------------
| Iodine - JavaScript Library
|--------------------------------------------------------------------------
|
| This library contains a collection of useful validation rules that can
| be used to quickly verify whether items meet certain conditions.
|
*/
export class Iodine {
  /**
   * Constructor.
   *
   */
  constructor() {
    this.locale = undefined;

    this.messages = this._defaultMessages();

    this.defaultFieldName = 'Value';
  }

  /**
   * @internal.
   *
   */
  _dateCompare(first, second, type, equals = false) {
    if (!this.isDate(first)) return false;

    if (!this.isDate(second) && !this.isInteger(second)) return false;

    second = typeof second === 'number' ? second : second.getTime();

    if (type === 'less' && equals) return first.getTime() <= second;
    if (type === 'less' && !equals) return first.getTime() < second;
    if (type === 'more' && equals) return first.getTime() >= second;
    if (type === 'more' && !equals) return first.getTime() > second;
  }

  /**
   * @internal.
   *
   */
  _defaultMessages() {
    return {
      after         : `The date must be after: '[PARAM]'`,
      afterOrEqual  : `The date must be after or equal to: '[PARAM]'`,
      array         : `[FIELD] must be an array`,
      before        : `The date must be before: '[PARAM]'`,
      beforeOrEqual : `The date must be before or equal to: '[PARAM]'`,
      boolean       : `[FIELD] must be true or false`,
      date          : `[FIELD] must be a date`,
      different     : `[FIELD] must be different to '[PARAM]'`,
      endingWith    : `[FIELD] must end with '[PARAM]'`,
      email         : `[FIELD] must be a valid email address`,
      falsy         : `[FIELD] must be a falsy value (false, 'false', 0 or '0')`,
      in            : `[FIELD] must be one of the following options: [PARAM]`,
      integer       : `[FIELD] must be an integer`,
      json          : `[FIELD] must be a parsable JSON object string`,
      max           : `[FIELD] must be less than or equal to [PARAM]`,
      min           : `[FIELD] must be greater than or equal to [PARAM]`,
      maxLength     : `[FIELD] must not be greater than '[PARAM]' in character length`,
      minLength     : `[FIELD] must not be less than '[PARAM]' character length`,
      notIn         : `[FIELD] must not be one of the following options: [PARAM]`,
      numeric       : `[FIELD] must be numeric`,
      optional      : `[FIELD] is optional`,
      regexMatch    : `[FIELD] must satisify the regular expression: [PARAM]`,
      required      : `[FIELD] must be present`,
      same          : `[FIELD] must be '[PARAM]'`,
      startingWith  : `[FIELD] must start with '[PARAM]'`,
      string        : `[FIELD] must be a string`,
      truthy        : `[FIELD] must be a truthy value (true, 'true', 1 or '1')`,
      url           : `[FIELD] must be a valid url`,
      uuid          : `[FIELD] must be a valid UUID`,
    };
  }

  /**
   * @internal.
   *
   */
  _prepare(value, rules = []) {
    if (!rules.length) return [];

    if (rules[0] === 'optional' && this.isOptional(value)) return [];

    return rules.filter(rule => rule !== 'optional')
                .map(rule => [rule, this._titleCase(rule.split(':').shift()), rule.split(':').slice(1)]);
  }

  /**
   * @internal.
   *
   */
  _titleCase(value) {
    return `${value[0].toUpperCase()}${value.slice(1)}`;
  }

  /**
   * Attach a custom validation rule to the library.
   *
   */
  addRule(name, closure) {
    Iodine.prototype[`is${this._titleCase(name)}`] = closure;
  }

  /**
   * Determine whether the given value meets the given synchronous or asynchronous rules.
   *
   */
  async asyncIs(value, rules = []) {
    for (let index in rules = this._prepare(value, rules)) {
      if (!await this[`is${rules[index][1]}`].apply(this, [value, rules[index][2].join(':')])) {
        return await rules[index][0];
      }
    }

    return true;
  }

  /**
   * Determine whether the given value meets the given rules.
   *
   */
  async asyncIsValid(value, rules = []) {
    return await this.asyncIs(value, rules) === true;
  }

  /**
   * Retrieve an error message for the given rule.
   *
   */
  getErrorMessage(rule, args = undefined) {
    let { param, field } = typeof args === 'object' ? args : { param: args, field: undefined };

    const chunks = rule.split(':');

    let key = chunks.shift();

    param = param || chunks.join(':');

    if (['after', 'afterOrEqual', 'before', 'beforeOrEqual'].includes(key)) {
      param = new Date(parseInt(param)).toLocaleTimeString(this.locale, {
        year   : 'numeric',
        month  : 'short',
        day    : 'numeric',
        hour   : '2-digit',
        minute : 'numeric',
        hour12 : false,
      });
    }

    let message = [null, undefined, ''].includes(param)
      ? this.messages[key]
      : this.messages[key].replace('[PARAM]', param);

    return [null, undefined, ''].includes(field)
      ? message.replace('[FIELD]', this.defaultFieldName)
      : message.replace('[FIELD]', field);
  }

  /**
   * Determine if the given date is after another given date.
   *
   */
  isAfter(value, after) {
    return this._dateCompare(value, after, 'more', false);
  }

  /**
   * Determine if the given date is after or equal to another given date.
   *
   */
  isAfterOrEqual(value, after) {
    return this._dateCompare(value, after, 'more', true);
  }

  /**
   * Determine if the given value is an array.
   *
   */
  isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Determine if the given date is before another given date.
   *
   */
  isBefore(value, before) {
    return this._dateCompare(value, before, 'less', false);
  }

  /**
   * Determine if the given date is before or equal to another given date.
   *
   */
  isBeforeOrEqual(value, before) {
    return this._dateCompare(value, before, 'less', true);
  }

  /**
   * Determine if the given value is a boolean.
   *
   */
  isBoolean(value) {
    return [true, false].includes(value);
  }

  /**
   * Determine if the given value is a date object.
   *
   */
  isDate(value) {
    return (value && Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value));
  }

  /**
   * Determine if the given value is different to another given value.
   *
   */
  isDifferent(value, different) {
    return value != different;
  }

  /**
   * Determine if the given value ends with another given value.
   *
   */
  isEndingWith(value, sub) {
    return this.isString(value) && value.endsWith(sub);
  }

  /**
   * Determine if the given value is a valid email address.
   *
   */
  isEmail(value) {
    return new RegExp("^\\S+@\\S+[\\.][0-9a-z]+$").test(String(value).toLowerCase());
  }

  /**
   * Determine if the given value is falsy.
   *
   */
  isFalsy(value) {
    return [0, '0', false, 'false'].includes(value);
  }

  /**
   * Determine if the given value is within the given array of options.
   *
   */
  isIn(value, options) {
    return (typeof options === 'string' ? options.split(',') : options).includes(value);
  }

  /**
   * Determine if the given value is an integer.
   *
   */
  isInteger(value) {
    return Number.isInteger(value) && parseInt(value).toString() === value.toString();
  }

  /**
   * Determine if the given value is a JSON string.
   *
   */
  isJson(value) {
    try {
      return typeof JSON.parse(value) === 'object';
    } catch (e) {
      return false;
    }
  }

  /**
   * Determine if the given number is less than or equal to the maximum limit.
   *
   */
  isMax(value, limit) {
    return parseFloat(value) <= limit;
  }

  /**
   * Determine if the given number is greater than or equal to the minimum limit.
   *
   */
  isMin(value, limit) {
    return parseFloat(value) >= limit;
  }

  /**
   * Determine if the given value string length is less than or equal to the maximum limit.
   *
   */
  isMaxLength(value, limit) {
    return typeof value === 'string' ? value.length <= limit : false;
  }

  /**
   * Determine if the given value string length is greater than or equal to the minimum limit.
   *
   */
  isMinLength(value, limit) {
    return typeof value === 'string' ? value.length >= limit : false;
  }

  /**
   * Determine if the given value is not within the given array of options.
   *
   */
  isNotIn(value, options) {
    return !this.isIn(value, options);
  }

  /**
   * Determine if the given value is numeric (an integer or a float).
   *
   */
  isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Determine if the given value is optional.
   *
   */
  isOptional(value) {
    return [null, undefined, ''].includes(value);
  }

  /**
   * Determine if the given value satisifies the given regular expression.
   *
   */
  isRegexMatch(value, expression) {
    return new RegExp(expression).test(String(value));
  }

  /**
   * Determine if the given value is present.
   *
   */
  isRequired(value) {
    return !this.isOptional(value);
  }

  /**
   * Determine if the given value is the same as another given value.
   *
   */
  isSame(value, same) {
    return value == same;
  }

  /**
   * Determine if the given value starts with another given value.
   *
   */
  isStartingWith(value, sub) {
    return this.isString(value) && value.startsWith(sub);
  }

  /**
   * Determine if the given value is a string.
   *
   */
  isString(value) {
    return typeof value === 'string';
  }

  /**
   * Determine if the given value is truthy.
   *
   */
  isTruthy(value) {
    return [1, '1', true, 'true'].includes(value);
  }

  /**
   * Determine if the given value is a valid URL.
   *
   */
  isUrl(value) {
    let regex = "^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$";

    return new RegExp(regex).test(String(value).toLowerCase());
  }

  /**
   * Determine if the given value is a valid UUID.
   *
   */
  isUuid(value) {
    let regex = "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";

    return new RegExp(regex).test(String(value).toLowerCase());
  }

  /**
   * Determine whether the given value meets the given rules.
   *
   */
  is(value, rules = []) {
    for (let index in rules = this._prepare(value, rules)) {
      if (!this[`is${rules[index][1]}`].apply(this, [value, rules[index][2].join(':')])) {
        return rules[index][0];
      }
    }

    return true;
  }

  /**
   * Determine whether the given value meets the given rules.
   *
   */
  isValid(value, rules = []) {
    return this.is(value, rules) === true;
  }

  /**
   * Determine whether the given dictionary of values meets the given schema.
   *
   */
  isValidSchema(values = {}, schema = {}) {
    const keys = Object.keys(schema);

    if(keys.length === 0) return true;

    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if(!values.hasOwnProperty(key)) return false;

        const value = values[key];
        const rules = schema[key];

        if (!this.isValid(value, rules)) return false;
    }

    return true;
  }

  /**
   * Replace the default error messages with a new set.
   *
   */
  setErrorMessages(messages) {
    this.messages = messages;
  }

  /**
   * Add or replace an error message.
   *
   */
  setErrorMessage(key, message) {
    this.messages[key] = message;
  }

  /**
   * Replace the default locale with a new value.
   *
   */
  setLocale(locale) {
    this.locale = locale;
  }

  /**
   * Replace the default field name with a new value.
   *
   */
  setDefaultFieldName(fieldName) {
    this.defaultFieldName = fieldName;
  }
}

/**
 * Create an instance of the library.
 *
 */
if(typeof window !== 'undefined') {
  window.Iodine = new Iodine();
}
