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

    // Função para carregar agendamentos da API
    async function carregarAgendamentos() {
        try {
            const response = await fetch('/api/agendamentos'); // Chama a API para obter os agendamentos
            agendamentos = await response.json();
            atualizarTabelaAgendamentos();
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }

    // Função para atualizar a tabela de agendamentos
    function atualizarTabelaAgendamentos() {
        agendamentosTableBody.innerHTML = '';
        agendamentos.forEach((agendamento, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${agendamento.data}</td>
                <td>${agendamento.nome}</td>
                <td>${agendamento.whatsapp}</td>
                <td><button class="remove-btn" data-index="${index}">Desmarcar</button></td>
            `;
            agendamentosTableBody.appendChild(tr);
        });

        // Adiciona eventos aos botões de desmarcar
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removerAgendamento(index); // Remove o agendamento
            });
        });
    }

    // Função para remover agendamento
    async function removerAgendamento(index) {
        const agendamento = agendamentos[index];
        try {
            await fetch(`/api/agendamentos/${agendamento.id}`, { method: 'DELETE' }); // Chama a API para deletar o agendamento
            agendamentos.splice(index, 1); // Remove o agendamento da lista local
            atualizarTabelaAgendamentos(); // Atualiza a tabela
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

    // Função para bloquear e liberar dias
    blockButton.addEventListener('click', () => {
        const data = blockDateInput.value;
        bloquearDia(data); // Chama a API para bloquear o dia
    });

    unblockButton.addEventListener('click', () => {
        const data = blockDateInput.value;
        liberarDia(data); // Chama a API para liberar o dia
    });

    // Função para bloquear o dia
    async function bloquearDia(data) {
        try {
            await fetch('/api/bloquearDia', {
                method: 'POST',
                body: JSON.stringify({ data }),
                headers: { 'Content-Type': 'application/json' },
            });
            alert('Dia bloqueado com sucesso!');
        } catch (error) {
            console.error('Erro ao bloquear o dia:', error);
        }
    }

    // Função para liberar o dia
    async function liberarDia(data) {
        try {
            await fetch('/api/liberarDia', {
                method: 'POST',
                body: JSON.stringify({ data }),
                headers: { 'Content-Type': 'application/json' },
            });
            alert('Dia liberado!');
        } catch (error) {
            console.error('Erro ao liberar o dia:', error);
        }
    }

    // Função para agendamento manual
    manualBookButton.addEventListener('click', async () => {
        const nome = manualNameInput.value;
        const whatsapp = manualWhatsappInput.value;
        const data = manualDateInput.value;

        if (nome && whatsapp && data) {
            try {
                await fetch('/api/agendamentos', {
                    method: 'POST',
                    body: JSON.stringify({ nome, whatsapp, data }),
                    headers: { 'Content-Type': 'application/json' },
                });
                alert('Agendamento realizado!');
                carregarAgendamentos(); // Recarrega a lista de agendamentos
                document.getElementById('manualBookingForm').style.display = 'none';
            } catch (error) {
                console.error('Erro ao agendar:', error);
            }
        } else {
            alert("Preencha todos os campos!");
        }
    });

    // Inicializa o calendário e a lista de agendamentos
    criarCalendario();
    carregarAgendamentos();
});