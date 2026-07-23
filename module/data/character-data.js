export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      concept: new fields.StringField({ required: false, initial: "" }),
      badHabits: new fields.StringField({ required: false, initial: "" }),
      attributes: new fields.SchemaField({
        identify: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        obscure: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        persuade: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        dissuade: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        pursue: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        escape: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        assault: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        protect: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 10 }),
        effectiveIdentify: new fields.NumberField({ required: false, integer: true }),
        effectiveObscure: new fields.NumberField({ required: false, integer: true }),
        effectivePersuade: new fields.NumberField({ required: false, integer: true }),
        effectiveDissuade: new fields.NumberField({ required: false, integer: true }),
        effectivePursue: new fields.NumberField({ required: false, integer: true }),
        effectiveEscape: new fields.NumberField({ required: false, integer: true }),
        effectiveAssault: new fields.NumberField({ required: false, integer: true }),
        effectiveProtect: new fields.NumberField({ required: false, integer: true }),
        penalties: new fields.SchemaField({
          identify: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          obscure: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          persuade: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          dissuade: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          pursue: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          escape: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          assault: new fields.NumberField({ required: false, integer: true, initial: 0 }),
          protect: new fields.NumberField({ required: false, integer: true, initial: 0 })
        })
      }),
      survivalPoints: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0, max: 5 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 5, min: 1 })
      }),
      cliches: new fields.HTMLField({ required: false, initial: "" }),
      biography: new fields.HTMLField({ required: false, initial: "" })
    };
  }
}
