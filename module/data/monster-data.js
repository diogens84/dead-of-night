export class MonsterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attributes: new fields.SchemaField({
        identify: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        obscure: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        persuade: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        dissuade: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        pursue: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        escape: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        assault: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        protect: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 })
      }),
      survivalPoints: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 5, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 10, min: 1 })
      }),
      vulnerabilities: new fields.HTMLField({ required: false, initial: "" }),
      biography: new fields.HTMLField({ required: false, initial: "" })
    };
  }
}
