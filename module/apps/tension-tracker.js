import { emitUpdateTension } from "../socket.js";

export class TensionTracker extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "don-tension-tracker",
      title: game.i18n.localize("DON.TensionTrackTitle"),
      template: "systems/dead-of-night/templates/apps/tension-tracker.hbs",
      classes: ["dead-of-night", "tension-tracker-app"],
      width: 280,
      height: "auto",
      resizable: false,
      minimizable: true,
      popOut: true
    });
  }

  getData() {
    const tension = game.settings.get("dead-of-night", "tensionTrack") ?? 1;
    const isGM = game.user.isGM;
    return {
      tension,
      isGM,
      tensionPercent: Math.min(100, (tension / 20) * 100)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".tension-btn-plus").click(async (e) => {
      e.preventDefault();
      await emitUpdateTension(1);
      this.render(false);
    });

    html.find(".tension-btn-minus").click(async (e) => {
      e.preventDefault();
      await emitUpdateTension(-1);
      this.render(false);
    });

    html.find(".tension-btn-reset").click(async (e) => {
      e.preventDefault();
      if (game.user.isGM) {
        await game.settings.set("dead-of-night", "tensionTrack", 1);
        this.render(false);
      }
    });
  }
}
