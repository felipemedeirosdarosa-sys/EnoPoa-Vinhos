
// ENOPOA VINHOS

const WHATSAPP_NUMBER = "555193691915";

const PAGE_SIZE = 48;

let produtosVisiveis = PAGE_SIZE;
let carrinho = [];


// FORMATAÇÃO DE PREÇOS

function dinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// NOTIFICAÇÃO DO CARRINHO

function mostrarNotificacao(mensagem) {

    const antiga = document.getElementById("notificacaoCarrinho");

    if (antiga) antiga.remove();

    const notificacao = document.createElement("div");

    notificacao.id = "notificacaoCarrinho";
    notificacao.textContent = "✓ " + mensagem;

    Object.assign(notificacao.style, {
        position: "fixed",
        bottom: "25px",
        right: "25px",
        background: "#42141c",
        color: "#ffffff",
        padding: "16px 22px",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: "99999",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        opacity: "0",
        transition: "opacity 0.3s ease"
    });

    document.body.appendChild(notificacao);

    requestAnimationFrame(() => {
        notificacao.style.opacity = "1";
    });

    setTimeout(() => {
        notificacao.style.opacity = "0";

        setTimeout(() => notificacao.remove(), 300);
    }, 2500);
}


// FILTROS

function iniciarCatalogo() {

    preencherFiltros();

    document.getElementById("buscaProduto")
        .addEventListener("input", filtrarProdutos);

    document.getElementById("filtroCategoria")
        .addEventListener("change", filtrarProdutos);

    document.getElementById("filtroOrigem")
        .addEventListener("change", filtrarProdutos);

    renderizarProdutos();
    atualizarCarrinho();
}


function preencherFiltros() {

    const categorias = [...new Set(
        PRODUTOS.map(p => p.category)
    )].sort();

    const origens = [...new Set(
        PRODUTOS.map(p => paisProduto(p.origin))
    )].sort();

    const cat = document.getElementById("filtroCategoria");
    const origem = document.getElementById("filtroOrigem");

    categorias.forEach(c => {
        cat.add(new Option(c, c));
    });

    origens.forEach(o => {
        origem.add(new Option(o, o));
    });
}


function paisProduto(origem) {
    return origem.replace(
        /^(Tinto|Branco|Rose|Rosé|Espumante)\s+/i,
        ""
    );
}


// BUSCA E FILTRAGEM

function produtosFiltrados() {

    const termo = document.getElementById("buscaProduto")
        .value.trim().toLocaleLowerCase("pt-BR");

    const categoria = document.getElementById("filtroCategoria").value;
    const origem = document.getElementById("filtroOrigem").value;

    return PRODUTOS.filter(p => {

        const texto = `${p.name} ${p.origin} ${p.category}`
            .toLocaleLowerCase("pt-BR");

        return (!termo || texto.includes(termo)) &&
            (!categoria || p.category === categoria) &&
            (!origem || paisProduto(p.origin) === origem);
    });
}


function filtrarProdutos() {
    produtosVisiveis = PAGE_SIZE;
    renderizarProdutos();
}


// EXIBIR PRODUTOS

