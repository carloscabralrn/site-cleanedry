// ======================================================
// 🌊 Clean & Dry Lavanderia Express
// Script.js — Integração completa Frontend + Backend (Render)
// ======================================================

const API = "https://api.cleanedry.com.br";

// 🔐 Agora o token é persistente
let token = localStorage.getItem("token");
let linksPagamento = {};
let timer;

// ======================================================
// 🔹 MOSTRAR LOGIN ADMIN
// ======================================================
function mostrarLogin() {
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("plansSection").classList.add("hidden");
  document.getElementById("adminButton").classList.add("hidden");
  document.getElementById("adminPanel").classList.add("hidden");

  clearTimeout(timer);
  timer = setTimeout(() => {
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("plansSection").classList.remove("hidden");
    document.getElementById("adminButton").classList.remove("hidden");
  }, 60000);
}

// ======================================================
// 🔹 LOGIN ADMIN (sem username)
// ======================================================
async function verificarSenha() {
  const senhaDigitada = document.getElementById("adminPassword").value;
  const erroDiv = document.getElementById("senhaErro");

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senhaDigitada }),
    });

    if (res.status === 401) {
      erroDiv.classList.remove("hidden");
      document.getElementById("adminPassword").value = "";
      return;
    }

    if (!res.ok) throw new Error("Erro inesperado");

    const data = await res.json();

    if (!data.token) throw new Error("Token não recebido.");

    token = data.token;
    localStorage.setItem("token", token); // 🔐 salva token no navegador

    clearTimeout(timer);
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("plansSection").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    document.getElementById("adminPassword").value = "";
    erroDiv.classList.add("hidden");

    await carregarPlanosPublicos();
  } catch (e) {
    console.error("Erro no login:", e);
    alert("❌ Erro ao conectar com o servidor. Verifique sua conexão.");
    document.getElementById("adminPanel").classList.add("hidden");
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("plansSection").classList.remove("hidden");
  }
}

// ======================================================
// 🔹 SAIR DO PAINEL ADMIN
// ======================================================
function sairAdmin() {
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("plansSection").classList.remove("hidden");
  document.getElementById("adminLogin").classList.add("hidden");
  document.getElementById("adminButton").classList.remove("hidden");
  token = null;
  localStorage.removeItem("token"); // ❌ remove token ao sair
}

// ======================================================
// 🔹 FECHAR MODAL DE SUCESSO
// ======================================================
function fecharModal() {
  document.getElementById("successModal").classList.add("hidden");
  document.getElementById("successModal").classList.remove("flex");
}

