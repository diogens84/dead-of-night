import { DeadOfNightRoll } from "../dice/roll.js";

export class DeadOfNightCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dead-of-night", "sheet", "actor", "character-sheet"],
      template: "systems/dead-of-night/templates/actor/character-sheet.hbs",
      width: 680,
      height: 780,
      resizable: true
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.system = context.actor.system;
    const attrs = context.system.attributes || {};
    const penalties = attrs.penalties || {};

    // Map attribute pairs showing effective values (after specialisation reductions)
    context.attributePairs = [
      {
        pairKey: "identify_obscure",
        keyA: "identify",
        labelA: game.i18n.localize("DON.Identify"),
        valA: attrs.effectiveIdentify ?? attrs.identify ?? 5,
        baseValA: attrs.identify ?? 5,
        penA: penalties.identify ?? 0,
        keyB: "obscure",
        labelB: game.i18n.localize("DON.Obscure"),
        valB: attrs.effectiveObscure ?? attrs.obscure ?? 5,
        baseValB: attrs.obscure ?? 5,
        penB: penalties.obscure ?? 0
      },
      {
        pairKey: "persuade_dissuade",
        keyA: "persuade",
        labelA: game.i18n.localize("DON.Persuade"),
        valA: attrs.effectivePersuade ?? attrs.persuade ?? 5,
        baseValA: attrs.persuade ?? 5,
        penA: penalties.persuade ?? 0,
        keyB: "dissuade",
        labelB: game.i18n.localize("DON.Dissuade"),
        valB: attrs.effectiveDissuade ?? attrs.dissuade ?? 5,
        baseValB: attrs.dissuade ?? 5,
        penB: penalties.dissuade ?? 0
      },
      {
        pairKey: "pursue_escape",
        keyA: "pursue",
        labelA: game.i18n.localize("DON.Pursue"),
        valA: attrs.effectivePursue ?? attrs.pursue ?? 5,
        baseValA: attrs.pursue ?? 5,
        penA: penalties.pursue ?? 0,
        keyB: "escape",
        labelB: game.i18n.localize("DON.Escape"),
        valB: attrs.effectiveEscape ?? attrs.escape ?? 5,
        baseValB: attrs.escape ?? 5,
        penB: penalties.escape ?? 0
      },
      {
        pairKey: "assault_protect",
        keyA: "assault",
        labelA: game.i18n.localize("DON.Assault"),
        valA: attrs.effectiveAssault ?? attrs.assault ?? 5,
        baseValA: attrs.assault ?? 5,
        penA: penalties.assault ?? 0,
        keyB: "protect",
        labelB: game.i18n.localize("DON.Protect"),
        valB: attrs.effectiveProtect ?? attrs.protect ?? 5,
        baseValB: attrs.protect ?? 5,
        penB: penalties.protect ?? 0
      }
    ];

    // Filter and format specialisations: Rating = Max(Base Pair Attributes) + 2
    const itemsList = context.items || [];
    context.specialisations = itemsList
      .filter(i => (i.type || i.document?.type) === "specialisation")
      .map(i => {
        const itemObj = typeof i.toObject === "function" ? i.toObject(false) : foundry.utils.deepClone(i);
        const itemId = i.id || i._id || itemObj._id || itemObj.id;
        itemObj._id = itemId;
        itemObj.id = itemId;

        const systemData = i.system || itemObj.system || {};
        const pairKey = systemData.attributePair || "identify_obscure";
        let valA = attrs.identify ?? 5;
        let valB = attrs.obscure ?? 5;

        if (pairKey === "persuade_dissuade") {
          valA = attrs.persuade ?? 5;
          valB = attrs.dissuade ?? 5;
        } else if (pairKey === "pursue_escape") {
          valA = attrs.pursue ?? 5;
          valB = attrs.escape ?? 5;
        } else if (pairKey === "assault_protect") {
          valA = attrs.assault ?? 5;
          valB = attrs.protect ?? 5;
        }

        const maxPair = Math.max(valA, valB);
        const bonus = systemData.bonus ?? 2;
        const rating = Math.min(10, maxPair + bonus);

        itemObj.derivedRating = rating;
        itemObj.pairLabel = game.i18n.localize(this._getPairLocalizationKey(pairKey));
        return itemObj;
      });

    return context;
  }

  _getPairLocalizationKey(pairKey) {
    switch (pairKey) {
      case "identify_obscure": return "DON.IdentifyObscure";
      case "persuade_dissuade": return "DON.PersuadeDissuade";
      case "pursue_escape": return "DON.PursueEscape";
      case "assault_protect": return "DON.AssaultProtect";
      default: return "DON.IdentifyObscure";
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    const $html = $(html);

    if (!this.isEditable) return;

    // Synchronized Dual-Slider Input logic (A + B = 10)
    $html.find(".attr-slider").on("input", (e) => {
      const slider = e.currentTarget;
      const keyA = slider.dataset.keyA;
      const keyB = slider.dataset.keyB;
      const penA = parseInt(slider.dataset.penA, 10) || 0;
      const penB = parseInt(slider.dataset.penB, 10) || 0;

      const baseA = Math.max(0, Math.min(10, parseInt(slider.value, 10) || 0));
      const baseB = 10 - baseA;

      const effA = Math.max(0, baseA - penA);
      const effB = Math.max(0, baseB - penB);

      // Update UI displays in real time
      $html.find(`.attr-val[data-key="${keyA}"]`).text(effA);
      $html.find(`.attr-val[data-key="${keyB}"]`).text(effB);
    });

    // Roll Attribute
    $html.find(".roll-attribute").click(async (e) => {
      e.preventDefault();
      const attributeKey = e.currentTarget.dataset.attribute;
      await DeadOfNightRoll.roll({
        actor: this.actor,
        attributeKey
      });
    });

    // Roll Specialisation
    $html.find(".roll-specialisation").click(async (e) => {
      e.preventDefault();
      const itemElement = e.currentTarget.closest(".item");
      const itemId = itemElement?.dataset?.itemId;
      const item = this.actor.items.get(itemId);
      if (!item) return;
      
      await DeadOfNightRoll.roll({
        actor: this.actor,
        item
      });
    });

    // Spend Survival Point
    $html.find(".spend-sp-btn").click(async (e) => {
      e.preventDefault();
      await this.actor.spendSurvivalPoint();
    });

    // Item Management Event Listeners
    $html.find(".item-create").click(this._onItemCreate.bind(this));
    $html.find(".item-edit").click(this._onItemEdit.bind(this));
    $html.find(".item-delete").click(this._onItemDelete.bind(this));
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type || "specialisation";
    const defaultName = type === "specialisation" 
      ? (game.i18n.localize("DON.NewSpecialisation") || "Nueva Especialización")
      : (game.i18n.localize("DON.NewAbility") || "Nueva Habilidad");

    const itemData = {
      name: defaultName,
      type: type,
      img: "icons/svg/item-bag.svg",
      system: {
        attributePair: "identify_obscure",
        reductionMode: "both"
      }
    };
    
    const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    if (created && created.length > 0) {
      const createdId = created[0].id || created[0]._id;
      const item = this.actor.items.get(createdId) || created[0];
      if (item && item.sheet) {
        item.sheet.render(true, { focus: true });
        setTimeout(() => {
          const liveItem = this.actor.items.get(createdId);
          if (liveItem && liveItem.sheet) liveItem.sheet.render(true, { focus: true });
        }, 100);
      }
    }
  }

  _onItemEdit(event) {
    event.preventDefault();
    const itemElement = event.currentTarget.closest(".item");
    const itemId = itemElement?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      item.sheet.render(true);
    }
  }

  async _onItemDelete(event) {
    event.preventDefault();
    const itemElement = event.currentTarget.closest(".item");
    const itemId = itemElement?.dataset?.itemId;
    if (itemId) {
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }
  }
}
