// State Management
const appState = {
    step: 1, // 1 ou 2
    formData: {
        // Dados controlados pela data atual
        dataCadastro: new Date().toISOString(),
        validadeCadastro: calcularValidade()
    }
};

function calcularValidade() {
    const dataAtual = new Date();
    // Adiciona 90 dias (3 meses) à data atual
    dataAtual.setDate(dataAtual.getDate() + 90);
    return dataAtual.toISOString();
}

function formatDateBr(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
}

// Configuração de Eventos Iniciais
document.addEventListener('DOMContentLoaded', () => {
    carregarEtapa(appState.step);

    // Atualiza a Barra de progresso baseada no step
    atualizarProgresso();

    // Logo injection hook on boot
    const logoContainer = document.getElementById('logoContainer');
    if (logoContainer) {
        logoContainer.innerHTML = '<img src="assets/logo.png" id="projectLogo" alt="Logo Mercado Solidário">';
    }
});

function atualizarProgresso() {
    const progressBar = document.getElementById('progressBar');
    const label1 = document.getElementById('label-step1');
    const label2 = document.getElementById('label-step2');

    // Configurando progresso visual
    let progressPercentage = appState.step === 1 ? '50%' : '100%';

    // Cria um injetor de CSS para o pseudo elemento
    const style = document.createElement('style');
    style.innerHTML = `.progress-bar::after { width: ${progressPercentage} !important; }`;
    document.head.appendChild(style);

    if (appState.step === 1) {
        label1.classList.add('active');
        if (label2) label2.classList.remove('active');
    } else {
        label1.classList.add('active'); // O 1 já foi feito
        if (label2) label2.classList.add('active');
    }
}

function carregarEtapa(step) {
    const container = document.getElementById('content-container');

    if (step === 1) {
        container.innerHTML = gerarHTML_Etapa1();
        configurarEventos_Etapa1();
    } else if (step === 2) {
        container.innerHTML = gerarHTML_Etapa2();

        // Wait rendering then attach
        setTimeout(() => {
            if (typeof configurarEventos_Etapa2 === 'function') {
                configurarEventos_Etapa2();
            }
        }, 100);
    }
}

// ============================================
// ETAPA 1 - FICHA DE ATENDIMENTO
// ============================================

