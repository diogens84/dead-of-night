export class DeadOfNightAbilitySheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dead-of-night", "sheet", "item", "ability-sheet"],
      template: "systems/dead-of-night/templates/item/ability-sheet.hbs",
      width: 480,
      height: 340,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  getData() {
    const context = super.getData();
    context.system = context.item.system;
    return context;
  }
}
