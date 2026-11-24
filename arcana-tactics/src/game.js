// Arcana Tactics: Fate Weaver — Core Game Engine (Works via file://, http://, and Desktop App)
// Uses MAJOR_ARCANA, PERSONALITY_QUESTIONS, DECK_COVERS, PERSONALITY_QUEST_PATHS, TAROT_SPREADS loaded from ./cards.js

const SAVE_KEY = "arcana_fate_weaver_save_v3";

class ArcanaTacticsGame {
  constructor() {
    this.activeTab = "personality";
    this.grimoireStyleOverride = "auto";

    // Personality & Campaign Persistent State
    this.personalityCompleted = false;
    this.quizStep = 0;
    this.alignmentScore = 0; // -100 (Pure Goth) to +100 (Pure Holy)
    this.traits = [];

    // Card Unlock State (Starts with 8 starter cards; 14 unlocked via Personality Quests)
    this.unlockedCardIds = MAJOR_ARCANA.filter((c) => c.starter).map((c) => c.id);
    this.completedQuests = []; // e.g. ["goth_1", "goth_2", ...]
    this.questIndex = 0; // 0..3
    this.campaignCompleted = false;
    this.readingUnlocked = false;
    this.isSupporterPro = false;

    // Quest Combat State
    this.dilemmaResolved = false;
    this.activeBuff = null; // "dmg" | "ward" | "fate" | "mana" | "heal"
    this.playerHp = 80;
    this.playerMaxHp = 80;
    this.playerBlock = 0;
    this.mana = 3;
    this.maxMana = 3;
    this.fatePoints = 2;
    this.gold = 50;

    this.enemy = null;
    this.enemyWeakened = 0;
    this.drawPile = [];
    this.discardPile = [];
    this.hand = [];

    // Tarot Reading State
    this.currentSpreadKey = "three_card";
    this.currentReadingQuestion = "";
    this.drawnReadingCards = []; // [{ position, card, reversed, revealed }]
    this.savedReadings = [];

    this.loadState();
    this.bindEvents();
    this.syncThemeAndHeader();
    this.prepareCurrentQuest(false);
    this.renderAllViews();
  }

