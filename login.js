$(document).ready(function() {
    $('#login-form').submit(function(event) {
        event.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === username && user.password === password);
        
        if (user) {
            // Salvar o usuário atual logado
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            window.location.href = 'calendario.html'; // Substitua 'calendario.html' pelo nome do seu arquivo HTML
        } else {
            $('#error-message').text('Credenciais inválidas, tente novamente.').show();
        }
    });
});
