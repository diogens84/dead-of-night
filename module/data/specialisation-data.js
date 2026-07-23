export class SpecialisationData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attributePair: new fields.StringField({
        required: true,
        initial: "identify_obscure",
        choices: ["identify_obscure", "persuade_dissuade", "pursue_escape", "assault_protect"]
      }),
      reductionMode: new fields.StringField({
        required: true,
        initial: "both",
        choices: ["attrA", "attrB", "both"]
      }),
      bonus: new fields.NumberField({ required: true, integer: true, initial: 2 }),
      description: new fields.HTMLField({ required: false, initial: "" })
    };
  }
}
