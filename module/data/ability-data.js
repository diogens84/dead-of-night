export class MonstrousAbilityData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      cost: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      description: new fields.HTMLField({ required: false, initial: "" })
    };
  }
}
