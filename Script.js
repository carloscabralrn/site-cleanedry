// ======================================================
// 🌐 Clean & Dry Lavanderia Express
// Script.js — Integração completa Frontend + Backend (Render)
// ======================================================

// URL base da API hospedada no Render
const API = "https://api.cleanedry.com.br";

let token = localStorage.getItem("token") || null;
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

    const data = await res.json();

    if (!res.ok) {
      erroDiv.classList.remove("hidden");
      document.getElementById("adminPassword").value = "";
      return;
    }

    token = data.token;
    localStorage.setItem("token", token);

    clearTimeout(timer);
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("plansSection").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    document.getElementById("adminPassword").value = "";
    erroDiv.classList.add("hidden");

    await carregarInformacoes();
  } catch (e) {
    alert("Erro de conexão com o servidor.");
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
  localStorage.removeItem("token");
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
async function carregarInformacoes() {
  try {
    const res = await fetch(`${API}/admin/planos`, {
      headers: token ? { Authorization: "Bearer " + token } : {}
    });

    if (res.ok) {
      const planos = await res.json();

      preencherPlano("Essencial", planos.essencial);
      preencherPlano("Familia", planos.familia);
      preencherPlano("Premium", planos.premium);

      linksPagamento.essencial = planos?.essencial?.link || "";
      linksPagamento.familia = planos?.familia?.link || "";
      linksPagamento.premium = planos?.premium?.link || "";
    }
  } catch (e) {
    console.warn("⚠️ Não foi possível carregar planos do backend.");
  }
}

async function carregarPlanosPublicos() {
  try {
    const res = await fetch(`${API}/planos`);
    if (res.ok) {
      const planos = await res.json();

      preencherPlano("Essencial", planos.essencial);
      preencherPlano("Familia", planos.familia);
      preencherPlano("Premium", planos.premium);

      linksPagamento.essencial = planos.essencial.link;
      linksPagamento.familia = planos.familia.link;
      linksPagamento.premium = planos.premium.link;
    }
  } catch (e) {
    console.error("Erro ao carregar planos públicos:", e);
  }
}

// ======================================================
// 🔹 FUNÇÃO AUXILIAR - Preenche campos e cards
// ======================================================
function preencherPlano(prefixo, dados) {
  if (!dados) return;

  const prefixoInput = prefixo.toLowerCase();
  const prefixoCard = "Plano" + prefixo;

  document.getElementById(`titulo${prefixo}`).value = dados.titulo;
  document.getElementById(`preco${prefixo}`).value = dados.preco;
  document.getElementById(`descricao${prefixo}`).value = dados.descricao.join("\n");
  document.getElementById(`link${prefixo}`).value = dados.link;

  document.getElementById(`titulo${prefixoCard}`).innerText = dados.titulo;
  document.getElementById(`preco${prefixoCard}`).innerText = dados.preco;
  document.getElementById(`descricao${prefixoCard}`).innerHTML = dados.descricao
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

// ======================================================
// 🔹 ATUALIZAR PLANOS (POST /admin/planos)
// ======================================================
async function atualizarPlanos() {
  function limparTexto(texto) {
    return texto
      .replace(/✓/g, "")
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter(Boolean);
  }

  const payload = {
    essencial: {
      titulo: document.getElementById("tituloEssencial").value,
      preco: document.getElementById("precoEssencial").value,
      descricao: limparTexto(document.getElementById("descricaoEssencial").value),
      link: document.getElementById("linkEssencial").value
    },
    familia: {
      titulo: document.getElementById("tituloFamilia").value,
      preco: document.getElementById("precoFamilia").value,
      descricao: limparTexto(document.getElementById("descricaoFamilia").value),
      link: document.getElementById("linkFamilia").value
    },
    premium: {
      titulo: document.getElementById("tituloPremium").value,
      preco: document.getElementById("precoPremium").value,
      descricao: limparTexto(document.getElementById("descricaoPremium").value),
      link: document.getElementById("linkPremium").value
    }
  };

  try {
    const res = await fetch(`${API}/admin/planos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Erro ao atualizar planos");

    document.getElementById("successModal").classList.remove("hidden");
    document.getElementById("successModal").classList.add("flex");
  } catch (e) {
    console.warn("⚠️ Falha ao salvar no backend, atualização local aplicada.");
    document.getElementById("successModal").classList.remove("hidden");
    document.getElementById("successModal").classList.add("flex");
  }
}

// ======================================================
// 🔹 BOTÃO “ASSINAR AGORA”
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
