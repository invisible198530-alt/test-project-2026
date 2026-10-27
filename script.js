/* Закрытая область видимости: не добавляем переменные в window. */
(() => {
  'use strict';
  const plans = {
    1: { name: 'Знакомство', count: 1, label: '1 занятие', price: 1000 },
    4: { name: 'Баланс', count: 4, label: '4 занятия', price: 3990 },
    8: { name: 'Гармония', count: 8, label: '8 занятий', price: 7490 }
  };
  const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  // Поддерживаем несколько независимых блоков T123 на одной странице.
  document.querySelectorAll('.yoga-cost').forEach(root => {
    if (root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';
    const find = selector => root.querySelector(selector);
    const inputs = root.querySelectorAll('input[type="radio"]');
    // Уникальное имя группы не даёт радиокнопкам разных блоков влиять друг на друга.
    const group = 'yoga-plan-' + Math.random().toString(36).slice(2);
    inputs.forEach(input => { input.name = group; });
    let selected;
    let animation;
    const render = () => {
      selected = plans[find('input:checked').value];
      const base = selected.count * plans[1].price;
      const saving = base - selected.price;
      find('[data-selected]').textContent = selected.name + ' · ' + selected.label;
      find('[data-total]').textContent = money(selected.price);
      find('[data-breakdown]').textContent = selected.label + ' × ' + money(plans[1].price);
      find('[data-base]').textContent = money(base);
      find('[data-discount]').textContent = money(saving);
      find('[data-discount-row]').hidden = saving === 0;
      find('.yc-message').hidden = true;
      // Сумма меняется сразу; анимация только мягко подчёркивает обновление.
      const total = find('[data-total]');
      if (animation) animation.cancel();
      if (typeof total.animate === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animation = total.animate([{ opacity: 0.35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
      }
    };
    inputs.forEach(input => input.addEventListener('change', render));
    // Демонстрационная запись: показываем выбор, не отправляя данные.
    find('.yc-submit').addEventListener('click', () => {
      const message = find('.yc-message');
      message.textContent = 'Вы выбрали «' + selected.name + '»: ' + selected.label + ' за ' + money(selected.price) + '. Это демонстрация — заявка пока не отправляется.';
      message.hidden = false;
    });
    render();
  });
})();
