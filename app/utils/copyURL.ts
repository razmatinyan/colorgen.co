export const copyURL = (text: string) => {
    if ( navigator.clipboard !== undefined ) navigator.clipboard.writeText(text);
}