function gerarHTML_Etapa1() {
    const validityDate = formatDateBr(appState.formData.validadeCadastro);

    return `
        <div class="form-section fade-in">
            <!-- ALERTA DE VALIDADE -->
            <div class="validity-alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div class="validity-content">
                    <h4>Aviso de Validade</h4>
                    <p>Este cadastro será válido apenas por <strong>3 meses</strong> (até ${validityDate}). Após este período será necessário atualizar a ficha.</p>
                </div>
            </div>

            <h2 class="section-title">Dados Pessoais do Atendido</h2>
            <div class="form-grid">
                <div class="input-group full-width">
                    <label>Nome Completo*</label>
                    <input type="text" id="nome" required placeholder="Digite o nome completo">
                </div>
                
                <div class="input-group">
                    <label>Data de Nascimento*</label>
                    <input type="date" id="data_nascimento" required>
                </div>
                
                <div class="input-group">
                    <label>RG*</label>
                    <input type="text" id="rg" required placeholder="00.000.000-0">
                </div>
                
                <div class="input-group">
                    <label>CPF*</label>
                    <input type="text" id="cpf" required placeholder="000.000.000-00">
                </div>
                
                <div class="input-group">
                    <label>Telefone de Contato*</label>
                    <input type="tel" id="telefone" required placeholder="(11) 90000-0000">
                </div>
                
                <div class="input-group">
                    <label>Nacionalidade</label>
                    <input type="text" id="nacionalidade" value="Brasileira">
                </div>
                
                <div class="input-group">
                    <label>Naturalidade (Cidade/Estado)</label>
                    <input type="text" id="naturalidade" placeholder="Ex: São Paulo - SP">
                </div>
                
                <div class="input-group">
                    <label>Estado Civil</label>
                    <select id="estado_civil">
                        <option value="">Selecione...</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                        <option value="União Estável">União Estável</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label>Escolaridade</label>
                    <select id="escolaridade">
                        <option value="">Selecione...</option>
                        <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                        <option value="Fundamental Completo">Fundamental Completo</option>
                        <option value="Médio Incompleto">Médio Incompleto</option>
                        <option value="Médio Completo">Médio Completo</option>
                        <option value="Superior Incompleto">Superior Incompleto</option>
                        <option value="Superior Completo">Superior Completo</option>
                    </select>
                </div>
                

                <div class="input-group">
                    <label>Profissão</label>
                    <input type="text" id="profissao" placeholder="Qual a sua profissão?">
                </div>
                
                <div class="input-group full-width">
                    <label>Endereço Completo</label>
                    <input type="text" id="endereco" placeholder="Rua, Número, Bairro, Complemento">
                </div>
                
                <div class="input-group">
                    <label>Tempo de residência em Novo Horizonte - SP</label>
                    <input type="text" id="tempo_nh" placeholder="Ex: 5 anos">
                </div>
                
                <div class="input-group">
                    <label>Veio de outra cidade? Qual?</label>
                    <input type="text" id="outra_cidade" placeholder="Deixe em branco se não">
                </div>
                
                <div class="input-group full-width">
                    <label class="checkbox-label">
                        <input type="checkbox" id="tem_renda">
                        Possui algum tipo de renda? 
                    </label>
                    <div id="campo_valor_renda" class="hidden-field mt-2">
                        <input type="number" id="valor_renda" placeholder="Qual o valor? R$">
                    </div>
                </div>
                
                <!-- SITUAÇÃO DE MORADIA -->
                <div class="input-group full-width group-box">
                    <h3 class="group-title">Situação de Moradia</h3>
                    <div class="radio-group row">
                        <label class="radio-label">
                            <input type="radio" name="tipo_moradia" value="Alugada"> Alugada
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="tipo_moradia" value="Própria"> Própria
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="tipo_moradia" value="Cedida"> Cedida
                        </label>
                    </div>
                    
                    <div class="input-group mt-3">
                        <label>Há quanto tempo reside no local?</label>
                        <input type="text" id="tempo_residencia_local" placeholder="Ex: 2 anos e 5 meses">
                    </div>
                    
                    <div id="campo_valor_moradia" class="hidden-field mt-3">
                        <label id="label_valor_moradia">Valor (R$)</label>
                        <input type="number" id="valor_moradia_input" placeholder="R$ 0,00">
                    </div>
                </div>
                
                <!-- SITUAÇÃO OCUPACIONAL (DESEMPREGO) -->
                <div class="input-group full-width group-box">
                    <div class="checkbox-wrapper">
                        <label class="checkbox-label toggle-title font-bold">
                            <input type="checkbox" id="esta_desempregado">
                            Esta pessoa está **Desempregada** atualmente?
                        </label>
                    </div>
                    
                    <div id="secao_desemprego" class="hidden-field mt-3 pl-3 border-left">
                        <div class="input-group full-width mb-3">
                            <label>Quando trabalhou com registro pela última vez?</label>
                            <input type="text" id="ultimo_trabalho_registro" placeholder="Ex: Mês/Ano">
                        </div>
                        <div class="input-group full-width mb-3">
                            <label>Qual foi o cargo? (Registro)</label>
                            <input type="text" id="cargo_registro" placeholder="Ex: Ajudante Geral">
                        </div>
                        <div class="input-group full-width mb-3">
                            <label>Quando trabalhou informalmente pela última vez?</label>
                            <input type="text" id="ultimo_trabalho_informal" placeholder="Ex: Mês/Ano">
                        </div>
                        <div class="input-group full-width">
                            <label>Qual foi o cargo? (Informal)</label>
                            <input type="text" id="cargo_informal" placeholder="Ex: Faxineira">
                        </div>
                    </div>
                </div>

                <!-- CÔNJUGE -->
                <div class="input-group full-width group-box">
                    <div class="checkbox-wrapper">
                        <label class="checkbox-label toggle-title font-bold">
                            <input type="checkbox" id="tem_conjuge">
                            Possui Cônjuge (Marido/Esposa/Companheiro)?
                        </label>
                    </div>
                    
                    <div id="secao_conjuge" class="hidden-field mt-4 border-t pt-4">
                        <h4 class="mb-3">Dados do Cônjuge</h4>
                        <div class="form-grid">
                            <div class="input-group full-width">
                                <label>Nome do Cônjuge</label>
                                <input type="text" id="conjuge_nome" placeholder="Nome completo">
                            </div>
                            <div class="input-group full-width">
                                <label>Moram juntos?</label>
                                <div class="radio-group row">
                                    <label class="radio-label">
                                        <input type="radio" name="moram_juntos" value="Sim"> Sim
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="moram_juntos" value="Não"> Não
                                    </label>
                                </div>
                            </div>
                            <div class="input-group">
                                <label>Data de Nascimento</label>
                                <input type="date" id="conjuge_data_nsc">
                            </div>
                            <div class="input-group">
                                <label>RG</label>
                                <input type="text" id="conjuge_rg">
                            </div>
                            <div class="input-group">
                                <label>CPF</label>
                                <input type="text" id="conjuge_cpf">
                            </div>
                            <div class="input-group">
                                <label>Profissão</label>
                                <input type="text" id="conjuge_profissao">
                            </div>
                            <div class="input-group">
                                <label>Renda (R$)</label>
                                <input type="number" id="conjuge_renda" placeholder="Deixe em branco se não houver">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-actions mt-5">
                <!-- O botão previne reload do form mas continua usando JS para logica -->
                <button type="button" class="btn btn-primary" id="btn-avancar-etapa1">
                    Salvar e Ir para Etapa 2 (Composição Familiar)
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>
        </div>
    `;
}

