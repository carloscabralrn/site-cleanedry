// Configuração da API local
const API = "http://localhost:3000";
let token = localStorage.getItem("token") || null;
let linksPagamento = {};
let timer;

function mostrarLogin() {
  document.getElementById('adminLogin').classList.remove('hidden');
  document.getElementById('plansSection').classList.add('hidden');
  document.getElementById('adminButton').classList.add('hidden');
  document.getElementById('adminPanel').classList.add('hidden');

  timer = setTimeout(function() {
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('plansSection').classList.remove('hidden');
    document.getElementById('adminButton').classList.remove('hidden');
  }, 10000);
}

async function verificarSenha() {
  const username = 'admin';
  const senhaDigitada = document.getElementById('adminPassword').value;
  const erroDiv = document.getElementById('senhaErro');
  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: senhaDigitada })
    });
    const data = await res.json();
    if (!res.ok) {
      erroDiv.classList.remove('hidden');
      document.getElementById('adminPassword').value = '';
      return;
    }
    token = data.token;
    localStorage.setItem('token', token);

    clearTimeout(timer);
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('plansSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('adminPassword').value = '';
    erroDiv.classList.add('hidden');

    await carregarInformacoes();
  } catch (e) {
    alert('Erro de conexão com o servidor.');
  }
}
       // Bloco de quebra de linha para listas
function linhasParaUl(listaId, texto) {
  const ul = document.getElementById(listaId);
  ul.innerHTML = ""; // limpa lista antiga
  const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== "");
  linhas.forEach(item => {
    const li = document.createElement("li");
    li.className = "flex items-center";
    li.innerHTML = `
      <span class="text-white mr-3">✓</span>
      <span class="text-white">${item}</span>
    `;
    ul.appendChild(li);
  });
}


function sairAdmin() {
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('plansSection').classList.remove('hidden');
  document.getElementById('adminLogin').classList.add('hidden');
  document.getElementById('adminButton').classList.remove('hidden');
}

