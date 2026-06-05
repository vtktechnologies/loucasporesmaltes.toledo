// Configurações Globais
const TELEFONE_LOJA = "554599145112"; 
let carrinho = [];

document.addEventListener("DOMContentLoaded", () => {
    // Verifica se estamos na página de catálogo antes de rodar as funções específicas
    if (document.getElementById("grid-produtos")) {
        carregarProdutos();
    }
    atualizarInterfaceCarrinho();
});

// Busca os produtos no arquivo JSON e renderiza na tela
async function carregarProdutos() {
    try {
        const resposta = await fetch("produtos.json");
        const produtos = await resposta.json(); // <--- Linha corrigida aqui!
        renderizarProdutos(produtos);
    } catch (erro) {
        console.error("Erro ao carregar dados do catálogo:", erro);
        document.getElementById("grid-produtos").innerHTML = "<p>Erro ao carregar os produtos. Tente novamente mais tarde.</p>";
    }
}

function renderizarProdutos(produtos) {
    const grid = document.getElementById("grid-produtos");
    grid.innerHTML = "";

    produtos.forEach(produto => {
        // Gera a marcação HTML das bolinhas de cores dinamicamente
        let coresHTML = "";
        const chavesCores = Object.keys(produto.cores);
        
        chavesCores.forEach((nomeCor, index) => {
            const hexCor = produto.cores[nomeCor];
            coresHTML += `
                <label class="container-cor-seletor">
                    <input type="radio" name="cor-${produto.id}" value="${nomeCor}" ${index === 0 ? 'checked' : ''}>
                    <span class="bolinha-cor" style="background-color: ${hexCor};" title="${nomeCor}"></span>
                </label>
            `;
        });

        const card = document.createElement("div");
        card.className = "card-produto";
        card.innerHTML = `
            <img src="${produto.foto}" alt="${produto.nome}" onerror="this.src='https://placehold.co/300x300?text=Produto'">
            <div class="card-produto-info">
                <h4>${produto.nome}</h4>
                <p class="preco-produto">R$ ${produto.valor.toFixed(2).replace('.', ',')}</p>
                <div class="seletor-cores-wrapper">
                    <p class="label-cor">Cor/Opção:</p>
                    <div class="lista-cores-bolinhas">${coresHTML}</div>
                </div>
                <button class="btn-adicionar" onclick="adicionarAoCarrinhoDoCard(${produto.id}, '${produto.nome}', ${produto.valor})">Adicionar ao Carrinho</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function adicionarAoCarrinhoDoCard(id, nome, valor) {
    // Descobre qual cor estava marcada no input radio daquele card específico
    const radioMarcado = document.querySelector(`input[name="cor-${id}"]:checked`);
    const corSelecionada = radioMarcado ? radioMarcado.value : "Padrão";

    // Chave única para diferenciar se o mesmo produto foi adicionado com cores diferentes
    const itemIdentificador = `${id}-${corSelecionada}`;

    const itemExistente = carrinho.find(item => item.chave === itemIdentificador);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            chave: itemIdentificador,
            id: id,
            nome: nome,
            valor: valor,
            cor: corSelecionada,
            quantidade: 1
        });
    }

    atualizarInterfaceCarrinho();
}

function alterarQuantidadeItem(chave, mudanca) {
    const item = carrinho.find(item => item.chave === chave);
    if (!item) return;

    item.quantidade += mudanca;

    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.chave !== chave);
    }

    atualizarInterfaceCarrinho();
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById("itens-carrinho");
    const containerTotal = document.getElementById("valor-total-carrinho");
    const containerNavContagem = document.getElementById("contagem-carrinho-nav");

    if (!containerItens) return;

    if (carrinho.length === 0) {
        containerItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
        containerTotal.innerText = "R$ 0,00";
        if(containerNavContagem) containerNavContagem.innerText = "0";
        return;
    }

    containerItens.innerHTML = "";
    let totalGeral = 0;
    let totalItensContador = 0;

    carrinho.forEach(item => {
        const subtotalItem = item.valor * item.quantidade;
        totalGeral += subtotalItem;
        totalItensContador += item.quantidade;

        const elementoItem = document.createElement("div");
        elementoItem.className = "item-carrinho-linha";
        elementoItem.innerHTML = `
            <div class="item-dados">
                <p class="item-nome"><strong>${item.nome}</strong></p>
                <p class="item-detalhe">Cor: ${item.cor} - R$ ${item.valor.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="item-controles">
                <button onclick="alterarQuantidadeItem('${item.chave}', -1)">-</button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQuantidadeItem('${item.chave}', 1)">+</button>
            </div>
        `;
        containerItens.appendChild(elementoItem);
    });

    containerTotal.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    if(containerNavContagem) containerNavContagem.innerText = totalItensContador;
}

// Vincula a ação de envio de dados ao botão do WhatsApp
const btnFinalizar = document.getElementById("btn-finalizar-whats");
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio! Adicione produtos antes de finalizar.");
            return;
        }

        let textoMensagem = "Olá, gostaria de finalizar a compra que fiz no site referente aos seguintes itens:\n\n";
        let totalGeral = 0;

        carrinho.forEach(item => {
            const subtotal = item.valor * item.quantidade;
            totalGeral += subtotal;
            textoMensagem += `• ${item.nome} (${item.cor}) - ${item.quantidade}x - R$ ${item.valor.toFixed(2).replace('.', ',')} un - R$ ${subtotal.toFixed(2).replace('.', ',')} total\n`;
        });

        textoMensagem += `\n*Total geral - R$ ${totalGeral.toFixed(2).replace('.', ',')}*`;

        // Codifica o texto plano para o formato aceito em URLs nativas
        const textoCodificado = encodeURIComponent(textoMensagem);
        const urlLinkWhatsApp = `https://api.whatsapp.com/send?phone=${TELEFONE_LOJA}&text=${textoCodificado}`;

        window.open(urlLinkWhatsApp, "_blank");
    });
}

// Controle de abertura do carrinho no layout Mobile
const btnMobile = document.getElementById("abrir-carrinho-mobile");
if (btnMobile) {
    btnMobile.addEventListener("click", (e) => {
        e.preventDefault();
        const lateral = document.getElementById("carrinho-lateral");
        lateral.classList.toggle("ativo-mobile");
    });
}