function configurarEventos_Etapa1() {
    // Check if we are in Edit Mode
    const editId = localStorage.getItem('@MercadoSolidario:EditTarget');
    if (editId) {
        let dataList = JSON.parse(localStorage.getItem('@MercadoSolidario:Cadastros') || '[]');
        let user = dataList.find(u => u.id === editId);
        if (user) {
            let nomeF = document.getElementById('nome');
            let cpfF = document.getElementById('cpf');
            if (nomeF) nomeF.value = user.nome;
            if (cpfF) cpfF.value = user.cpf;
        }
    }

    // Renda
    const chkRenda = document.getElementById('tem_renda');
    const campoValRenda = document.getElementById('campo_valor_renda');
    if (chkRenda) chkRenda.addEventListener('change', (e) => {
        if (e.target.checked) {
            campoValRenda.classList.remove('hidden-field');
            campoValRenda.classList.add('visible-field');
        } else {
            campoValRenda.classList.add('hidden-field');
            campoValRenda.classList.remove('visible-field');
        }
    });

    // Moradia (Radios)
    const radiosMoradia = document.querySelectorAll('input[name="tipo_moradia"]');
    const campoValMoradia = document.getElementById('campo_valor_moradia');
    const labelValMoradia = document.getElementById('label_valor_moradia');

    radiosMoradia.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'Alugada') {
                campoValMoradia.classList.remove('hidden-field');
                campoValMoradia.classList.add('visible-field');
                labelValMoradia.innerText = 'Valor do Aluguel (R$)';
            } else if (val === 'Própria') {
                campoValMoradia.classList.remove('hidden-field');
                campoValMoradia.classList.add('visible-field');
                labelValMoradia.innerText = 'Valor da Prestação da Casa (R$)';
            } else {
                campoValMoradia.classList.add('hidden-field');
                campoValMoradia.classList.remove('visible-field');
            }
        });
    });

    // Desemprego
    const chkDesemprego = document.getElementById('esta_desempregado');
    const secaoDesemprego = document.getElementById('secao_desemprego');
    if (chkDesemprego) chkDesemprego.addEventListener('change', (e) => {
        if (e.target.checked) {
            secaoDesemprego.classList.remove('hidden-field');
            secaoDesemprego.classList.add('visible-field');
        } else {
            secaoDesemprego.classList.add('hidden-field');
            secaoDesemprego.classList.remove('visible-field');
        }
    });

    // Cônjuge
    const chkConjuge = document.getElementById('tem_conjuge');
    const secaoConjuge = document.getElementById('secao_conjuge');
    if (chkConjuge) chkConjuge.addEventListener('change', (e) => {
        if (e.target.checked) {
            secaoConjuge.classList.remove('hidden-field');
            secaoConjuge.classList.add('visible-field');
        } else {
            secaoConjuge.classList.add('hidden-field');
            secaoConjuge.classList.remove('visible-field');
        }
    });

    // Avançar
    const btnAvancar = document.getElementById('btn-avancar-etapa1');
    if (btnAvancar) {
        btnAvancar.addEventListener('click', () => {
            const nomeObj = document.getElementById('nome');
            if (!nomeObj.value.trim()) {
                alert('Por favor, preencha pelo menos o Nome Completo antes de avançar.');
                nomeObj.focus();
                return;
            }

            // Capturar TODOS os campos da Etapa 1 e salvar no estado
            appState.formData.nome = nomeObj.value;
            appState.formData.data_nascimento = document.getElementById('data_nascimento')?.value || '';
            appState.formData.rg = document.getElementById('rg')?.value || '';
            appState.formData.cpf = document.getElementById('cpf')?.value || '';
            appState.formData.nacionalidade = document.getElementById('nacionalidade')?.value || '';
            appState.formData.naturalidade = document.getElementById('naturalidade')?.value || '';
            appState.formData.estado_civil = document.getElementById('estado_civil')?.value || '';
            appState.formData.escolaridade = document.getElementById('escolaridade')?.value || '';
            appState.formData.telefone = document.getElementById('telefone')?.value || '';
            appState.formData.profissao = document.getElementById('profissao')?.value || '';
            appState.formData.endereco = document.getElementById('endereco')?.value || '';
            appState.formData.tempo_nh = document.getElementById('tempo_nh')?.value || '';
            appState.formData.outra_cidade = document.getElementById('outra_cidade')?.value || '';

            appState.formData.tem_renda = document.getElementById('tem_renda')?.checked || false;
            appState.formData.valor_renda = document.getElementById('valor_renda')?.value || '';

            const radioMoradia = document.querySelector('input[name="tipo_moradia"]:checked');
            appState.formData.tipo_moradia = radioMoradia ? radioMoradia.value : '';
            appState.formData.tempo_residencia_local = document.getElementById('tempo_residencia_local')?.value || '';
            appState.formData.valor_moradia_input = document.getElementById('valor_moradia_input')?.value || '';

            appState.formData.esta_desempregado = document.getElementById('esta_desempregado')?.checked || false;
            appState.formData.ultimo_trabalho_registro = document.getElementById('ultimo_trabalho_registro')?.value || '';
            appState.formData.cargo_registro = document.getElementById('cargo_registro')?.value || '';
            appState.formData.ultimo_trabalho_informal = document.getElementById('ultimo_trabalho_informal')?.value || '';
            appState.formData.cargo_informal = document.getElementById('cargo_informal')?.value || '';

            appState.formData.tem_conjuge = document.getElementById('tem_conjuge')?.checked || false;
            appState.formData.conjuge_nome = document.getElementById('conjuge_nome')?.value || '';
            const radioMoramJuntos = document.querySelector('input[name="moram_juntos"]:checked');
            appState.formData.moram_juntos = radioMoramJuntos ? radioMoramJuntos.value : '';
            appState.formData.conjuge_data_nsc = document.getElementById('conjuge_data_nsc')?.value || '';
            appState.formData.conjuge_rg = document.getElementById('conjuge_rg')?.value || '';
            appState.formData.conjuge_cpf = document.getElementById('conjuge_cpf')?.value || '';
            appState.formData.conjuge_profissao = document.getElementById('conjuge_profissao')?.value || '';
            appState.formData.conjuge_renda = document.getElementById('conjuge_renda')?.value || '';

            appState.step = 2;
            atualizarProgresso();
            carregarEtapa(2);
            window.scrollTo(0, 0);
        });
    }
}

