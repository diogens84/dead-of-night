export function registerSocketListeners() {
  game.socket.on("system.dead-of-night", async (data) => {
    if (!game.user.isGM) return;

    if (data.action === "updateTension") {
      const current = game.settings.get("dead-of-night", "tensionTrack") ?? 1;
      const newTension = Math.max(1, current + (data.delta ?? 1));
      await game.settings.set("dead-of-night", "tensionTrack", newTension);
      
      // Render/update tension tracker applications across clients
      ui.windows && Object.values(ui.windows).forEach(w => {
        if (w.constructor.name === "TensionTracker") w.render(false);
      });
    }
  });
}

export async function emitUpdateTension(delta = 1) {
  if (game.user.isGM) {
    const current = game.settings.get("dead-of-night", "tensionTrack") ?? 1;
    const newTension = Math.max(1, current + delta);
    await game.settings.set("dead-of-night", "tensionTrack", newTension);

    // Refresh active tension tracker windows
    Object.values(ui.windows).forEach(w => {
      if (w.constructor.name === "TensionTracker") w.render(false);
    });
  } else {
    game.socket.emit("system.dead-of-night", {
      action: "updateTension",
      delta
    });
  }
}
