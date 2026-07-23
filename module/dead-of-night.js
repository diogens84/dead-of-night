import { CharacterData } from "./data/character-data.js";
import { MonsterData } from "./data/monster-data.js";
import { SpecialisationData } from "./data/specialisation-data.js";
import { MonstrousAbilityData } from "./data/ability-data.js";

import { DeadOfNightActor } from "./actor/actor.js";
import { DeadOfNightCharacterSheet } from "./actor/character-sheet.js";
import { DeadOfNightMonsterSheet } from "./actor/monster-sheet.js";

import { DeadOfNightItem } from "./item/item.js";
import { DeadOfNightSpecialisationSheet } from "./item/specialisation-sheet.js";
import { DeadOfNightAbilitySheet } from "./item/ability-sheet.js";

import { TensionTracker } from "./apps/tension-tracker.js";
import { DeadOfNightRoll } from "./dice/roll.js";
import { registerSocketListeners } from "./socket.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once("init", async function () {
  console.log("Dead of Night | Initializing Dead of Night System");

  // Record Configuration Values
  CONFIG.Actor.documentClass = DeadOfNightActor;
  CONFIG.Item.documentClass = DeadOfNightItem;

  // Register Data Models
  CONFIG.Actor.dataModels = {
    character: CharacterData,
    monster: MonsterData
  };

  CONFIG.Item.dataModels = {
    specialisation: SpecialisationData,
    monstrous_ability: MonstrousAbilityData
  };

  // Register Settings
  game.settings.register("dead-of-night", "tensionTrack", {
    name: "DON.Settings.TensionTrackName",
    hint: "DON.Settings.TensionTrackHint",
    scope: "world",
    config: true,
    type: Number,
    default: 1,
    onChange: value => {
      Object.values(ui.windows).forEach(w => {
        if (w.constructor.name === "TensionTracker") w.render(false);
      });
    }
  });

  game.settings.register("dead-of-night", "useTensionAsTN", {
    name: "DON.Settings.UseTensionAsTNName",
    hint: "DON.Settings.UseTensionAsTNHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Register Actor & Item Sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("dead-of-night", DeadOfNightCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "DON.ActorTypeCharacter"
  });
  Actors.registerSheet("dead-of-night", DeadOfNightMonsterSheet, {
    types: ["monster"],
    makeDefault: true,
    label: "DON.ActorTypeMonster"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("dead-of-night", DeadOfNightSpecialisationSheet, {
    types: ["specialisation"],
    makeDefault: true,
    label: "DON.Specialisations"
  });
  Items.registerSheet("dead-of-night", DeadOfNightAbilitySheet, {
    types: ["monstrous_ability"],
    makeDefault: true,
    label: "DON.MonstrousAbilities"
  });

  // Preload Handlebars Templates
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Preload Handlebars Templates                */
/* -------------------------------------------- */
async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/dead-of-night/templates/actor/character-sheet.hbs",
    "systems/dead-of-night/templates/actor/monster-sheet.hbs",
    "systems/dead-of-night/templates/item/specialisation-sheet.hbs",
    "systems/dead-of-night/templates/item/ability-sheet.hbs",
    "systems/dead-of-night/templates/apps/tension-tracker.hbs",
    "systems/dead-of-night/templates/chat/roll-card.hbs"
  ];
  return loadTemplates(templatePaths);
}

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once("ready", function () {
  registerSocketListeners();

  // Global chat click handler for rerolls
  $(document).on("click", ".don-chat-card .sp-reroll-btn", DeadOfNightRoll.handleReroll);

  // Auto-open Tension Tracker window
  if (!ui.tensionTracker) {
    ui.tensionTracker = new TensionTracker().render(true);
  }
});

/* -------------------------------------------- */
/*  Scene Controls Hook                         */
/* -------------------------------------------- */
Hooks.on("getSceneControlButtons", (controls) => {
  const tokenControls = controls.find(c => c.name === "token");
  if (tokenControls) {
    tokenControls.tools.push({
      name: "tension-tracker",
      title: "DON.TensionTrackTitle",
      icon: "fas fa-skull",
      visible: true,
      onClick: () => {
        if (ui.tensionTracker?._rendered) {
          ui.tensionTracker.close();
        } else {
          ui.tensionTracker = new TensionTracker().render(true);
        }
      },
      button: true
    });
  }
});