// ============================================
// ETAPA 2 - COMPOSIÇÃO FAMILIAR
// ============================================

function gerarHTML_Etapa2() {
    return `
        <div class="form-section fade-in">
            <h2 class="section-title">2. Composição Familiar</h2>
            <p class="text-muted mb-4">Adicione os moradores da mesma residência, se houver.</p>
            
            <div class="family-members-container" id="family-table-container">
                <div class="member-card empty-state" id="empty-family-state">
                    <p>Nenhum membro familiar adicionado ainda.</p>
                </div>
            </div>
            
            <button class="btn btn-outline full-width mb-5 mt-3" type="button" id="btn-add-member" style="border:1px solid #10b981; color:#10b981; background:transparent;">
                + Adicionar Membro da Família
            </button>

            <!-- QUESTIONÁRIO SOCIAL -->
            <h3 class="group-title border-t pt-4">Questionário Social</h3>
            
            <div class="questions-list mt-4">
                <div class="question-item">
                    <label>As crianças e adolescentes estão matriculadas e frequentam creches/escolas?</label>
                    <div class="radio-group-sm">
                        <label><input type="radio" name="criancas_escola" value="SIM"> SIM</label>
                        <label><input type="radio" name="criancas_escola" value="NÃO"> NÃO</label>
                    </div>
                </div>

                <div class="question-item">
                    <label>A Família está inscrita no Cadastro Único?</label>
                    <div class="radio-group-sm">
                        <label><input type="radio" name="cad_unico" value="SIM"> SIM</label>
                        <label><input type="radio" name="cad_unico" value="NÃO"> NÃO</label>
                    </div>
                </div>

                <div class="question-item">
                    <label>Recebe algum benefício assistencial?</label>
                    <div class="radio-group-sm">
                        <label><input type="radio" name="beneficios" value="SIM"> SIM</label>
                        <label><input type="radio" name="beneficios" value="NÃO"> NÃO</label>
                    </div>
                </div>

                <div class="question-item">
                    <label>Já esta sendo atendido por outro projeto ou instituição?</label>
                    <div class="radio-group-sm mb-2">
                        <label><input type="radio" name="outro_projeto" id="rb_proj_sim" value="SIM"> SIM</label>
                        <label><input type="radio" name="outro_projeto" id="rb_proj_nao" value="NÃO"> NÃO</label>
                    </div>
                    <div id="campo_cras" class="hidden-field pl-3 border-left">
                        <input type="text" class="full-width" placeholder="Qual o CRAS de Referência ou Instituição?">
                    </div>
                </div>

                <div class="question-item border-t pt-3 mt-3">
                    <label>Como ficou sabendo do mercado solidário?</label>
                    <div class="radio-group-sm column-layout mt-1">
                        <label><input type="radio" name="como_soube" value="Redes sociais"> Redes sociais</label>
                        <label><input type="radio" name="como_soube" value="Whatsapp"> Whatsapp</label>
                        <label><input type="radio" name="como_soube" value="Por participantes do mercado"> Por participantes do mercado</label>
                        <label><input type="radio" name="como_soube" value="Outros"> Outros</label>
                    </div>
                    <div id="campo_outros" class="hidden-field mt-2">
                        <input type="text" id="obs_outros" placeholder="Observações" class="full-width">
                    </div>
                </div>

                <div class="question-item border-t pt-3 mt-3">
                    <label>Possui algum familiar na residência que é dependente químico?</label>
                    <div class="radio-group-sm">
                        <label><input type="radio" name="dep_quimico" value="SIM"> SIM</label>
                        <label><input type="radio" name="dep_quimico" value="NÃO"> NÃO</label>
                    </div>
                </div>

                <div class="question-item border-t pt-3 mt-3">
                    <label>Esse usuário já participou quantos meses do Mercado Solidário?</label>
                    <input type="number" id="meses_participacao" placeholder="Número de meses" min="0" class="full-width">
                    <div class="mt-2">
                        <label>Observações / Justificativa:</label>
                        <textarea id="obs_participacao" placeholder="Explique o motivo ou detalhes da participação..." rows="3" class="full-width"></textarea>
                    </div>
                </div>
            </div>

            <div class="form-actions mt-5" style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; gap: 10px; width: 100%;">
                    <button type="button" class="btn btn-secondary" onclick="appState.step=1; carregarEtapa(1); atualizarProgresso(); window.scrollTo(0,0);" style="flex: 1;">
                        Voltar
                    </button>
                    <button type="button" class="btn btn-success" id="btn-finalizar" style="background:#10b981; color:white; flex: 2;">
                        Salvar e Finalizar Cadastro
                    </button>
                </div>
                <button type="button" class="btn btn-secondary" onclick="window.location.href='admin.html'" style="background:#475569; color:white; width: 100%; margin-top: 10px;">
                    Ir para Gestão de Atendimentos
                </button>
            </div>
        </div>
    `;
}

