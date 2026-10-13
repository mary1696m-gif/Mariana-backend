
const API_URL = '/api/alunos';

// ELEMENTOS DO HTML
const form = document.getElementById('aluno-form');
const tbody = document.getElementById('alunos-tbody');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

const inputId = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputCurso = document.getElementById('curso');
const inputTelefone = document.getElementById('telefone');
const inputEndereco = document.getElementById('endereço');
const inputIdade = document.getElementById('idade');

let editandoId = null;

// CARREGAR ALUNOS
async function carregarAlunos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Erro ao buscar alunos.');
        }

        const alunos = await resposta.json();
        tbody.innerHTML = '';

        if (alunos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Nenhum aluno encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        alunos.forEach(aluno => {
            const tr = document.createElement('tr');

            const endereco = aluno.endereco ?? aluno.endereço ?? '';
            const telefone = aluno.telefone ?? '';
            const idade = aluno.idade ?? '';

            tr.innerHTML = `
                <td>#${aluno.id}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Excluir</button>
                </td>
            `;

            // Inserir os dados como texto
            tr.cells[1].textContent = aluno.nome ?? '';
            tr.cells[2].textContent = aluno.email ?? '';
            tr.cells[3].textContent = aluno.curso ?? '';
            tr.cells[4].textContent = endereco;
            tr.cells[5].textContent = telefone;
            tr.cells[6].textContent = idade;

            tr.querySelector('.btn-edit').addEventListener(
                'click',
                () => iniciarEdicao(aluno.id)
            );

            tr.querySelector('.btn-delete').addEventListener(
                'click',
                () => deletarAluno(aluno.id)
            );

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error('Erro ao carregar alunos:', erro);
        alert('Erro ao carregar os alunos. Confira se o servidor está ligado.');
    }
}

// CADASTRAR OU ATUALIZAR
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const aluno = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        curso: inputCurso.value.trim(),
        endereco: inputEndereco.value.trim(),
        telefone: inputTelefone.value.trim(),
        idade: inputIdade.value.trim()
    };

    if (
        !aluno.nome ||
        !aluno.email ||
        !aluno.curso ||
        !aluno.endereco ||
        !aluno.telefone ||
        !aluno.idade
    ) {
        alert('Preencha todos os campos.');
        return;
    }

    try {
        const editando = editandoId !== null;

        const resposta = await fetch(
            editando ? `${API_URL}/${editandoId}` : API_URL,
            {
                method: editando ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aluno)
            }
        );

        const dados = resposta.status === 204
            ? {}
            : await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao salvar aluno.');
            return;
        }

        alert(
            editando
                ? 'Aluno atualizado com sucesso!'
                : 'Aluno cadastrado com sucesso!'
        );

        resetarFormulario();
        await carregarAlunos();

    } catch (erro) {
        console.error('Erro ao salvar aluno:', erro);
        alert('Erro de conexão com o servidor.');
    }
});

// INICIAR EDIÇÃO
async function iniciarEdicao(id) {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Erro ao buscar alunos.');
        }

        const alunos = await resposta.json();

        const aluno = alunos.find(
            item => Number(item.id) === Number(id)
        );

        if (!aluno) {
            alert('Aluno não encontrado.');
            return;
        }

        editandoId = aluno.id;

        inputId.value = aluno.id;
        inputNome.value = aluno.nome ?? '';
        inputEmail.value = aluno.email ?? '';
        inputCurso.value = aluno.curso ?? '';
        inputEndereco.value = aluno.endereco ?? aluno.endereço ?? '';
        inputTelefone.value = aluno.telefone ?? '';
        inputIdade.value = aluno.idade ?? '';

        btnSave.textContent = 'Atualizar';
        btnCancel.style.display = 'inline-block';

        inputNome.focus();

    } catch (erro) {
        console.error('Erro ao iniciar edição:', erro);
        alert('Erro ao buscar aluno.');
    }
}

// EXCLUIR ALUNO
async function deletarAluno(id) {
    const confirmar = confirm(
        'Tem certeza que deseja excluir este aluno?'
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao excluir aluno.');
            return;
        }

        if (editandoId !== null && Number(editandoId) === Number(id)) {
            resetarFormulario();
        }

        alert('Aluno excluído com sucesso!');
        await carregarAlunos();

    } catch (erro) {
        console.error('Erro ao excluir:', erro);
        alert('Erro de conexão com o servidor.');
    }
}

// CANCELAR EDIÇÃO
btnCancel.addEventListener('click', resetarFormulario);

// LIMPAR FORMULÁRIO
function resetarFormulario() {
    form.reset();
    inputId.value = '';
    editandoId = null;

    btnSave.textContent = 'Cadastrar';
    btnCancel.style.display = 'none';
}

// INICIAR
carregarAlunos();