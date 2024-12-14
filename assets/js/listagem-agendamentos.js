document.addEventListener('DOMContentLoaded', () => {
    const agendamentosTableBody = document.getElementById('agendamentosTableBody');
    const barberShopId = '5e51932c-b7e3-11ef-b363-a8a159004237'; // ID da barbearia

    // Função para formatar a data (para exibir o mês e o dia da semana)
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Carregar agendamentos do backend
    function loadAppointments(barberShopId) {
        fetch(`https://192.168.2.242:7035/api/appointments/barbershop/${barberShopId}`)
            .then(response => response.json())
            .then(data => {
                // Transformar array em um objeto organizado por data
                const appointmentsByDate = {};

                data.forEach(appointment => {
                    // Extrair a data no formato YYYY-MM-DD
                    const dateKey = new Date(appointment.date).toISOString();

                    if (!appointmentsByDate[dateKey]) {
                        appointmentsByDate[dateKey] = [];
                    }

                    appointmentsByDate[dateKey].push({
                        id: appointment.id, // Garantir que o id do agendamento seja passado
                        startTime: appointment.startTime.slice(0, 5), // Exemplo: "08:30"
                        endTime: appointment.endTime.slice(0, 5),
                        customerName: appointment.customerName,
                        customerPhone: appointment.customerPhone,
                        serviceDescription: appointment.serviceDescription,
                    });
                });

                // Ordenar as chaves do objeto appointmentsByDate por data
                const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => new Date(a) - new Date(b));

                // Armazenar os dados no formato esperado
                window.appointments = {};

                sortedDates.forEach(date => {
                    // Adiciona os agendamentos ordenados por data
                    window.appointments[date] = appointmentsByDate[date];
                });

                console.log('Agendamentos processados:', window.appointments); // Para debug

                // Exibir os agendamentos na tabela
                renderAppointments(window.appointments);
            })
            .catch(error => console.error('Erro ao carregar agendamentos:', error));
    }

    // Função para renderizar os agendamentos na tabela
    function renderAppointments(appointmentsByDate) {
        // Limpar a tabela antes de adicionar os agendamentos
        agendamentosTableBody.innerHTML = '';

        for (const dateKey in appointmentsByDate) {
            const appointments = appointmentsByDate[dateKey];

            appointments.forEach(appointment => {
                const row = document.createElement('tr');

                // Exibir data formatada (mês e dia da semana)
                const dateCell = document.createElement('td');
                dateCell.textContent = formatDate(dateKey);
                row.appendChild(dateCell);

                // Exibir nome do cliente
                const nameCell = document.createElement('td');
                nameCell.textContent = appointment.customerName;
                row.appendChild(nameCell);

                // Exibir WhatsApp do cliente
                const whatsappCell = document.createElement('td');
                whatsappCell.textContent = appointment.customerPhone;
                row.appendChild(whatsappCell);

                // Exibir descrição do serviço
                const serviceCell = document.createElement('td');
                serviceCell.textContent = appointment.serviceDescription;
                row.appendChild(serviceCell);

                // Exibir horário de início e fim
                const timeCell = document.createElement('td');
                timeCell.textContent = `${appointment.startTime} - ${appointment.endTime}`;
                row.appendChild(timeCell);

                // Exibir ações (remover agendamento)
                const actionsCell = document.createElement('td');
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remover';
                removeButton.classList.add('remove-btn');
                
                // Passar o ID correto para a função de remoção
                removeButton.addEventListener('click', () => removeAppointment(appointment.id));
                
                actionsCell.appendChild(removeButton);
                row.appendChild(actionsCell);

                // Adicionar a linha à tabela
                agendamentosTableBody.appendChild(row);
            });
        }
    }

    // Função para remover um agendamento
    function removeAppointment(appointmentId) {
        // Enviar uma requisição DELETE para remover o agendamento
        fetch(`https://192.168.2.242:7035/api/appointments/${appointmentId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                // Recarregar os agendamentos após a exclusão
                loadAppointments(barberShopId);
            } else {
                console.error('Erro ao remover agendamento');
            }
        })
        .catch(error => console.error('Erro ao remover agendamento:', error));
    }

    // Carregar os agendamentos ao carregar a página
    loadAppointments(barberShopId);
});
