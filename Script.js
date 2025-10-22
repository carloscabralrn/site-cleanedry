// ======================================================
// 🌊 Clean & Dry Lavanderia Express
// Script.js — Integração completa Frontend + Backend (Render)
// ======================================================

// URL base da API hospedada no Render
const API = "https://api.cleanedry.com.br";

// Armazena token em memória (não usa localStorage)
let token = null;
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
  
  // Timer da senha - 60 segundos
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
      body: JSON.stringify({ password: senhaDigitada })
    });

    if (res.status === 401) {
      // Senha incorreta
      erroDiv.classList.remove("hidden");
      document.getElementById("adminPassword").value = "";
      return;
    }

    if (!res.ok) {
      throw new Error("Erro inesperado");
    }

    const data = await res.json();

    if (!data.token) {
      throw new Error("Token não recebido.");
    }

    token = data.token;

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
    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }
    
    const dados = await res.json();
    console.log("Planos carregados:", dados);

    // Garante que dados inválidos não quebrem o app
    const planos = {};
    dados.forEach((plano) => {
      if (!plano.nome) return; // Ignora planos sem nome

      const nome = plano.nome.toLowerCase();

      planos[nome] = {
        titulo: plano.titulo || "",
        preco: plano.preco || "",
        descricao: Array.isArray(plano.descricao) 
          ? plano.descricao 
          : typeof plano.descricao === "string"
          ? plano.descricao.split(";").map((d) => d.trim()).filter(Boolean)
          : [],
        link: plano.link || ""
      };
    });

    preencherPlano("Essencial", planos.essencial);
    preencherPlano("Familia", planos.familia);
    preencherPlano("Premium", planos.premium);

    // Apenas define links se existirem
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

  // Preenche inputs do admin
  const inputTitulo = document.getElementById(`titulo${prefixo}`);
  const inputPreco = document.getElementById(`preco${prefixo}`);
  const inputDescricao = document.getElementById(`descricao${prefixo}`);
  const inputLink = document.getElementById(`link${prefixo}`);

  if (inputTitulo) inputTitulo.value = dados.titulo;
  if (inputPreco) inputPreco.value = dados.preco;
  if (inputDescricao) inputDescricao.value = dados.descricao.join("\n");
  if (inputLink) inputLink.value = dados.link;

  // Preenche cards públicos
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
    return texto
      .replace(/✓/g, "")
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter(Boolean);
  }

  try {
    // ESSENCIAL
    const res1 = await fetch(`${API}/admin/planos/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        titulo: document.getElementById("tituloEssencial").value,
        preco: document.getElementById("precoEssencial").value,
        descricao: limparTexto(document.getElementById("descricaoEssencial").value),
        link: document.getElementById("linkEssencial").value
      })
    });

    if (!res1.ok) throw new Error(`Erro ao atualizar Essencial: ${res1.status}`);

    // FAMÍLIA
    const res2 = await fetch(`${API}/admin/planos/2`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        titulo: document.getElementById("tituloFamilia").value,
        preco: document.getElementById("precoFamilia").value,
        descricao: limparTexto(document.getElementById("descricaoFamilia").value),
        link: document.getElementById("linkFamilia").value
      })
    });

    if (!res2.ok) throw new Error(`Erro ao atualizar Família: ${res2.status}`);

    // PREMIUM
    const res3 = await fetch(`${API}/admin/planos/3`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        titulo: document.getElementById("tituloPremium").value,
        preco: document.getElementById("precoPremium").value,
        descricao: limparTexto(document.getElementById("descricaoPremium").value),
        link: document.getElementById("linkPremium").value
      })
    });

    if (!res3.ok) throw new Error(`Erro ao atualizar Premium: ${res3.status}`);

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

  carregarPlanosPublicos(); // Carrega planos automaticamente
});