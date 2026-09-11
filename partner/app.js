(() => {
  "use strict";

  const markets = {
    top3: { size: 148759, label: "Топ-3 города" },
    russia: { size: 880000, label: "Россия" },
  };
  const shares = [0.1, 1, 10];
  const prices = [10000, 15000, 20000];
  const TABLE_COST = 2000;
  const PARTNER_SHARE = 0.4;
  const state = { market: "russia", share: 0.1, price: 15000, cost: 2000 };
  const integer = new Intl.NumberFormat("ru-RU");
  const resultPanel = document.querySelector(".calculator-result");

  const formatMoney = (value) => {
    if (value >= 1_000_000_000) return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000_000)} млрд ₽`;
    if (value >= 1_000_000) return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000)} млн ₽`;
    return `${integer.format(value)} ₽`;
  };

  const ordersFor = (marketSize, share) => Math.round(marketSize * share / 100);
  const partnerIncome = (orders, price, cost) => Math.round(Math.max(0, orders * (price - cost)) * PARTNER_SHARE);

  function renderTable(target, marketSize) {
    document.querySelector(target).innerHTML = shares.map((share) => {
      const orders = ordersFor(marketSize, share);
      const cells = prices.map((price) => {
        const revenue = orders * price;
        const partner = partnerIncome(orders, price, TABLE_COST);
        return `<td><strong>${formatMoney(revenue)}</strong><small>${formatMoney(partner)} тебе</small></td>`;
      }).join("");
      return `<tr><td><strong>${String(share).replace(".", ",")}%</strong></td><td>${integer.format(orders)}</td>${cells}</tr>`;
    }).join("");
  }

  function selectButton(control, selected) {
    document.querySelectorAll(`[data-control="${control}"] button`).forEach((button) => {
      const active = button.dataset.value === String(selected);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateCalculator(animate = true) {
    const market = markets[state.market];
    const orders = ordersFor(market.size, state.share);
    const revenue = orders * state.price;
    const costs = orders * state.cost;
    const net = Math.max(0, revenue - costs);
    const partner = Math.round(net * PARTNER_SHARE);

    document.querySelector("#scenarioLabel").textContent = `${market.label} · ${String(state.share).replace(".", ",")}% рынка · ${integer.format(orders)} заказов`;
    document.querySelector("#partnerResult").textContent = formatMoney(partner);
    document.querySelector("#revenueResult").textContent = formatMoney(revenue);
    document.querySelector("#costResult").textContent = formatMoney(costs);
    document.querySelector("#netResult").textContent = formatMoney(net);

    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      resultPanel.classList.remove("is-updating");
      requestAnimationFrame(() => resultPanel.classList.add("is-updating"));
    }
  }

  document.querySelectorAll("[data-control] button").forEach((button) => {
    button.addEventListener("click", () => {
      const control = button.parentElement.dataset.control;
      state[control] = control === "market" ? button.dataset.value : Number(button.dataset.value);
      selectButton(control, state[control]);
      updateCalculator();
    });
  });

  resultPanel.addEventListener("animationend", () => resultPanel.classList.remove("is-updating"));
  renderTable("#top3Table", markets.top3.size);
  renderTable("#russiaTable", markets.russia.size);
  updateCalculator(false);
})();
