// @flow

import { always } from 'rambdax'

import makeDecorator from 'utils/common/makeDecorator'
import tryCatch from 'utils/fp/tryCatch'

import { type ColumnName } from 'Schema'

import { ensureDecoratorUsedProperly } from 'decorators/common'

// Defines a model property that's (de)serialized to and from JSON using custom sanitizer function.
//
// Pass the database column name as first argument, and sanitizer function as second.
//
// Stored value will be parsed to JSON if possible, and passed to sanitizer as argument, or
// undefined will be passed on parsing error. Field value will be result of sanitizer call.
//
// Value assigned to field will be passed to sanitizer and its results will be stored as stringified
// value.
//
// Examples:
//   @json('contact_info', jsonValue => jasonValue || {}) contactInfo: ContactInfo

const parseJSON = tryCatch(JSON.parse, always(undefined))

export const jsonDecorator = makeDecorator(
  (rawFieldName: ColumnName, sanitizer: any => any) => (
    target: Object,
    key: string,
    descriptor: Object,
  ) => {
    ensureDecoratorUsedProperly(rawFieldName, target, key, descriptor)

    return {
      configurable: true,
      enumerable: true,
      get(): any {
        const rawValue = this._getRaw(rawFieldName)
        const parsedValue = parseJSON(rawValue)

        return sanitizer(parsedValue)
      },
      set(json: any): void {
        const sanitizedValue = sanitizer(json)
        const stringifiedValue = sanitizedValue != null ? JSON.stringify(sanitizedValue) : null

        this._setRaw(rawFieldName, stringifiedValue)
      },
    }
  },
)

export default jsonDecorator