function renderizarProdutos() {

    const todos = produtosFiltrados();

    const lista = todos.slice(0, produtosVisiveis);

    const grid = document.getElementById("productGrid");

    document.getElementById("resultadoContagem").textContent =
        `${todos.length} produto(s) encontrado(s)`;

    grid.innerHTML = "";

    if (lista.length === 0) {

        grid.innerHTML = `
            <p class="empty-cart">
                Nenhum vinho encontrado.
            </p>
        `;

    } else {

        lista.forEach(p => {

            const precoAtual = p.offerPrice ?? p.price;

            const etiqueta = p.offerPrice !== null
                ? "OFERTA"
                : p.package === "caixa" ? "CAIXA / KIT" : "";

            const precoAntigo = p.offerPrice !== null
                ? `<span class="old-price">${dinheiro(p.price)}</span>`
                : "";

            const embalagem = p.package === "caixa"
                ? "Preço da caixa/kit"
                : "Preço da garrafa";

            const card = document.createElement("article");

            card.className = "product-card";

            card.innerHTML = `

                <div class="product-visual">

                    ${etiqueta
                        ? `<span class="product-tag">${etiqueta}</span>`
                        : ""
                    }

                    ${p.image
                        ? `
                            <img
                                class="product-image"
                                src="${escaparHTML(p.image)}"
                                alt="${escaparHTML(p.name)}"
                                loading="lazy"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
                            >
                            <span class="bottle-icon" style="display:none;">🍷</span>
                        `
                        : `<span class="bottle-icon">🍷</span>`
                    }

                </div>

                <div class="product-info">

                    <span class="product-type">
                        ${escaparHTML(p.category)}
                    </span>

                    <h3>${escaparHTML(p.name)}</h3>

                    <p class="product-origin">
                        ${escaparHTML(p.origin)}
                    </p>

                    <div class="price-line">

                        <strong class="current-price">
                            ${dinheiro(precoAtual)}
                        </strong>

                        ${precoAntigo}

                    </div>

                    <span class="package-note">
                        ${embalagem}
                    </span>

                    <button
                        class="add-cart"
                        onclick="adicionarCarrinho(${p.id})"
                    >
                        Adicionar ao carrinho
                    </button>

                </div>
            `;

            grid.appendChild(card);

        });
    }

    document.getElementById("carregarMais").style.display =
        todos.length > produtosVisiveis ? "block" : "none";
}


function escaparHTML(texto) {

    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);

}


function carregarMais() {
    produtosVisiveis += PAGE_SIZE;
    renderizarProdutos();
}


// CARRINHO

function adicionarCarrinho(id) {

    const produto = PRODUTOS.find(p => p.id === id);

    if (!produto) return;

    const existente = carrinho.find(p => p.id === id);

    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push({
            id: id,
            quantidade: 1
        });
    }

    atualizarCarrinho();

    mostrarNotificacao(`${produto.name} adicionado ao carrinho!`);
}


// ATUALIZAR CARRINHO

function atualizarCarrinho() {

    const quantidade = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    document.getElementById("contadorCarrinho").textContent =
        quantidade;

    const lista = document.getElementById("listaCarrinho");
    const totalElemento = document.getElementById("totalCarrinho");

    if (carrinho.length === 0) {

        lista.innerHTML = `
            <p class="empty-cart">
                Seu carrinho está vazio.
            </p>
        `;

        totalElemento.textContent = dinheiro(0);
        return;
    }

    let total = 0;

    lista.innerHTML = "";

    carrinho.forEach(item => {

        const produto = PRODUTOS.find(p => p.id === item.id);

        if (!produto) return;

        const preco = produto.offerPrice ?? produto.price;
        const subtotal = preco * item.quantidade;

        total += subtotal;

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `

            <div class="cart-item-info">

                <strong>${escaparHTML(produto.name)}</strong>

                <small>${dinheiro(preco)} por unidade</small>

                <div class="quantity-control">

                    <button
                        class="quantity-btn"
                        onclick="alterarQuantidade(${produto.id}, -1)"
                        aria-label="Diminuir quantidade"
                    >−</button>

                    <span class="quantity-number">
                        ${item.quantidade}
                    </span>

                    <button
                        class="quantity-btn"
                        onclick="alterarQuantidade(${produto.id}, 1)"
                        aria-label="Aumentar quantidade"
                    >+</button>

                </div>

            </div>

            <div class="cart-item-actions">

                <strong>${dinheiro(subtotal)}</strong>

                <button
                    class="remove-item"
                    onclick="removerDoCarrinho(${produto.id})"
                >
                    Remover
                </button>

            </div>
        `;

        lista.appendChild(div);

    });

    totalElemento.textContent = dinheiro(total);
}


// ALTERAR QUANTIDADE

function alterarQuantidade(id, variacao) {

    const item = carrinho.find(p => p.id === id);

    if (!item) return;

    item.quantidade += variacao;

    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }

    atualizarCarrinho();
}


// REMOVER PRODUTO

function removerDoCarrinho(id) {

    carrinho = carrinho.filter(item => item.id !== id);

    atualizarCarrinho();

}


