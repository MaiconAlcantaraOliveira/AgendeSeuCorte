document.addEventListener('DOMContentLoaded', () => {
    const calendarBody = document.getElementById('calendarBody');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const modal = new bootstrap.Modal(document.getElementById('modalAgendamento'));
    const confirmButton = document.getElementById('confirmarAgendamento');
    window.appointments = {}; // Armazena os agendamentos em memória global
    let currentDate = new Date();
    let selectedTimeSlot = null;

    // Renderizar o calendário
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        calendarBody.innerHTML = '';
        currentMonthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        let dayCount = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < firstDay || dayCount > daysInMonth) {
                    row.appendChild(cell);
                    continue;
                }

                const dateKey = `${year}-${month + 1}-${dayCount}`;
                cell.textContent = dayCount;
                cell.dataset.date = dateKey;
                cell.classList.add('date-cell');

                // Exibir horários ocupados no dia
                if (window.appointments[dateKey]) {
                    window.appointments[dateKey].forEach(app => {
                        const appointmentDiv = document.createElement('div');
                        appointmentDiv.className = 'occupied-time';
                        appointmentDiv.textContent = `${app.time} - ${app.endTime}`;
                        appointmentDiv.addEventListener('click', () => {
                            displayAppointmentDetails(app);
                        });
                        cell.appendChild(appointmentDiv);
                    });
                }

                cell.addEventListener('click', () => openModal(dateKey));
                row.appendChild(cell);
                dayCount++;
            }
            calendarBody.appendChild(row);
        }
    }

    // Criar slots de tempo baseados no serviço
    function createTimeSlots(dateKey) {
        const serviceType = document.getElementById('service')?.value || 30;
        const serviceDuration = parseInt(serviceType);
        const startOfDay = 8 * 60; // 08:00
        const endOfDay = 17 * 60; // 17:00
        const timeSlots = [];

        for (let time = startOfDay; time + serviceDuration <= endOfDay; time += 30) {
            const startTime = formatTime(time);
            const endTime = formatTime(time + serviceDuration);
            timeSlots.push({ startTime, endTime });
        }

        return timeSlots;
    }

    // Verificar se o horário está ocupado
    function isOccupied(dateKey, startTime, endTime) {
        if (!window.appointments[dateKey]) return false;
        return window.appointments[dateKey].some(app => {
            const appStart = app.time;
            const appEnd = app.endTime;
            return (startTime < appEnd && endTime > appStart);
        });
    }

    // Abrir a modal para agendamento
    function openModal(date) {
        document.getElementById('selectedDate').value = date;
        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        const slots = createTimeSlots(date);
        timeSlotsContainer.innerHTML = '';
        slots.forEach(slot => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.classList.add('available-time');
            timeSlotDiv.textContent = `${slot.startTime} - ${slot.endTime}`;
            if (isOccupied(date, slot.startTime, slot.endTime)) {
                timeSlotDiv.classList.add('occupied-time');
                timeSlotDiv.style.cursor = 'not-allowed';
            } else {
                timeSlotDiv.addEventListener('click', () => {
                    if (selectedTimeSlot) {
                        selectedTimeSlot.classList.remove('selected-time');
                    }
                    timeSlotDiv.classList.add('selected-time');
                    selectedTimeSlot = timeSlotDiv;
                });
            }
            timeSlotsContainer.appendChild(timeSlotDiv);
        });

        modal.show();
    }

    // Exibir detalhes do agendamento
    function displayAppointmentDetails(appointment) {
        const message = `**Detalhes do Agendamento**\nNome: ${appointment.name}\nWhatsApp: ${appointment.whatsapp}`;
        alert(message);
    }

    // Confirmar agendamento
    confirmButton.addEventListener('click', () => {
        const selectedDate = document.getElementById('selectedDate').value;
        const name = document.getElementById('nome').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const service = document.getElementById('service').value;

        const selectedSlot = selectedTimeSlot ? selectedTimeSlot.textContent.split(' - ') : [];
        const time = selectedSlot[0] || '';
        const endTime = selectedSlot[1] || '';

        if (!time || !endTime) {
            alert('Por favor, selecione um horário!');
            return;
        }

        if (window.appointments[selectedDate]) {
            const existingAppointment = window.appointments[selectedDate].find(
                app => app.whatsapp === whatsapp
            );

            if (existingAppointment) {
                alert(`Este cliente já está agendado no dia ${selectedDate} para o horário ${existingAppointment.time} - ${existingAppointment.endTime}.`);
                return;
            }
        }

        if (isOccupied(selectedDate, time, endTime)) {
            alert('Este horário já está ocupado. Por favor, escolha outro horário.');
            return;
        }

        if (!window.appointments[selectedDate]) {
            window.appointments[selectedDate] = [];
        }

        window.appointments[selectedDate].push({ name, whatsapp, service, time, endTime });
        document.getElementById('formAgendamento').reset();
        modal.hide();
        renderCalendar(currentDate);
    });

    // Formatar hora
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // Atualizar horários ao mudar o serviço
    document.getElementById('service').addEventListener('change', () => {
        const selectedDate = document.getElementById('selectedDate').value;
        openModal(selectedDate);
    });

    // Inicializar calendário
    renderCalendar(currentDate);

    // Navegar entre meses
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
});
