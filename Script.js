// ===============================
// 💻 Clean & Dry - Frontend Script Atualizado (com JWT)
// ===============================

const API = "https://api.cleanedry.com.br"; // 👉 Mantenha assim (sem /api)
let token = sessionStorage.getItem("token") || null;

// ===============================
// 🔐 LOGIN ADMIN
// ===============================
async function fazerLogin() {
  const senha = document.getElementById("senhaAdmin").value.trim();
  if (!senha) {
    alert("Digite a senha de administrador.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senha }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.error || "Falha ao autenticar.");
    }

    const dados = await resposta.json();
    token = dados.token;
    sessionStorage.setItem("token", token);

    alert("✅ Login realizado com sucesso!");
    document.getElementById("loginAdmin").style.display = "none";
    document.getElementById("painelAdmin").style.display = "block";
  } catch (err) {
    console.error("Erro no login:", err);
    alert("❌ Senha incorreta ou servidor indisponível.");
  }
}

// ===============================
// 🔁 ATUALIZAR PLANOS (rota protegida)
// ===============================
async function atualizarPlanos() {
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    return;
  }

  const planos = [
    {
      nome: "essencial",
      titulo: document.getElementById("tituloPlanoEssencial").value.trim(),
      preco: document.getElementById("precoPlanoEssencial").value.trim(),
      descricao: document.getElementById("descricaoPlanoEssencial").value.trim(),
      link: document.getElementById("linkPlanoEssencial").value.trim(),
    },
    {
      nome: "familia",
      titulo: document.getElementById("tituloPlanoFamilia").value.trim(),
      preco: document.getElementById("precoPlanoFamilia").value.trim(),
      descricao: document.getElementById("descricaoPlanoFamilia").value.trim(),
      link: document.getElementById("linkPlanoFamilia").value.trim(),
    },
    {
      nome: "premium",
      titulo: document.getElementById("tituloPlanoPremium").value.trim(),
      preco: document.getElementById("precoPlanoPremium").value.trim(),
      descricao: document.getElementById("descricaoPlanoPremium").value.trim(),
      link: document.getElementById("linkPlanoPremium").value.trim(),
    },
  ];

  try {
    for (const plano of planos) {
      const resposta = await fetch(`${API}/admin/planos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(plano),
      });

      if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}));
        throw new Error(erro.error || `Erro ao atualizar ${plano.nome}`);
      }
    }

    alert("✅ Planos atualizados com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar planos:", err);
    alert("❌ Erro ao atualizar planos. Tente novamente.");
  }
}

// ===============================
// 🌍 CARREGAR PLANOS (rota pública)
// ===============================
async function carregarPlanos() {
  try {
    const resposta = await fetch(`${API}/planos`);
    if (!resposta.ok) throw new Error("Falha ao carregar planos.");
    const dados = await resposta.json();

    dados.forEach(plano => {
      if (plano.nome === "essencial") {
        document.getElementById("tituloPlanoEssencial").value = plano.titulo || "";
        document.getElementById("precoPlanoEssencial").value = plano.preco || "";
        document.getElementById("descricaoPlanoEssencial").value = plano.descricao || "";
        document.getElementById("linkPlanoEssencial").value = plano.link || "";
      } else if (plano.nome === "familia") {
        document.getElementById("tituloPlanoFamilia").value = plano.titulo || "";
        document.getElementById("precoPlanoFamilia").value = plano.preco || "";
        document.getElementById("descricaoPlanoFamilia").value = plano.descricao || "";
        document.getElementById("linkPlanoFamilia").value = plano.link || "";
      } else if (plano.nome === "premium") {
        document.getElementById("tituloPlanoPremium").value = plano.titulo || "";
        document.getElementById("precoPlanoPremium").value = plano.preco || "";
        document.getElementById("descricaoPlanoPremium").value = plano.descricao || "";
        document.getElementById("linkPlanoPremium").value = plano.link || "";
      }
    });
  } catch (err) {
    console.error("Erro ao carregar planos:", err);
  }
}

// ===============================
// ⚙️ EVENTOS AO CARREGAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  carregarPlanos();
  const painel = document.getElementById("painelAdmin");
  if (token) painel.style.display = "block";
});

