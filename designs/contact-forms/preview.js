(() => {
  'use strict';
  const variants = [
    { id: 'ciste-sklo', name: 'Čisté sklo', description: 'Nejklidnější varianta. Jedna skleněná karta, tři pole a jasné odeslání. Nejblíž současnému webu.' },
    { id: 'osobni-dialog', name: 'Osobní dialog', description: 'Portrét staví Martina do centra kontaktu. Osobnější a výraznější sekce s tmavým sklem.' },
    { id: 'dopis-martinovi', name: 'Dopis Martinovi', description: 'Známý princip aplikace Mail. Příjemce je vidět od začátku a psaní zprávy působí přirozeně.' },
    { id: 'krok-za-krokem', name: 'Krok za krokem', description: 'Nejdřív téma, potom zpráva a kontakt. Méně polí najednou, ale více kroků k odeslání.' },
    { id: 'nocni-sklo', name: 'Noční sklo', description: 'Výrazné tmavé sklo a živý náhled dopisu. Uživatel průběžně vidí, co Martinovi posílá.' },
  ];
  const all = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const canvas = document.getElementById('preview-canvas');
  const dialog = document.getElementById('demo-dialog');
  let current = 0;
  let step = 0;
  let lastSubmit = null;
  const initial = new URL(location.href).searchParams.get('navrh');
  const found = variants.findIndex(variant => variant.id === initial);
  if (found >= 0) current = found;

  function show(index, updateUrl = true) {
    current = (index + variants.length) % variants.length;
    const variant = variants[current];
    all('[data-variant]').forEach(node => { node.hidden = node.dataset.variant !== variant.id; });
    all('[data-show]').forEach(button => {
      if (button.dataset.show === variant.id) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('variant-name').textContent = variant.name;
    document.getElementById('variant-description').textContent = variant.description;
    document.getElementById('description-index').textContent = String(current + 1).padStart(2, '0') + ' / 05';
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('navrh', variant.id);
      try { history.replaceState(null, '', url); } catch { /* The file preview still works without a URL update. */ }
    }
    document.title = variant.name + ' — návrhy kontaktu Martina Kostrhuna';
  }
  all('[data-show]').forEach(button => button.addEventListener('click', () => show(variants.findIndex(v => v.id === button.dataset.show))));
  document.getElementById('previous').addEventListener('click', () => show(current - 1));
  document.getElementById('next').addEventListener('click', () => show(current + 1));
  all('.device-control button').forEach(button => button.addEventListener('click', () => {
    canvas.dataset.device = button.dataset.device;
    all('.device-control button').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
  }));

  function validate(form, parent = form) {
    const error = form.querySelector('.form-error');
    error.hidden = true;
    const inputs = all('input:not([type=radio]),textarea,select', parent);
    for (const input of inputs) {
      input.removeAttribute('aria-invalid');
      const value = input.value.trim();
      let message = '';
      if (input.required && !value) message = input.name === 'message' ? 'Napište prosím pár slov o tom, co chcete probrat.' : 'Vyplňte prosím toto pole.';
      else if (input.name === 'name' && value.length < 2) message = 'Napište prosím své jméno (alespoň 2 znaky).';
      else if (input.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Zadejte prosím platný e-mail, na který může Martin odpovědět.';
      else if (input.name === 'message' && value.length < 10) message = 'Přidejte prosím trochu podrobností (alespoň 10 znaků).';
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', error.id);
        error.textContent = message;
        error.hidden = false;
        input.focus();
        return false;
      }
    }
    return true;
  }

  const stepForm = document.querySelector('[data-form=steps]');
  function renderStep(focus = true) {
    all('[data-step]', stepForm).forEach(node => { node.hidden = Number(node.dataset.step) !== step; });
    all('.step-progress>span', stepForm).forEach((node, i) => {
      node.classList.toggle('active', i <= step);
      if (i === step) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    });
    stepForm.querySelector('[data-step-back]').disabled = step === 0;
    stepForm.querySelector('[data-step-next]').hidden = step === 2;
    stepForm.querySelector('[data-step-send]').hidden = step !== 2;
    stepForm.querySelector('[data-step-topic]').textContent = stepForm.elements.topic.value;
    stepForm.querySelector('[data-step-summary]').textContent = stepForm.elements.message.value.trim();
    stepForm.querySelector('.form-error').hidden = true;
    if (focus) {
      const heading = stepForm.querySelector('[data-step="' + step + '"] h3');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  stepForm.querySelector('[data-step-next]').addEventListener('click', () => {
    if (validate(stepForm, stepForm.querySelector('[data-step="' + step + '"]'))) { step++; renderStep(); }
  });
  stepForm.querySelector('[data-step-back]').addEventListener('click', () => { step = Math.max(0, step - 1); renderStep(); });

  const liveForm = document.querySelector('[data-form=nocturne]');
  function updateLetter() {
    const name = liveForm.elements.name.value.trim();
    const email = liveForm.elements.email.value.trim();
    const message = liveForm.elements.message.value.trim();
    document.querySelector('[data-letter-name]').textContent = name || 'Vaše jméno';
    document.querySelector('[data-letter-email]').textContent = email || 'vas@email.cz';
    document.querySelector('[data-letter-subject]').textContent = liveForm.elements.subject.value;
    const letter = document.querySelector('[data-letter-message]');
    letter.textContent = message || 'Tady uvidíte zprávu tak, jak ji Martin obdrží.';
    letter.classList.toggle('is-placeholder', !message);
    document.querySelector('[data-character-count]').textContent = liveForm.elements.message.value.length.toLocaleString('cs-CZ');
  }
  liveForm.addEventListener('input', updateLetter);
  liveForm.addEventListener('change', updateLetter);

  all('form').forEach((form, index) => {
    form.querySelector('.form-error').id = 'form-error-' + index;
    form.addEventListener('input', event => {
      event.target.removeAttribute('aria-invalid');
      event.target.removeAttribute('aria-describedby');
      form.querySelector('.form-error').hidden = true;
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (form === stepForm && step < 2) {
        if (validate(form, form.querySelector('[data-step="' + step + '"]'))) { step++; renderStep(); }
        return;
      }
      if (!validate(form)) return;
      const button = form.querySelector('button[type=submit]');
      if (button.disabled) return;
      lastSubmit = button;
      const label = button.innerHTML;
      button.disabled = true;
      button.textContent = 'Připravuji zprávu…';
      window.setTimeout(() => {
        button.disabled = false;
        button.innerHTML = label;
        dialog.showModal();
        dialog.querySelector('.dialog-done').focus();
      }, 500);
    });
  });
  function closeDialog() { dialog.close(); lastSubmit?.focus(); }
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.querySelector('.dialog-done').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog();
    }
  });

  document.getElementById('fill-sample').addEventListener('click', () => {
    const form = document.querySelector('[data-variant="' + variants[current].id + '"] form');
    form.elements.name.value = 'Alex Novák';
    form.elements.email.value = 'alex@example.com';
    form.elements.message.value = 'Dobrý den, Martine,\nrád bych si udělal jasný plán pro své finance a probral možnosti financování prvního bydlení. Můžeme se spojit?\nDěkuji, Alex.';
    if (form.dataset.form === 'mail') form.elements.subject.value = 'Finanční plán a první bydlení';
    if (form === liveForm) { form.elements.subject.value = 'Finanční plán'; updateLetter(); }
    if (form === stepForm) { step = 2; renderStep(false); }
    form.querySelector('.form-error').hidden = true;
    all('[aria-invalid]', form).forEach(input => input.removeAttribute('aria-invalid'));
  });
  document.addEventListener('keydown', event => {
    if (dialog.open || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (event.altKey && event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.altKey && event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
  });
  show(current, false);
  renderStep(false);
  updateLetter();
})();
