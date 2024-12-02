document.addEventListener('DOMContentLoaded', () => {
    // Obter o corpo da tabela onde os agendamentos serão exibidos
    const agendamentosTableBody = document.getElementById('agendamentosTableBody');

    // Função para formatar a data (para exibir o mês e o dia da semana)
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Função para carregar os agendamentos e exibir na tabela
    function loadAppointments() {
        // Limpar a tabela antes de adicionar os agendamentos
        agendamentosTableBody.innerHTML = '';

        // Iterar sobre os agendamentos armazenados em memória
        for (const dateKey in window.appointments) {
            const appointments = window.appointments[dateKey];

            // Para cada agendamento no dia
            appointments.forEach(appointment => {
                const row = document.createElement('tr');

                // Exibir data formatada (mês e dia da semana)
                const dateCell = document.createElement('td');
                dateCell.textContent = formatDate(dateKey);
                row.appendChild(dateCell);

                // Exibir o mês
                const monthCell = document.createElement('td');
                const month = new Date(dateKey).toLocaleString('default', { month: 'long' });
                monthCell.textContent = month;
                row.appendChild(monthCell);

                // Exibir o dia da semana
                const dayCell = document.createElement('td');
                const dayOfWeek = new Date(dateKey).toLocaleString('default', { weekday: 'long' });
                dayCell.textContent = dayOfWeek;
                row.appendChild(dayCell);

                // Exibir nome do cliente
                const nameCell = document.createElement('td');
                nameCell.textContent = appointment.name;
                row.appendChild(nameCell);

                // Exibir WhatsApp do cliente
                const whatsappCell = document.createElement('td');
                whatsappCell.textContent = appointment.whatsapp;
                row.appendChild(whatsappCell);

                // Exibir ações (remover agendamento)
                const actionsCell = document.createElement('td');
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remover';
                removeButton.classList.add('remove-btn');
                removeButton.addEventListener('click', () => removeAppointment(dateKey, appointment));
                actionsCell.appendChild(removeButton);
                row.appendChild(actionsCell);

                // Adicionar a linha à tabela
                agendamentosTableBody.appendChild(row);
            });
        }
    }

    // Função para remover um agendamento
    function removeAppointment(dateKey, appointment) {
        const index = window.appointments[dateKey].findIndex(app => app.whatsapp === appointment.whatsapp && app.time === appointment.time);
        if (index !== -1) {
            window.appointments[dateKey].splice(index, 1);

            // Se não houver mais agendamentos para essa data, remover a chave do objeto de agendamentos
            if (window.appointments[dateKey].length === 0) {
                delete window.appointments[dateKey];
            }

            // Recarregar a tabela de agendamentos
            loadAppointments();
        }
    }

    // Carregar os agendamentos ao carregar a página
    loadAppointments();
});
