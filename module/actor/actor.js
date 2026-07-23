import { emitUpdateTension } from "../socket.js";

export class DeadOfNightActor extends Actor {
  _parseAttrValue(val) {
    if (val === null || val === undefined) return 5;
    if (typeof val === "object" && val !== null) {
      return this._parseAttrValue(val.value);
    }
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? 5 : Math.max(0, Math.min(10, parsed));
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const systemData = this.system;

    if (this.type === "character") {
      const attrs = systemData.attributes || {};

      // Parse base values strictly (A + B = 10)
      const baseIdentify = this._parseAttrValue(attrs.identify);
      const baseObscure = 10 - baseIdentify;

      const basePersuade = this._parseAttrValue(attrs.persuade);
      const baseDissuade = 10 - basePersuade;

      const basePursue = this._parseAttrValue(attrs.pursue);
      const baseEscape = 10 - basePursue;

      const baseAssault = this._parseAttrValue(attrs.assault);
      const baseProtect = 10 - baseAssault;

      // Calculate penalties from all active specialisation items
      const penalties = {
        identify: 0, obscure: 0,
        persuade: 0, dissuade: 0,
        pursue: 0, escape: 0,
        assault: 0, protect: 0
      };

      if (this.items) {
        for (const item of this.items) {
          if (item.type === "specialisation") {
            const pairKey = item.system?.attributePair || "identify_obscure";
            const mode = item.system?.reductionMode || "both";

            let keyA = "identify", keyB = "obscure";
            if (pairKey === "persuade_dissuade") { keyA = "persuade"; keyB = "dissuade"; }
            else if (pairKey === "pursue_escape") { keyA = "pursue"; keyB = "escape"; }
            else if (pairKey === "assault_protect") { keyA = "assault"; keyB = "protect"; }

            if (mode === "attrA") {
              penalties[keyA] += 2;
            } else if (mode === "attrB") {
              penalties[keyB] += 2;
            } else { // "both"
              penalties[keyA] += 1;
              penalties[keyB] += 1;
            }
          }
        }
      }

      // Compute Effective Attribute Values (Base minus Penalty)
      attrs.effectiveIdentify = Math.max(0, baseIdentify - penalties.identify);
      attrs.effectiveObscure = Math.max(0, baseObscure - penalties.obscure);

      attrs.effectivePersuade = Math.max(0, basePersuade - penalties.persuade);
      attrs.effectiveDissuade = Math.max(0, baseDissuade - penalties.dissuade);

      attrs.effectivePursue = Math.max(0, basePursue - penalties.pursue);
      attrs.effectiveEscape = Math.max(0, baseEscape - penalties.escape);

      attrs.effectiveAssault = Math.max(0, baseAssault - penalties.assault);
      attrs.effectiveProtect = Math.max(0, baseProtect - penalties.protect);

      // Store base values back
      attrs.identify = baseIdentify;
      attrs.obscure = baseObscure;
      attrs.persuade = basePersuade;
      attrs.dissuade = baseDissuade;
      attrs.pursue = basePursue;
      attrs.escape = baseEscape;
      attrs.assault = baseAssault;
      attrs.protect = baseProtect;
      attrs.penalties = penalties;

      // Compute Specialisation Rating: Max(Base Pair Attributes) + 2 (Max 10)
      if (this.items) {
        for (const item of this.items) {
          if (item.type === "specialisation") {
            const pairKey = item.system?.attributePair || "identify_obscure";
            let valA = baseIdentify, valB = baseObscure;
            
            if (pairKey === "persuade_dissuade") {
              valA = basePersuade;
              valB = baseDissuade;
            } else if (pairKey === "pursue_escape") {
              valA = basePursue;
              valB = baseEscape;
            } else if (pairKey === "assault_protect") {
              valA = baseAssault;
              valB = baseProtect;
            }

            const maxPair = Math.max(valA, valB);
            const bonus = item.system?.bonus ?? 2;
            item.derivedRating = Math.min(10, maxPair + bonus);
          }
        }
      }

      // Clamp Survival Points between 0 and max (5)
      if (systemData.survivalPoints) {
        const maxSP = systemData.survivalPoints.max ?? 5;
        systemData.survivalPoints.value = Math.clamped(systemData.survivalPoints.value ?? 5, 0, maxSP);
      }
    }
  }

  /**
   * Deduct 1 Survival Point and increment Global Tension Track
   * @returns {Promise<boolean>} True if SP was spent successfully
   */
  async spendSurvivalPoint() {
    const currentSP = this.system.survivalPoints?.value ?? 0;
    if (currentSP <= 0) {
      ui.notifications.warn(game.i18n.localize("DON.NoSPRemaining"));
      return false;
    }

    // Deduct 1 SP
    await this.update({ "system.survivalPoints.value": currentSP - 1 });

    // Emit socket or update tension setting
    await emitUpdateTension(1);

    const tension = game.settings.get("dead-of-night", "tensionTrack");
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `<div class="don-chat-sp-spent">
        <i class="fas fa-ghost"></i> <strong>${this.name}</strong> ${game.i18n.localize("DON.SPSpentChatNotice")} <strong>${tension}</strong>!
      </div>`
    });

    return true;
  }
}
