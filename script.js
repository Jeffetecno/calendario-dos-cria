$(document).ready(function() {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];

    function saveEvents() {
        localStorage.setItem('events', JSON.stringify(events));
        console.log("Eventos salvos:", events);
    }

    function saveChatMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
        console.log("Mensagens de chat salvas:", chatMessages);
    }

    function renderChatMessages() {
        const chatMessagesContainer = $('#chat-messages');
        chatMessagesContainer.empty();
        chatMessages.forEach(message => {
            const messageElement = $('<div>').addClass('message').addClass(message.type).text(message.text);
            chatMessagesContainer.append(messageElement);
        });
        scrollToBottom(chatMessagesContainer);
    }

    function scrollToBottom(container) {
        container.scrollTop(container.prop("scrollHeight"));
    }

    function clearOldChatMessages() {
        const now = Date.now();
        chatMessages = chatMessages.filter(message => now - message.timestamp < 24 * 60 * 60 * 1000);
        saveChatMessages();
        renderChatMessages();
    }

    function renderCalendar() {
        currentDate.setDate(1);
        const monthDays = document.getElementById('days');
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        const firstDayIndex = currentDate.getDay();
        const lastDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDay();
        const nextDays = 7 - lastDayIndex - 1;

        document.getElementById('month-year').innerText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        let days = "";

        for (let x = firstDayIndex; x > 0; x--) {
            days += `<div class="prev-date">${prevLastDay - x + 1}</div>`;
        }

        for (let i = 1; i <= lastDay; i++) {
            days += `<div data-day="${i}">${i}</div>`;
        }

        for (let j = 1; j <= nextDays; j++) {
            days += `<div class="next-date">${j}</div>`;
        }

        monthDays.innerHTML = days;

        // Adicionar eventos de clique aos dias
        document.querySelectorAll('#days div').forEach(day => {
            day.addEventListener('click', function() {
                const selectedDay = this.getAttribute('data-day');
                $('#event-date').val(`${selectedDay} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
                $('#event-modal').modal('show');
            });
        });

        // Renderizar eventos
        renderEvents();
    }

    function renderEvents() {
        const monthDays = document.getElementById('days');
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        monthDays.querySelectorAll('div').forEach(dayElement => {
            const day = dayElement.getAttribute('data-day');
            if (day) {
                dayElement.style.backgroundImage = '';
                dayElement.classList.remove('event');
                dayElement.classList.remove('no-image-event');
                dayElement.style.backgroundColor = ''; // Clear background color
                dayElement.innerHTML = day; // Reset day number
                dayElement.removeAttribute('title');
            }
        });

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const day = eventDate.getDate();
            if (event.recurring !== 'none') {
                if (event.recurring === 'weekly') {
                    const eventDayOfWeek = eventDate.getDay();
                    document.querySelectorAll(`#days div`).forEach(dayElement => {
                        if (dayElement.getAttribute('data-day') && new Date(currentYear, currentMonth, dayElement.getAttribute('data-day')).getDay() === eventDayOfWeek) {
                            if (event.image) {
                                dayElement.style.backgroundImage = `url(${event.image})`;
                                dayElement.classList.add('event');
                            } else {
                                dayElement.classList.add('no-image-event');
                                dayElement.style.backgroundColor = 'red';
                            }
                            dayElement.innerHTML = `${dayElement.getAttribute('data-day')}<div class="event-text">${event.description}</div>`;
                            dayElement.setAttribute('title', event.description);
                        }
                    });
                } else if (event.recurring === 'monthly' && eventDate.getDate() === parseInt(day)) {
                    const dayElement = $(`#days div[data-day='${day}']`);
                    if (event.image) {
                        dayElement.css('background-image', `url(${event.image})`);
                        dayElement.addClass('event');
                    } else {
                        dayElement.addClass('no-image-event');
                        dayElement.css('background-color', 'red');
                    }
                    dayElement.html(`${dayElement.attr('data-day')}<div class="event-text">${event.description}</div>`);
                    dayElement.attr('title', event.description);
                } else if (event.recurring === 'annually' && eventDate.getDate() === parseInt(day) && eventDate.getMonth() === currentMonth) {
                    const dayElement = $(`#days div[data-day='${day}']`);
                    if (event.image) {
                        dayElement.css('background-image', `url(${event.image})`);
                        dayElement.addClass('event');
                    } else {
                        dayElement.addClass('no-image-event');
                        dayElement.css('background-color', 'red');
                    }
                    dayElement.html(`${dayElement.attr('data-day')}<div class="event-text">${event.description}</div>`);
                    dayElement.attr('title', event.description);
                }
            } else if (eventDate.getDate() == parseInt(day) && eventDate.getMonth() == currentMonth && eventDate.getFullYear() == currentYear) {
                const dayElement = $(`#days div[data-day='${day}']`);
                if (event.image) {
                    dayElement.css('background-image', `url(${event.image})`);
                    dayElement.addClass('event');
                } else {
                    dayElement.addClass('no-image-event');
                    dayElement.css('background-color', 'red');
                }
                dayElement.html(`${dayElement.attr('data-day')}<div class="event-text">${event.description}</div>`);
                dayElement.attr('title', event.description);
            }
        });
    }

    document.getElementById('prev').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    $('#event-form').submit(function(event) {
        event.preventDefault();
    });

    $('#save-event').click(function() {
        const date = $('#event-date').val();
        const description = $('#event-description').val();
        const recurring = $('#event-recurring').val();
        const eventObj = { date, description, recurring };

        // Verificar se a variável events é um array antes de adicionar o evento
        if (!Array.isArray(events)) {
            events = [];
        }

        events.push(eventObj);
        saveEvents();
        renderEvents();

        $('#event-modal').modal('hide');
    });

    $('#save-event-with-image').click(function() {
        const date = $('#event-date').val();
        const description = $('#event-description').val();
        const image = $('#event-image')[0].files[0];
        const recurring = $('#event-recurring').val();
        const eventObj = { date, description, recurring };

        if (image) {
            const reader = new FileReader();
            reader.onload = function(e) {
                eventObj.image = e.target.result;

                // Verificar se a variável events é um array antes de adicionar o evento
                if (!Array.isArray(events)) {
                    events = [];
                }

                events.push(eventObj);
                saveEvents();
                renderEvents();
            };
            reader.readAsDataURL(image);
        } else {
            alert('Por favor, selecione uma imagem.');
        }

        $('#event-modal').modal('hide');
    });

    $('#chat-form').submit(function(event) {
        event.preventDefault();
        const messageText = $('#chat-input').val();
        const messageObj = { text: messageText, type: 'sent', timestamp: Date.now() };
        chatMessages.push(messageObj);
        saveChatMessages();
        renderChatMessages();
        $('#chat-input').val('');
    });

    renderCalendar();
    renderChatMessages();
    clearOldChatMessages();
});
