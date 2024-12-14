document.addEventListener('DOMContentLoaded', () => {
    const currentMonthLabel = document.getElementById('currentMonth');
    const calendarDays = document.querySelector('#days');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const blockDateInput = document.getElementById('blockDate');
    const blockButton = document.getElementById('blockButton');
    const unblockButton = document.getElementById('unblockButton');
    const manualNameInput = document.getElementById('manualName');
    const manualWhatsappInput = document.getElementById('manualWhatsapp');
    const manualDateInput = document.getElementById('manualDate');
    const manualBookButton = document.getElementById('manualBookButton');
    const agendamentosTableBody = document.getElementById('agendamentosTableBody');
    let currentDate = new Date();
    let agendamentos = [];  // Inicializa o array de agendamentos
    let diasBloqueados = []; // Lista de dias bloqueados

    // Função para carregar agendamentos da API e organizar por data
    async function loadAppointments(barberShopId) {
        try {
            const response = await fetch(`https://localhost:7035/api/Appointments/barbershop/${barberShopId}`);
            const data = await response.json();

            // Organizar os agendamentos por data
            const appointmentsByDate = {};

            data.forEach(appointment => {
                // Extrair a data no formato YYYY-MM-DD
                const dateKey = new Date(appointment.date).toISOString().split('T')[0];

                if (!appointmentsByDate[dateKey]) {
                    appointmentsByDate[dateKey] = [];
                }

                appointmentsByDate[dateKey].push({
                    id: appointment.id,
                    startTime: appointment.startTime.slice(0, 5), // Exemplo: "08:30"
                    endTime: appointment.endTime.slice(0, 5),
                    customerName: appointment.customerName,
                    customerPhone: appointment.customerPhone,
                    serviceDescription: appointment.serviceDescription,
                });
            });

            // Ordenar os agendamentos de cada dia por startTime
            for (let date in appointmentsByDate) {
                appointmentsByDate[date].sort((a, b) => {
                    return a.startTime.localeCompare(b.startTime);
                });
            }

            // Armazenar os dados no formato esperado
            window.appointments = appointmentsByDate;

            console.log('Agendamentos processados:', window.appointments); // Para debug

            // Exibir os agendamentos na tabela
            renderAppointments(window.appointments);

        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }

    // Função para renderizar os agendamentos na tabela
    function renderAppointments(appointmentsByDate) {
        agendamentosTableBody.innerHTML = '';
        for (let date in appointmentsByDate) {
            appointmentsByDate[date].forEach(appointment => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${appointment.startTime} - ${appointment.endTime}</td>
                    <td>${appointment.customerName}</td>
                    <td>${appointment.customerPhone}</td>
                    <td>${appointment.serviceDescription}</td>
                    <td><button class="remove-btn" data-id="${appointment.id}">Desmarcar</button></td>
                `;
                agendamentosTableBody.appendChild(tr);
            });
        }

        // Adicionar evento de remover para cada botão
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                removerAgendamento(id); // Remove o agendamento
            });
        });
    }

    // Função para remover agendamento
    async function removerAgendamento(id) {
        try {
            await fetch(`https://localhost:7035/api/Appointments/${id}`, { method: 'DELETE' }); // Deleta o agendamento
            loadAppointments(1); // Recarrega os agendamentos
        } catch (error) {
            console.error('Erro ao remover agendamento:', error);
        }
    }

    // Função para criar o calendário
    function criarCalendario() {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();

        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        // Atualiza o nome do mês
        currentMonthLabel.textContent = `${getMonthName(month)} ${year}`;

        // Limpa os dias anteriores
        calendarDays.innerHTML = '';

        // Preenche os dias do mês
        let currentDay = 1;
        for (let i = startDay; i < 7; i++) {
            const dayCell = createDayCell(currentDay);
            calendarDays.appendChild(dayCell);
            currentDay++;
        }

        // Preenche o restante do mês
        while (currentDay <= totalDays) {
            for (let i = 0; i < 7; i++) {
                if (currentDay <= totalDays) {
                    const dayCell = createDayCell(currentDay);
                    calendarDays.appendChild(dayCell);
                    currentDay++;
                }
            }
        }
    }

    // Cria uma célula de dia no calendário
    function createDayCell(day) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');
        dayCell.textContent = day;
        dayCell.addEventListener('click', () => {
            mostrarAgendarManualForm(day);
        });
        return dayCell;
    }

    // Exibe o formulário de agendamento manual
    function mostrarAgendarManualForm(day) {
        manualDateInput.value = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        document.getElementById('manualBookingForm').style.display = 'block';
    }

    // Função para agendamento manual
    manualBookButton.addEventListener('click', async () => {
        const nome = manualNameInput.value;
        const whatsapp = manualWhatsappInput.value;
        const data = manualDateInput.value;

        if (nome && whatsapp && data) {
            try {
                await fetch('https://localhost:7035/api/Appointments', {
                    method: 'POST',
                    body: JSON.stringify({ nome, whatsapp, data }),
                    headers: { 'Content-Type': 'application/json' },
                });
                alert('Agendamento realizado!');
                loadAppointments(1); // Recarrega a lista de agendamentos
                document.getElementById('manualBookingForm').style.display = 'none';
            } catch (error) {
                console.error('Erro ao agendar:', error);
            }
        } else {
            alert("Preencha todos os campos!");
        }
    });

    // Inicializa o calendário e carrega os agendamentos
    loadAppointments(1); // Usando um exemplo de barberShopId como 1
    criarCalendario();
});
