
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DB_FILE = path.join(__dirname, 'db.json');

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// BANCO DE DADOS
function lerBancoDados() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(
            DB_FILE,
            JSON.stringify({ alunos: [] }, null, 2)
        );
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

function salvarBancoDados(data) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );
}

// NORMALIZAR OS DADOS
function obterDadosAluno(body) {
    return {
        nome: String(body.nome ?? '').trim(),
        email: String(body.email ?? '').trim(),
        curso: String(body.curso ?? '').trim(),
        endereco: String(
            body.endereco ?? body['endereço'] ?? ''
        ).trim(),
        telefone: String(body.telefone ?? '').trim(),
        idade: String(body.idade ?? '').trim()
    };
}

// CADASTRAR ALUNO
app.post('/api/alunos', (req, res) => {
    const dados = obterDadosAluno(req.body);

    if (
        !dados.nome ||
        !dados.email ||
        !dados.curso ||
        !dados.endereco ||
        !dados.telefone ||
        !dados.idade
    ) {
        return res.status(400).json({
            erro: 'Preencha todos os campos.'
        });
    }

    const db = lerBancoDados();

    const novoId = db.alunos.length > 0
        ? Math.max(...db.alunos.map(aluno => aluno.id)) + 1
        : 1;

    const novoAluno = {
        id: novoId,
        nome: dados.nome,
        email: dados.email,
        curso: dados.curso,
        endereço: dados.endereco,
        telefone: dados.telefone,
        idade: dados.idade
    };

    db.alunos.push(novoAluno);
    salvarBancoDados(db);

    res.status(201).json(novoAluno);
});

// LISTAR ALUNOS
app.get('/api/alunos', (req, res) => {
    const db = lerBancoDados();

    // Os alunos antigos podem não ter todos os campos.
    const alunos = db.alunos.map(aluno => ({
        ...aluno,
        endereço: aluno.endereço ?? aluno.endereco ?? '',
        telefone: aluno.telefone ?? '',
        idade: aluno.idade ?? ''
    }));

    res.json(alunos);
});

// EDITAR ALUNO
app.put('/api/alunos/:id', (req, res) => {
    const id = Number(req.params.id);
    const dados = obterDadosAluno(req.body);

    if (
        !dados.nome ||
        !dados.email ||
        !dados.curso ||
        !dados.endereco ||
        !dados.telefone ||
        !dados.idade
    ) {
        return res.status(400).json({
            erro: 'Preencha todos os campos.'
        });
    }

    const db = lerBancoDados();

    const index = db.alunos.findIndex(
        aluno => Number(aluno.id) === id
    );

    if (index === -1) {
        return res.status(404).json({
            erro: 'Aluno não encontrado.'
        });
    }

    db.alunos[index] = {
        id: id,
        nome: dados.nome,
        email: dados.email,
        curso: dados.curso,
        endereço: dados.endereco,
        telefone: dados.telefone,
        idade: dados.idade
    };

    salvarBancoDados(db);

    res.json(db.alunos[index]);
});

// EXCLUIR ALUNO
app.delete('/api/alunos/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = lerBancoDados();

    const index = db.alunos.findIndex(
        aluno => Number(aluno.id) === id
    );

    if (index === -1) {
        return res.status(404).json({
            erro: 'Aluno não encontrado.'
        });
    }

    db.alunos.splice(index, 1);
    salvarBancoDados(db);

    res.status(204).send();
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('==============================');
    console.log('Sistema de Cadastro de Alunos');
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Banco de dados: ${DB_FILE}`);
    console.log('==============================');
});