function configurarEventos_Etapa2() {
    const btnAddMember = document.getElementById('btn-add-member');
    const tableContainer = document.getElementById('family-table-container');
    const emptyState = document.getElementById('empty-family-state');

    // Dynamic dependent CRAS field
    const rbProjSim = document.getElementById('rb_proj_sim');
    const rbProjNao = document.getElementById('rb_proj_nao');
    const campoCras = document.getElementById('campo_cras');

    if (rbProjSim && rbProjNao) {
        rbProjSim.addEventListener('change', () => {
            campoCras.classList.remove('hidden-field');
            campoCras.classList.add('visible-field');
        });
        rbProjNao.addEventListener('change', () => {
            campoCras.classList.add('hidden-field');
            campoCras.classList.remove('visible-field');
        });
    }

    // Outros field
    const radiosComoSoube = document.querySelectorAll('input[name="como_soube"]');
    const campoOutros = document.getElementById('campo_outros');

    radiosComoSoube.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Outros') {
                campoOutros.classList.remove('hidden-field');
                campoOutros.classList.add('visible-field');
            } else {
                campoOutros.classList.add('hidden-field');
                campoOutros.classList.remove('visible-field');
            }
        });
    });

    if (btnAddMember) {
        btnAddMember.addEventListener('click', () => {
            if (emptyState) emptyState.style.display = 'none';

            const memberId = Date.now();
            const memberHTML = `
                <div class="member-card fade-in" id="member-${memberId}" style="border:1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 15px; border-bottom:1px solid #e5e7eb; padding-bottom:10px;">
                        <h4 style="margin:0;">Membro Familiar</h4>
                        <button type="button" style="background:transparent; border:none; cursor:pointer; color:#ef4444; font-weight:bold;" onclick="document.getElementById('member-${memberId}').remove(); verificarMembrosVazios();">
                            X Remover
                        </button>
                    </div>
                    <div class="form-grid mt-2">
                        <div class="input-group">
                            <label>Nome</label>
                            <input type="text" class="m-nome" placeholder="Nome completo">
                        </div>
                        <div class="input-group">
                            <label>Idade / Data de Nascimento</label>
                            <input type="text" class="m-idade" placeholder="Ex: 12 anos ou DD/MM/AAAA">
                        </div>
                        <div class="input-group">
                            <label>Parentesco</label>
                            <input type="text" class="m-parentesco" placeholder="Ex: Filho, Mãe">
                        </div>
                        <div class="input-group">
                            <label>Condição PCD/AT?</label>
                            <select class="m-pcd">
                                <option value="Não">Não</option>
                                <option value="Sim">Sim</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Escolaridade</label>
                            <input type="text" class="m-escolaridade" placeholder="Ex: Ensino Médio">
                        </div>
                        <div class="input-group">
                            <label>Profissão / Renda</label>
                            <input type="text" class="m-profissao" placeholder="Profissão e Renda">
                        </div>
                    </div>
                </div>
            `;
            tableContainer.insertAdjacentHTML('beforeend', memberHTML);
        });
    }

    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            await gerarPDFFinal();
        });
    }
}

