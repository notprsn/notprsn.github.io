const canvas = document.getElementById("mod-circle-canvas");
const context = canvas.getContext("2d");
const pointsInput = document.getElementById("points");
const multiplierInput = document.getElementById("multiplier");
const rotationInput = document.getElementById("rotation");
const pointsValue = document.getElementById("points-value");
const multiplierValue = document.getElementById("multiplier-value");
const rotationValue = document.getElementById("rotation-value");

function draw() {
    const pointCount = Number(pointsInput.value);
    const multiplier = Number(multiplierInput.value);
    const rotationDegrees = Number(rotationInput.value);
    const rotation = (rotationDegrees * Math.PI) / 180;
    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width * 0.42;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#fffdf9";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(23, 20, 17, 0.12)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.stroke();

    const positions = [];
    for (let index = 0; index < pointCount; index += 1) {
        const angle = (index / pointCount) * Math.PI * 2 - Math.PI / 2 + rotation;
        positions.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
        });
    }

    for (let index = 0; index < pointCount; index += 1) {
        const nextIndex = (index * multiplier) % pointCount;
        const start = positions[index];
        const end = positions[nextIndex];
        const hue = (index / pointCount) * 360;

        context.strokeStyle = `hsla(${hue}, 70%, 46%, 0.42)`;
        context.lineWidth = 1.15;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    }

    positions.forEach((point) => {
        context.fillStyle = "#171411";
        context.beginPath();
        context.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
        context.fill();
    });

    pointsValue.textContent = `${pointCount}`;
    multiplierValue.textContent = `${multiplier}`;
    rotationValue.textContent = `${rotationDegrees}°`;
}

[pointsInput, multiplierInput, rotationInput].forEach((input) => {
    input.addEventListener("input", draw);
});

draw();
