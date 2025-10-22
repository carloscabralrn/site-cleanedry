// ===============================
// 💻 Clean & Dry - Frontend Script (com JWT)
// ===============================

const API = "https://api.cleanedry.com.br";
let token = sessionStorage.getItem("token") || null;

async function fazerLogin() {
  const senhaEl = document.getElementById("senhaAdmin");
  const senha = (senhaEl?.value || "").trim();
  if (!senha) return alert("Digite a senha do administrador.");

  try {
    const resp = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senha })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Falha ao autenticar.");

    token = data.token;
    sessionStorage.setItem("token", token);

    document.getElementById("loginAdmin").classList.add("hidden");
    document.getElementById("painelAdmin").classList.remove("hidden");

    await carregarPlanos();
    alert("✅ Login realizado!");
  } catch (e) {
    console.error(e);
    alert("❌ Senha incorreta ou servidor indisponível.");
  }
}

async function atualizarPlanos() {
  if (!token) return alert("Sessão expirada. Faça login novamente.");

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
      const resp = await fetch(`${API}/admin/planos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(plano)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || `Erro ao salvar ${plano.nome}`);
    }
    alert("✅ Planos atualizados!");
  } catch (e) {
    console.error(e);
    alert("❌ Erro ao atualizar planos. Tente novamente.");
  }
}

async function carregarPlanos() {
  try {
    const resp = await fetch(`${API}/planos`);
    if (!resp.ok) throw new Error("Falha ao carregar planos.");
    const lista = await resp.json();

    // Preencher campos, se existirem
    lista.forEach((plano) => {
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
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (token) {
    document.getElementById("loginAdmin").classList.add("hidden");
    document.getElementById("painelAdmin").classList.remove("hidden");
    carregarPlanos();
  }
});
