//ScrrenShot 
function takeSnapshot(name) {

    html2canvas(
        document.getElementById('capture-area'),
        {
            backgroundColor: '#020617',
            scale: 2
        }
    ).then(canvas => {

        const a = document.createElement('a');

        a.download = name + '.png';

        a.href = canvas.toDataURL();

        a.click();
    });
}