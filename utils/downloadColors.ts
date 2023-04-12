import html2canvas from "html2canvas";

export const downloadColors = (colors: string, element: any) => {
    var container: any = document.querySelector(element);

    html2canvas(container).then(function(canvas) {
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.download = `${colors}.png`;
        link.href = canvas.toDataURL(`image/png`);
        link.target = '_blank';
        link.click();
    });
}