// ABRIR E FECHAR CARRINHO

function abrirCarrinho() {
    document.getElementById("modalCarrinho")
        .classList.add("active");
}


function fecharCarrinho() {
    document.getElementById("modalCarrinho")
        .classList.remove("active");
}


function fecharAoClicarFora(event) {

    if (event.target.id === "modalCarrinho") {
        fecharCarrinho();
    }

}


// FINALIZAR PEDIDO PELO WHATSAPP

function finalizarPedido() {

    if (carrinho.length === 0) {
        alert("Adicione algum vinho ao carrinho.");
        return;
    }

    // DADOS DO CLIENTE

    const nome = document.getElementById("nomeCliente").value.trim();
    const endereco = document.getElementById("enderecoCliente").value.trim();
    const bairro = document.getElementById("bairroCliente").value.trim();
    const cidade = document.getElementById("cidadeCliente").value.trim();

    const cepCampo = document.getElementById("cepCliente");
    const cep = cepCampo ? cepCampo.value.trim() : "";

    const complemento = document.getElementById("complementoCliente").value.trim();

    // DADOS DO PRESENTE

    const presente = document.getElementById("pedidoPresente");
    const mensagemPresente = document.getElementById("mensagemPresente");

    const ehPresente = presente ? presente.checked : false;

    const textoPresente = mensagemPresente
        ? mensagemPresente.value.trim()
        : "";

    // VALIDAR CAMPOS OBRIGATÓRIOS

    if (!nome || !endereco || !bairro || !cidade) {

        alert(
            "Preencha seu nome, endereço, bairro e cidade para continuar."
        );

        const primeiroCampo = !nome
            ? "nomeCliente"
            : !endereco
                ? "enderecoCliente"
                : !bairro
                    ? "bairroCliente"
                    : "cidadeCliente";

        document.getElementById(primeiroCampo).focus();

        return;
    }

    // MONTAR PEDIDO

    let total = 0;

    const linhas = carrinho.map(item => {

        const produto = PRODUTOS.find(p => p.id === item.id);

        if (!produto) return "";

        const preco = produto.offerPrice ?? produto.price;

        const subtotal = preco * item.quantidade;

        total += subtotal;

        return `🍷 ${produto.name}
Quantidade: ${item.quantidade}
Preço unitário: ${dinheiro(preco)}
Subtotal: ${dinheiro(subtotal)}`;

    }).filter(Boolean);

    // MONTAR ENDEREÇO

    const enderecoCompleto = [
        endereco,
        `Bairro: ${bairro}`,
        cidade,
        cep ? `CEP: ${cep}` : "",
        complemento ? `Complemento: ${complemento}` : ""
    ].filter(Boolean).join("\n");

    // INFORMAÇÕES DO PRESENTE

    const dadosPresente = ehPresente
        ? `*PEDIDO PARA PRESENTE* 🎁\n` +
          (textoPresente
              ? `Mensagem: ${textoPresente}\n`
              : `Sem mensagem personalizada.\n`)
        : "";

    // MENSAGEM PARA WHATSAPP

    const mensagem =
        `Olá! Gostaria de fazer um pedido na EnoPoa Vinhos! 🍷\n\n` +
        `*DADOS DO CLIENTE*\n` +
        `Nome: ${nome}\n\n` +
        `*ENDEREÇO DE ENTREGA*\n` +
        `${enderecoCompleto}\n\n` +
        dadosPresente +
        (ehPresente ? "\n" : "") +
        `*MEU PEDIDO*\n\n` +
        `${linhas.join("\n\n")}\n\n` +
        `*TOTAL: ${dinheiro(total)}*\n\n` +
        `Aguardo a confirmação do pedido. Obrigado!`;

    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
}


// INICIALIZAÇÃO

document.addEventListener("DOMContentLoaded", iniciarCatalogo);


// MOSTRAR OU OCULTAR CAMPO DE PRESENTE

function alternarPresente() {

    const presente = document.getElementById("pedidoPresente");
    const campo = document.getElementById("campoMensagemPresente");

    if (!presente || !campo) return;

    campo.style.display = presente.checked ? "block" : "none";
}
