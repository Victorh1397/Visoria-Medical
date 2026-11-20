/**
 * Mejora progresiva del formulario de demo (spec 004 R7, R8, R11).
 * - Mide el tiempo hasta el envío (señal antibots, R5).
 * - Valida con la API nativa y pinta los mensajes en español junto a cada campo.
 * - Envía con fetch y anuncia el resultado en la región aria-live, sin recargar ni mover el foco.
 */
import { FIELD, LIMITS, MESSAGES, type UserField } from '../../worker/fields';

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

type ApiResponse = { ok: true } | { ok: false; error: string; fields?: Partial<Record<UserField, string>> };

const form = document.querySelector<HTMLFormElement>('[data-demo-form]');

if (form) {
  const loadedAt = performance.now();
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const elapsed = form.querySelector<HTMLInputElement>('[data-elapsed]')!;
  const msg = form.dataset;
  // No se usa `disabled`: deshabilitar el botón enfocado hace que el navegador mueva el foco (R7).
  let busy = false;

  // Con JS mostramos nuestros mensajes; sin JS actúan los del navegador.
  form.noValidate = true;

  const controls = () =>
    Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')).filter(
      (el) => el.name && el.type !== 'hidden' && el.name !== FIELD.honeypot,
    );

  const setError = (name: string, text: string) => {
    const box = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    const control = form.querySelector<HTMLElement>(`[name="${name}"]`);
    if (box) box.textContent = text;
    if (control) control.setAttribute('aria-invalid', text ? 'true' : 'false');
  };

  const messageFor = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string => {
    const v = el.validity;
    if (el.name === FIELD.privacy) return MESSAGES.privacy;
    if (v.valueMissing) return el instanceof HTMLSelectElement ? MESSAGES.choice : MESSAGES.required;
    if (v.typeMismatch && el.name === FIELD.email) return MESSAGES.email;
    if (v.patternMismatch && el.name === FIELD.phone) return MESSAGES.phone;
    if (v.tooShort) {
      const min = el.name === FIELD.name ? LIMITS.name.min : LIMITS.institution.min;
      return MESSAGES.tooShort(min);
    }
    if (v.tooLong) return MESSAGES.tooLong(Number(el.getAttribute('maxlength')));
    return MESSAGES.required;
  };

  const say = (text: string, tone: 'info' | 'error' | 'ok' = 'info') => {
    status.dataset.tone = tone;
    status.textContent = text;
  };

  const withContact = (text: string) =>
    msg.contactEmail ? `${text} También puede escribirnos a ${msg.contactEmail}.` : text;

  // Limpia el error de un campo en cuanto pasa a ser válido.
  form.addEventListener('input', (event) => {
    const el = event.target as HTMLInputElement;
    if (el.name && el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) setError(el.name, '');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;

    const invalid = controls().filter((el) => !el.checkValidity());
    controls().forEach((el) => setError(el.name, ''));
    if (invalid.length) {
      invalid.forEach((el) => setError(el.name, messageFor(el)));
      invalid[0].focus();
      say('Revise los campos marcados.', 'error');
      return;
    }

    const data = new FormData(form);
    if (!data.get(FIELD.turnstile)) {
      say('Espere a que termine la verificación antispam e inténtelo de nuevo.', 'error');
      return;
    }

    elapsed.value = String(Math.round(performance.now() - loadedAt));
    data.set(FIELD.elapsed, elapsed.value);

    busy = true;
    submit.setAttribute('aria-disabled', 'true');
    say('Enviando…');

    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { accept: 'application/json' } });
      const body = (await res.json()) as ApiResponse;

      if (body.ok) {
        form.reset();
        say(msg.msgSuccess ?? '', 'ok');
        // Conversión (spec 006 R6): la URL pasa a /demo/gracias sin recargar; Web Analytics en modo SPA la
        // cuenta como página vista.
        history.pushState(null, '', '/demo/gracias');
      } else if (body.error === 'invalid' && body.fields) {
        for (const [name, text] of Object.entries(body.fields)) setError(name, text ?? '');
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        say('Revise los campos marcados.', 'error');
      } else if (body.error === 'send_failed') {
        // R8: se conserva lo escrito.
        say(withContact(msg.msgSendFailed ?? ''), 'error');
      } else {
        say(withContact(msg.msgRejected ?? ''), 'error');
      }
    } catch {
      say(withContact(msg.msgSendFailed ?? ''), 'error');
    } finally {
      busy = false;
      submit.removeAttribute('aria-disabled');
      // Los tokens de Turnstile son de un solo uso.
      window.turnstile?.reset();
    }
  });
}
