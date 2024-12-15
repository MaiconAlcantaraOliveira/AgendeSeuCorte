document.addEventListener('DOMContentLoaded', () => {
    const agendamentosTableBody = document.getElementById('agendamentosTableBody');
    const barberShopId = '5e51932c-b7e3-11ef-b363-a8a159004237'; // ID da barbearia

    // Mapeamento de cores fixas para cada dia do mês (1 a 31)
    const dayColors = {};

    // Função para gerar uma cor clara com base no número do dia
    function getColorForDay(day) {
        if (!dayColors[day]) {
            const r = Math.floor(200 + (day * 15) % 55); // Tons claros
            const g = Math.floor(200 + (day * 25) % 55);
            const b = Math.floor(200 + (day * 35) % 55);
            dayColors[day] = `rgb(${r}, ${g}, ${b})`;
        }
        return dayColors[day];
    }

    // Função para carregar os agendamentos
    function loadAppointments(barberShopId) {
        fetch(`https://192.168.2.242:7035/api/appointments/barbershop/${barberShopId}`)
            .then(response => response.json())
            .then(data => {
                const appointmentsByDate = {};

                data.forEach(appointment => {
                    const dateKey = new Date(appointment.date).toISOString().split('T'); // Apenas a data no formato YYYY-MM-DD

                    if (!appointmentsByDate[dateKey]) {
                        appointmentsByDate[dateKey] = [];
                    }

                    appointmentsByDate[dateKey].push({
                        id: appointment.id,
                        startTime: appointment.startTime.slice(0, 5),
                        endTime: appointment.endTime.slice(0, 5),
                        customerName: appointment.customerName,
                        customerPhone: appointment.customerPhone,
                        serviceDescription: appointment.serviceDescription,
                    });
                });

                const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => new Date(a) - new Date(b));

                window.appointments = {};
                sortedDates.forEach(date => {
                    window.appointments[date] = appointmentsByDate[date];
                });

                renderAppointments(window.appointments);
            })
            .catch(error => console.error('Erro ao carregar agendamentos:', error));
    }

    // Função para renderizar os agendamentos
    function renderAppointments(appointmentsByDate) {
        const today = new Date().toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD
        agendamentosTableBody.innerHTML = '';

        for (const dateKey in appointmentsByDate) {
            if (dateKey < today) {
                continue; // Ignorar agendamentos anteriores ao dia de hoje
            }

            const appointments = appointmentsByDate[dateKey];
            const day = new Date(dateKey).getUTCDate(); // Extrai o dia do mês
            const rowColor = getColorForDay(day); // Obtém a cor fixa para o dia

            appointments.forEach(appointment => {
                const row = document.createElement('tr');
                row.style.backgroundColor = rowColor; // Aplica a cor fixa
                row.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)'; // Sombra leve

                // Data

                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(dateKey).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                });
                row.appendChild(dateCell);

                // Cliente
                const nameCell = document.createElement('td');
                nameCell.textContent = appointment.customerName;
                row.appendChild(nameCell);

                // WhatsApp
                const whatsappCell = document.createElement('td');
                whatsappCell.textContent = appointment.customerPhone;
                row.appendChild(whatsappCell);

                // Serviço
                const serviceCell = document.createElement('td');
                serviceCell.textContent = appointment.serviceDescription;
                row.appendChild(serviceCell);

                // Horário
                const timeCell = document.createElement('td');
                timeCell.textContent = `${appointment.startTime} - ${appointment.endTime}`;
                row.appendChild(timeCell);

                // Ações
                const actionsCell = document.createElement('td');
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remover';
                removeButton.classList.add('remove-btn');
                removeButton.addEventListener('click', () => removeAppointment(appointment.id));
                actionsCell.appendChild(removeButton);
                row.appendChild(actionsCell);

                agendamentosTableBody.appendChild(row);
            });
        }
    }

    // Função para remover agendamento
    function removeAppointment(appointmentId) {
        fetch(`https://192.168.2.242:7035/api/appointments/${appointmentId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    loadAppointments(barberShopId);
                } else {
                    console.error('Erro ao remover agendamento');
                }
            })
            .catch(error => console.error('Erro ao remover agendamento:', error));
    }

    // Carregar os agendamentos ao iniciar
    loadAppointments(barberShopId);
});
