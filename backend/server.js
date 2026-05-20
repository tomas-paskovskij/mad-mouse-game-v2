const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const cors = require("cors");
const cardsData = require("./data/cards.json");

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://admin.socket.io"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
instrument(io, { auth: false, mode: "development" });

let rooms = [];
const games = {};
const HAND_LIMIT = 10;
const WIN_CONDITION = 10;
const STARTING_CARDS = 3;
const REACTION_MS = 5000;

const handlePlayerExit = (socketId, roomId = null) => {
  rooms.forEach((room) => {
    if (roomId && room.id !== roomId) return;
    const idx = room.players.findIndex((p) => p.id === socketId);
    if (idx !== -1) {
      const leaving = room.players[idx];
      room.players.splice(idx, 1);
      if (room.players.length > 0) {
        if (room.host === leaving.username)
          room.host = room.players[0].username;
        io.to(room.id).emit("room_data_update", room);
      } else rooms = rooms.filter((r) => r.id !== room.id);
    }
  });
  io.emit("update_rooms", rooms);
};

function emitRoomUpdate(roomId) {
  const room = rooms.find((r) => r.id === roomId);
  if (room) io.to(roomId).emit("room_data_update", room);
  io.emit("update_rooms", rooms);
}

function createDeck() {
  let deck = [];
  cardsData.forEach((card) => {
    const copies = card.count || 4;
    for (let i = 0; i < copies; i++)
      deck.push({
        ...card,
        instanceId: `${card.id}-${Math.random().toString(36).substr(2, 5)}`,
      });
  });
  return deck.sort(() => Math.random() - 0.5);
}

function makeEntry(card, ownerUsername) {
  return { ...card, ownerUsername: ownerUsername || "?" };
}

function broadcastGameState(roomId) {
  const game = games[roomId];
  if (!game) return;
  const current = game.players[game.currentTurnIndex];
  game.players.forEach((player) => {
    const sock = io.sockets.sockets.get(player.id);
    if (!sock) return;
    const isBlind = (player.curses || []).some(
      (c) => c.effect === "curse_blind",
    );
    sock.emit("game_state_update", {
      myCards: isBlind
        ? player.cards.map((c) => ({ ...c, hidden: true }))
        : player.cards,
      opponents: game.players.map((p) => ({
        id: p.id,
        username: p.username,
        cardCount: p.cards.length,
        curses: p.curses || [],
        isConnected: p.isConnected !== false,
        madMousePending: p.madMousePending || false,
      })),
      currentTurnPlayerId: current ? current.id : null,
      deckCount: game.deck.length,
      discardPile: game.discardPile,
      tableCards: game.tableCards || [],
      winner: game.winner || null,
      pendingAction: game.pendingAction || null,
      turnNumber: game.turnNumber || 0,
      handLimit: HAND_LIMIT,
      phase: game.phase || "playing",
      actionUsed: game.actionUsed || false,
      madMousePlayerId: game.madMousePlayerId || null,
      reactionActive: !!game.reactionWindow,
      reactionCard: game.reactionWindow?.card || null,
      reactionInitiatorId: game.reactionWindow?.initiatorId || null,
    });
  });
}

function processCurses(roomId, playerId) {
  const game = games[roomId];
  if (!game) return;
  const player = game.players.find((p) => p.id === playerId);
  if (!player || !player.curses) return;
  player.curses = player.curses.filter((curse) => {
    if (curse.effect === "curse_give_left") {
      const idx = game.players.findIndex((p) => p.id === playerId);
      const li = (idx - 1 + game.players.length) % game.players.length;
      if (player.cards.length > 0) {
        const card = player.cards.splice(
          Math.floor(Math.random() * player.cards.length),
          1,
        )[0];
        game.players[li].cards.push(card);
        io.to(roomId).emit("game_notification", {
          message: `💀 ${player.username} atiduoda kortą ${game.players[li].username}!`,
          type: "curse",
        });
      }
    }
    curse.turnsLeft--;
    if (curse.turnsLeft <= 0)
      game.tableCards = (game.tableCards || []).filter(
        (tc) => !(tc.ownerId === playerId && tc.card.effect === curse.effect),
      );
    return curse.turnsLeft > 0;
  });
}

function processTimeBombs(roomId) {
  const game = games[roomId];
  if (!game) return;
  game.tableCards = (game.tableCards || []).filter((tc) => {
    if (tc.card.effect === "trap_time_bomb") {
      tc.turnsLeft = (tc.turnsLeft || 2) - 1;
      if (tc.turnsLeft <= 0) {
        game.players.forEach((p) => {
          if (p.cards.length > 0)
            game.discardPile.push(
              makeEntry(
                p.cards.splice(
                  Math.floor(Math.random() * p.cards.length),
                  1,
                )[0],
                p.username,
              ),
            );
        });
        io.to(roomId).emit("game_notification", {
          message: "💥 Laiko bomba sprogo! Visi praranda kortą!",
          type: "trap",
        });
        io.to(roomId).emit("effect_boom");
        return false;
      }
    }
    return true;
  });
}

function checkMadMouseWin(roomId, currentPlayerId) {
  const game = games[roomId];
  if (
    !game ||
    !game.madMousePlayerId ||
    game.madMousePlayerId !== currentPlayerId
  )
    return false;
  const p = game.players.find((pl) => pl.id === currentPlayerId);
  if (!p) return false;
  if (p.cards.length >= WIN_CONDITION) {
    game.winner = p.username;
    game.phase = "ended";
    p.madMousePending = false;
    io.to(roomId).emit("game_over", { winner: p.username });
    broadcastGameState(roomId);
    return true;
  } else {
    game.madMousePlayerId = null;
    game.madMouseRoundEnd = null;
    p.madMousePending = false;
    io.to(roomId).emit("game_notification", {
      message: `❌ ${p.username} nebeturi 10 kortų!`,
      type: "skip",
    });
    broadcastGameState(roomId);
    return false;
  }
}

