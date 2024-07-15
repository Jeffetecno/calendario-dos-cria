$(document).ready(function() {
    $('#register-form').submit(function(event) {
        event.preventDefault();
        
        const username = $('#new-username').val();
        const password = $('#new-password').val();
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.username === username);
        
        if (userExists) {
            $('#register-error-message').text('Usuário já existe, escolha outro nome de usuário.').show();
        } else {
            users.push({ username, password });
            localStorage.setItem('users', JSON.stringify(users));

            // Salvar o usuário atual logado
            localStorage.setItem('currentUser', JSON.stringify({ username, password }));

            // Redirecionar para o calendário
            window.location.href = 'calendario.html';
        }
    });
});
