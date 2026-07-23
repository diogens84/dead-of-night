import { DeadOfNightRoll } from "../dice/roll.js";

export class DeadOfNightMonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dead-of-night", "sheet", "actor", "monster-sheet"],
      template: "systems/dead-of-night/templates/actor/monster-sheet.hbs",
      width: 650,
      height: 650,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.system = context.actor.system;

    context.abilities = context.items.filter(i => i.type === "monstrous_ability");
    context.specialisations = context.items.filter(i => i.type === "specialisation");

    context.attributesList = [
      { key: "identify", label: game.i18n.localize("DON.Identify"), val: context.system.attributes?.identify ?? 5 },
      { key: "obscure", label: game.i18n.localize("DON.Obscure"), val: context.system.attributes?.obscure ?? 5 },
      { key: "persuade", label: game.i18n.localize("DON.Persuade"), val: context.system.attributes?.persuade ?? 5 },
      { key: "dissuade", label: game.i18n.localize("DON.Dissuade"), val: context.system.attributes?.dissuade ?? 5 },
      { key: "pursue", label: game.i18n.localize("DON.Pursue"), val: context.system.attributes?.pursue ?? 5 },
      { key: "escape", label: game.i18n.localize("DON.Escape"), val: context.system.attributes?.escape ?? 5 },
      { key: "assault", label: game.i18n.localize("DON.Assault"), val: context.system.attributes?.assault ?? 5 },
      { key: "protect", label: game.i18n.localize("DON.Protect"), val: context.system.attributes?.protect ?? 5 }
    ];

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    const $html = $(html);

    if (!this.isEditable) return;

    // Roll Attribute
    $html.find(".roll-attribute").click(async (e) => {
      e.preventDefault();
      const attributeKey = e.currentTarget.dataset.attribute;
      await DeadOfNightRoll.roll({
        actor: this.actor,
        attributeKey
      });
    });

    // Item creation
    $html.find(".ability-create").click(async (e) => {
      e.preventDefault();
      const itemData = {
        name: game.i18n.localize("DON.AddMonstrousAbility"),
        type: "monstrous_ability",
        system: { cost: 0, description: "" }
      };
      await this.actor.createEmbeddedDocuments("Item", [itemData]);
    });

    $html.find(".item-edit").click((e) => {
      const itemId = e.currentTarget.closest(".item").dataset.itemId;
      const item = this.actor.items.get(itemId);
      item?.sheet?.render(true);
    });

    $html.find(".item-delete").click(async (e) => {
      const itemId = e.currentTarget.closest(".item").dataset.itemId;
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });
  }
}
