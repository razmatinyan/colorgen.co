export const rgbToHex = (rgbColor) => {
    // Extract the RGB values from the color string
    let rgbValues = rgbColor.substring(4, rgbColor.length - 1).split(",");
    let r = parseInt(rgbValues[0].trim());
    let g = parseInt(rgbValues[1].trim());
    let b = parseInt(rgbValues[2].trim());

    // Convert the RGB values to hex format
    let hexR = r.toString(16).padStart(2, "0");
    let hexG = g.toString(16).padStart(2, "0");
    let hexB = b.toString(16).padStart(2, "0");

    // Combine the hex values into a single hex color string
    let hexColor = "#" + hexR + hexG + hexB;

    // Return the hex color string
    return hexColor;
}