function checkMadMouseAfter(roomId) {
  const game = games[roomId];
  if (!game || !game.madMousePlayerId) return;
  const p = game.players.find((pl) => pl.id === game.madMousePlayerId);
  if (p && p.cards.length < WIN_CONDITION) {
    p.madMousePending = false;
    game.madMousePlayerId = null;
    game.madMouseRoundEnd = null;
    io.to(roomId).emit("game_notification", {
      message: `❌ ${p.username} nebeturi 10 kortų!`,
      type: "skip",
    });
  }
}

function nextTurn(roomId) {
  const game = games[roomId];
  if (!game || game.winner) return;
  processTimeBombs(roomId);
  let attempts = 0;
  do {
    game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
    attempts++;
  } while (
    game.players[game.currentTurnIndex].isConnected === false &&
    attempts < game.players.length
  );
  game.turnNumber = (game.turnNumber || 0) + 1;
  game.actionUsed = false;
  const current = game.players[game.currentTurnIndex];
  processCurses(roomId, current.id);
  if (checkMadMouseWin(roomId, current.id)) return;
  if (current.skippedTurns > 0) {
    current.skippedTurns--;
    io.to(roomId).emit("game_notification", {
      message: `⏭ ${current.username} praleidžia ėjimą!`,
      type: "skip",
    });
    nextTurn(roomId);
    return;
  }
  io.to(roomId).emit("turn_chain_clear");
  io.to(roomId).emit("game_notification", {
    message: `${current.username} ėjimas`,
    type: "turn",
    playerId: current.id,
  });
  broadcastGameState(roomId);
}

// ─── REACTION WINDOW ────────────────────────────────────────────────────────────
function startReactionWindow(
  roomId,
  initiatorId,
  card,
  targetId,
  extraData,
  skipEffect = false,
) {
  const game = games[roomId];
  if (!game || game.winner) return;
  const others = game.players.filter(
    (p) => p.id !== initiatorId && p.isConnected !== false,
  );
  const canReact = others.some(
    (p) =>
      p.cards.some((c) => c.isLightning && c.type === "response") ||
      (game.tableCards || []).some(
        (tc) => tc.ownerId === p.id && tc.card.type === "trap",
      ),
  );
  // Taip pat tikriname ar yra savo trap kortų kurias galima aktyvuoti per reakciją
  const myTraps = (game.tableCards || []).filter(
    (tc) =>
      tc.ownerId === initiatorId &&
      tc.card.type === "trap" &&
      tc.placedAtTurn !== game.turnNumber,
  );

  if (!canReact && myTraps.length === 0) {
    if (!skipEffect && card)
      executeEffect(roomId, initiatorId, card, targetId, extraData);
    setTimeout(
      () => {
        if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
      },
      skipEffect ? 600 : 900,
    );
    return;
  }

  game.reactionWindow = {
    initiatorId,
    card,
    targetId,
    extraData,
    skipEffect,
    passedPlayers: new Set(),
    totalOthers: others.length,
    timer: null,
  };
  io.to(roomId).emit("reaction_window_start", {
    initiatorId,
    card: card
      ? { title: card.title, type: card.type, effect: card.effect }
      : null,
    targetId,
    durationMs: REACTION_MS,
  });
  broadcastGameState(roomId);
  game.reactionWindow.timer = setTimeout(
    () => finishReactionWindow(roomId),
    REACTION_MS,
  );
}

function finishReactionWindow(roomId) {
  const game = games[roomId];
  if (!game || !game.reactionWindow) return;
  const { initiatorId, card, targetId, extraData, skipEffect, timer } =
    game.reactionWindow;
  if (timer) clearTimeout(timer);
  game.reactionWindow = null;
  io.to(roomId).emit("reaction_window_end");
  if (!skipEffect && card)
    executeEffect(roomId, initiatorId, card, targetId, extraData);
  if (!game.winner)
    setTimeout(() => {
      if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
    }, 700);
}

// ─── EFEKTAI ────────────────────────────────────────────────────────────────────
function checkTraps(roomId, triggerType, initiatorId, targetId) {
  const game = games[roomId];
  if (!game) return false;
  const target = targetId ? game.players.find((p) => p.id === targetId) : null;
  if (!target) return false;
  const trap = (game.tableCards || []).find(
    (tc) =>
      tc.ownerId === targetId &&
      tc.card.trigger === triggerType &&
      tc.placedAtTurn !== game.turnNumber,
  );
  if (!trap) return false;
  game.tableCards = game.tableCards.filter((tc) => tc !== trap);
  const initiator = game.players.find((p) => p.id === initiatorId);
  switch (trap.card.effect) {
    case "trap_steal_punish": {
      const lost = initiator.cards.splice(
        0,
        Math.min(2, initiator.cards.length),
      );
      lost.forEach((c) =>
        game.discardPile.push(makeEntry(c, initiator.username)),
      );
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: `🪤 Pelėkautai! ${initiator.username} praranda ${lost.length} kortas!`,
        type: "trap",
      });
      break;
    }
    case "trap_guard": {
      io.to(roomId).emit("game_notification", {
        message: `🛡 ${target.username} apsaugotas!`,
        type: "trap",
      });
      return true;
    }
    case "trap_reflect": {
      io.to(roomId).emit("game_notification", {
        message: `🔄 ${target.username} atspindi!`,
        type: "trap",
      });
      return "reflect";
    }
  }
  broadcastGameState(roomId);
  return true;
}

