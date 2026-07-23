export class DeadOfNightRoll {
  /**
   * Execute an attribute or specialisation roll
   * @param {Object} options
   * @param {DeadOfNightActor} options.actor
   * @param {string} options.attributeKey
   * @param {DeadOfNightItem} [options.item]
   */
  static async roll({ actor, attributeKey, item = null }) {
    if (!actor) return;

    let attributeValue = 0;
    let attributeLabel = "";
    let specialisationBonus = 0;
    let rollTitle = "";

    if (item && item.type === "specialisation") {
      const pairKey = item.system?.attributePair || "identify_obscure";
      const attrs = actor.system.attributes || {};

      let valA = attrs.identify ?? 5;
      let valB = attrs.obscure ?? 5;
      let pairLabelKey = "DON.IdentifyObscure";

      if (pairKey === "persuade_dissuade") {
        valA = attrs.persuade ?? 5;
        valB = attrs.dissuade ?? 5;
        pairLabelKey = "DON.PersuadeDissuade";
      } else if (pairKey === "pursue_escape") {
        valA = attrs.pursue ?? 5;
        valB = attrs.escape ?? 5;
        pairLabelKey = "DON.PursueEscape";
      } else if (pairKey === "assault_protect") {
        valA = attrs.assault ?? 5;
        valB = attrs.protect ?? 5;
        pairLabelKey = "DON.AssaultProtect";
      }

      const maxPair = Math.max(valA, valB);
      const bonus = item.system?.bonus ?? 2;
      const derivedRating = Math.min(10, maxPair + bonus);

      attributeValue = derivedRating;
      attributeLabel = game.i18n.localize(pairLabelKey);
      rollTitle = `${item.name} (${attributeLabel})`;
    } else if (attributeKey) {
      const capKey = attributeKey.charAt(0).toUpperCase() + attributeKey.slice(1);
      const effKey = `effective${capKey}`;
      attributeValue = actor.system.attributes?.[effKey] ?? actor.system.attributes?.[attributeKey] ?? 0;
      attributeLabel = game.i18n.localize(`DON.${capKey}`);
      rollTitle = attributeLabel;
    }

    const totalModifier = attributeValue + specialisationBonus;

    // Determine Target Number (TN)
    const useTensionAsTN = game.settings.get("dead-of-night", "useTensionAsTN") ?? false;
    const currentTension = game.settings.get("dead-of-night", "tensionTrack") ?? 1;
    const targetNumber = useTensionAsTN ? currentTension : 15;

    // Create 2d10 roll formula
    const rollFormula = `2d10 + ${totalModifier}`;
    const roll = new Roll(rollFormula);
    await roll.evaluate();

    const isSuccess = roll.total >= targetNumber;
    const diceResults = roll.terms?.find(t => t.results)?.results?.map(r => r.result) ?? roll.dice[0]?.results?.map(r => r.result) ?? [];

    const cardData = {
      actor,
      attributeKey,
      attributeLabel: rollTitle || attributeLabel,
      attributeValue,
      item,
      specialisationBonus,
      totalModifier,
      targetNumber,
      rollTotal: roll.total,
      diceResults,
      isSuccess,
      canSpendSP: (actor.system.survivalPoints?.value ?? 0) > 0
    };

    // Render HTML card
    const html = await renderTemplate("systems/dead-of-night/templates/chat/roll-card.hbs", cardData);

    const messageStyle = CONST.CHAT_MESSAGE_STYLES?.ROLL ?? CONST.CHAT_MESSAGE_TYPES?.ROLL ?? 5;

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      style: messageStyle,
      type: messageStyle,
      rolls: [roll],
      roll: roll,
      content: html,
      flags: {
        "dead-of-night": {
          actorId: actor.id,
          attributeKey,
          itemId: item?.id
        }
      }
    };

    return ChatMessage.create(chatData);
  }

  /**
   * Handle Reroll click event on chat card
   * @param {Event} event
   */
  static async handleReroll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const card = button.closest(".don-chat-card");
    const messageId = card.closest(".chat-message")?.dataset?.messageId;
    const message = game.messages.get(messageId);

    if (!message) return;

    const flags = message.flags["dead-of-night"];
    if (!flags) return;

    const actor = game.actors.get(flags.actorId);
    if (!actor) {
      ui.notifications.error("Actor not found!");
      return;
    }

    if (!actor.isOwner) {
      ui.notifications.warn("You do not have permission to control this actor!");
      return;
    }

    // Spend 1 SP and update Tension
    const success = await actor.spendSurvivalPoint();
    if (success) {
      // Execute the reroll
      const item = flags.itemId ? actor.items.get(flags.itemId) : null;
      await DeadOfNightRoll.roll({
        actor,
        attributeKey: flags.attributeKey,
        item
      });
    }
  }
}
