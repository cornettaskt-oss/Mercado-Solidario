// Admin DB Logic - Agora usando Firebase Firestore
const COLLECTION_NAME = 'cadastros';

document.addEventListener('DOMContentLoaded', async () => {
    await carregarTabelaAdmin();
});

// Retrieves data from Firestore
async function getCadastros() {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (error) {
        console.error("Erro ao buscar cadastros:", error);
        return [];
    }
}

// Saves data to Firestore
async function saveCadastros(dataArray) {
    try {
        // Para simplificar, vamos limpar e re-adicionar todos (não ideal para produção, mas ok para demo)
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        querySnapshot.forEach(async (document) => {
            await deleteDoc(doc(db, COLLECTION_NAME, document.id));
        });

        for (const item of dataArray) {
            const { id, ...data } = item; // Remove id local, Firestore gera novo
            await addDoc(collection(db, COLLECTION_NAME), data);
        }

        await carregarTabelaAdmin(); // Reload UI
    } catch (error) {
        console.error("Erro ao salvar cadastros:", error);
    }
}

function formatDateBr(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
}

// Verifica se a validade já passou do dia atual
function isExpired(validadeIso) {
    if (!validadeIso) return false;
    const now = new Date();
    const validDate = new Date(validadeIso);
    return now > validDate;
}

