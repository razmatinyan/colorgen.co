import html2canvas from "html2canvas";

export const downloadColors = (element: any, fileName: String = 'palette') => {
    var container: any = document.querySelector(element);

    html2canvas(container).then(function(canvas) {
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL(`image/png`);
        link.target = '_blank';
        link.click();
    });
}