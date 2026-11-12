import { RAD120, RAD180, RAD360, SQRT3 } from './const.ts';

type RGB = [red: number, green: number, blue: number];

type HBC = {
  hue: number;
  base: number;
  chroma: number;
};

const rgbToHBC = ([red, green, blue]: RGB): HBC => {
  const base = (red + green + blue) / 3;

  const x = red - base;
  const y = (green - blue) / SQRT3;

  const hue = Math.atan2(y, x);

  const chroma = Math.hypot(x, y);

  return { hue, base, chroma };
};

const hbcToRGB = ({ hue, base, chroma }: HBC): RGB => [
  base + chroma * Math.cos(hue),
  base + chroma * Math.cos(hue - RAD120),
  base + chroma * Math.cos(hue + RAD120),
];

const COLOR_EPSILON = 1e-3;

export class Color {
  rgb: RGB = [0, 0, 0];
  private hbc: HBC = { hue: 0, base: 0, chroma: 0 };
  settled = true;

  constructor(color: RGB | Color) {
    if (color instanceof Color) {
      this.set(color);
    } else {
      this.rgb = [...color];
      this.hbc = rgbToHBC(this.rgb);
    }
  }

  set(color: Color) {
    this.rgb[0] = color.rgb[0];
    this.rgb[1] = color.rgb[1];
    this.rgb[2] = color.rgb[2];
    this.hbc.hue = color.hbc.hue;
    this.hbc.base = color.hbc.base;
    this.hbc.chroma = color.hbc.chroma;

    return this;
  }

  lerp(target: Color, factor: number) {
    if (this.settled) return;

    let difference = (target.hbc.hue - this.hbc.hue) % RAD360;

    if (difference > RAD180) {
      difference -= RAD360;
    } else if (difference < -RAD180) {
      difference += RAD360;
    }

    this.hbc.hue = (this.hbc.hue + difference * factor + RAD360) % RAD360;
    this.hbc.base += (target.hbc.base - this.hbc.base) * factor;
    this.hbc.chroma += (target.hbc.chroma - this.hbc.chroma) * factor;

    const rgb = hbcToRGB(this.hbc);

    this.rgb[0] = rgb[0];
    this.rgb[1] = rgb[1];
    this.rgb[2] = rgb[2];

    this.settled =
      Math.abs(target.rgb[0] - this.rgb[0]) <= COLOR_EPSILON &&
      Math.abs(target.rgb[1] - this.rgb[1]) <= COLOR_EPSILON &&
      Math.abs(target.rgb[2] - this.rgb[2]) <= COLOR_EPSILON;

    if (this.settled) this.set(target);
  }
}
