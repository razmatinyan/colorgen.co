export const rgbaToHex = (rgbaColor) => {
    const rgbaValues = rgbaColor.slice(5, -1).split(',');
    const r = parseInt(rgbaValues[0], 10);
    const g = parseInt(rgbaValues[1], 10);
    const b = parseInt(rgbaValues[2], 10);
    let a = parseFloat(rgbaValues[3]);
  
    a = Math.round(a * 255).toString(16);
    if (a.length === 1) {
      a = `0${a}`;
    }
  
    let hex = ((r << 16) | (g << 8) | b).toString(16);
    while (hex.length < 6) {
      hex = `0${hex}`;
    }
  
    hex += a;
    return `#${hex}`;
}