async function carregarInformacoes() {
  try {
    const res = await fetch(API + '/admin/planos', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    if (res.ok) {
      const planos = await res.json();

      const setPlano = (prefixoInput, prefixoCard, obj) => {
        if (!obj) return;
        if (obj.titulo) {
          document.getElementById(prefixoInput.replace('titulo','titulo')).value = obj.titulo;
          document.getElementById(prefixoCard.replace('titulo','titulo')).innerText = obj.titulo;
        }
        if (obj.preco) {
          document.getElementById(prefixoInput.replace('titulo','preco')).value = obj.preco;
          document.getElementById(prefixoCard.replace('titulo','preco')).innerText = obj.preco;
        }
        if (obj.descricao && Array.isArray(obj.descricao)) {
          // ✅ agora usamos '\n' para exibir cada item em nova linha
          document.getElementById(prefixoInput.replace('titulo','descricao')).value = obj.descricao.join('\n');
          document.getElementById(prefixoCard.replace('titulo','descricao')).innerHTML = obj.descricao.map(item => `
            <li class="flex items-center">
              <span class="text-white mr-3">✓</span>
              <span class="text-white">${item}</span>
            </li>`).join('');
        }
        if (obj.link) {
          document.getElementById(prefixoInput.replace('titulo','link')).value = obj.link;
        }
      };

      setPlano('tituloEssencial', 'tituloPlanoEssencial', planos.essencial);
      setPlano('tituloFamilia',   'tituloPlanoFamilia',   planos.familia);
      setPlano('tituloPremium',   'tituloPlanoPremium',   planos.premium);

      linksPagamento.essencial = planos?.essencial?.link || '';
      linksPagamento.familia   = planos?.familia?.link   || '';
      linksPagamento.premium   = planos?.premium?.link   || '';
    }
  } catch (e) {
    console.warn('Não foi possível carregar planos do backend ainda.');
  }

  // ✅ Fallback local, também corrigido
  document.getElementById('descricaoEssencial').value = Array.from(
    document.getElementById('descricaoPlanoEssencial').getElementsByTagName('span')
  ).map(el => el.innerText).join('\n');

  document.getElementById('descricaoFamilia').value = Array.from(
    document.getElementById('descricaoPlanoFamilia').getElementsByTagName('span')
  ).map(el => el.innerText).join('\n');

  document.getElementById('descricaoPremium').value = Array.from(
    document.getElementById('descricaoPlanoPremium').getElementsByTagName('span')
  ).map(el => el.innerText).join('\n');
}

async function atualizarPlanos() {
  linksPagamento.essencial = document.getElementById('linkEssencial').value;
  linksPagamento.familia = document.getElementById('linkFamilia').value;
  linksPagamento.premium = document.getElementById('linkPremium').value;

  // Função auxiliar para limpar e transformar as linhas
  function limparTexto(texto) {
    return texto
      .replace(/✓/g, '') // remove o símbolo ✓ se o usuário digitar
      .split(/\r?\n/) // quebra por linha
      .map(linha => linha.trim()) // remove espaços
      .filter(Boolean); // remove linhas vazias
  }

  // 🔹 Plano Essencial
  const descEssencial = limparTexto(document.getElementById('descricaoEssencial').value);
  document.getElementById('tituloPlanoEssencial').innerText = document.getElementById('tituloEssencial').value;
  document.getElementById('precoPlanoEssencial').innerText = document.getElementById('precoEssencial').value;
  document.getElementById('descricaoPlanoEssencial').innerHTML = descEssencial
    .map(item => `
      <li class="flex items-center">
        <span class="text-white mr-3">✓</span>
        <span class="text-white">${item}</span>
      </li>
    `)
    .join('');

  // 🔹 Plano Família
  const descFamilia = limparTexto(document.getElementById('descricaoFamilia').value);
  document.getElementById('tituloPlanoFamilia').innerText = document.getElementById('tituloFamilia').value;
  document.getElementById('precoPlanoFamilia').innerText = document.getElementById('precoFamilia').value;
  document.getElementById('descricaoPlanoFamilia').innerHTML = descFamilia
    .map(item => `
      <li class="flex items-center">
        <span class="text-white mr-3">✓</span>
        <span class="text-white">${item}</span>
      </li>
    `)
    .join('');

  // 🔹 Plano Premium
  const descPremium = limparTexto(document.getElementById('descricaoPremium').value);
  document.getElementById('tituloPlanoPremium').innerText = document.getElementById('tituloPremium').value;
  document.getElementById('precoPlanoPremium').innerText = document.getElementById('precoPremium').value;
  document.getElementById('descricaoPlanoPremium').innerHTML = descPremium
    .map(item => `
      <li class="flex items-center">
        <span class="text-white mr-3">✓</span>
        <span class="text-white">${item}</span>
      </li>
    `)
    .join('');

  // Payload para backend
  const payload = {
    essencial: {
      titulo: document.getElementById('tituloEssencial').value,
      preco: document.getElementById('precoEssencial').value,
      descricao: descEssencial,
      link: document.getElementById('linkEssencial').value
    },
    familia: {
      titulo: document.getElementById('tituloFamilia').value,
      preco: document.getElementById('precoFamilia').value,
      descricao: descFamilia,
      link: document.getElementById('linkFamilia').value
    },
    premium: {
      titulo: document.getElementById('tituloPremium').value,
      preco: document.getElementById('precoPremium').value,
      descricao: descPremium,
      link: document.getElementById('linkPremium').value
    }
  };

  try {
    const res = await fetch(API + '/admin/planos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao salvar planos');
  } catch (e) {
    console.warn('Não foi possível salvar no servidor, mas atualização local feita.');
  }

  document.getElementById('successModal').classList.remove('hidden');
  document.getElementById('successModal').classList.add('flex');
}


function fecharModal() {
  document.getElementById('successModal').classList.add('hidden');
  document.getElementById('successModal').classList.remove('flex');
}

function assinarPlano(plano) {
  const link = linksPagamento[plano];
  if (link && link.trim() !== '') {
    window.open(link, '_blank', 'noopener,noreferrer');
  } else {
    alert('Link de pagamento ainda não configurado. Por favor, entre em contato conosco para assinar este plano!');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const pass = document.getElementById('adminPassword');
  if (pass) {
    pass.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        verificarSenha();
      }
    });
  }
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        fecharModal();
      }
    });
  }
});
