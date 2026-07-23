export class DeadOfNightSpecialisationSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dead-of-night", "sheet", "item", "specialisation-sheet"],
      template: "systems/dead-of-night/templates/item/specialisation-sheet.hbs",
      width: 480,
      height: 420,
      submitOnChange: true,
      closeOnSubmit: false
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.system = this.item.system;
    context.descriptionHTML = await TextEditor.enrichHTML(this.item.system.description || "", {
      async: true,
      relativeTo: this.item
    });
    return context;
  }

  /** @override */
  async _updateObject(event, formData) {
    await super._updateObject(event, formData);
    if (this.item.actor) {
      this.item.actor.prepareData();
      this.item.actor.sheet.render(false);
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