async function carregarTabelaAdmin() {
    let data = await getCadastros();
    const tbody = document.getElementById('tableBody');

    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (searchTerm) {
        data = data.filter(u =>
            (u.nome && u.nome.toLowerCase().includes(searchTerm)) ||
            (u.cpf && u.cpf.toLowerCase().includes(searchTerm))
        );
    }

    // Stats calculation
    let ativos = 0;
    let inativos = 0;
    let vencendo = 0;
    const now = new Date();

    // Sort recents first
    data.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Nenhum usuário encontrado.</td></tr>';
        atualizarStats(0, 0, 0, 0);
        return;
    }

    let rowsHtml = '';

    data.forEach((user) => {
        // Evaluate Status
        let statusBadge = '';
        let statusText = '';

        const expired = isExpired(user.validadeCadastro);

        // Define expiring this month
        if (user.validadeCadastro) {
            const valDate = new Date(user.validadeCadastro);
            const timeDiff = valDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (daysDiff >= 0 && daysDiff <= 30 && user.status === 'ativo') {
                vencendo++;
            }
        }

        if (user.status === 'inativo') {
            statusBadge = 'status-inactive';
            statusText = 'Desativado';
            inativos++;
        } else if (expired) {
            statusBadge = 'status-expired';
            statusText = 'Cadastro Vencido (> 3 meses)';
        } else {
            statusBadge = 'status-active';
            statusText = 'Ativo (Dentro do prazo)';
            ativos++;
        }

        // Toggle button logic
        const toggleBtnTxt = user.status === 'inativo' ? 'Reativar' : 'Desativar';
        const toggleClass = user.status === 'inativo' ? 'btn-success' : 'btn-warn';

        rowsHtml += `
            <tr>
                <td style="font-weight: 500;">
                    <button onclick="abrirModalUser('${user.id}')" style="background:none; border:none; color:#2563eb; text-decoration:underline; cursor:pointer; font-size:inherit; font-weight:600; padding:0; text-align:left;">
                        ${user.nome}
                    </button>
                </td>
                <td>${user.cpf || '-'}</td>
                <td>${formatDateBr(user.dataCadastro)}</td>
                <td style="font-weight: 500;">${formatDateBr(user.validadeCadastro)}</td>
                <td><span class="status-badge ${statusBadge}">${statusText}</span></td>
                <td class="action-btns">
                    <button class="btn btn-secondary btn-sm" onclick="gerarPdfAdmin('${user.id}', event)" title="Imprimir Ficha">
                        Imprimir Ficha
                    </button>
                    <button class="btn ${toggleClass} btn-sm" onclick="toggleStatus('${user.id}')" title="Congela ou descongela o usuário">
                        ${toggleBtnTxt}
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="editarUser('${user.id}')" title="Abre a ficha de inscrição carregada">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirUser('${user.id}')" title="Excluir Permanentemente">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
    // Fix: We update stats according to the filtered visual data
    atualizarStats(data.length, ativos, vencendo, inativos);
}

function atualizarStats(total, ativos, vencendo, inativos) {
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-ativos').innerText = ativos;
    document.getElementById('stat-vencendo').innerText = vencendo;
    document.getElementById('stat-inativos').innerText = inativos;
}

// ---------- AÇÕES ADMINISTRATIVAS ----------

window.toggleParticipants = function () {
    const tableArea = document.getElementById('participants-table-area');
    if (tableArea.style.display === 'none') {
        tableArea.style.display = 'block';
        // Opcional: fazer um scroll suave até a tabela
        setTimeout(() => {
            tableArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        tableArea.style.display = 'none';
    }
}

window.toggleStatus = async function (id) {
    const data = await getCadastros();
    const index = data.findIndex(u => u.id === id);
    if (index !== -1) {
        const isInactive = data[index].status === 'inativo';
        const confirmMsg = isInactive ?
            "Deseja REATIVAR este cadastro no sistema?" :
            "Deseja DESATIVAR este cadastro? Ele deixará de constar como ativo.";

        if (confirm(confirmMsg)) {
            data[index].status = isInactive ? 'ativo' : 'inativo';
            await saveCadastros(data);
        }
    }
}

window.excluirUser = async function (id) {
    if (confirm("ATENÇÃO: Você está prestes a excluir este cadastro permanentemente. Continuar?")) {
        let data = await getCadastros();
        data = data.filter(u => u.id !== id);
        await saveCadastros(data);
    }
}

window.editarUser = function (id) {
    localStorage.setItem('@MercadoSolidario:EditTarget', id);
    window.location.href = 'index.html?mode=edit';
}

// ---------- MODAL E PDF ----------

function formatBool(val) {
    if (val === true || val === 'true') return 'Sim';
    if (val === false || val === 'false') return 'Não';
    return val || '-';
}

function buildUserExtractHTML(user, isPdf = false) {
    return `
        <h3 style="color: #1e293b; margin-top:0; margin-bottom:15px; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom:5px;">1. DADOS PESSOAIS E CONTATO</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: white;">
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;" colspan="2"><strong>Nome Completo:</strong> ${user.nome || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>CPF:</strong> ${user.cpf || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Data Nasc.:</strong> ${user.data_nascimento || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>RG:</strong> ${user.rg || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Est. Civil:</strong> ${user.estado_civil || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Nacionalidade:</strong> ${user.nacionalidade || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Naturalidade:</strong> ${user.naturalidade || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Telefone:</strong> ${user.telefone || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;" colspan="2"><strong>Endereço:</strong> ${user.endereco || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Escolaridade:</strong> ${user.escolaridade || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Tempo NV.Hrz:</strong> ${user.tempo_nh || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;" colspan="2"><strong>Veio de outra cidade?:</strong> ${user.outra_cidade || "Não"}</td>
            </tr>
        </table>

        <h3 style="color: #1e293b; margin-bottom:15px; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom:5px;">2. TRABALHO, RENDA E MORADIA</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: white;">
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Profissão:</strong> ${user.profissao || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Possui Renda?:</strong> ${formatBool(user.tem_renda)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Valor (R$):</strong> ${user.tem_renda ? (user.valor_renda || "-") : "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Situação:</strong> ${user.esta_desempregado ? "Desempregado" : "Empregado"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;" colspan="2">
                    ${user.esta_desempregado
            ? `<strong>Último trabalho:</strong> ${user.ultimo_trabalho_registro || user.ultimo_trabalho_informal || "-"}`
            : `<strong>Trabalho atual/cargo:</strong> ${user.cargo_registro || user.cargo_informal || "-"}`}
                </td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Tipo Moradia:</strong> ${user.tipo_moradia || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Tempo de Residência:</strong> ${user.tempo_residencia_local || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Valor Mensal:</strong> ${["Alugada", "Própria"].includes(user.tipo_moradia) ? (user.valor_moradia_input || "-") : "-"}</td>
            </tr>
        </table>

        ${user.tem_conjuge ?
            `<h3 style="color: #1e293b; margin-bottom:15px; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom:5px;">DADOS DO CÔNJUGE</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: white;">
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;" colspan="2"><strong>Nome:</strong> ${user.conjuge_nome || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>CPF:</strong> ${user.conjuge_cpf || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Data Nasc:</strong> ${user.conjuge_data_nsc || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>RG:</strong> ${user.conjuge_rg || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Prof / Renda:</strong> ${user.conjuge_profissao || "-"} / R$ ${user.conjuge_renda || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;" colspan="3"><strong>Moram juntos?:</strong> ${user.moram_juntos || "-"}</td>
            </tr>
        </table>` : ''}

        <h3 style="color: #1e293b; margin-bottom:15px; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom:5px;">3. COMPOSIÇÃO FAMILIAR</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: white;">
            <thead>
                <tr style="background:#f8fafc;">
                    <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:left;">Nome</th>
                    <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:left;">Idade</th>
                    <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:left;">Parentesco</th>
                    <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:left;">PCD</th>
                    <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:left;">Escolaridade</th>
                    <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:left;">Profissão/Renda</th>
                </tr>
            </thead>
            <tbody>
                ${(user.membros_familia && user.membros_familia.length > 0) ? user.membros_familia.map(m => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.nome || "-"}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.idade || "-"}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.parentesco || "-"}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.pcd || "-"}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.escolaridade || "-"}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.profissao || "-"}</td>
                </tr>`).join('') : `<tr><td colspan="6" style="padding: 8px; border: 1px solid #cbd5e1; text-align:center;">Não constam dependentes.</td></tr>`}
            </tbody>
        </table>

        <h3 style="color: #1e293b; margin-bottom:15px; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom:5px;">4. QUESTIONÁRIO SOCIAL</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: white;">
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Crianças na Escola Pública?:</strong> ${user.criancas_escola || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Cadastro Único?:</strong> ${user.cad_unico || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Recebe Benefícios?:</strong> ${user.beneficios || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Outro Projeto / CRAS:</strong> ${user.outro_projeto === 'SIM' ? `Sim (${user.campo_cras || "-"})` : (user.outro_projeto || "-")}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Como soube:</strong> ${user.como_soube || "-"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Problemas Dep/Quim:</strong> ${user.dep_quimico || "-"}</td>
            </tr>
            ${user.como_soube === 'Outros' ? `<tr><td colspan="2" style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Observações (Outros):</strong> ${user.obs_outros || "-"}</td></tr>` : ''}
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Meses de Participação no Mercado:</strong> ${user.meses_participacao || "0"}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Observações / Justificativa:</strong> ${user.obs_participacao || "-"}</td>
            </tr>
        </table>
    `;
}

window.abrirModalUser = async function (id) {
    const data = await getCadastros();
    const user = data.find(u => u.id === id);
    if (!user) return alert("Usuário não encontrado.");

    const contentDiv = document.getElementById('modalContent');

    let baseHTML = `
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
           <p style="margin:0 0 5px 0;"><strong>Status do Sistema:</strong> <span style="font-weight:bold; text-transform:uppercase;">${user.status}</span></p>
           <p style="margin:0 0 5px 0;"><strong>Data de Cadastro:</strong> ${formatDateBr(user.dataCadastro)}</p>
           <p style="margin:0;"><strong>Vencimento (3 Meses):</strong> ${formatDateBr(user.validadeCadastro)}</p>
        </div>
    `;

    baseHTML += buildUserExtractHTML(user, false);



    contentDiv.innerHTML = baseHTML;
    document.getElementById('userModal').style.display = 'flex';
}

window.fecharModalUser = function () {
    document.getElementById('userModal').style.display = 'none';
}

window.gerarPdfAdmin = async function (id, event) {
    const data = await getCadastros();
    const user = data.find(u => u.id === id);
    if (!user) return alert("Usuário não encontrado.");

    const nome = user.nome || "Sem Nome";

    // Config do rodapé
    const dataAtual = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const rodapeManual = `Novo Horizonte SP, ______ de ${meses[dataAtual.getMonth()]} de 20${dataAtual.getFullYear().toString().slice(-2)}`;

    // Build central data chunks for PDF
    const extratoDetailsHtml = buildUserExtractHTML(user, true);

    const pdfHTMLString = `
        <div style="padding: 30px; font-family: Arial, sans-serif; color: black !important; background: white;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="font-size: 20px; margin: 0; color: black;">MERCADO SOLIDÁRIO - MÃOS QUE SUSTENTAM</h1>
                <h2 style="font-size: 16px; margin: 8px 0 0 0; color: #333;">Ficha de Atendimento e Cadastro (FAC)</h2>
            </div>
            
            ${extratoDetailsHtml}

            <div style="color: #c2410c; font-weight: bold; border: 2px dashed #c2410c; padding: 15px; background-color: #fff7ed; margin-top:20px; text-align:center; font-size: 13px;">
                TERMO DE VALIDADE: Cadastro aprovado no dia ${formatDateBr(user.dataCadastro)}. Com encerramento de três meses previsto para ${formatDateBr(user.validadeCadastro)}.
            </div>
            
            <div style="margin-top: 50px; width: 100%; color: black; font-size: 14px; page-break-inside: avoid;">
                <p style="margin-bottom: 50px; font-size:15px; text-align: left; padding-left: 5%;">Novo Horizonte - SP, _____ de _______________________ de 20____</p>
                
                <div style="margin-top: 60px; text-align: left; padding-left: 5%; padding-right: 5%;">
                    <div style="border-top: 1px solid black; width: 100%; margin-bottom: 10px;"></div>
                    <p style="margin: 0 0 15px 0; font-weight: bold;">Assinatura do Responsável Pelo Cadastro</p>
                    <p style="margin: 0 0 15px 0;">Nome Completo: __________________________________________________________________________</p>
                    <p style="margin: 0;">CPF: _________________________________________________________________</p>
                </div>
            </div>
        </div>
    `;

    const btn = event ? (event.currentTarget || event.target) : null;
    let btnOriginalText = "Imprimir Ficha";
    if (btn) {
        btnOriginalText = "Imprimir Ficha";
        if (btn.innerText.includes("Imprimir") || btn.innerText.includes("Completa")) {
            btnOriginalText = btn.innerHTML;
            btn.innerHTML = "Preparando Impressão...";
        } else {
            btnOriginalText = btn.innerHTML;
            btn.innerHTML = "Preparando...";
        }
        btn.disabled = true;
    }

    // Create a hidden iframe for printing
    let printFrame = document.getElementById('printFrame');
    if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'printFrame';
        printFrame.style.position = 'absolute';
        printFrame.style.top = '-10000px';
        printFrame.style.left = '-10000px';
        document.body.appendChild(printFrame);
    }

    const printDoc = printFrame.contentWindow.document;
    printDoc.open();
    printDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imprimir Ficha - ${nome}</title>
            <style>
                @media print {
                    @page { margin: 10mm; }
                    body { font-family: Arial, sans-serif; background: white; margin: 0; }
                }
            </style>
        </head>
        <body>
            ${pdfHTMLString}
        </body>
        </html>
    `);
    printDoc.close();

    // Wait for content to render before printing
    setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        if (btn) {
            btn.innerHTML = btnOriginalText;
            btn.disabled = false;
        }
    }, 500);
}
