// ======================================================
// Clean & Dry Lavanderia Express - Frontend
// ======================================================

const API_BASE_URL = "https://api.cleanedry.com.br";



// ========================================
// AUTENTICAÇÃO
// ========================================

class AuthManager {
  constructor() {
    this.token = null;
    this.username = null;
  }

  setToken(token, username) {
    this.token = token;
    this.username = username;
  }

  clearToken() {
    this.token = null;
    this.username = null;
  }

  isAuthenticated() {
    return this.token !== null;
  }

  getToken() {
    return this.token;
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }
}

const auth = new AuthManager();

const linksPlanos = {
  essencial: "",
  familia: "",
  premium: ""
};

// ========================================
// INTERFACE
// ========================================

function mostrarLogin() {
  const loginDiv = document.getElementById("adminLogin");
  const plansSection = document.getElementById("plansSection");
  const adminButton = document.getElementById("adminButton");

  if (loginDiv) {
    loginDiv.classList.remove("hidden");
    loginDiv.style.display = "block";
  }
  if (plansSection) plansSection.classList.add("hidden");
  if (adminButton) adminButton.classList.add("hidden");

  const passwordInput = document.getElementById("adminPassword");
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function exibirErroLogin(mensagem) {
  const erroDiv = document.getElementById("senhaErro");
  if (erroDiv) {
    erroDiv.textContent = mensagem;
    erroDiv.classList.remove("hidden");
    erroDiv.style.display = "block";
  }
}

function ocultarErroLogin() {
  const erroDiv = document.getElementById("senhaErro");
  if (erroDiv) {
    erroDiv.classList.add("hidden");
    erroDiv.style.display = "none";
  }
}

function fecharModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.style.display = "none";
  }
  carregarPlanosPublicos();
}

function exibirModalSucesso() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.style.display = "flex";
  }
}

// ========================================
// AUTENTICAÇÃO
// ========================================

async function verificarSenha() {
  const senhaDigitada = document.getElementById("adminPassword")?.value || "";
  const usernameInput = document.getElementById("adminUsername")?.value || "admin";

  if (!senhaDigitada) {
    exibirErroLogin("Por favor, digite a senha.");
    return;
  }

  ocultarErroLogin();

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        username: usernameInput,
        password: senhaDigitada 
      })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      auth.setToken(dados.token, dados.username);

      const adminLogin = document.getElementById("adminLogin");
      if (adminLogin) {
        adminLogin.classList.add("hidden");
        adminLogin.style.display = "none";
      }
      
      const plansSection = document.getElementById("plansSection");
      if (plansSection) {
        plansSection.classList.add("hidden");
        plansSection.style.display = "none";
      }
      
      const adminButton = document.getElementById("adminButton");
      if (adminButton) {
        adminButton.classList.add("hidden");
        adminButton.style.display = "none";
      }

      const heroSection = document.querySelector("header");
      if (heroSection) heroSection.style.display = "none";

      const benefitsSection = document.querySelector(".benefits-section");
      if (benefitsSection) benefitsSection.style.display = "none";

      const footer = document.querySelector("footer");
      if (footer) footer.style.display = "none";
      
      const adminPanel = document.getElementById("adminPanel");
      if (adminPanel) {
        adminPanel.classList.remove("hidden");
        adminPanel.style.display = "block";
      }
      
      ocultarErroLogin();
      await carregarPlanosNoAdmin();
      
    } else {
      exibirErroLogin(dados.message || "Credenciais inválidas.");
      const passwordInput = document.getElementById("adminPassword");
      if (passwordInput) passwordInput.value = "";
    }
  } catch (erro) {
    exibirErroLogin("Erro ao conectar com o servidor. Verifique sua conexão.");
  }
}

function sairAdmin() {
  auth.clearToken();

  const adminPanel = document.getElementById("adminPanel");
  if (adminPanel) {
    adminPanel.classList.add("hidden");
    adminPanel.style.display = "none";
  }

  const plansSection = document.getElementById("plansSection");
  if (plansSection) {
    plansSection.classList.remove("hidden");
    plansSection.style.display = "block";
  }
  
  const adminButton = document.getElementById("adminButton");
  if (adminButton) {
    adminButton.classList.remove("hidden");
    adminButton.style.display = "block";
  }

  const heroSection = document.querySelector("header");
  if (heroSection) heroSection.style.display = "block";

  const benefitsSection = document.querySelector(".benefits-section");
  if (benefitsSection) benefitsSection.style.display = "block";

  const footer = document.querySelector("footer");
  if (footer) footer.style.display = "block";

  carregarPlanosPublicos();
}

// ========================================
// CARREGAR PLANOS
// ========================================

