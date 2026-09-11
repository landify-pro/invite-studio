(() => {
  "use strict";

  const markets = {
    top3: { size: 148759, label: "Топ-3 города" },
    russia: { size: 880000, label: "Россия" },
  };
  const state = { market: "russia", share: 0.1, price: 15000, cost: 2000 };
  const formatInteger = new Intl.NumberFormat("ru-RU");
  const resultPanel = document.querySelector(".calculator-results");

  const formatMoney = (value) => {
    if (value >= 1_000_000_000) {
      return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000_000)} млрд ₽`;
    }
    if (value >= 1_000_000) {
      return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000)} млн ₽`;
    }
    return `${formatInteger.format(value)} ₽`;
  };

  const ordersFor = () => Math.round(markets[state.market].size * state.share / 100);

  function selectButton(control, selected) {
    document.querySelectorAll(`[data-control="${control}"] button`).forEach((button) => {
      const active = button.dataset.value === String(selected);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateCalculator(animate = true) {
    const orders = ordersFor();
    const revenue = orders * state.price;
    const costs = orders * state.cost;
    const net = Math.max(0, revenue - costs);
    const partner = Math.round(net * 0.4);
    const studio = net - partner;

    document.querySelector("#scenarioLabel").textContent = `${markets[state.market].label} · ${String(state.share).replace(".", ",")}% рынка`;
    document.querySelector("#ordersResult").textContent = formatInteger.format(orders);
    document.querySelector("#monthlyResult").textContent = `≈${formatInteger.format(Math.max(1, Math.round(orders / 12)))}`;
    document.querySelector("#revenueResult").textContent = formatMoney(revenue);
    document.querySelector("#costResult").textContent = formatMoney(costs);
    document.querySelector("#netResult").textContent = formatMoney(net);
    document.querySelector("#partnerResult").textContent = formatMoney(partner);
    document.querySelector("#studioResult").textContent = formatMoney(studio);
    document.querySelector("#partnerMonthly").textContent = `≈${formatMoney(Math.round(partner / 12))} в месяц`;
    document.querySelector("#studioMonthly").textContent = `≈${formatMoney(Math.round(studio / 12))} в месяц`;

    document.querySelectorAll("[data-share-jump]").forEach((card) => {
      card.classList.toggle("active", Number(card.dataset.shareJump) === state.share);
    });

    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      resultPanel.classList.remove("is-updating");
      requestAnimationFrame(() => resultPanel.classList.add("is-updating"));
    }
  }

  document.querySelectorAll("[data-control] button").forEach((button) => {
    button.addEventListener("click", () => {
      const control = button.parentElement.dataset.control;
      const value = button.dataset.value;
      state[control] = control === "market" ? value : Number(value);
      selectButton(control, state[control]);
      updateCalculator();
    });
  });

  document.querySelectorAll("[data-share-jump]").forEach((card) => {
    card.addEventListener("click", () => {
      state.market = "russia";
      state.share = Number(card.dataset.shareJump);
      selectButton("market", state.market);
      selectButton("share", state.share);
      updateCalculator();
      document.querySelector("#calculator").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  });

  resultPanel.addEventListener("animationend", () => resultPanel.classList.remove("is-updating"));
  updateCalculator(false);
})();
