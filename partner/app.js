(() => {
  "use strict";

  const markets = {
    top3: 148759,
    russia: 880000,
  };
  const prices = [10000, 15000, 20000];
  const shares = [0.1, 1, 10];
  const state = { market: "top3", share: 0.1, price: 15000 };

  const formatInteger = new Intl.NumberFormat("ru-RU");
  const formatMoney = (value) => {
    if (value >= 1_000_000_000) {
      return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000_000)} млрд ₽`;
    }
    if (value >= 1_000_000) {
      return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000)} млн ₽`;
    }
    return `${formatInteger.format(value)} ₽`;
  };

  const ordersFor = (marketSize, share) => Math.round(marketSize * share / 100);

  function updateCalculator() {
    const orders = ordersFor(markets[state.market], state.share);
    const revenue = orders * state.price;
    document.querySelector("#revenueResult").textContent = formatMoney(revenue);
    document.querySelector("#ordersResult").textContent = formatInteger.format(orders);
    document.querySelector("#monthlyResult").textContent = `≈${formatInteger.format(Math.max(1, Math.round(orders / 12)))}`;
  }

  function selectButton(control, selected) {
    document.querySelectorAll(`[data-control="${control}"] button`).forEach((button) => {
      const active = button.dataset.value === String(selected);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
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

  function renderMatrix(target, marketSize) {
    const body = document.querySelector(target);
    body.innerHTML = shares.map((share) => {
      const orders = ordersFor(marketSize, share);
      const cells = prices.map((price) => `<td>${formatMoney(orders * price)}</td>`).join("");
      return `<tr><td><strong>${String(share).replace(".", ",")}%</strong><small>${formatInteger.format(orders)} заказов</small></td>${cells}</tr>`;
    }).join("");
  }

  renderMatrix("#top3Table", markets.top3);
  renderMatrix("#russiaTable", markets.russia);
  updateCalculator();
})();
