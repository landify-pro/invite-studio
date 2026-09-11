(() => {
  "use strict";

  const MARKET_SIZE = 880000;
  const PARTNER_SHARE = 0.4;
  const state = { orders: 150, price: 15000, cost: 2000 };
  const resultPanel = document.querySelector(".calculator-result");
  const integer = new Intl.NumberFormat("ru-RU");

  const formatMoney = (value) => {
    if (value >= 1_000_000_000) return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000_000)} млрд ₽`;
    if (value >= 1_000_000) return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000)} млн ₽`;
    return `${integer.format(value)} ₽`;
  };

  const formatShare = (orders) => {
    const share = orders / MARKET_SIZE * 100;
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: share < 0.1 ? 3 : 1 }).format(share)}%`;
  };

  const scenarioLabels = {
    150: "10 партнёров × 15 свадеб",
    500: "Рабочий масштаб · 500 свадеб",
    880: "0,1% рынка России",
    8800: "1% рынка России",
  };

  function selectButton(control, selected) {
    document.querySelectorAll(`[data-control="${control}"] button`).forEach((button) => {
      const active = button.dataset.value === String(selected);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateCalculator(animate = true) {
    const revenue = state.orders * state.price;
    const costs = state.orders * state.cost;
    const net = Math.max(0, revenue - costs);
    const partner = Math.round(net * PARTNER_SHARE);

    document.querySelector("#scenarioLabel").textContent = scenarioLabels[state.orders] || `${integer.format(state.orders)} заказов`;
    document.querySelector("#partnerResult").textContent = formatMoney(partner);
    document.querySelector("#revenueResult").textContent = formatMoney(revenue);
    document.querySelector("#costResult").textContent = formatMoney(costs);
    document.querySelector("#netResult").textContent = formatMoney(net);
    document.querySelector("#marketShareResult").textContent = formatShare(state.orders);

    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      resultPanel.classList.remove("is-updating");
      requestAnimationFrame(() => resultPanel.classList.add("is-updating"));
    }
  }

  document.querySelectorAll("[data-control] button").forEach((button) => {
    button.addEventListener("click", () => {
      const control = button.parentElement.dataset.control;
      state[control] = Number(button.dataset.value);
      selectButton(control, state[control]);
      updateCalculator();
    });
  });

  resultPanel.addEventListener("animationend", () => resultPanel.classList.remove("is-updating"));
  updateCalculator(false);
})();