// ======================================================
// 🔹 CARREGAR PLANOS (ADMIN + PÚBLICO)
// ======================================================
async function carregarPlanosPublicos() {
  try {
    const res = await fetch(`${API}/planos`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

    const dados = await res.json();
    console.log("Planos carregados:", dados);

    const planos = {};
    dados.forEach((plano) => {
      if (!plano.nome) return;
      const nome = plano.nome.toLowerCase();
      planos[nome] = {
        titulo: plano.titulo || "",
        preco: plano.preco || "",
        descricao: Array.isArray(plano.descricao)
          ? plano.descricao
          : typeof plano.descricao === "string"
          ? plano.descricao.split(";").map((d) => d.trim()).filter(Boolean)
          : [],
        link: plano.link || "",
      };
    });

    preencherPlano("Essencial", planos.essencial);
    preencherPlano("Familia", planos.familia);
    preencherPlano("Premium", planos.premium);

    linksPagamento.essencial = planos.essencial?.link || "";
    linksPagamento.familia = planos.familia?.link || "";
    linksPagamento.premium = planos.premium?.link || "";
  } catch (e) {
    console.error("Erro ao carregar planos públicos:", e);
  }
}

// ======================================================
// 🔹 FUNÇÃO AUXILIAR - Preenche campos e cards
// ======================================================
function preencherPlano(prefixo, dados) {
  if (!dados) return;

  const prefixoCard = "Plano" + prefixo;

  const inputTitulo = document.getElementById(`titulo${prefixo}`);
  const inputPreco = document.getElementById(`preco${prefixo}`);
  const inputDescricao = document.getElementById(`descricao${prefixo}`);
  const inputLink = document.getElementById(`link${prefixo}`);

  if (inputTitulo) inputTitulo.value = dados.titulo;
  if (inputPreco) inputPreco.value = dados.preco;
  if (inputDescricao) inputDescricao.value = dados.descricao.join("\n");
  if (inputLink) inputLink.value = dados.link;

  const cardTitulo = document.getElementById(`titulo${prefixoCard}`);
  const cardPreco = document.getElementById(`preco${prefixoCard}`);
  const cardDescricao = document.getElementById(`descricao${prefixoCard}`);

  if (cardTitulo) cardTitulo.innerText = dados.titulo;
  if (cardPreco) cardPreco.innerText = dados.preco;
  if (cardDescricao) {
    cardDescricao.innerHTML = dados.descricao
      .map(
        (item) => `
        <li class="flex items-center">
          <span class="text-white mr-3">✓</span>
          <span class="text-white">${item}</span>
        </li>
      `
      )
      .join("");
  }
}

// ======================================================
// 🔹 ATUALIZAR PLANOS (PUT /admin/planos/:id)
// ======================================================
async function atualizarPlanos() {
  if (!token) {
    alert("❌ Você precisa estar logado para atualizar os planos.");
    return;
  }

  function limparTexto(texto) {
    if (!texto) return [];
    return texto
      .split(/\r?\n/)
      .map((linha) => linha.replace(/^[\s✓✔️]+/, "").trim())
      .filter(Boolean);
  }

  try {
    console.log("Iniciando atualização dos planos...");

    const planos = [
      { id: 1, nome: "Essencial" },
      { id: 2, nome: "Familia" },
      { id: 3, nome: "Premium" },
    ];

    for (const plano of planos) {
      const dados = {
        titulo: document.getElementById(`titulo${plano.nome}`).value,
        preco: document.getElementById(`preco${plano.nome}`).value,
        descricao: limparTexto(
          document.getElementById(`descricao${plano.nome}`).value
        ),
        link: document.getElementById(`link${plano.nome}`).value,
      };

      const res = await fetch(`${API}/admin/planos/${plano.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(dados),
      });

      console.log(`Resposta ${plano.nome}:`, res.status);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao atualizar ${plano.nome}: ${errorText}`);
      }
    }

    console.log("Todos os planos atualizados com sucesso!");
    await carregarPlanosPublicos();

    document.getElementById("successModal").classList.remove("hidden");
    document.getElementById("successModal").classList.add("flex");
  } catch (e) {
    console.error("Erro ao atualizar planos:", e);
    alert("⚠️ Erro ao salvar: " + e.message);
  }
}

// ======================================================
// 🔹 BOTÃO "ASSINAR AGORA"
// ======================================================
function assinarPlano(plano) {
  const link = linksPagamento[plano];
  if (link && link.trim() !== "") {
    window.open(link, "_blank", "noopener,noreferrer");
  } else {
    alert("Link de pagamento ainda não configurado.");
  }
}

// ======================================================
// 🔹 EVENTOS INICIAIS
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token"); // 🔄 recupera token salvo

  if (token) {
    document.getElementById("adminPanel").classList.remove("hidden");
    document.getElementById("plansSection").classList.add("hidden");
    console.log("🔐 Sessão admin restaurada");
  }

  const pass = document.getElementById("adminPassword");
  if (pass) {
    pass.addEventListener("keypress", (e) => {
      if (e.key === "Enter") verificarSenha();
    });
  }

  const modal = document.getElementById("successModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModal();
    });
  }

  carregarPlanosPublicos();
});