window.verificarMembrosVazios = function () {
    const tableContainer = document.getElementById('family-table-container');
    const emptyState = document.getElementById('empty-family-state');
    const cards = tableContainer.querySelectorAll('.member-card');

    if (cards.length === 0 && emptyState) {
        emptyState.style.display = 'block';
    }
}

// ============================================
// PDF GENERATION & LOCALSTORAGE SAVING
// ============================================

async function gerarPDFFinal() {
    const btnFinalizar = document.getElementById('btn-finalizar');
    const originalText = btnFinalizar.innerText;
    btnFinalizar.innerText = "Salvando Cadastro...";
    if (btnFinalizar) btnFinalizar.disabled = true;

    // --- CAPTURA CAMPOS DA ETAPA 2 ---
    const membros = [];
    document.querySelectorAll('.member-card:not(.empty-state)').forEach(card => {
        membros.push({
            nome: card.querySelector('.m-nome')?.value || '',
            idade: card.querySelector('.m-idade')?.value || '',
            parentesco: card.querySelector('.m-parentesco')?.value || '',
            pcd: card.querySelector('.m-pcd')?.value || '',
            escolaridade: card.querySelector('.m-escolaridade')?.value || '',
            profissao: card.querySelector('.m-profissao')?.value || '',
        });
    });
    appState.formData.membros_familia = membros;

    const radioCE = document.querySelector('input[name="criancas_escola"]:checked');
    appState.formData.criancas_escola = radioCE ? radioCE.value : '';

    const radioCU = document.querySelector('input[name="cad_unico"]:checked');
    appState.formData.cad_unico = radioCU ? radioCU.value : '';

    const radioBen = document.querySelector('input[name="beneficios"]:checked');
    appState.formData.beneficios = radioBen ? radioBen.value : '';

    const radioProj = document.querySelector('input[name="outro_projeto"]:checked');
    appState.formData.outro_projeto = radioProj ? radioProj.value : '';
    appState.formData.campo_cras = document.querySelector('#campo_cras input')?.value || '';

    const radioSoube = document.querySelector('input[name="como_soube"]:checked');
    appState.formData.como_soube = radioSoube ? radioSoube.value : '';
    appState.formData.obs_outros = document.getElementById('obs_outros')?.value || '';

    appState.formData.meses_participacao = document.getElementById('meses_participacao')?.value || '';
    appState.formData.obs_participacao = document.getElementById('obs_participacao')?.value || '';

    const radioDep = document.querySelector('input[name="dep_quimico"]:checked');
    appState.formData.dep_quimico = radioDep ? radioDep.value : '';
    // ------------------------------------

    // --- FIRESTORE LOGIC ---
    try {
        const editId = localStorage.getItem('@MercadoSolidario:EditTarget');
        if (editId) {
            // Update existing document
            await updateDoc(doc(db, 'cadastros', editId), appState.formData);
            localStorage.removeItem('@MercadoSolidario:EditTarget');
        } else {
            // Add new document
            const docRef = await addDoc(collection(db, 'cadastros'), {
                ...appState.formData,
                dataCadastro: new Date().toISOString(),
                status: 'ativo'
            });
            console.log("Documento adicionado com ID: ", docRef.id);
        }

        // Mudar visual para Sucesso
        const actionsDiv = document.querySelector('.form-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `
                <div style="background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; font-weight: bold; font-size: 16px;">
                    ✓ Cadastro Finalizado e Salvo na Nuvem com Sucesso!
                </div>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button type="button" class="btn btn-secondary" onclick="window.location.reload()" style="background:#2563eb; color:white; width: 100%; padding: 15px; font-size: 16px;">
                        ✚ Iniciar Novo Cadastro
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="window.location.href='admin.html'" style="background:#475569; color:white; width: 100%; padding: 15px; font-size: 16px;">
                        Ir para Gestão de Atendimentos
                    </button>
                </div>
            `;
            actionsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (btnFinalizar) {
            btnFinalizar.innerText = "Salvo na Nuvem ✓";
            btnFinalizar.style.backgroundColor = "#059669";
        }
    } catch (error) {
        console.error("Erro ao salvar no Firestore:", error);
        alert("Erro ao salvar. Verifique sua conexão e tente novamente.");
        if (btnFinalizar) {
            btnFinalizar.innerText = originalText;
            btnFinalizar.disabled = false;
        }
    }
}