function executeEffect(roomId, initiatorId, card, targetId, extraData) {
  const game = games[roomId];
  if (!game) return;
  const initiator = game.players.find((p) => p.id === initiatorId);
  const target = targetId ? game.players.find((p) => p.id === targetId) : null;

  if (target && target.isShielded && card.type === "action") {
    target.isShielded = false;
    io.to(roomId).emit("game_notification", {
      message: `🛡 ${target.username} skydas!`,
      type: "shield",
    });
    broadcastGameState(roomId);
    return;
  }
  if (
    ["steal_random_card", "inspect_steal", "steal_all_one"].includes(
      card.effect,
    )
  ) {
    const trap = checkTraps(roomId, "on_steal_target", initiatorId, targetId);
    if (trap === true) {
      broadcastGameState(roomId);
      return;
    }
    if (trap === "reflect") {
      executeEffect(roomId, targetId, card, initiatorId, extraData);
      return;
    }
  }
  if (card.type === "action" && targetId) {
    const trap = checkTraps(roomId, "on_action_target", initiatorId, targetId);
    if (trap === "reflect") {
      executeEffect(roomId, targetId, card, initiatorId, extraData);
      return;
    }
  }

  function draw(player, count) {
    for (let i = 0; i < count; i++) {
      if (game.deck.length > 0 && player.cards.length < HAND_LIMIT)
        player.cards.push(game.deck.pop());
    }
  }
  function disc(card, owner) {
    game.discardPile.push(makeEntry(card, owner));
  }

  switch (card.effect) {
    case "draw_two": {
      draw(initiator, 2);
      io.to(roomId).emit("game_notification", {
        message: `${initiator.username} patraukė 2 kortas!`,
        type: "action",
      });
      break;
    }
    case "draw_three": {
      draw(initiator, 3);
      io.to(roomId).emit("game_notification", {
        message: `${initiator.username} patraukė 3 kortas!`,
        type: "action",
      });
      break;
    }
    case "shuffle_redistribute": {
      let all = [];
      game.players.forEach((p) => {
        all = all.concat(p.cards);
        p.cards = [];
      });
      all
        .sort(() => Math.random() - 0.5)
        .forEach((c, i) => game.players[i % game.players.length].cards.push(c));
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: "🌀 Chaosas!",
        type: "action",
      });
      break;
    }
    case "skip_turn": {
      if (!target) break;
      target.skippedTurns = (target.skippedTurns || 0) + 1;
      io.to(roomId).emit("game_notification", {
        message: `⏭ ${target.username} praleips ėjimą!`,
        type: "action",
      });
      break;
    }
    case "inspect_hand": {
      if (!target) break;
      const s = io.sockets.sockets.get(initiator.id);
      if (s)
        s.emit("inspect_result", {
          targetUsername: target.username,
          cards: target.cards,
        });
      io.to(roomId).emit("game_notification", {
        message: `🔍 ${initiator.username} apžiūrėjo ${target.username}!`,
        type: "action",
      });
      break;
    }
    case "force_draw_two": {
      if (!target) break;
      draw(target, 2);
      io.to(roomId).emit("game_notification", {
        message: `${target.username} traukia 2 kortas!`,
        type: "action",
      });
      break;
    }
    case "all_draw_one": {
      game.players.forEach((p) => draw(p, 1));
      io.to(roomId).emit("game_notification", {
        message: "Visi traukia po 1!",
        type: "action",
      });
      break;
    }
    case "force_discard": {
      if (!target || target.cards.length === 0) break;
      disc(
        target.cards.splice(
          Math.floor(Math.random() * target.cards.length),
          1,
        )[0],
        target.username,
      );
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: `${target.username} išmeta kortą!`,
        type: "action",
      });
      break;
    }
    case "give_card": {
      if (!target || !extraData?.cardInstanceId) break;
      const ci = initiator.cards.findIndex(
        (c) => c.instanceId === extraData.cardInstanceId,
      );
      if (ci === -1) break;
      if (target.cards.length < HAND_LIMIT) {
        target.cards.push(initiator.cards.splice(ci, 1)[0]);
        checkMadMouseAfter(roomId);
      }
      io.to(roomId).emit("game_notification", {
        message: `${initiator.username} dovanoja kortą ${target.username}!`,
        type: "action",
      });
      break;
    }
    case "return_draw_two": {
      if (!extraData?.cardInstanceId) break;
      const ci = initiator.cards.findIndex(
        (c) => c.instanceId === extraData.cardInstanceId,
      );
      if (ci !== -1) {
        game.deck.unshift(initiator.cards.splice(ci, 1)[0]);
        game.deck.sort(() => Math.random() - 0.5);
      }
      draw(initiator, 2);
      io.to(roomId).emit("game_notification", {
        message: `${initiator.username} grąžino ir patraukė 2!`,
        type: "action",
      });
      break;
    }
    case "pass_left": {
      const cs = game.players.map((p) =>
        p.cards.length > 0
          ? p.cards.splice(Math.floor(Math.random() * p.cards.length), 1)[0]
          : null,
      );
      cs.forEach((c, i) => {
        if (c) {
          const li = (i - 1 + game.players.length) % game.players.length;
          if (game.players[li].cards.length < HAND_LIMIT)
            game.players[li].cards.push(c);
          else disc(c, game.players[i].username);
        }
      });
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: "Visi perduoda kairėje!",
        type: "action",
      });
      break;
    }
    case "pass_right": {
      const cs = game.players.map((p) =>
        p.cards.length > 0
          ? p.cards.splice(Math.floor(Math.random() * p.cards.length), 1)[0]
          : null,
      );
      cs.forEach((c, i) => {
        if (c) {
          const ri = (i + 1) % game.players.length;
          if (game.players[ri].cards.length < HAND_LIMIT)
            game.players[ri].cards.push(c);
          else disc(c, game.players[i].username);
        }
      });
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: "Visi perduoda dešinėje!",
        type: "action",
      });
      break;
    }
    case "shuffle_draw": {
      game.deck.sort(() => Math.random() - 0.5);
      draw(initiator, 1);
      io.to(roomId).emit("game_notification", {
        message: `${initiator.username} sumaišė ir patraukė!`,
        type: "action",
      });
      break;
    }
    case "tax_richest": {
      const r = game.players.reduce((a, b) =>
        a.cards.length > b.cards.length ? a : b,
      );
      if (
        r.id !== initiatorId &&
        r.cards.length > 0 &&
        initiator.cards.length < HAND_LIMIT
      ) {
        initiator.cards.push(
          r.cards.splice(Math.floor(Math.random() * r.cards.length), 1)[0],
        );
        checkMadMouseAfter(roomId);
      }
      io.to(roomId).emit("game_notification", {
        message: `${initiator.username} pasiima iš ${r.username}!`,
        type: "action",
      });
      break;
    }
    case "help_poorest": {
      const po = game.players.reduce((a, b) =>
        a.cards.length < b.cards.length ? a : b,
      );
      draw(po, 2);
      io.to(roomId).emit("game_notification", {
        message: `${po.username} gauna 2!`,
        type: "action",
      });
      break;
    }
    case "amnesia": {
      if (!target) break;
      const cnt = target.cards.length;
      game.deck.push(...target.cards);
      target.cards = [];
      game.deck.sort(() => Math.random() - 0.5);
      draw(target, cnt);
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: `${target.username} užmiršta viską!`,
        type: "action",
      });
      break;
    }
    case "steal_random_card": {
      if (!target || target.cards.length === 0) break;
      if (initiator.cards.length < HAND_LIMIT) {
        initiator.cards.push(
          target.cards.splice(
            Math.floor(Math.random() * target.cards.length),
            1,
          )[0],
        );
        checkMadMouseAfter(roomId);
      }
      io.to(roomId).emit("game_notification", {
        message: `🗡 ${initiator.username} pavogė iš ${target.username}!`,
        type: "action",
      });
      break;
    }
    case "swap_hands": {
      if (!target) break;
      const tmp = initiator.cards;
      initiator.cards = target.cards;
      target.cards = tmp;
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: `🔄 ${initiator.username} ↔ ${target.username}!`,
        type: "action",
      });
      break;
    }
    case "inspect_steal": {
      if (!target) break;
      const s = io.sockets.sockets.get(initiator.id);
      if (s)
        s.emit("inspect_steal_choose", {
          targetId,
          targetUsername: target.username,
          cards: target.cards,
        });
      io.to(roomId).emit("game_notification", {
        message: `🔍 ${initiator.username} peržiūri ${target.username}!`,
        type: "action",
      });
      break;
    }
    case "mass_swap": {
      const sw = game.players.map((p) => [...p.cards]);
      game.players.forEach((p, i) => {
        p.cards = sw[(i - 1 + game.players.length) % game.players.length];
      });
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: "🔄 Didysis apsimainymas!",
        type: "action",
      });
      break;
    }
    case "steal_all_one": {
      game.players.forEach((p) => {
        if (
          p.id !== initiatorId &&
          p.cards.length > 0 &&
          initiator.cards.length < HAND_LIMIT
        ) {
          initiator.cards.push(
            p.cards.splice(Math.floor(Math.random() * p.cards.length), 1)[0],
          );
        }
      });
      checkMadMouseAfter(roomId);
      io.to(roomId).emit("game_notification", {
        message: `🦹 ${initiator.username} apvogė visus!`,
        type: "action",
      });
      break;
    }
    // Response
    case "shield": {
      initiator.isShielded = true;
      io.to(roomId).emit("game_notification", {
        message: `🛡 ${initiator.username} skydas!`,
        type: "response",
      });
      break;
    }
    case "delay_action": {
      io.to(roomId).emit("game_notification", {
        message: `⏱ Veiksmas atidėtas!`,
        type: "response",
      });
      break;
    }
    // Curse
    case "curse_skip_two": {
      if (!target) break;
      target.skippedTurns = (target.skippedTurns || 0) + 2;
      if (!game.tableCards) game.tableCards = [];
      game.tableCards.push({
        id: `tc-${Date.now()}`,
        card,
        ownerId: targetId,
        ownerName: target.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: 2,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `💀 ${target.username} praleips 2!`,
        type: "curse",
      });
      break;
    }
    case "curse_give_left": {
      if (!target) break;
      if (!target.curses) target.curses = [];
      target.curses.push({
        effect: "curse_give_left",
        turnsLeft: card.duration || 3,
      });
      if (!game.tableCards) game.tableCards = [];
      game.tableCards.push({
        id: `tc-${Date.now()}`,
        card,
        ownerId: targetId,
        ownerName: target.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: card.duration || 3,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `💀 ${target.username} prakeiktas!`,
        type: "curse",
      });
      break;
    }
    case "curse_blind": {
      if (!target) break;
      if (!target.curses) target.curses = [];
      target.curses.push({
        effect: "curse_blind",
        turnsLeft: card.duration || 2,
      });
      if (!game.tableCards) game.tableCards = [];
      game.tableCards.push({
        id: `tc-${Date.now()}`,
        card,
        ownerId: targetId,
        ownerName: target.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: card.duration || 2,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `👁 ${target.username} apakęs!`,
        type: "curse",
      });
      break;
    }
    case "curse_bad_draw": {
      if (!target) break;
      if (!target.curses) target.curses = [];
      target.curses.push({
        effect: "curse_bad_draw",
        turnsLeft: card.duration || 2,
      });
      if (!game.tableCards) game.tableCards = [];
      game.tableCards.push({
        id: `tc-${Date.now()}`,
        card,
        ownerId: targetId,
        ownerName: target.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: card.duration || 2,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `💀 ${target.username} kortos išmetamos!`,
        type: "curse",
      });
      break;
    }
    case "curse_overload": {
      if (!target) break;
      draw(target, 3);
      io.to(roomId).emit("game_notification", {
        message: `💀 ${target.username} traukia 3!`,
        type: "curse",
      });
      break;
    }
    // Trap — dedi ant stalo, placedAtTurn saugo kada padėta
    case "trap_steal_punish":
    case "trap_reflect":
    case "trap_guard":
    case "trap_mimic": {
      if (!game.tableCards) game.tableCards = [];
      const tc2 = game.tableCards.filter(
        (tc) => tc.ownerId === initiatorId && tc.card.type === "trap",
      ).length;
      if (tc2 >= 3) {
        const s = io.sockets.sockets.get(initiatorId);
        if (s) s.emit("error_message", "Max 3 trap!");
        initiator.cards.push(card);
        break;
      }
      game.tableCards.push({
        id: `tc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        card,
        ownerId: initiatorId,
        ownerName: initiator.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: null,
        canActivate: false,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `🪤 ${initiator.username} padėjo spąstą!`,
        type: "trap",
      });
      break;
    }
    case "trap_lose_card": {
      if (!game.tableCards) game.tableCards = [];
      const tc3 = game.tableCards.filter(
        (tc) => tc.ownerId === initiatorId && tc.card.type === "trap",
      ).length;
      if (tc3 >= 3) {
        const s = io.sockets.sockets.get(initiatorId);
        if (s) s.emit("error_message", "Max 3 trap!");
        initiator.cards.push(card);
        break;
      }
      game.tableCards.push({
        id: `tc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        card,
        ownerId: initiatorId,
        ownerName: initiator.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: null,
        canActivate: true,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `🪤 ${initiator.username} padėjo spąstus!`,
        type: "trap",
      });
      break;
    }
    case "trap_time_bomb": {
      if (!game.tableCards) game.tableCards = [];
      game.tableCards.push({
        id: `tc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        card,
        ownerId: initiatorId,
        ownerName: initiator.username,
        placedAt: game.tableCards.length + 1,
        turnsLeft: 2,
        placedAtTurn: game.turnNumber,
      });
      io.to(roomId).emit("game_notification", {
        message: `💣 Laiko bomba! Po 2 ėjimų!`,
        type: "trap",
      });
      break;
    }
    default:
      console.log("Nežinomas efektas:", card.effect);
  }
  broadcastGameState(roomId);
}

// ─── SOCKET EVENTS ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Prisijungė:", socket.id);
  socket.emit("update_rooms", rooms);

  socket.on("join_game_room", (data) => {
    const { roomId, username } = data;
    socket.join(roomId);
    const game = games[roomId];
    if (game) {
      const player = game.players.find((p) => p.username === username);
      if (player) {
        player.id = socket.id;
        player.isConnected = true;
      }
      broadcastGameState(roomId);
    }
  });

  socket.on("create_room", (data) => {
    const newRoom = {
      id: Math.random().toString(36).substring(7),
      name: data.name,
      host: data.host,
      players: [
        { id: socket.id, username: data.host, cards: [], isReady: false },
      ],
      maxPlayers: parseInt(data.maxPlayers) || 4,
      password: data.password || null,
    };
    rooms.push(newRoom);
    socket.join(newRoom.id);
    socket.emit("room_created", newRoom);
    io.emit("update_rooms", rooms);
  });

  socket.on("join_room", (data) => {
    const { roomId, username, password } = data;
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return socket.emit("error_message", "Room not found!");
    if (room.password && room.password !== password)
      return socket.emit("error_message", "Incorrect password!");
    const already = room.players.find((p) => p.username === username);
    if (!already) {
      if (room.players.length >= room.maxPlayers)
        return socket.emit("error_message", "Room is full!");
      room.players.push({ id: socket.id, username, cards: [], isReady: false });
    } else {
      already.id = socket.id;
    }
    socket.join(roomId);
    emitRoomUpdate(roomId);
    socket.emit("join_success", roomId);
  });

  socket.on("leave_room", (roomId) => {
    handlePlayerExit(socket.id, roomId);
    socket.leave(roomId);
  });
  socket.on("toggle_ready", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      emitRoomUpdate(roomId);
    }
  });
  socket.on("kick_player", (data) => {
    const { roomId, playerId } = data;
    const room = rooms.find((r) => r.id === roomId);
    if (
      !room ||
      room.host !== room.players.find((p) => p.id === socket.id)?.username
    )
      return;
    const kicked = io.sockets.sockets.get(playerId);
    room.players = room.players.filter((p) => p.id !== playerId);
    if (kicked) {
      kicked.leave(roomId);
      kicked.emit("kicked_from_room");
    }
    emitRoomUpdate(roomId);
  });
  socket.on("update_room_settings", (data) => {
    const { roomId, newName, newMaxPlayers } = data;
    const room = rooms.find((r) => r.id === roomId);
    if (
      room &&
      room.host === room.players.find((p) => p.id === socket.id)?.username
    ) {
      room.name = newName;
      room.maxPlayers = parseInt(newMaxPlayers) || room.maxPlayers;
      emitRoomUpdate(roomId);
    }
  });

  socket.on("start_game", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (
      !room ||
      room.host !== room.players.find((p) => p.id === socket.id)?.username
    )
      return;
    const deck = createDeck();
    const gamePlayers = room.players.map((p) => ({
      id: p.id,
      username: p.username,
      cards: [],
      skippedTurns: 0,
      isShielded: false,
      curses: [],
      traps: [],
      isConnected: true,
      mulliganUsed: false,
      madMousePending: false,
    }));
    games[roomId] = {
      players: gamePlayers,
      deck,
      discardPile: [],
      tableCards: [],
      currentTurnIndex: 0,
      pendingAction: null,
      winner: null,
      turnNumber: 0,
      phase: "playing",
      actionUsed: false,
      madMousePlayerId: null,
      madMouseRoundEnd: null,
      reactionWindow: null,
    };
    gamePlayers.forEach((player) => {
      for (let i = 0; i < STARTING_CARDS; i++) {
        if (games[roomId].deck.length > 0)
          player.cards.push(games[roomId].deck.pop());
      }
      const s = io.sockets.sockets.get(player.id);
      if (s) s.emit("starting_cards", player.cards);
    });
    io.to(roomId).emit("game_started", { firstPlayerId: gamePlayers[0].id });
    broadcastGameState(roomId);
    io.to(roomId).emit("game_notification", {
      message: `🐭 Žaidimas prasidėjo! Kiekvienas gauna ${STARTING_CARDS} kortas.`,
      type: "turn",
      playerId: gamePlayers[0].id,
    });
  });

  socket.on("mulligan", (roomId) => {
    const game = games[roomId];
    if (!game || game.turnNumber > 0) return;
    const player = game.players.find((p) => p.id === socket.id);
    if (!player || player.mulliganUsed)
      return socket.emit("error_message", "Mulligan jau panaudotas!");
    game.deck.push(...player.cards);
    player.cards = [];
    game.deck.sort(() => Math.random() - 0.5);
    player.mulliganUsed = true;
    for (let i = 0; i < STARTING_CARDS; i++) {
      if (game.deck.length > 0) player.cards.push(game.deck.pop());
    }
    socket.emit("starting_cards", player.cards);
    io.to(roomId).emit("game_notification", {
      message: `${player.username} panaudojo Mulligan!`,
      type: "action",
    });
    broadcastGameState(roomId);
  });

  socket.on("declare_mad_mouse", (roomId) => {
    const game = games[roomId];
    if (!game || game.winner) return;
    const player = game.players.find((p) => p.id === socket.id);
    if (!player) return;
    if (player.cards.length < WIN_CONDITION)
      return socket.emit("error_message", `Dar neturi ${WIN_CONDITION} kortų!`);
    if (game.madMousePlayerId)
      return socket.emit("error_message", "Kitas jau paskelbė!");
    player.madMousePending = true;
    game.madMousePlayerId = socket.id;
    game.madMouseRoundEnd =
      game.turnNumber +
      game.players.filter((p) => p.isConnected !== false).length;
    io.to(roomId).emit("game_notification", {
      message: `🐭 ${player.username} paskelbė MAD MOUSE!`,
      type: "mad_mouse",
    });
    broadcastGameState(roomId);
  });

  socket.on("play_card", (data) => {
    const { roomId, cardInstanceId, targetId, extraData } = data;
    const game = games[roomId];
    if (!game || game.winner) return;
    const player = game.players.find((p) => p.id === socket.id);
    if (!player) return;
    const cardIdx = player.cards.findIndex(
      (c) => c.instanceId === cardInstanceId,
    );
    if (cardIdx === -1) return;
    const card = player.cards[cardIdx];
    const isMyTurn = game.players[game.currentTurnIndex].id === socket.id;

    // Response — veikia bet kada (2 punktas pataisytas)
    if (card.isLightning && card.type === "response") {
      player.cards.splice(cardIdx, 1);
      game.discardPile.push(makeEntry(card, player.username));

      if (card.effect === "cancel_action") {
        if (game.reactionWindow) {
          const rw = game.reactionWindow;
          if (rw.timer) clearTimeout(rw.timer);
          game.reactionWindow = null;
          io.to(roomId).emit("reaction_window_end");
          io.to(roomId).emit("game_notification", {
            message: `🚫 ${player.username} atšaukė veiksmą!`,
            type: "response",
          });
          broadcastGameState(roomId);
          return;
        }
        if (game.pendingAction) {
          game.pendingAction = null;
          io.to(roomId).emit("game_notification", {
            message: `🚫 ${player.username} atšaukė!`,
            type: "response",
          });
          broadcastGameState(roomId);
          return;
        }
        return;
      }
      if (card.effect === "reflect_action") {
        if (game.reactionWindow) {
          const rw = game.reactionWindow;
          if (rw.timer) clearTimeout(rw.timer);
          game.reactionWindow = null;
          io.to(roomId).emit("reaction_window_end");
          io.to(roomId).emit("game_notification", {
            message: `↩️ ${player.username} atspindi!`,
            type: "response",
          });
          if (rw.card)
            executeEffect(
              roomId,
              rw.targetId || socket.id,
              rw.card,
              rw.initiatorId,
              null,
            );
          setTimeout(() => {
            if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
          }, 700);
          return;
        }
        if (game.pendingAction) {
          const orig = game.pendingAction;
          game.pendingAction = null;
          executeEffect(
            roomId,
            orig.targetId || socket.id,
            orig.card,
            orig.initiatorId,
            null,
          );
          return;
        }
        return;
      }
      if (card.effect === "shield") {
        executeEffect(roomId, socket.id, card, null, null);
        return;
      }
      if (card.effect === "delay_action") {
        if (game.reactionWindow) {
          const rw = game.reactionWindow;
          if (rw.timer) clearTimeout(rw.timer);
          game.reactionWindow = null;
          io.to(roomId).emit("reaction_window_end");
          io.to(roomId).emit("game_notification", {
            message: `⏱ Veiksmas atidėtas!`,
            type: "response",
          });
          broadcastGameState(roomId);
          return;
        }
        return;
      }
      return;
    }

    if (!isMyTurn) return socket.emit("error_message", "Ne tavo ėjimas!");
    if (game.actionUsed)
      return socket.emit("error_message", "Jau panaudojai veiksmą!");

    if (extraData?.discard) {
      player.cards.splice(cardIdx, 1);
      game.discardPile.push(makeEntry(card, player.username));
      game.actionUsed = true;
      io.to(roomId).emit("game_notification", {
        message: `${player.username} išmetė kortą.`,
        type: "action",
      });
      broadcastGameState(roomId);
      setTimeout(() => {
        if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
      }, 700);
      return;
    }

    player.cards.splice(cardIdx, 1);
    if (card.type !== "trap")
      game.discardPile.push(makeEntry(card, player.username));
    game.actionUsed = true;

    if (card.requiresTarget && !targetId) {
      game.pendingAction = { card, initiatorId: socket.id };
      io.to(roomId).emit("action_needs_target", {
        card,
        initiatorId: socket.id,
      });
      broadcastGameState(roomId);
      return;
    }

    // Pranešame visiems apie padėtą kortą
    const pName = player.username;
    io.to(roomId).emit("card_played_display", {
      card: { ...card },
      playerName: pName,
      playerId: socket.id,
    });

    // Visi veiksmai eina per reaction window
    startReactionWindow(
      roomId,
      socket.id,
      card,
      targetId || null,
      extraData || null,
    );
  });

  // Trap aktyvavimas — TIKTAI ne tą ėjimą kada padėjai (3 punktas)
  socket.on("activate_trap", (data) => {
    const { roomId, tableCardId, targetId } = data;
    const game = games[roomId];
    if (!game || game.winner) return;
    if (game.players[game.currentTurnIndex].id !== socket.id)
      return socket.emit("error_message", "Ne tavo ėjimas!");
    if (game.actionUsed)
      return socket.emit("error_message", "Jau panaudojai veiksmą!");
    const tc = (game.tableCards || []).find(
      (t) => t.id === tableCardId && t.ownerId === socket.id,
    );
    if (!tc) return;
    // Negalima aktyvuoti tą patį ėjimą kada padėjai (3 punktas)
    if (tc.placedAtTurn === game.turnNumber)
      return socket.emit("error_message", "Negalima aktyvuoti tą patį ėjimą!");
    game.tableCards = game.tableCards.filter((t) => t.id !== tableCardId);
    const player = game.players.find((p) => p.id === socket.id);
    if (tc.card.effect === "trap_lose_card" && targetId) {
      const target = game.players.find((p) => p.id === targetId);
      if (target && target.cards.length > 0) {
        game.discardPile.push(
          makeEntry(
            target.cards.splice(
              Math.floor(Math.random() * target.cards.length),
              1,
            )[0],
            target.username,
          ),
        );
        checkMadMouseAfter(roomId);
        io.to(roomId).emit("game_notification", {
          message: `🪤 ${player.username} aktyvavo! ${target.username} praranda kortą!`,
          type: "trap",
        });
      }
    }
    const pl = game.players.find((p) => p.id === socket.id);
    if (pl)
      io.to(roomId).emit("card_played_display", {
        card: { ...tc.card },
        playerName: pl.username,
        playerId: socket.id,
      });
    game.actionUsed = true;
    broadcastGameState(roomId);
    startReactionWindow(roomId, socket.id, null, null, null, true);
  });

  // Trap aktyvavimas per reaction window
  socket.on("activate_trap_reaction", (data) => {
    const { roomId, tableCardId, targetId } = data;
    const game = games[roomId];
    if (!game) return;
    const tc = (game.tableCards || []).find(
      (t) => t.id === tableCardId && t.ownerId === socket.id,
    );
    if (!tc || tc.placedAtTurn === game.turnNumber) return;
    const player = game.players.find((p) => p.id === socket.id);
    game.tableCards = game.tableCards.filter((t) => t.id !== tableCardId);
    if (tc.card.effect === "trap_lose_card" && targetId) {
      const target = game.players.find((p) => p.id === targetId);
      if (target && target.cards.length > 0) {
        game.discardPile.push(
          makeEntry(
            target.cards.splice(
              Math.floor(Math.random() * target.cards.length),
              1,
            )[0],
            target.username,
          ),
        );
        checkMadMouseAfter(roomId);
      }
      io.to(roomId).emit("game_notification", {
        message: `🪤 ${player.username} aktyvavo spąstus!`,
        type: "trap",
      });
    } else if (tc.card.effect === "trap_steal_punish" && game.reactionWindow) {
      const initiator = game.players.find(
        (p) => p.id === game.reactionWindow.initiatorId,
      );
      if (initiator) {
        const lost = initiator.cards.splice(
          0,
          Math.min(2, initiator.cards.length),
        );
        lost.forEach((c) =>
          game.discardPile.push(makeEntry(c, initiator.username)),
        );
        checkMadMouseAfter(roomId);
      }
      io.to(roomId).emit("game_notification", {
        message: `🪤 Pelėkautai!`,
        type: "trap",
      });
    } else if (tc.card.effect === "trap_reflect" && game.reactionWindow) {
      const rw = game.reactionWindow;
      if (rw.timer) clearTimeout(rw.timer);
      game.reactionWindow = null;
      io.to(roomId).emit("reaction_window_end");
      io.to(roomId).emit("game_notification", {
        message: `🔄 ${player.username} atspindi!`,
        type: "trap",
      });
      if (rw.card)
        executeEffect(roomId, socket.id, rw.card, rw.initiatorId, rw.extraData);
      setTimeout(() => {
        if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
      }, 700);
      broadcastGameState(roomId);
      return;
    }
    broadcastGameState(roomId);
    if (game.reactionWindow) finishReactionWindow(roomId);
  });

  socket.on("pass_reaction", (roomId) => {
    const game = games[roomId];
    if (!game || !game.reactionWindow) return;
    game.reactionWindow.passedPlayers.add(socket.id);
    if (
      game.reactionWindow.passedPlayers.size >= game.reactionWindow.totalOthers
    )
      finishReactionWindow(roomId);
  });

  socket.on("select_target", (data) => {
    const { roomId, targetId, extraData } = data;
    const game = games[roomId];
    if (!game || !game.pendingAction) return;
    if (game.pendingAction.initiatorId !== socket.id) return;
    const { card } = game.pendingAction;
    game.pendingAction = null;
    startReactionWindow(roomId, socket.id, card, targetId, extraData || null);
  });

  socket.on("inspect_steal_pick", (data) => {
    const { roomId, targetId, cardInstanceId } = data;
    const game = games[roomId];
    if (!game) return;
    const initiator = game.players.find((p) => p.id === socket.id);
    const target = game.players.find((p) => p.id === targetId);
    if (!initiator || !target || initiator.cards.length >= HAND_LIMIT) return;
    const ci = target.cards.findIndex((c) => c.instanceId === cardInstanceId);
    if (ci === -1) return;
    initiator.cards.push(target.cards.splice(ci, 1)[0]);
    checkMadMouseAfter(roomId);
    io.to(roomId).emit("game_notification", {
      message: `${initiator.username} pasiima kortą iš ${target.username}!`,
      type: "action",
    });
    broadcastGameState(roomId);
    setTimeout(() => {
      if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
    }, 700);
  });

  socket.on("draw_card", (roomId) => {
    const game = games[roomId];
    if (!game || game.winner) return;
    const current = game.players[game.currentTurnIndex];
    if (current.id !== socket.id)
      return socket.emit("error_message", "Ne tavo ėjimas!");
    if (game.actionUsed)
      return socket.emit("error_message", "Jau panaudojai veiksmą!");
    if (game.deck.length === 0)
      return socket.emit("error_message", "Kaladė tuščia!");
    if (current.cards.length >= HAND_LIMIT)
      return socket.emit("error_message", `Max ${HAND_LIMIT}!`);
    const hasBadDraw = (current.curses || []).some(
      (c) => c.effect === "curse_bad_draw",
    );
    const card = game.deck.pop();
    if (hasBadDraw) {
      game.discardPile.push(makeEntry(card, current.username));
      io.to(roomId).emit("game_notification", {
        message: `💀 Prakeikimas: korta išmesta!`,
        type: "curse",
      });
    } else {
      current.cards.push(card);
      socket.emit("receive_card", card);
    }
    game.actionUsed = true;
    broadcastGameState(roomId);
    setTimeout(() => {
      if (games[roomId] && !games[roomId].winner) nextTurn(roomId);
    }, 700);
  });

  socket.on("end_turn", (roomId) => {
    const game = games[roomId];
    if (!game || game.winner) return;
    if (game.players[game.currentTurnIndex].id !== socket.id) return;
    nextTurn(roomId);
  });

  socket.on("restart_game", (roomId) => {
    const game = games[roomId];
    if (!game || game.phase !== "ended") return;
    delete games[roomId];
    io.to(roomId).emit("game_restarted");
  });

  socket.on("disconnect", () => {
    Object.keys(games).forEach((roomId) => {
      const game = games[roomId];
      const player = game.players.find((p) => p.id === socket.id);
      if (player) {
        player.isConnected = false;
        if (player.madMousePending) {
          player.madMousePending = false;
          game.madMousePlayerId = null;
        }
        if (game.reactionWindow) {
          game.reactionWindow.passedPlayers.add(socket.id);
          if (
            game.reactionWindow.passedPlayers.size >=
            game.reactionWindow.totalOthers
          )
            finishReactionWindow(roomId);
        }
        io.to(roomId).emit("game_notification", {
          message: `${player.username} atsijungė...`,
          type: "skip",
        });
        broadcastGameState(roomId);
        if (
          game.players[game.currentTurnIndex].id === socket.id &&
          !game.winner
        )
          setTimeout(() => nextTurn(roomId), 2000);
      }
    });
    handlePlayerExit(socket.id);
    console.log("Atsijungė:", socket.id);
  });
});

httpServer.listen(3000, () =>
  console.log("Serveris veikia: http://localhost:3000"),
);
