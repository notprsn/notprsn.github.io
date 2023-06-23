window.onload = function() {
    let counter = localStorage.getItem('counter') ? Number(localStorage.getItem('counter')) : 0;
    counter++;
    localStorage.setItem('counter', counter);
    document.getElementById('counter').innerText = counter;
};
