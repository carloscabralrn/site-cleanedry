// ======================================================
// 🌐 Clean & Dry Lavanderia Express
// Script.js — Versão Otimizada com Cache
// ======================================================

const API = "https://api.cleanedry.com.br";
const CACHE_KEY = "cleanedry_planos_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

let token = localStorage.getItem("token") || null;
let linksPagamento = {};
let timer;

// ======================================================
// 🔹 FUNÇÕES DE CACHE
// ======================================================
function salvarCache(dados) {
  const cache = {
    data: dados,
    timestamp: Date.now()
  };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function obterCache() {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    
    // Verificar se expirou (mais de 5 minutos)
    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (e) {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

// ======================================================
// 🔹 LOADING STATE
// ======================================================
function mostrarLoading(show) {
  const section = document.getElementById("plansSection");
  if (!section) return;
  
  if (show) {
    section.style.opacity = "0.6";
    section.style.pointerEvents = "none";
  } else {
    section.style.opacity = "1";
    section.style.pointerEvents = "auto";
  }
}

// ======================================================
// 🔹 CARREGAR PLANOS (UNIFICADO COM CACHE)
// ======================================================
async function carregarPlanos(forceRefresh = false) {
  mostrarLoading(true);

  try {
    const res = await fetch(`${API}/planos`);
    if (!res.ok) throw new Error("Erro ao buscar planos");

    const planos = await res.json();

    // Aplicar dados reais vindos do backend
    aplicarPlanos(planos);

    // Salvar cache para próxima visita (dados reais)
    salvarCache(planos);

    console.log("✅ Planos carregados da API com sucesso");

  } catch (e) {
    console.error("❌ Erro ao carregar planos:", e);

    const cached = obterCache();
    if (cached) {
      aplicarPlanos(cached);
      console.warn("⚠️ Mostrando planos do cache (dados anteriores)");
    } else {
      alert("Erro ao carregar informações dos planos. Tente novamente mais tarde.");
    }
  } finally {
    mostrarLoading(false);
  }
}


// ======================================================
// 🔹 APLICAR PLANOS NOS CARDS
// ======================================================
function aplicarPlanos(planos) {
  if (!planos) return;

  preencherPlano("Essencial", planos.essencial);
  preencherPlano("Familia", planos.familia);
  preencherPlano("Premium", planos.premium);

  linksPagamento = {
    essencial: planos.essencial?.link || "",
    familia: planos.familia?.link || "",
    premium: planos.premium?.link || ""
  };
}

// ======================================================
// 🔹 PREENCHER PLANO (CARDS + ADMIN)
// ======================================================
function preencherPlano(prefixo, dados) {
  if (!dados) return;

  const prefixoCard = "Plano" + prefixo;

  // Preencher campos do ADMIN (se existirem)
  const tituloInput = document.getElementById(`titulo${prefixo}`);
  const precoInput = document.getElementById(`preco${prefixo}`);
  const descricaoInput = document.getElementById(`descricao${prefixo}`);
  const linkInput = document.getElementById(`link${prefixo}`);

  if (tituloInput) tituloInput.value = dados.titulo;
  if (precoInput) precoInput.value = dados.preco;
  if (descricaoInput) descricaoInput.value = dados.descricao.join("\n");
  if (linkInput) linkInput.value = dados.link;

  // Preencher CARDS públicos
  const tituloCard = document.getElementById(`titulo${prefixoCard}`);
  const precoCard = document.getElementById(`preco${prefixoCard}`);
  const descricaoCard = document.getElementById(`descricao${prefixoCard}`);

  if (tituloCard) tituloCard.innerText = dados.titulo;
  if (precoCard) precoCard.innerText = dados.preco;
  
  if (descricaoCard) {
    descricaoCard.innerHTML = dados.descricao
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
// 🔹 MOSTRAR LOGIN ADMIN
// ======================================================
function mostrarLogin() {
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("plansSection").classList.add("hidden");
  document.getElementById("adminButton").classList.add("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
  
  // Timer de 60 segundos para fechar automaticamente
  timer = setTimeout(() => {
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("plansSection").classList.remove("hidden");
    document.getElementById("adminButton").classList.remove("hidden");
  }, 60000);
}

// ======================================================
// 🔹 LOGIN ADMIN
// ======================================================
async function verificarSenha() {
  const senhaDigitada = document.getElementById("adminPassword").value;
  const erroDiv = document.getElementById("senhaErro");

  if (!senhaDigitada) {
    erroDiv.textContent = "Por favor, digite a senha.";
    erroDiv.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senhaDigitada })
    });

    const data = await res.json();

    if (!res.ok) {
      erroDiv.textContent = data.message || "Senha incorreta.";
      erroDiv.classList.remove("hidden");
      document.getElementById("adminPassword").value = "";
      return;
    }

    // Login bem-sucedido
    token = data.token;
    localStorage.setItem("token", token);

    clearTimeout(timer);
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("plansSection").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    document.getElementById("adminPassword").value = "";
    erroDiv.classList.add("hidden");

    // Carregar informações do admin
    await carregarInformacoesAdmin();
    
  } catch (e) {
    console.error("Erro ao fazer login:", e);
    erroDiv.textContent = "Erro de conexão com o servidor.";
    erroDiv.classList.remove("hidden");
  }
}

// ======================================================
// 🔹 CARREGAR INFORMAÇÕES ADMIN
// ======================================================
async function carregarInformacoesAdmin() {
  if (!token) return;
  
  try {
    const res = await fetch(`${API}/admin/planos`, {
      headers: { Authorization: "Bearer " + token }
    });

    // Verificar se token expirou
    if (res.status === 401) {
      localStorage.removeItem("token");
      token = null;
      alert("Sessão expirada. Faça login novamente.");
      sairAdmin();
      return;
    }

    if (res.ok) {
      const planos = await res.json();
      
      // Preencher campos do admin
      preencherPlano("Essencial", planos.essencial);
      preencherPlano("Familia", planos.familia);
      preencherPlano("Premium", planos.premium);
      
      // Atualizar cache e cards públicos
      salvarCache(planos);
      aplicarPlanos(planos);
      
      console.log("✅ Informações admin carregadas");
    }
  } catch (e) {
    console.error("❌ Erro ao carregar informações admin:", e);
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
// 🔹 ATUALIZAR PLANOS (ADMIN)
// ======================================================
async function atualizarPlanos() {
  if (!token) {
    alert("Você precisa estar logado para atualizar os planos.");
    return;
  }

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

    if (res.status === 401) {
      localStorage.removeItem("token");
      token = null;
      alert("Sessão expirada. Faça login novamente.");
      sairAdmin();
      return;
    }

    if (!res.ok) {
      throw new Error("Erro ao atualizar planos");
    }

    // Atualizar cache com novos dados
    salvarCache(payload);
    aplicarPlanos(payload);

    // Mostrar modal de sucesso
    document.getElementById("successModal").classList.remove("hidden");
    document.getElementById("successModal").classList.add("flex");
    
    console.log("✅ Planos atualizados com sucesso");
    
  } catch (e) {
    console.error("❌ Erro ao atualizar planos:", e);
    alert("Erro ao atualizar planos. Tente novamente.");
  }
}

// ======================================================
// 🔹 FECHAR MODAL DE SUCESSO
// ======================================================
function fecharModal() {
  document.getElementById("successModal").classList.add("hidden");
  document.getElementById("successModal").classList.remove("flex");
}

// ======================================================
// 🔹 BOTÃO "ASSINAR AGORA"
// ======================================================
function assinarPlano(plano) {
  const link = linksPagamento[plano];
  
  if (link && link.trim() !== "") {
    window.open(link, "_blank", "noopener,noreferrer");
  } else {
    alert("Link de pagamento ainda não configurado para este plano. Entre em contato conosco!");
  }
}

// ======================================================
// 🔹 EVENTOS INICIAIS
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Clean & Dry - Sistema inicializado");

  // Enter no campo de senha
  const pass = document.getElementById("adminPassword");
  if (pass) {
    pass.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        verificarSenha();
      }
    });
  }

  // Clique fora do modal fecha ele
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        fecharModal();
      }
    });
  }

  // CARREGAR PLANOS AUTOMATICAMENTE
  carregarPlanos();
  
  console.log("✅ Planos sendo carregados...");
});