async function carregarPlanosNoAdmin() {
  if (!auth.isAuthenticated()) return;

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/planos`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    
    const planos = await resposta.json();

    preencherCamposAdmin("Essencial", planos[0]);
    preencherCamposAdmin("Familia", planos[1]);
    preencherCamposAdmin("Premium", planos[2]);
  } catch (erro) {
    alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
  }
}

async function carregarPlanosPublicos() {
  try {
    mostrarEstadoCarregamento();
    
    const resposta = await fetch(`${API_BASE_URL}/api/planos`);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    
    const planos = await resposta.json();

    preencherCardPlano("Essencial", planos[0]);
    preencherCardPlano("Familia", planos[1]);
    preencherCardPlano("Premium", planos[2]);
    
    linksPlanos.essencial = planos[0]?.link_pagamento || "";
    linksPlanos.familia = planos[1]?.link_pagamento || "";
    linksPlanos.premium = planos[2]?.link_pagamento || "";
  } catch (erro) {
    // Silencioso
  }
}

// ========================================
// PREENCHIMENTO
// ========================================

function mostrarEstadoCarregamento() {
  const planos = ["Essencial", "Familia", "Premium"];
  
  planos.forEach(prefixo => {
    const titulo = document.getElementById(`tituloPlano${prefixo}`);
    const preco = document.getElementById(`precoPlano${prefixo}`);
    const descricao = document.getElementById(`descricaoPlano${prefixo}`);

    if (titulo) titulo.innerText = "Plano";
    if (preco) preco.innerText = "Carregando...";
    if (descricao) descricao.innerHTML = '<li class="flex items-center"><span class="text-white">Carregando informações...</span></li>';
  });
}

function preencherCamposAdmin(prefixo, plano) {
  if (!plano) return;

  const titulo = document.getElementById(`titulo${prefixo}`);
  const preco = document.getElementById(`preco${prefixo}`);
  const descricao = document.getElementById(`descricao${prefixo}`);
  const link = document.getElementById(`link${prefixo}`);

  if (titulo) titulo.value = plano.titulo || "";
  if (preco) preco.value = plano.preco || "";
  if (descricao) descricao.value = plano.descricao || "";
  if (link) link.value = plano.link_pagamento || "";
}

function preencherCardPlano(prefixo, plano) {
  if (!plano) return;

  const titulo = document.getElementById(`tituloPlano${prefixo}`);
  const preco = document.getElementById(`precoPlano${prefixo}`);
  const descricao = document.getElementById(`descricaoPlano${prefixo}`);

  if (titulo) titulo.innerText = plano.titulo || "Plano";
  if (preco) preco.innerText = plano.preco || "R$ 0,00";
  
  if (descricao && plano.descricao) {
    const itens = plano.descricao.split('\n').filter(item => item.trim());
    const htmlItens = itens.map(item => `
      <li class="flex items-center">
        <span class="text-white mr-3">✓</span>
        <span class="text-white">${escapeHtml(item.trim())}</span>
      </li>
    `).join('');
    descricao.innerHTML = htmlItens;
  }
}

// ========================================
// ATUALIZAÇÃO
// ========================================

function validarPlanoFrontend(plano) {
  const erros = [];
  if (!plano.titulo || plano.titulo.trim().length === 0) erros.push("Título é obrigatório");
  if (!plano.preco || plano.preco.trim().length === 0) erros.push("Preço é obrigatório");
  if (!plano.descricao || plano.descricao.trim().length === 0) erros.push("Descrição é obrigatória");
  
  if (plano.link_pagamento && plano.link_pagamento.trim() !== "") {
    try {
      new URL(plano.link_pagamento);
    } catch {
      erros.push("Link de pagamento inválido");
    }
  }

  return { valido: erros.length === 0, erros: erros };
}

async function atualizarPlanos() {
  if (!auth.isAuthenticated()) {
    alert("❌ Você precisa estar logado para atualizar os planos.");
    mostrarLogin();
    return;
  }

  const planos = [
    {
      id: 1,
      titulo: document.getElementById("tituloEssencial")?.value || "",
      preco: document.getElementById("precoEssencial")?.value || "",
      descricao: document.getElementById("descricaoEssencial")?.value || "",
      link_pagamento: document.getElementById("linkEssencial")?.value || ""
    },
    {
      id: 2,
      titulo: document.getElementById("tituloFamilia")?.value || "",
      preco: document.getElementById("precoFamilia")?.value || "",
      descricao: document.getElementById("descricaoFamilia")?.value || "",
      link_pagamento: document.getElementById("linkFamilia")?.value || ""
    },
    {
      id: 3,
      titulo: document.getElementById("tituloPremium")?.value || "",
      preco: document.getElementById("precoPremium")?.value || "",
      descricao: document.getElementById("descricaoPremium")?.value || "",
      link_pagamento: document.getElementById("linkPremium")?.value || ""
    }
  ];

  const errosValidacao = [];
  planos.forEach((plano, index) => {
    const validacao = validarPlanoFrontend(plano);
    if (!validacao.valido) {
      errosValidacao.push({
        plano: index + 1,
        nome: plano.titulo || `Plano ${index + 1}`,
        erros: validacao.erros
      });
    }
  });

  if (errosValidacao.length > 0) {
    let mensagemErro = "Corrija os seguintes erros:\n\n";
    errosValidacao.forEach(erro => {
      mensagemErro += `${erro.nome}:\n`;
      erro.erros.forEach(e => mensagemErro += `  - ${e}\n`);
      mensagemErro += "\n";
    });
    alert(mensagemErro);
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/planos`, {
      method: "PUT",
      headers: auth.getAuthHeaders(),
      body: JSON.stringify({ planos })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      exibirModalSucesso();
    } else if (resposta.status === 401) {
      alert("⚠️ Sua sessão expirou. Faça login novamente.");
      sairAdmin();
      mostrarLogin();
    } else {
      alert("⚠️ Erro ao salvar planos: " + (resultado.message || "Erro desconhecido"));
    }
  } catch (error) {
    alert("Erro ao conectar com o servidor.");
  }
}

function assinarPlano(tipo) {
  const link = linksPlanos[tipo];
  if (link && link.trim() !== "" && link !== "undefined" && link !== "null") {
    window.open(link, "_blank", "noopener,noreferrer");
  } else {
    alert("Link de pagamento não configurado. Entre em contato conosco pelo WhatsApp!");
  }
}

// ========================================
// UTILITÁRIOS
// ========================================

function escapeHtml(text) {
  const map = {'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#039;'};
  return text.replace(/[&<>"']/g, m => map[m]);
}

function configurarEventListeners() {
  const passwordInput = document.getElementById("adminPassword");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        verificarSenha();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarPlanosPublicos();
  configurarEventListeners();
});