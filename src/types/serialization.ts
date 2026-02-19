type DateFieldKey = `${string}At` | "banExpires";

type DeserializeDateValue<Value, Key> = Key extends DateFieldKey
  ? Value extends string
    ? Date
    : Value extends string | null
      ? Date | null
      : Value
  : Value;

export type SerializeDates<T> = T extends Date
  ? string
  : T extends readonly (infer Item)[]
    ? SerializeDates<Item>[]
    : T extends object
      ? {
          [Key in keyof T]: SerializeDates<T[Key]>;
        }
      : T;

export type DeserializeDates<T> = T extends Date
  ? Date
  : T extends readonly (infer Item)[]
    ? DeserializeDates<Item>[]
    : T extends object
      ? {
          [Key in keyof T]: T[Key] extends readonly (infer Child)[]
            ? DeserializeDates<Child>[]
            : T[Key] extends object
              ? DeserializeDates<T[Key]>
              : DeserializeDateValue<T[Key], Key>;
        }
      : T;
