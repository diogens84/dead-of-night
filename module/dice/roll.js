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

    const attributeValue = actor.system.attributes?.[attributeKey] ?? 0;
    const specialisationBonus = item?.system?.bonus ?? 0;
    const totalModifier = attributeValue + specialisationBonus;

    // Determine Target Number (TN)
    const useTensionAsTN = game.settings.get("dead-of-night", "useTensionAsTN") ?? false;
    const currentTension = game.settings.get("dead-of-night", "tensionTrack") ?? 1;
    const targetNumber = useTensionAsTN ? currentTension : 15;

    // Create 2d10 roll formula
    const rollFormula = `2d10 + ${totalModifier}`;
    const roll = new Roll(rollFormula);
    await roll.evaluate({ async: true });

    const isSuccess = roll.total >= targetNumber;

    // Prepare template data
    const attributeLabel = game.i18n.localize(`DON.${attributeKey.charAt(0).toUpperCase() + attributeKey.slice(1)}`);
    const cardData = {
      actor,
      attributeKey,
      attributeLabel,
      attributeValue,
      item,
      specialisationBonus,
      totalModifier,
      targetNumber,
      rollTotal: roll.total,
      diceResults: roll.dice[0]?.results?.map(r => r.result) ?? [],
      isSuccess,
      canSpendSP: (actor.system.survivalPoints?.value ?? 0) > 0
    };

    // Render HTML card
    const html = await renderTemplate("systems/dead-of-night/templates/chat/roll-card.hbs", cardData);

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll,
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
