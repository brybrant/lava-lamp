import { Horizontal } from '@brybrant/fade-scroll';

import { siGithub } from 'simple-icons';

import { append, createElement, createSVG } from './dom.ts';
import { Color } from './color.ts';
import { canvas } from './gl.ts';

type Palette = {
  Lava: Color;
  Fog: Color;
};

const PALETTES = {
  Cherry: {
    Lava: new Color([1.2, -0.2, 0.0]),
    Fog: new Color([0.3, 0.1, 0.25]),
  },
  Coffee: {
    Lava: new Color([0.6, 0.4, 0.2]),
    Fog: new Color([0.25, 0.15, 0.05]),
  },
  Mango: {
    Lava: new Color([2.0, 0.8, -0.6]),
    Fog: new Color([0.4, 0.1, 0.4]),
  },
  Lemon: {
    Lava: new Color([1.3, 1.1, -0.4]),
    Fog: new Color([0.2, 0.3, 0.1]),
  },
  Lime: {
    Lava: new Color([0.3, 1.2, -0.4]),
    Fog: new Color([0.0, 0.2, 0.5]),
  },
  Berry: {
    Lava: new Color([-0.2, 0.8, 2.0]),
    Fog: new Color([0.45, 0.05, 0.3]),
  },
  Grape: {
    Lava: new Color([1.0, 0.3, 2.0]),
    Fog: new Color([0.25, 0.0, 0.4]),
  },
  Pitaya: {
    Lava: new Color([1.3, -0.2, 0.5]),
    Fog: new Color([0.1, 0.3, 0.1]),
  },
} as const satisfies Record<string, Palette>;

const STORAGE_KEY = 'Palette';

type PaletteName = keyof typeof PALETTES;

const isPaletteName = (value: string | null): value is PaletteName => {
  return value !== null && Object.hasOwn(PALETTES, value);
};

const storedPalette = localStorage.getItem(STORAGE_KEY);

const initialPalette: PaletteName = isPaletteName(storedPalette)
  ? storedPalette
  : 'Mango';

localStorage.setItem(STORAGE_KEY, initialPalette);

export const currentLava = new Color(PALETTES[initialPalette].Lava);
export const currentFog = new Color(PALETTES[initialPalette].Fog);
export const targetLava = new Color(currentLava);
export const targetFog = new Color(currentFog);

const controlsPanel = append(
  createElement('div', {
    ariaLabel: 'Color palette',
    className: 'controls__panel',
    id: 'controls',
    inert: true,
    role: 'radiogroup',
  }),
  (Object.keys(PALETTES) as PaletteName[]).map((palette) => {
    const { Lava, Fog } = PALETTES[palette];

    const paletteInput = createElement('input', {
      id: `palette-${palette.toLowerCase()}`,
      type: 'radio',
      name: 'palette',
      value: palette,
      checked: palette === initialPalette,
      onchange() {
        targetLava.set(Lava);
        targetFog.set(Fog);

        currentLava.settled = currentFog.settled = false;

        localStorage.setItem(STORAGE_KEY, palette);
      },
    });

    return append(createElement('div', { className: 'control__group' }), [
      createElement('label', {
        htmlFor: paletteInput.id,
        innerText: palette,
      }),
      paletteInput,
    ]);
  }),
);

const controlsToggle = createElement('button', {
  ariaControlsElements: [controlsPanel],
  ariaExpanded: String(!controlsPanel.inert),
  ariaLabel: 'Show Controls',
  title: 'Show Controls',
  className: 'controls__toggle',
  innerHTML: createSVG(
    'M20.89 14.38a2.47 2.47 0 0 1 0-4.76 2.47 2.47 0 1 0-2.38-4.13 2.47 2.47 0 0 1-4.13-2.39 2.47 2.47 0 1 0-4.76 0 2.47 2.47 0 0 1-4.13 2.39 2.47 2.47 0 1 0-2.38 4.13 2.47 2.47 0 0 1 0 4.76 2.47 2.47 0 1 0 2.38 4.13 2.47 2.47 0 0 1 4.13 2.39 2.47 2.47 0 1 0 4.76 0 2.47 2.47 0 0 1 4.13-2.39 2.47 2.47 0 1 0 2.38-4.13M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  ),
  onclick() {
    const active = document.body.classList.toggle('controls-active');

    controlsPanel.inert = !active;

    const label = `${active ? 'Hide' : 'Show'} Controls`;

    controlsToggle.ariaExpanded = String(active);
    controlsToggle.ariaLabel = controlsToggle.title = label;
  },
});

const controlsWrapper = append(createElement('div'), [controlsPanel]);

const scroller = new Horizontal(controlsWrapper);

append(document.body, [
  canvas,
  createElement('div', { className: 'controls__shadow' }),
  append(createElement('main'), [
    append(createElement('div', { className: 'controls' }), [
      controlsToggle,
      controlsWrapper,
    ]),
    createElement('h1', { innerText: 'Lava Lamp' }),
    createElement('a', {
      className: 'github-link',
      href: 'https://github.com/brybrant/lava-lamp',
      target: '_blank',
      rel: 'noopener noreferrer',
      title: 'GitHub',
      innerHTML: createSVG(siGithub.path),
    }),
  ]),
]);

scroller.mount();

append(scroller.wrapper, [
  createElement('button', {
    ariaLabel: 'Scroll to beginning',
    className: 'fade-scroll__button fade-scroll__button--left',
    onclick() {
      scroller.scrollPosition = 0;
    },
  }),
  createElement('button', {
    ariaLabel: 'Scroll to end',
    className: 'fade-scroll__button fade-scroll__button--right',
    onclick() {
      scroller.scrollPosition = scroller.overflowSize;
    },
  }),
]);

scroller.captureWheel = scroller.hideScrollbar = true;
