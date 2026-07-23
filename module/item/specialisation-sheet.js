export class DeadOfNightSpecialisationSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dead-of-night", "sheet", "item", "specialisation-sheet"],
      template: "systems/dead-of-night/templates/item/specialisation-sheet.hbs",
      width: 480,
      height: 380
    });
  }

  getData() {
    const context = super.getData();
    context.system = context.item.system;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Auto-save on select/input change and refresh actor sheet immediately
    html.find("select, input").on("change", async (e) => {
      await this._onSubmit(e);
      if (this.item.actor) {
        this.item.actor.prepareData();
        this.item.actor.sheet.render(false);
      }
    });
  }
}