  // ===========================================================================
  // PERSISTENCE & PROFILE HELPERS
  // ===========================================================================
  loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.personalityCompleted = Boolean(data.personalityCompleted);
        this.quizStep = Number.isInteger(data.quizStep) ? data.quizStep : 0;
        this.alignmentScore = typeof data.alignmentScore === "number"
          ? Math.max(-100, Math.min(100, data.alignmentScore))
          : 0;
        this.traits = Array.isArray(data.traits) ? data.traits : [];
        if (Array.isArray(data.unlockedCardIds) && data.unlockedCardIds.length >= 8) {
          this.unlockedCardIds = Array.from(new Set(data.unlockedCardIds)).sort((a, b) => a - b);
        }
        this.completedQuests = Array.isArray(data.completedQuests) ? data.completedQuests : [];
        this.questIndex = Number.isInteger(data.questIndex) ? Math.min(3, Math.max(0, data.questIndex)) : 0;
        this.campaignCompleted = Boolean(data.campaignCompleted || this.completedQuests.length >= 4);
        this.gold = typeof data.gold === "number" ? data.gold : 50;
        this.isSupporterPro = Boolean(data.isSupporterPro);
        this.readingUnlocked = Boolean(
          data.readingUnlocked ||
            this.campaignCompleted ||
            this.completedQuests.length >= 4 ||
            this.unlockedCardIds.length >= 22 ||
            this.isSupporterPro
        );
        this.savedReadings = Array.isArray(data.savedReadings) ? data.savedReadings : [];
      }
      if (localStorage.getItem("arcana_pro_pass") === "true") {
        this.isSupporterPro = true;
        this.readingUnlocked = true;
      }
    } catch (err) {
      console.warn("Could not load save state:", err);
    }
  }

  saveState() {
    try {
      const payload = {
        personalityCompleted: this.personalityCompleted,
        quizStep: this.quizStep,
        alignmentScore: this.alignmentScore,
        traits: this.traits,
        unlockedCardIds: this.unlockedCardIds,
        completedQuests: this.completedQuests,
        questIndex: this.questIndex,
        campaignCompleted: this.campaignCompleted,
        gold: this.gold,
        isSupporterPro: this.isSupporterPro,
        readingUnlocked: this.readingUnlocked,
        savedReadings: this.savedReadings.slice(0, 20),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Could not save state:", err);
    }
  }

  clampAlignment(val) {
    return Math.max(-100, Math.min(100, Math.round(val)));
  }

  getDeckCoverProfile() {
    const score = this.clampAlignment(this.alignmentScore);
    for (const cover of DECK_COVERS) {
      if (score >= cover.minScore && score <= cover.maxScore) {
        return cover;
      }
    }
    return DECK_COVERS[2]; // Default Twilight
  }

  getCardArtPath(cardId, styleOverride = null) {
    const profile = this.getDeckCoverProfile();
    const style = styleOverride && styleOverride !== "auto" ? styleOverride : profile.artStyle;
    const padded = String(cardId).padStart(2, "0");
    return `./assets/cards/${style}/card_${padded}.png`;
  }

  getActiveQuestPath() {
    const profile = this.getDeckCoverProfile();
    return PERSONALITY_QUEST_PATHS[profile.questPathKey] || PERSONALITY_QUEST_PATHS.twilight;
  }

  // ===========================================================================
  // UI SYNCHRONIZATION & EVENT BINDING
  // ===========================================================================
  syncThemeAndHeader() {
    const profile = this.getDeckCoverProfile();
    const score = this.clampAlignment(this.alignmentScore);

    document.body.classList.remove("theme-goth", "theme-twilight", "theme-holy");
    document.body.classList.add(`theme-${profile.artStyle}`);

    const archetypeBadge = document.getElementById("soul-archetype-badge");
    if (archetypeBadge) {
      archetypeBadge.textContent = this.personalityCompleted
        ? `${profile.title} (${profile.artStyle.toUpperCase()} ART)`
        : `Soul Alignment: Calibrating (${profile.title})`;
    }

    const collectionBadge = document.getElementById("collection-badge");
    if (collectionBadge) {
      collectionBadge.textContent = `Cards: ${this.unlockedCardIds.length} / 22`;
    }

    const navCardCount = document.getElementById("nav-card-count");
    if (navCardCount) {
      navCardCount.textContent = `${this.unlockedCardIds.length}/22`;
    }

    const navQuestProgress = document.getElementById("nav-quest-progress");
    if (navQuestProgress) {
      const doneCount = Math.min(4, this.completedQuests.length);
      navQuestProgress.textContent = `${doneCount}/4`;
    }

    const readingLockIcon = document.getElementById("reading-lock-icon");
    if (readingLockIcon) {
      readingLockIcon.textContent = this.readingUnlocked ? "✨" : "🔒";
    }

    const proBadge = document.getElementById("pro-badge");
    if (proBadge) {
      proBadge.textContent = this.isSupporterPro ? "★ SUPPORTER FOIL PASS" : "";
    }

    // Spectrum Bar Marker (-100 -> 0%, 0 -> 50%, +100 -> 100%)
    const pct = ((score + 100) / 200) * 100;
    const marker = document.getElementById("alignment-marker");
    if (marker) {
      marker.style.left = `${Math.max(2, Math.min(98, pct))}%`;
    }
    const scoreLabel = document.getElementById("alignment-score-label");
    if (scoreLabel) {
      const tag =
        profile.artStyle === "goth"
          ? "🦇 Goth"
          : profile.artStyle === "holy"
          ? "☀️ Holy"
          : "⚖️ Twilight";
      scoreLabel.textContent = `${score > 0 ? "+" : ""}${score} (${tag})`;
    }

    // Update live Deck Cover preview in View 1
    const coverTitle = document.getElementById("deck-cover-title");
    const coverSubtitle = document.getElementById("deck-cover-subtitle");
    const coverImg = document.getElementById("deck-cover-img");
    const passiveBox = document.getElementById("deck-passive-box");

    if (coverTitle) coverTitle.textContent = profile.title;
    if (coverSubtitle) coverSubtitle.textContent = profile.subtitle;
    if (coverImg) coverImg.src = profile.coverImage;
    if (passiveBox) passiveBox.textContent = profile.passiveDesc;

    // Update Mini Deck Widgets in View 2 & View 4
    const combatDeckBack = document.getElementById("combat-deck-back");
    const combatDeckName = document.getElementById("combat-deck-name");
    if (combatDeckBack) combatDeckBack.src = profile.coverImage;
    if (combatDeckName) combatDeckName.textContent = profile.title;

    const readingDeckLabel = document.getElementById("reading-deck-label");
    const readingDeckThumb = document.getElementById("reading-deck-thumb");
    if (readingDeckLabel) {
      readingDeckLabel.textContent = `${profile.title} (${profile.artStyle.toUpperCase()} Art)`;
    }
    if (readingDeckThumb) {
      readingDeckThumb.src = profile.coverImage;
    }
  }

  bindEvents() {
    // Mode Navigation Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });

    // Store & Reset Buttons
    document.getElementById("btn-open-store")?.addEventListener("click", () => {
      document.getElementById("pro-modal")?.classList.remove("hidden");
    });
    document.getElementById("btn-close-store")?.addEventListener("click", () => {
      document.getElementById("pro-modal")?.classList.add("hidden");
    });
    document.getElementById("btn-unlock-pro")?.addEventListener("click", () => {
      const key = document.getElementById("pro-key-input")?.value?.trim() || "";
      if (key.length >= 4) {
        this.activateSupporterPass();
      }
    });

    document.getElementById("btn-reset-save")?.addEventListener("click", () => {
      this.resetPersonalityAndCampaign();
    });

    // Combat Actions
    document.getElementById("btn-end-turn")?.addEventListener("click", () => {
      this.endTurn();
    });
    document.getElementById("btn-blessing")?.addEventListener("click", () => {
      this.buySanctumBlessing();
    });

    // Grimoire Style Switcher
    document.querySelectorAll("[data-preview-style]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.grimoireStyleOverride = btn.getAttribute("data-preview-style") || "auto";
        this.renderGrimoireView();
      });
    });

    // Tarot Reading Controls
    document.getElementById("btn-go-quests")?.addEventListener("click", () => {
      this.switchTab("quests");
    });
    document.getElementById("btn-Instant-unlock-reading")?.addEventListener("click", () => {
      this.unlockAllCardsAndReading("Master Seeker Override activated!");
    });
    document.getElementById("btn-deal-reading")?.addEventListener("click", () => {
      this.dealTarotSpread();
    });
    document.getElementById("btn-reveal-all-reading")?.addEventListener("click", () => {
      this.revealAllReadingCards();
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    const views = ["personality", "quests", "grimoire", "reading"];
    views.forEach((v) => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.toggle("hidden", v !== tabName);
    });

    this.syncThemeAndHeader();
    this.renderAllViews();
  }

  renderAllViews() {
    this.syncThemeAndHeader();
    this.renderPersonalityView();
    this.renderQuestsView();
    this.renderGrimoireView();
    this.renderReadingView();
  }

  // ===========================================================================
  // VIEW 1: PERSONALITY TEST & DECK COVER ART CONFIGURATOR
  // ===========================================================================
  renderPersonalityView() {
    const container = document.getElementById("quiz-container");
    if (!container) return;

    const profile = this.getDeckCoverProfile();

    if (!this.personalityCompleted && this.quizStep < PERSONALITY_QUESTIONS.length) {
      const q = PERSONALITY_QUESTIONS[this.quizStep];
      const progressPct = Math.round(((this.quizStep + 1) / PERSONALITY_QUESTIONS.length) * 100);

      container.innerHTML = `
        <div class="section-eyebrow">SOUL CALIBRATION RITUAL • QUESTION ${this.quizStep + 1} OF ${PERSONALITY_QUESTIONS.length}</div>
        <h2 style="margin: 6px 0 8px;">Discover Your Deck Cover &amp; Soul Alignment</h2>
        <p class="muted-text" style="margin-bottom: 12px;">
          Answer the 7 trials of the Oracle. Darker choices forge a <strong>Goth</strong> deck cover and nocturnal quests; lighter choices consecrate a <strong>Holy</strong> deck cover and seraphic quests.
        </p>
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width: ${progressPct}%;"></div>
        </div>
        <h3 style="margin: 14px 0 10px; font-size: 1.08rem; color: #f8fafc;">${q.prompt}</h3>
        <div class="choice-list" id="quiz-choice-list"></div>
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(148, 163, 184, 0.25); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn-secondary" data-quick-start="-85" title="Forge Goth Deck &amp; Start Quests">🦇 Quick Start: Goth</button>
            <button class="btn-secondary" data-quick-start="0" title="Forge Twilight Deck &amp; Start Quests">⚖️ Quick Start: Twilight</button>
            <button class="btn-secondary" data-quick-start="85" title="Forge Holy Deck &amp; Start Quests">☀️ Quick Start: Holy</button>
          </div>
          <button id="btn-continue-game-now" class="btn-primary" style="font-size: 0.95rem; padding: 10px 18px;">
            ▶ Continue Game to Quests →
          </button>
        </div>
      `;

      const listEl = container.querySelector("#quiz-choice-list");
      q.choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        const tag =
          choice.score <= -20
            ? "🦇 Deep Goth (-25)"
            : choice.score < 0
            ? "🌙 Shadow (-10)"
            : choice.score <= 15
            ? "⚖️ Astral (+10)"
            : "☀️ Pure Holy (+25)";
        btn.innerHTML = `
          <div>${choice.label}</div>
          <div style="margin-top: 4px; font-size: 0.74rem; color: #94a3b8;">
            Trait: <strong style="color: #e2e8f0;">${choice.trait}</strong> • Alignment Shift: <strong>${tag}</strong>
          </div>
        `;
        btn.addEventListener("click", () => this.answerQuizQuestion(choice));
        listEl.appendChild(btn);
      });

      container.querySelector("#btn-continue-game-now")?.addEventListener("click", () => {
        this.personalityCompleted = true;
        this.prepareCurrentQuest(true);
        this.saveState();
        this.switchTab("quests");
      });

      container.querySelectorAll("[data-quick-start]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const score = Number(btn.getAttribute("data-quick-start"));
          this.alignmentScore = this.clampAlignment(score);
          this.personalityCompleted = true;
          this.prepareCurrentQuest(true);
          this.saveState();
          this.switchTab("quests");
        });
      });
    } else {
      // Completed Personality Summary & Quick Alignment Tuner
      const questPath = this.getActiveQuestPath();
      const score = this.clampAlignment(this.alignmentScore);
      const traitBadges = (this.traits.length ? this.traits : ["Soul Awakened", "Fate Weaver"])
        .map(
          (t) =>
            `<span style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); padding: 4px 10px; border-radius: 999px; font-size: 0.76rem;">✨ ${t}</span>`
        )
        .join(" ");

      container.innerHTML = `
        <div class="section-eyebrow">SOUL CALIBRATION COMPLETE • DECK FORGED</div>
        <h2 style="margin: 6px 0;">${profile.title}</h2>
        <div class="muted-text" style="margin-bottom: 12px;">
          ${profile.subtitle} • Alignment Score: <strong>${score > 0 ? "+" : ""}${score}</strong>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
          ${traitBadges}
        </div>

        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div class="section-eyebrow">YOUR PERSONALITY QUEST CAMPAIGN</div>
          <h3 style="margin: 4px 0 6px; color: #fde68a;">⚔️ ${questPath.pathTitle}</h3>
          <p class="muted-text" style="margin: 0 0 10px;">${questPath.pathDesc}</p>
          <div style="font-size: 0.84rem; color: #e2e8f0;">
            <strong>Quest Progress:</strong> ${Math.min(4, this.completedQuests.length)} / 4 Completed •
            <strong>Unlocked Arcana:</strong> ${this.unlockedCardIds.length} / 22 Cards
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px;">
          <button id="btn-start-quests-cta" class="btn-primary" style="font-size: 0.95rem; padding: 11px 18px;">
            ⚔️ Embark on Your Personality Quests (${Math.min(4, this.completedQuests.length)}/4)
          </button>
          <button id="btn-retake-quiz-cta" class="btn-secondary" style="border-color: #fde68a; color: #fde68a;">
            🪞 Take 7-Question Personality Exam Again
          </button>
          <button id="btn-go-grimoire-cta" class="btn-secondary">
            📖 Inspect ${profile.artStyle.toUpperCase()} Card Art Grimoire
          </button>
          ${
            this.readingUnlocked
              ? `<button id="btn-go-reading-cta" class="btn-primary">🔮 Enter Tarot Reading Sanctum</button>`
              : ""
          }
        </div>

        <div style="border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 14px;">
          <div class="section-eyebrow" style="margin-bottom: 6px;">SOUL SPECTRUM ATTUNEMENT (PREVIEW GOTH ↔ HOLY DECK COVERS)</div>
          <p class="muted-text" style="margin: 0 0 10px; font-size: 0.78rem;">
            Shift your soul resonance below or retake the 7-question Personality Test at any time to experience all 5 Deck Covers and 3 Quest Campaigns:
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-secondary" data-preset-score="-85">🦇 Abyssal Goth (-85)</button>
            <button class="btn-secondary" data-preset-score="-40">🌙 Umbral Witch (-40)</button>
            <button class="btn-secondary" data-preset-score="0">⚖️ Twilight Balance (0)</button>
            <button class="btn-secondary" data-preset-score="40">🕊️ Dawnbriar Saint (+40)</button>
            <button class="btn-secondary" data-preset-score="85">☀️ Seraphic Holy (+85)</button>
          </div>
        </div>
      `;

      container.querySelector("#btn-start-quests-cta")?.addEventListener("click", () => {
        this.switchTab("quests");
      });
      container.querySelector("#btn-retake-quiz-cta")?.addEventListener("click", () => {
        this.startPersonalityExam();
      });
      container.querySelector("#btn-go-grimoire-cta")?.addEventListener("click", () => {
        this.switchTab("grimoire");
      });
      container.querySelector("#btn-go-reading-cta")?.addEventListener("click", () => {
        this.switchTab("reading");
      });

      container.querySelectorAll("[data-preset-score]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const newScore = Number(btn.getAttribute("data-preset-score"));
          this.alignmentScore = this.clampAlignment(newScore);
          this.personalityCompleted = true;
          this.prepareCurrentQuest(true);
          this.saveState();
          this.renderAllViews();
        });
      });
    }
  }

  answerQuizQuestion(choice) {
    this.alignmentScore = this.clampAlignment(this.alignmentScore + choice.score);
    if (choice.trait && !this.traits.includes(choice.trait)) {
      this.traits.push(choice.trait);
    }
    this.quizStep += 1;

    if (this.quizStep >= PERSONALITY_QUESTIONS.length) {
      this.personalityCompleted = true;
      this.prepareCurrentQuest(true);
    }

    this.saveState();
    this.syncThemeAndHeader();
    this.renderPersonalityView();
  }

  startPersonalityExam() {
    this.personalityCompleted = false;
    this.quizStep = 0;
    this.alignmentScore = 0;
    this.traits = [];
    this.saveState();
    this.switchTab("personality");
  }

  resetPersonalityAndCampaign() {
    this.personalityCompleted = false;
    this.quizStep = 0;
    this.alignmentScore = 0;
    this.traits = [];
    this.unlockedCardIds = MAJOR_ARCANA.filter((c) => c.starter).map((c) => c.id);
    this.completedQuests = [];
    this.questIndex = 0;
    this.campaignCompleted = false;
    this.readingUnlocked = this.isSupporterPro;
    this.dilemmaResolved = false;
    this.activeBuff = null;
    this.gold = 50;

    this.prepareCurrentQuest(true);
    this.saveState();
    this.switchTab("personality");
  }

  // ===========================================================================
  // VIEW 2: PERSONALITY-BASED QUESTS & TACTICAL TAROT COMBAT
  // ===========================================================================
  prepareCurrentQuest(resetDilemma = false) {
    const questPath = this.getActiveQuestPath();
    const safeIdx = Math.min(questPath.quests.length - 1, Math.max(0, this.questIndex));
    this.questIndex = safeIdx;
    const quest = questPath.quests[safeIdx];

    if (resetDilemma) {
      this.dilemmaResolved = false;
      this.activeBuff = null;
    }

    const profile = this.getDeckCoverProfile();
    this.playerMaxHp = 80 + (profile.bonusMaxHp || 0);
    this.playerHp = this.playerMaxHp;
    this.playerBlock = 0;
    this.maxMana = this.isSupporterPro ? 4 : 3;
    this.mana = this.maxMana;
    this.fatePoints = 2 + (profile.bonusFate || 0);

    this.enemy = {
      name: quest.boss.name,
      title: quest.boss.title,
      maxHp: quest.boss.maxHp,
      hp: quest.boss.maxHp,
      baseDmg: quest.boss.baseDmg,
      nextDmg: quest.boss.baseDmg,
      goldReward: quest.boss.goldReward,
    };
    this.enemyWeakened = 0;

    this.buildCombatDeck();
    this.hand = [];
    this.drawCards(4);
  }

  buildCombatDeck() {
    const unlockedCards = MAJOR_ARCANA.filter((c) => this.unlockedCardIds.includes(c.id));
    this.drawPile = [];
    this.discardPile = [];

    // Include each unlocked Major Arcana card in the combat deck (duplicate if < 12 cards)
    const copies = unlockedCards.length < 12 ? 2 : 1;
    for (let i = 0; i < copies; i++) {
      for (const card of unlockedCards) {
        this.drawPile.push({
          ...card,
          uid: `${card.id}_${i}_${Math.random().toString(36).slice(2, 7)}`,
          isReversed: Math.random() < 0.42,
        });
      }
    }
    this.shuffle(this.drawPile);
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  drawCards(count) {
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = [...this.discardPile];
        this.discardPile = [];
        this.shuffle(this.drawPile);
        this.logCombat("🔄 Reshuffled the Astral Discard Pile into your Soul Deck.");
      }
      const card = this.drawPile.pop();
      card.isReversed = Math.random() < 0.42;
      this.hand.push(card);
    }
  }

  resolveQuestDilemma(choice) {
    this.alignmentScore = this.clampAlignment(this.alignmentScore + (choice.shift || 0));
    this.dilemmaResolved = true;
    this.activeBuff = choice.buff;

    this.syncThemeAndHeader();
    if (!this.enemy || this.enemy.hp >= this.enemy.maxHp) {
      this.prepareCurrentQuest(false);
    }

    if (choice.buff === "ward") {
      this.playerBlock += 15;
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 10);
      this.logCombat("🛡️ Moral Choice Blessing: Gained +15 Astral Ward & +10 HP!");
    } else if (choice.buff === "dmg") {
      this.fatePoints += 2;
      this.logCombat("🔥 Moral Choice Blessing: All cards deal +4 bonus DMG this trial & +2 Fate Points!");
    } else if (choice.buff === "fate") {
      this.fatePoints += 3;
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 10);
      this.logCombat("🔮 Moral Choice Blessing: Gained +3 Fate Points & +10 HP!");
    } else if (choice.buff === "mana") {
      this.maxMana += 1;
      this.mana = this.maxMana;
      this.playerBlock += 10;
      this.logCombat("⚡ Moral Choice Blessing: +1 Max Astral Mana this trial & +10 Ward!");
    } else if (choice.buff === "heal") {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 20);
      this.playerBlock += 12;
      this.logCombat("💧 Moral Choice Blessing: Restored +20 HP & gained +12 Ward!");
    }

    this.saveState();
    this.renderQuestsView();
  }

  renderQuestsView() {
    const questPath = this.getActiveQuestPath();
    const profile = this.getDeckCoverProfile();
    const currentQuest = questPath.quests[this.questIndex] || questPath.quests[0];

    // 1. Render 4-Quest Stepper
    const stepperEl = document.getElementById("quest-stepper");
    if (stepperEl) {
      stepperEl.innerHTML = "";
      questPath.quests.forEach((q, idx) => {
        const isDone =
          this.campaignCompleted ||
          this.completedQuests.includes(q.questId) ||
          idx < this.completedQuests.length;
        const isActive = idx === this.questIndex && !this.campaignCompleted;
        const unlockNames = q.unlockCardIds
          .map((id) => MAJOR_ARCANA.find((c) => c.id === id)?.name)
          .filter(Boolean)
          .join(", ");

        const stepCard = document.createElement("div");
        stepCard.className = `quest-step-card ${isActive ? "active" : ""} ${isDone ? "completed" : ""}`;
        stepCard.style.cursor = "pointer";
        stepCard.innerHTML = `
          <div class="section-eyebrow">${q.chapter} ${isDone ? "✓ COMPLETED" : isActive ? "• ACTIVE" : ""}</div>
          <div style="font-weight: 800; font-size: 0.92rem; margin: 3px 0;">${q.title}</div>
          <div class="muted-text" style="font-size: 0.75rem;">Boss: ${q.boss.name}</div>
          <div style="margin-top: 6px; font-size: 0.73rem; color: #fde68a;">
            🎁 Unlocks: ${unlockNames}
          </div>
        `;
        stepCard.addEventListener("click", () => {
          this.campaignCompleted = false;
          this.questIndex = idx;
          this.prepareCurrentQuest(true);
          this.renderQuestsView();
        });
        stepperEl.appendChild(stepCard);
      });
    }

    // 2. Render Campaign Victory Finale OR Dilemma Panel
    const dilemmaBox = document.getElementById("quest-dilemma-box");
    if (dilemmaBox) {
      if (this.campaignCompleted) {
        dilemmaBox.classList.remove("hidden");
        dilemmaBox.innerHTML = `
          <div class="section-eyebrow" style="color: #86efac;">🏆 ALL 4 PERSONALITY QUESTS COMPLETED • GRAND ASCENSION</div>
          <h2 style="margin: 6px 0 8px; color: #fde68a;">Quest IV Finale Conquered! All 22 Major Arcana Unlocked!</h2>
          <p style="margin: 0 0 14px; color: #e2e8f0; font-size: 0.94rem; line-height: 1.5;">
            You have triumphed over <strong>${currentQuest.boss.name}</strong> and completed <strong>${questPath.pathTitle}</strong>. Your soul-forged deck (<strong>${profile.title}</strong>) is now complete with all 22 Major Arcana, and the <strong>Oracle's Tarot Card Reading Sanctum</strong> is permanently unlocked!
          </p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="btn-victory-go-reading" class="btn-primary" style="font-size: 1rem; padding: 12px 22px;">
              🔮 Enter Tarot Card Reading Sanctum &amp; Deal Spread →
            </button>
            <button id="btn-victory-go-grimoire" class="btn-secondary" style="padding: 12px 18px;">
              📖 View All 22 Unlocked Cards in Grimoire
            </button>
            <button id="btn-victory-rematch" class="btn-secondary" style="padding: 12px 16px;">
              ⚔️ Replay Quest IV Boss Battle
            </button>
          </div>
        `;
        dilemmaBox.querySelector("#btn-victory-go-reading")?.addEventListener("click", () => {
          this.switchTab("reading");
          if (this.drawnReadingCards.length === 0) {
            this.dealTarotSpread();
          }
        });
        dilemmaBox.querySelector("#btn-victory-go-grimoire")?.addEventListener("click", () => {
          this.switchTab("grimoire");
        });
        dilemmaBox.querySelector("#btn-victory-rematch")?.addEventListener("click", () => {
          this.campaignCompleted = false;
          this.questIndex = 3;
          this.prepareCurrentQuest(true);
          this.saveState();
          this.renderQuestsView();
        });
      } else if (!this.dilemmaResolved) {
        dilemmaBox.classList.remove("hidden");
        const unlockBadges = currentQuest.unlockCardIds
          .map((id) => {
            const c = MAJOR_ARCANA.find((x) => x.id === id);
            return c ? `${c.numeral} ${c.name}` : "";
          })
          .join(" • ");

        dilemmaBox.innerHTML = `
          <div class="section-eyebrow">${questPath.pathTitle.toUpperCase()} • ${currentQuest.chapter}</div>
          <h3 style="margin: 4px 0 6px; font-size: 1.2rem;">${currentQuest.title}</h3>
          <p style="margin: 0 0 10px; color: #e2e8f0; font-size: 0.9rem; line-height: 1.45;">
            ${currentQuest.lore}
          </p>
          <div style="margin-bottom: 12px; font-size: 0.8rem; color: #fde68a;">
            🃏 <strong>Cards Sealed in This Trial:</strong> ${unlockBadges}
          </div>
          <div class="dilemma-choices" id="dilemma-choice-buttons"></div>
        `;
        const btnWrap = dilemmaBox.querySelector("#dilemma-choice-buttons");
        currentQuest.dilemmaChoices.forEach((ch) => {
          const b = document.createElement("button");
          b.className = "choice-btn";
          b.textContent = ch.label;
          b.addEventListener("click", () => this.resolveQuestDilemma(ch));
          btnWrap.appendChild(b);
        });
      } else {
        dilemmaBox.classList.add("hidden");
      }
    }

    // 3. Render Combat Stats & Boss Panel
    document.getElementById("stat-hp").textContent = `${this.playerHp} / ${this.playerMaxHp}`;
    document.getElementById("stat-block").textContent = `${this.playerBlock}`;
    document.getElementById("stat-mana").textContent = `${this.mana} / ${this.maxMana}`;
    document.getElementById("stat-fate").textContent = `${this.fatePoints}`;
    document.getElementById("stat-gold").textContent = `${this.gold}`;

    document.getElementById("quest-chapter-tag").textContent = this.campaignCompleted
      ? `${currentQuest.chapter} • COMPLETED ✓`
      : `${currentQuest.chapter} • ${currentQuest.title}`;
    document.getElementById("enemy-name").textContent = this.enemy.name;
    document.getElementById("enemy-title").textContent = this.enemy.title;

    const rewardPreview = document.getElementById("quest-reward-preview");
    if (rewardPreview) {
      const rewardCards = currentQuest.unlockCardIds
        .map((id) => MAJOR_ARCANA.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      rewardPreview.innerHTML = this.campaignCompleted
        ? `🏆 <strong>Campaign Complete:</strong> All 22 Major Arcana &amp; Tarot Readings Unlocked!`
        : `🎁 <strong>Quest Reward:</strong> Unlocks <em>${rewardCards}</em> (+${this.enemy.goldReward} 🪙)`;
    }

    const displayEnemyHp = this.enemy.hp;
    const hpPct = Math.max(0, Math.min(100, Math.round((displayEnemyHp / this.enemy.maxHp) * 100)));
    document.getElementById("enemy-hp-bar").style.width = `${hpPct}%`;
    document.getElementById("enemy-hp").textContent = `Boss HP: ${this.enemy.hp} / ${this.enemy.maxHp}`;

    const effectiveIntentDmg =
      this.enemyWeakened > 0 ? Math.floor(this.enemy.nextDmg * 0.65) : this.enemy.nextDmg;
    document.getElementById("enemy-intent").textContent =
      `⚔️ Imminent Omen: Strikes for ${effectiveIntentDmg} DMG when your turn ends (Astral Mana: ${this.mana}/${this.maxMana})` +
      (this.enemyWeakened > 0 ? ` (Weakened ${this.enemyWeakened}t)` : "");

    document.getElementById("draw-pile-count").textContent = `${this.drawPile.length}`;
    document.getElementById("discard-pile-count").textContent = `${this.discardPile.length}`;

    // 4. Render Hand Cards with Personality Art (Goth / Twilight / Holy)
    const handEl = document.getElementById("hand-container");
    if (!handEl) return;
    handEl.innerHTML = "";

    if (!this.hand || this.hand.length === 0) {
      this.drawCards(4);
    }

    this.hand.forEach((card, idx) => {
      const mode = card.isReversed ? card.reversed : card.upright;
      const artSrc = this.getCardArtPath(card.id, profile.artStyle);

      const cardEl = document.createElement("div");
      cardEl.className = `tarot-card ${card.isReversed ? "reversed" : ""} ${this.isSupporterPro ? "foil-gold" : ""}`;
      cardEl.style.cursor = "pointer";
      cardEl.title = "Click card to invoke Arcana";
      cardEl.innerHTML = `
        <div>
          <div class="card-header">
            <span>${card.numeral} • ${card.name}</span>
            <span class="cost-orb">⚡ ${card.cost}</span>
          </div>
          <div class="orientation-badge ${card.isReversed ? "badge-reversed" : "badge-upright"}">
            ${card.isReversed ? "↓ REVERSED" : "↑ UPRIGHT"} • ${mode.type}
          </div>
          <div class="card-art-wrap">
            <img
              src="${artSrc}"
              alt="${card.name}"
              class="${card.isReversed ? "img-reversed" : ""}"
            />
          </div>
          <div class="card-desc">${mode.desc}</div>
        </div>
        <div class="card-actions">
          <button class="btn-small btn-cast">✨ Invoke (${card.cost}⚡)</button>
          <button class="btn-small btn-flip" title="Spend 1 Fate Point to invert Upright/Reversed">🔄 Flip (1🔮)</button>
        </div>
      `;

      // Clicking anywhere on the card (except the Flip button) invokes the card!
      cardEl.addEventListener("click", () => {
        this.playCard(idx);
      });
      cardEl.querySelector(".btn-cast").addEventListener("click", (e) => {
        e.stopPropagation();
        this.playCard(idx);
      });
      cardEl.querySelector(".btn-flip").addEventListener("click", (e) => {
        e.stopPropagation();
        this.flipCard(idx);
      });

      handEl.appendChild(cardEl);
    });
  }

  flipCard(index) {
    if (this.fatePoints < 1) {
      this.logCombat("⚠️ Not enough Fate Points (🔮) to invert this card's polarity!");
      return;
    }
    this.fatePoints -= 1;
    const card = this.hand[index];
    card.isReversed = !card.isReversed;
    this.logCombat(
      `🔄 Inverted [${card.numeral} ${card.name}] to ${card.isReversed ? "REVERSED" : "UPRIGHT"}!`
    );
    this.renderQuestsView();
  }

  playCard(index) {
    const card = this.hand[index];
    if (!card) return;

    // Auto-resolve moral dilemma if player jumps straight into playing cards
    if (!this.dilemmaResolved) {
      const questPath = this.getActiveQuestPath();
      const currentQuest = questPath.quests[this.questIndex] || questPath.quests[0];
      if (currentQuest && currentQuest.dilemmaChoices && currentQuest.dilemmaChoices.length > 0) {
        this.dilemmaResolved = true;
        this.activeBuff = currentQuest.dilemmaChoices[0].buff;
      }
    }

    const cardCost = card.cost || 1;
    this.mana = Math.max(0, this.mana - cardCost);
    const mode = card.isReversed ? card.reversed : card.upright;
    const profile = this.getDeckCoverProfile();

    // Extra HP cost for blood/sacrifice cards
    if (mode.costExtraHp) {
      this.playerHp = Math.max(1, this.playerHp - mode.costExtraHp);
      this.logCombat(`🩸 Blood Price: Sacrificed ${mode.costExtraHp} HP for ${card.name}.`);
    }

    // Calculate Damage with Personality Deck Cover Passives & Dilemma Buffs
    if (mode.dmg && mode.dmg > 0) {
      let dmg = mode.dmg;
      if (card.isReversed && profile.dmgBonusRev) {
        dmg = Math.round(dmg * profile.dmgBonusRev);
      } else if (!card.isReversed && profile.dmgBonusUp) {
        dmg = Math.round(dmg * profile.dmgBonusUp);
      }
      if (this.activeBuff === "dmg") {
        dmg += 4;
      }
      this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
      this.logCombat(
        `✨ Invoked [${card.numeral} ${card.name}] (${card.isReversed ? "Rev" : "Up"}): Dealt ${dmg} DMG!`
      );
    }

    // Block / Ward
    let totalBlock = mode.block || 0;
    if (!card.isReversed && profile.wardOnUp) totalBlock += profile.wardOnUp;
    if (profile.wardOnCast) totalBlock += profile.wardOnCast;
    if (totalBlock > 0) {
      this.playerBlock += totalBlock;
      this.logCombat(`🛡️ Gained +${totalBlock} Astral Ward.`);
    }

    // Healing
    let totalHeal = mode.heal || 0;
    if (card.isReversed && profile.healOnRev) totalHeal += profile.healOnRev;
    if (!card.isReversed && profile.healOnUp) totalHeal += profile.healOnUp;
    if (totalHeal > 0) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + totalHeal);
      this.logCombat(`💚 Restored +${totalHeal} Vessel HP.`);
    }

    // Fate Gain
    if (mode.fateGain) {
      this.fatePoints += mode.fateGain;
      this.logCombat(`🔮 Gained +${mode.fateGain} Fate Points.`);
    }

    // Weaken Curse
    if (mode.weaken) {
      this.enemyWeakened += mode.weaken;
      this.logCombat(`🌙 Cursed ${this.enemy.name} with Weaken for ${mode.weaken} turns!`);
    }

    // Self Recoil
    if (mode.selfVuln) {
      this.playerHp = Math.max(1, this.playerHp - 3);
      this.logCombat(`⚡ Astral Recoil: Took 3 DMG from unstable arcana.`);
    }

    // Remove played card before drawing extra
    this.hand.splice(index, 1);
    this.discardPile.push(card);

    if (mode.draw) {
      this.drawCards(mode.draw);
      this.logCombat(`🃏 Drew ${mode.draw} card(s).`);
    }

    // Check Quest Boss Defeat
    if (this.enemy.hp <= 0) {
      this.handleQuestVictory();
      return;
    }

    // If Astral Mana is depleted or no cards remain in hand, resolve the turn; otherwise let player continue playing cards!
    if (this.mana <= 0 || this.hand.length === 0) {
      this.endTurn();
    } else {
      this.saveState();
      this.renderQuestsView();
    }
  }

  endTurn() {
    let incoming = this.enemy.nextDmg;
    if (this.enemyWeakened > 0) {
      incoming = Math.floor(incoming * 0.65);
      this.enemyWeakened -= 1;
    }

    const blocked = Math.min(this.playerBlock, incoming);
    const netDmg = incoming - blocked;
    this.playerHp = Math.max(0, this.playerHp - netDmg);
    this.logCombat(
      `👹 ${this.enemy.name} strikes for ${incoming} DMG (${blocked} blocked, ${netDmg} taken).`
    );

    if (this.playerHp <= 0) {
      this.logCombat(
        `💀 Your Astral Vessel shattered! Reforming at the Sanctum with full strength...`
      );
      this.prepareCurrentQuest(false);
      this.renderQuestsView();
      return;
    }

    // Next Turn Setup
    this.playerBlock = 0;
    this.mana = this.maxMana;
    this.fatePoints += 1;
    this.enemy.nextDmg = this.enemy.baseDmg + Math.floor(Math.random() * 5);

    while (this.hand.length > 0) {
      this.discardPile.push(this.hand.pop());
    }
    this.drawCards(4);
    this.renderQuestsView();
  }

  handleQuestVictory() {
    const questPath = this.getActiveQuestPath();
    const currentQuest = questPath.quests[this.questIndex];

    this.gold += this.enemy.goldReward;
    if (!this.completedQuests.includes(currentQuest.questId)) {
      this.completedQuests.push(currentQuest.questId);
    }

    const newlyUnlockedNames = [];
    currentQuest.unlockCardIds.forEach((id) => {
      if (!this.unlockedCardIds.includes(id)) {
        this.unlockedCardIds.push(id);
        const c = MAJOR_ARCANA.find((x) => x.id === id);
        if (c) newlyUnlockedNames.push(`${c.numeral} ${c.name}`);
      }
    });
    this.unlockedCardIds.sort((a, b) => a - b);

    this.logCombat(
      `🏆 VICTORY! Defeated ${this.enemy.name} and claimed +${this.enemy.goldReward} 🪙!`
    );
    if (newlyUnlockedNames.length > 0) {
      this.logCombat(`🃏 UNLOCKED NEW MAJOR ARCANA: ${newlyUnlockedNames.join(", ")}!`);
    }

    // Check if Quest IV (Finale) or all 4 Quests on the path are complete
    if (this.questIndex >= 3 || this.completedQuests.length >= 4 || this.unlockedCardIds.length >= 22) {
      questPath.quests.forEach((q) => {
        if (!this.completedQuests.includes(q.questId)) {
          this.completedQuests.push(q.questId);
        }
      });
      MAJOR_ARCANA.forEach((c) => {
        if (!this.unlockedCardIds.includes(c.id)) this.unlockedCardIds.push(c.id);
      });
      this.unlockedCardIds.sort((a, b) => a - b);
      this.campaignCompleted = true;
      this.readingUnlocked = true;
      this.prepareCurrentQuest(true);
      this.logCombat(
        `🔮 GRAND ASCENSION! Quest IV Finale Completed! All 22 Major Arcana & the TAROT CARD READING SANCTUM (Tab 4) are now UNLOCKED!`
      );
      this.saveState();
      this.syncThemeAndHeader();
      this.renderAllViews();
      return;
    }

    // Advance to the next Quest (I -> II -> III -> IV)
    this.questIndex += 1;
    this.prepareCurrentQuest(true);
    this.saveState();
    this.syncThemeAndHeader();
    this.renderAllViews();
  }

  buySanctumBlessing() {
    if (this.gold < 40) {
      this.logCombat("⚠️ Need 40 Astral Gold (🪙) for a Sanctum Blessing!");
      return;
    }
    this.gold -= 40;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 18);
    this.fatePoints += 2;
    this.logCombat("🌟 Sanctum Blessing: Restored +18 HP and gained +2 Fate Points!");
    this.saveState();
    this.renderQuestsView();
  }

  logCombat(msg) {
    const box = document.getElementById("combat-log");
    if (!box) return;
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = msg;
    box.prepend(div);
  }

  // ===========================================================================
  // VIEW 3: ARCANA GRIMOIRE (22 MAJOR ARCANA GALLERY)
  // ===========================================================================
  renderGrimoireView() {
    const grid = document.getElementById("grimoire-grid");
    if (!grid) return;

    const profile = this.getDeckCoverProfile();
    const activeStyle =
      this.grimoireStyleOverride === "auto" ? profile.artStyle : this.grimoireStyleOverride;

    const styleLabel = document.getElementById("grimoire-style-label");
    if (styleLabel) {
      styleLabel.textContent = `${activeStyle.toUpperCase()} (${profile.title})`;
    }

    grid.innerHTML = "";
    const questPath = this.getActiveQuestPath();

    MAJOR_ARCANA.forEach((card) => {
      const isUnlocked = this.unlockedCardIds.includes(card.id);
      const artSrc = this.getCardArtPath(card.id, activeStyle);

      // Find which quest unlocks this card if locked
      let sourceLabel = "Starter Soul Deck";
      if (!card.starter) {
        const qMatch = questPath.quests.find((q) => q.unlockCardIds.includes(card.id));
        sourceLabel = qMatch ? `Unlocked in ${qMatch.chapter}: ${qMatch.title}` : "Personality Quest Reward";
      }

      const item = document.createElement("div");
      item.className = `grimoire-card ${isUnlocked ? "" : "locked"}`;
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 0.85rem;">
          <span>${card.numeral} • ${card.name}</span>
          <span style="font-size: 0.72rem; color: ${isUnlocked ? "#86efac" : "#fda4af"};">
            ${isUnlocked ? "✓ UNLOCKED" : "🔒 SEALED"}
          </span>
        </div>
        <div class="card-art-wrap" style="height: 225px;">
          <img src="${artSrc}" alt="${card.name}" />
        </div>
        <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.35;">
          <div><strong style="color: #86efac;">↑ Upright:</strong> ${card.upright.desc}</div>
          <div style="margin-top: 3px;"><strong style="color: #fda4af;">↓ Reversed:</strong> ${card.reversed.desc}</div>
        </div>
        <div style="font-size: 0.73rem; color: #fde68a; border-top: 1px solid rgba(148,163,184,0.18); padding-top: 6px;">
          <strong>🔮 Oracle Meaning:</strong> ${card.upright.readingMeaning}
        </div>
        <div class="muted-text" style="font-size: 0.7rem;">
          Source: ${sourceLabel}
        </div>
      `;
      grid.appendChild(item);
    });
  }

  // ===========================================================================
  // VIEW 4: TAROT CARD READING SANCTUM (ENDGAME DIVINATION ENGINE)
  // ===========================================================================
  unlockAllCardsAndReading(reasonMsg = "Unlocked all 22 Major Arcana!") {
    this.unlockedCardIds = MAJOR_ARCANA.map((c) => c.id);
    this.readingUnlocked = true;
    const questPath = this.getActiveQuestPath();
    this.completedQuests = questPath.quests.map((q) => q.questId);
    this.saveState();
    this.logCombat(`🗝️ ${reasonMsg}`);
    this.renderAllViews();
  }

  activateSupporterPass() {
    this.isSupporterPro = true;
    localStorage.setItem("arcana_pro_pass", "true");
    document.getElementById("pro-modal")?.classList.add("hidden");
    this.unlockAllCardsAndReading("💎 Supporter Foil Pass Activated! All 22 Cards & Reading Sanctum Unlocked!");
  }

  renderReadingView() {
    const lockedPanel = document.getElementById("reading-locked-panel");
    const sanctumContent = document.getElementById("reading-sanctum-content");
    const unlockStatus = document.getElementById("reading-unlock-status");

    if (!this.readingUnlocked) {
      lockedPanel?.classList.remove("hidden");
      sanctumContent?.classList.add("hidden");
      if (unlockStatus) {
        unlockStatus.textContent = `Current Progress: ${Math.min(4, this.completedQuests.length)} / 4 Quests Completed • ${this.unlockedCardIds.length} / 22 Major Arcana Unlocked`;
      }
      return;
    }

    lockedPanel?.classList.add("hidden");
    sanctumContent?.classList.remove("hidden");

    this.renderReadingStage();
    this.renderReadingJournal();
  }

  dealTarotSpread() {
    const spreadSelect = document.getElementById("reading-spread-select");
    const questionInput = document.getElementById("reading-question-input");

    this.currentSpreadKey = spreadSelect ? spreadSelect.value : "three_card";
    this.currentReadingQuestion =
      questionInput && questionInput.value.trim().length > 0
        ? questionInput.value.trim()
        : "What unseen truth guides my path across the threshold?";

    const spreadDef = TAROT_SPREADS[this.currentSpreadKey] || TAROT_SPREADS.three_card;

    // Shuffle all 22 Major Arcana and deal unique cards for each spread position
    const pool = [...MAJOR_ARCANA];
    this.shuffle(pool);

    this.drawnReadingCards = spreadDef.positions.map((pos, idx) => {
      const card = pool[idx];
      return {
        positionIndex: idx,
        positionTitle: pos.title,
        positionPrompt: pos.prompt,
        card,
        isReversed: Math.random() < 0.38,
        revealed: false,
      };
    });

    this.renderReadingStage();
  }

  revealAllReadingCards() {
    if (this.drawnReadingCards.length === 0) {
      this.dealTarotSpread();
    }
    this.drawnReadingCards.forEach((slot) => {
      slot.revealed = true;
    });
    this.renderReadingStage();
  }

  renderReadingStage() {
    const stageEl = document.getElementById("reading-spread-stage");
    const synthEl = document.getElementById("reading-synthesis-panel");
    if (!stageEl || !synthEl) return;

    const profile = this.getDeckCoverProfile();

    if (this.drawnReadingCards.length === 0) {
      stageEl.innerHTML = `
        <div class="panel-card" style="grid-column: 1 / -1; text-align: center; padding: 28px;">
          <img src="${profile.coverImage}" alt="${profile.title}" style="width: 120px; border-radius: 10px; border: 2px solid #fbbf24; margin-bottom: 10px;" />
          <h3 style="margin: 4px 0;">Your ${profile.title} Awaits</h3>
          <p class="muted-text" style="max-width: 520px; margin: 4px auto 0;">
            Select a 1-Card, 3-Card, or 5-Card spread above and click <strong>"🃏 Shuffle &amp; Deal Tarot Spread"</strong> to lay out your soul-forged cards.
          </p>
        </div>
      `;
      synthEl.classList.add("hidden");
      return;
    }

    stageEl.innerHTML = "";
    this.drawnReadingCards.forEach((slot, idx) => {
      const slotEl = document.createElement("div");
      slotEl.className = "spread-slot";

      if (!slot.revealed) {
        slotEl.innerHTML = `
          <div>
            <div class="spread-position-title">${slot.positionTitle}</div>
            <div class="spread-position-prompt">${slot.positionPrompt}</div>
            <div class="card-back-Button" title="Click to flip and reveal this Tarot card">
              <img src="${profile.coverImage}" alt="Face Down Tarot Card" />
            </div>
          </div>
          <button class="btn-primary" style="width: 100%; margin-top: 10px;">
            👁️ Flip Card ${idx + 1}
          </button>
        `;
        slotEl.querySelector(".card-back-Button")?.addEventListener("click", () => {
          slot.revealed = true;
          this.renderReadingStage();
        });
        slotEl.querySelector("button")?.addEventListener("click", () => {
          slot.revealed = true;
          this.renderReadingStage();
        });
      } else {
        const card = slot.card;
        const mode = slot.isReversed ? card.reversed : card.upright;
        const artSrc = this.getCardArtPath(card.id, profile.artStyle);

        slotEl.innerHTML = `
          <div>
            <div class="spread-position-title">${slot.positionTitle}</div>
            <div class="spread-position-prompt">${slot.positionPrompt}</div>
            <div style="font-weight: 800; font-size: 1rem; margin-bottom: 4px;">
              ${card.numeral} • ${card.name}
            </div>
            <div class="orientation-badge ${slot.isReversed ? "badge-reversed" : "badge-upright"}">
              ${slot.isReversed ? "↓ REVERSED ORIENTATION" : "↑ UPRIGHT ORIENTATION"}
            </div>
            <div class="card-art-wrap" style="height: 250px;">
              <img
                src="${artSrc}"
                alt="${card.name}"
                class="${slot.isReversed ? "img-reversed" : ""}"
              />
            </div>
            <div class="meaning-box">
              <strong>Oracle Interpretation:</strong> ${mode.readingMeaning}
            </div>
          </div>
        `;
      }

      stageEl.appendChild(slotEl);
    });

    // Check if all cards in the spread are revealed -> synthesize reading
    const allRevealed = this.drawnReadingCards.every((s) => s.revealed);
    if (allRevealed) {
      synthEl.classList.remove("hidden");
      const synthesisText = this.buildHolisticOracleSynthesis();
      synthEl.innerHTML = `
        <div class="section-eyebrow">HOLISTIC ORACLE SYNTHESIS • ${profile.title.toUpperCase()}</div>
        <h3 style="margin: 4px 0 8px; color: #fde68a;">🔮 "${this.currentReadingQuestion}"</h3>
        <p style="margin: 0 0 12px; line-height: 1.55; color: #f1f5f9; font-size: 0.92rem;">
          ${synthesisText}
        </p>
        <button id="btn-save-reading" class="btn-primary">
          📜 Record Reading in Saved Chronicle
        </button>
      `;
      synthEl.querySelector("#btn-save-reading")?.addEventListener("click", () => {
        this.saveCurrentReading(synthesisText);
      });
    } else {
      synthEl.classList.add("hidden");
    }
  }

  buildHolisticOracleSynthesis() {
    const profile = this.getDeckCoverProfile();
    const uprightCount = this.drawnReadingCards.filter((s) => !s.isReversed).length;
    const revCount = this.drawnReadingCards.length - uprightCount;

    const toneIntro =
      profile.artStyle === "goth"
        ? `Through the obsidian mirror of ${profile.title}, the shadows speak without compromise:`
        : profile.artStyle === "holy"
        ? `Bathed in the cathedral light of ${profile.title}, the seraphic choir reveals:`
        : `Balanced upon the astral fulcrum of ${profile.title}, dusk and dawn converge:`;

    const cardSummaries = this.drawnReadingCards
      .map((s) => {
        const mode = s.isReversed ? s.card.reversed : s.card.upright;
        return `In <strong>${s.positionTitle}</strong>, <em>${s.card.numeral} ${s.card.name} (${
          s.isReversed ? "Reversed" : "Upright"
        })</em> counsels: ${mode.readingMeaning}`;
      })
      .join(" ");

    const polarityAdvice =
      revCount > uprightCount
        ? `With ${revCount} Reversed Arcana present, hidden currents and internal thresholds demand your honest reckoning before outward action.`
        : `With ${uprightCount} Upright Arcana aligned, clear momentum and sovereign willpower favor decisive movement along your chosen path.`;

    return `${toneIntro} ${cardSummaries} ${polarityAdvice}`;
  }

  saveCurrentReading(synthesisText) {
    const profile = this.getDeckCoverProfile();
    const spreadDef = TAROT_SPREADS[this.currentSpreadKey] || TAROT_SPREADS.three_card;
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      deckTitle: profile.title,
      artStyle: profile.artStyle,
      spreadName: spreadDef.name,
      question: this.currentReadingQuestion,
      cards: this.drawnReadingCards.map(
        (s) => `${s.positionTitle}: ${s.card.numeral} ${s.card.name} (${s.isReversed ? "Rev" : "Up"})`
      ),
      synthesis: synthesisText.replace(/<[^>]+>/g, ""),
    };
    this.savedReadings.unshift(entry);
    this.saveState();
    this.renderReadingJournal();
  }

  renderReadingJournal() {
    const listEl = document.getElementById("reading-journal-list");
    if (!listEl) return;

    if (this.savedReadings.length === 0) {
      listEl.innerHTML = `
        <div class="muted-text" style="font-size: 0.82rem;">
          No readings recorded yet. Reveal all cards in a spread above and click "📜 Record Reading in Saved Chronicle".
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.savedReadings
      .map(
        (r) => `
        <div class="journal-entry">
          <div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
            <strong style="color: #fde68a;">🔮 "${r.question}"</strong>
            <span class="muted-text" style="font-size: 0.74rem;">${r.date} • ${r.deckTitle} (${r.artStyle.toUpperCase()})</span>
          </div>
          <div style="font-size: 0.78rem; color: #c4b5fd; margin: 4px 0;">
            ${r.cards.join("  |  ")}
          </div>
          <div style="font-size: 0.8rem; color: #e2e8f0; line-height: 1.4;">
            ${r.synthesis}
          </div>
        </div>
      `
      )
      .join("");
  }
}

function bootArcanaTactics() {
  if (!window.arcanaGame) {
    window.arcanaGame = new ArcanaTacticsGame();
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootArcanaTactics);
} else {
  bootArcanaTactics();
}
