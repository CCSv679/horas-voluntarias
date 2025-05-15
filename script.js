const endpoint = "https://script.google.com/macros/s/AKfycbxd90HX1GcMf8o7GVpApkuILldWjTQDMigZnx511KvUyrO7a_9v0ChBMzf9kflfc2ZC5Q/exec";

const form = document.getElementById("form-voluntario");
const tabelaCorpo = document.querySelector("#tabela-horas tbody");
const mensagem = document.getElementById("mensagem");
const filtroMes = document.getElementById("filtro-mes");
const filtroAno = document.getElementById("filtro-ano");
const btnFiltrar = document.getElementById("btn-filtrar");
const btnImprimir = document.getElementById("btn-imprimir");

// Enviar formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensagem.textContent = "";

  const dados = {
    name: form.nome.value.trim(),
    matricula: form.matricula.value.trim(),
    date: form.data.value,
    hours: parseFloat(form.horas.value)
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(dados)
    });
    const json = await res.json();

    if (json.status === "success") {
      mensagem.style.color = "green";
      mensagem.textContent = "✅ Registro salvo com sucesso!";
      form.reset();
      carregarDados();
      popularFiltros();
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = "❌ Erro ao salvar registro.";
    }
  } catch (err) {
    mensagem.style.color = "red";
    mensagem.textContent = "❌ Erro na conexão com o servidor.";
    console.error(err);
  }
});

// Carregar dados e exibir tabela
async function carregarDados(mes = "", ano = "") {
  try {
    const res = await fetch(endpoint);
    const dados = await res.json();

    tabelaCorpo.innerHTML = "";
    const dadosFiltrados = dados.filter(row => {
      if (!row[2]) return false; // data vazia ou inválida
      const data = new Date(row[2]);
      const mesData = (data.getMonth() + 1).toString().padStart(2, "0");
      const anoData = data.getFullYear().toString();

      return (mes === "" || mes === mesData) && (ano === "" || ano === anoData);
    });

    for (const linha of dadosFiltrados) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${linha[0]}</td>
        <td>${linha[1]}</td>
        <td>${linha[2]}</td>
        <td>${linha[3]}</td>
      `;
      tabelaCorpo.appendChild(tr);
    }

  } catch (err) {
    mensagem.style.color = "red";
    mensagem.textContent = "❌ Erro ao carregar os dados.";
    console.error(err);
  }
}

// Popular filtros com meses e anos únicos
async function popularFiltros() {
  try {
    const res = await fetch(endpoint);
    const dados = await res.json();

    const mesesSet = new Set();
    const anosSet = new Set();

    dados.forEach(row => {
      if (!row[2]) return;
      const data = new Date(row[2]);
      mesesSet.add((data.getMonth() + 1).toString().padStart(2, "0"));
      anosSet.add(data.getFullYear().toString());
    });

    popularSelect(filtroMes, mesesSet);
    popularSelect(filtroAno, anosSet);
  } catch (err) {
    console.error(err);
  }
}

function popularSelect(select, valoresSet) {
  const valores = Array.from(valoresSet).sort();
  select.innerHTML = `<option value="">Todos</option>`;
  valores.forEach(v => {
    const op = document.createElement("option");
    op.value = v;
    op.textContent = v;
    select.appendChild(op);
  });
}

// Eventos dos filtros e botão imprimir
btnFiltrar.addEventListener("click", () => {
  carregarDados(filtroMes.value, filtroAno.value);
});

btnImprimir.addEventListener("click", () => {
  window.print();
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
  popularFiltros();
});
