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
    let pendingScroll = false;
    // Привязка только к согласованному блоку: другие формы не затрагиваются.
    const fieldSelector = '#rec5252905801 input[name="selected_plan"]';
    const syncForm = () => {
      if (!selected) return false;
      const block = document.getElementById('rec5252905801');
      const field = document.querySelector(fieldSelector);
      const form = field && field.closest('form');
      if (!block || !field || field.type !== 'hidden' || !form || !block.contains(form)) return false;
      const value = selected.name + ' · ' + selected.label + ' · ' + money(selected.price);
      // Проверка значения предотвращает повторные события и циклы MutationObserver.
      if (field.value !== value) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (pendingScroll) {
        pendingScroll = false;
        find('.yc-message').hidden = true;
        if (typeof block.scrollIntoView === 'function') {
          const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          block.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }
      return true;
    };
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
      syncForm();
      // Сумма меняется сразу; анимация только мягко подчёркивает обновление.
      const total = find('[data-total]');
      if (animation) animation.cancel();
      if (typeof total.animate === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animation = total.animate([{ opacity: 0.35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
      }
    };
    inputs.forEach(input => input.addEventListener('change', render));
    // Кнопка заполняет штатное поле и прокручивает к форме, но не отправляет её.
    find('.yc-submit').addEventListener('click', () => {
      pendingScroll = true;
      if (!syncForm()) {
        const message = find('.yc-message');
        message.textContent = 'Форма записи пока недоступна. Попробуйте ещё раз чуть позже.';
        message.hidden = false;
      }
    });
    // Tilda может добавить или переинициализировать поле после блока T123.
    // Наблюдатель использует актуальный тариф и повторно находит поле при замене DOM.
    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(() => { syncForm(); });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id', 'name', 'type', 'value']
      });
    }
    document.addEventListener('DOMContentLoaded', syncForm, { once: true });
    render();
  });
})();
