

export abstract class ValueObjects<T>{
  protected readonly _value: T;

  constructor(value: T) {
    this._value = Object.freeze(value);
  }

  get value(): T {
    return this._value;
  }
  equals(vo?: ValueObjects<T> | null): boolean {
    if (vo === null || vo === undefined) return false;
    if(this.constructor !== vo.constructor) return false;
    return JSON.stringify(this._value) === JSON.stringify(vo._value);
  }



}