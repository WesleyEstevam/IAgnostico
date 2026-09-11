const REF = {
  pediatria: "https://www.aap.org/en/quality-improvement/clinical-practice-guidelines/",
  "ginecologia-obstetricia": "https://www.acog.org/clinical",
  anestesiologia: "https://www.asahq.org/standards-and-practice-parameters",
  ortopedia: "https://www.aaos.org/quality/quality-programs/clinical-practice-guidelines/",
  radiologia: "https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Appropriateness-Criteria",
  oncologia: "https://www.cancer.gov/about-cancer/diagnosis-staging",
  dermatologia: "https://www.aad.org/member/clinical-quality/guidelines",
};

// especialidade, slug, diagnóstico, idade, queixa, pistas decisivas, exame 1, exame 2, dificuldade
const rows = [
  // Pediatria
  ["pediatria","bronquiolite","Bronquiolite viral aguda",1,"tosse, coriza e esforço para respirar","primeiro episódio de sibilância após pródromo viral, tiragens e crepitações difusas","Oximetria=90% em ar ambiente","Radiografia de tórax=Hiperinsuflação sem consolidação","facil"],
  ["pediatria","crupe","Laringotraqueíte viral",3,"tosse rouca e barulho ao respirar à noite","tosse metálica, disfonia e estridor inspiratório","Avaliação respiratória=Estridor em repouso e retrações leves","Radiografia cervical=Estreitamento subglótico em torre","facil"],
  ["pediatria","epiglotite","Epiglotite aguda",5,"febre alta, baba e dificuldade para respirar","posição em tripé, voz abafada, sialorreia e ausência de tosse","Laringoscopia controlada=Epiglote muito edemaciada e hiperemiada","Hemograma=Leucocitose neutrofílica","dificil"],
  ["pediatria","kawasaki","Doença de Kawasaki",4,"febre há seis dias e olhos vermelhos","conjuntivite bilateral, língua em framboesa, exantema, adenopatia e edema de extremidades","Ecocardiograma=Ectasia discreta de coronária esquerda","PCR e VHS=Muito elevados","intermediario"],
  ["pediatria","pyloro","Estenose hipertrófica do piloro",1,"vômitos fortes depois das mamadas","lactente de cinco semanas, vômitos não biliosos em jato e fome após vomitar","Ultrassom abdominal=Músculo pilórico espessado e canal alongado","Gasometria=Alcalose metabólica hipoclorêmica","intermediario"],
  ["pediatria","invaginacao","Invaginação intestinal",2,"crises de choro, vômitos e fezes com sangue","dor abdominal intermitente, massa em salsicha e fezes em geleia de morango","Ultrassom abdominal=Sinal do alvo","Enema pneumático=Defeito de enchimento ileocólico","intermediario"],
  ["pediatria","meningite","Meningite bacteriana pediátrica",7,"febre, dor de cabeça e sonolência","rigidez de nuca, petéquias e alteração do estado mental","Líquor=Neutrofilia, proteína alta e glicose baixa","Cultura do líquor=Neisseria meningitidis","dificil"],
  ["pediatria","glomerulonefrite","Glomerulonefrite pós-estreptocócica",8,"urina escura e rosto inchado","edema periorbitário, hipertensão e faringite há três semanas","Urina tipo 1=Hematúria dismórfica e cilindros hemáticos","Complemento C3=Reduzido","intermediario"],
  ["pediatria","sindrome-nefrotica","Síndrome nefrótica por doença de lesões mínimas",6,"inchaço no rosto e nas pernas","edema generalizado sem hipertensão importante e urina espumosa","Urina de 24 horas=Proteinúria em faixa nefrótica","Albumina e colesterol=Hipoalbuminemia e hipercolesterolemia","facil"],
  ["pediatria","purpura-henoch","Vasculite por IgA",9,"manchas roxas nas pernas e dor abdominal","púrpura palpável simétrica, artralgia e cólica abdominal","Urina tipo 1=Hematúria microscópica","Biópsia de pele=Depósitos vasculares de IgA","intermediario"],
  ["pediatria","cetoacidose","Cetoacidose diabética pediátrica",12,"muita sede, perda de peso e respiração funda","poliúria, desidratação, hálito cetônico e respiração de Kussmaul","Gasometria=pH 7,12 e bicarbonato 9 mEq/L","Glicemia e cetonas=420 mg/dL e cetonemia positiva","intermediario"],
  ["pediatria","febre-reumatica","Febre reumática aguda",11,"dor migratória nas articulações e falta de ar","faringite recente, poliartrite migratória, sopro novo e movimentos involuntários","Ecocardiograma=Regurgitação mitral","ASLO e PCR=Títulos de ASLO e PCR elevados","dificil"],
  ["pediatria","coqueluche","Coqueluche",2,"crises prolongadas de tosse com vômitos","tosse paroxística, guincho inspiratório e vacinação incompleta","PCR de secreção nasofaríngea=Bordetella pertussis detectada","Hemograma=Linfocitose importante","facil"],
  ["pediatria","sarampo","Sarampo",4,"febre, tosse, olhos vermelhos e manchas","manchas de Koplik seguidas de exantema cefalocaudal e ausência de vacinação","RT-PCR para sarampo=Detectável","Sorologia=IgM reagente para sarampo","facil"],
  ["pediatria","atrésia-biliar","Atresia biliar",1,"pele amarela e fezes muito claras","icterícia persistente, colúria, acolia fecal e hepatomegalia","Bilirrubinas=Hiperbilirrubinemia direta","Ultrassom hepatobiliar=Vesícula atrófica e sinal do cordão triangular","dificil"],

  // Ginecologia e Obstetrícia
  ["ginecologia-obstetricia","ectopica","Gravidez ectópica rota",29,"atraso menstrual, dor pélvica súbita e desmaio","teste gestacional positivo, instabilidade e líquido livre abdominal","Ultrassom transvaginal=Ausência de gestação intrauterina e massa anexial","Beta-hCG=Acima da zona discriminatória","dificil"],
  ["ginecologia-obstetricia","pre-eclampsia","Pré-eclâmpsia com sinais de gravidade",32,"dor de cabeça e visão borrada com 35 semanas","PA 170/112, proteinúria e dor epigástrica","Relação proteína-creatinina urinária=0,8","Plaquetas e transaminases=Plaquetopenia e AST elevada","intermediario"],
  ["ginecologia-obstetricia","hellp","Síndrome HELLP",35,"dor no alto do abdome, náuseas e mal-estar na gestação","hipertensão, hemólise, enzimas hepáticas elevadas e plaquetopenia","Hemograma e esfregaço=Plaquetas 62 mil e esquizócitos","LDH e AST=Muito elevadas","dificil"],
  ["ginecologia-obstetricia","descolamento-placenta","Descolamento prematuro de placenta",34,"sangramento vaginal doloroso no terceiro trimestre","útero hipertônico, dor contínua e sofrimento fetal","Cardiotocografia=Desacelerações tardias recorrentes","Ultrassom obstétrico=Hematoma retroplacentário","dificil"],
  ["ginecologia-obstetricia","placenta-previa","Placenta prévia",30,"sangramento vermelho vivo sem dor com 32 semanas","hemorragia indolor recorrente e útero relaxado","Ultrassom transvaginal=Placenta recobrindo o orifício cervical interno","Hemograma=Anemia leve","facil"],
  ["ginecologia-obstetricia","corioamnionite","Infecção intra-amniótica",27,"febre e dor uterina durante trabalho de parto","febre materna, taquicardia fetal, líquido fétido e dor uterina","Hemograma=Leucocitose neutrofílica","Cardiotocografia=Taquicardia fetal persistente","intermediario"],
  ["ginecologia-obstetricia","hemorragia-pos-parto","Hemorragia pós-parto por atonia uterina",31,"sangramento intenso após parto vaginal","útero amolecido e aumentado, placenta íntegra e sangramento difuso","Avaliação uterina=Útero flácido sem boa contração","Hemograma=Queda aguda da hemoglobina","facil"],
  ["ginecologia-obstetricia","endometriose","Endometriose profunda",33,"dor pélvica cíclica e dor nas relações","dismenorreia progressiva, infertilidade e nodulação em fundo de saco","Ressonância de pelve=Implantes profundos e endometrioma","Ultrassom transvaginal=Endometrioma com ecos homogêneos","intermediario"],
  ["ginecologia-obstetricia","torcao-ovariana","Torção ovariana",24,"dor pélvica súbita com náuseas","massa anexial, dor unilateral intensa e fluxo ovariano reduzido","Ultrassom com Doppler=Ovário aumentado com fluxo venoso ausente","Beta-hCG=Não reagente","intermediario"],
  ["ginecologia-obstetricia","dip","Doença inflamatória pélvica",22,"dor pélvica, febre e corrimento","dor à mobilização do colo e secreção mucopurulenta","PCR cervical=Chlamydia trachomatis detectada","Ultrassom transvaginal=Espessamento tubário sem abscesso","facil"],
  ["ginecologia-obstetricia","abscesso-tubo-ovariano","Abscesso tubo-ovariano",38,"febre alta e dor pélvica intensa","massa anexial dolorosa após quadro de doença inflamatória pélvica","Ultrassom transvaginal=Coleção anexial complexa de 7 cm","Hemograma=Leucocitose neutrofílica","dificil"],
  ["ginecologia-obstetricia","sop","Síndrome dos ovários policísticos",25,"menstruações irregulares, acne e pelos excessivos","oligomenorreia, hiperandrogenismo e exclusão de causas secundárias","Testosterona total=Discretamente elevada","Ultrassom pélvico=Morfologia ovariana policística","facil"],
  ["ginecologia-obstetricia","mioma","Leiomioma uterino",42,"menstruação volumosa e pressão pélvica","útero aumentado e irregular com anemia ferropriva","Ultrassom transvaginal=Múltiplos nódulos miometriais bem delimitados","Hemograma=Anemia microcítica","facil"],
  ["ginecologia-obstetricia","incompetencia-cervical","Insuficiência istmocervical",29,"perda de líquido e pressão pélvica com 21 semanas","dilatação cervical indolor e perda gestacional prévia no segundo trimestre","Ultrassom transvaginal=Colo de 14 mm com afunilamento","Exame especular=Membranas abaulando pelo colo","intermediario"],
  ["ginecologia-obstetricia","mola","Mola hidatiforme completa",20,"sangramento, vômitos intensos e útero maior que o esperado","beta-hCG muito alto, ausência de feto e hipertireoidismo gestacional precoce","Ultrassom obstétrico=Padrão em tempestade de neve sem embrião","Beta-hCG=Acima de 200 mil mUI/mL","intermediario"],

  // Anestesiologia
  ["anestesiologia","hipertermia-maligna","Hipertermia maligna",22,"rigidez e aumento rápido do CO2 durante anestesia","exposição a succinilcolina, rigidez massetérica, hipercapnia e hipertermia","Gasometria=Acidose mista grave e hipercalemia","Creatinoquinase=Muito elevada","dificil"],
  ["anestesiologia","anafilaxia","Anafilaxia perioperatória",46,"hipotensão e broncoespasmo após antibiótico na indução","queda abrupta da pressão, urticária e aumento da pressão de via aérea","Triptase sérica=Elevada em amostra aguda","Gasometria=Hipoxemia","dificil"],
  ["anestesiologia","toxicidade-local","Toxicidade sistêmica por anestésico local",37,"gosto metálico, zumbido e convulsão após bloqueio","injeção intravascular, sintomas neurológicos seguidos de arritmia ventricular","ECG=QRS alargado e arritmia ventricular","Gasometria=Acidose metabólica e lactato elevado","dificil"],
  ["anestesiologia","intubacao-esofagica","Intubação esofágica",58,"dessaturação logo após intubação","ausência persistente de capnografia e expansão gástrica","Capnografia=Traçado ausente após seis ventilações","Ausculta=Murmúrio ausente bilateral e ruídos epigástricos","facil"],
  ["anestesiologia","broncoespasmo","Broncoespasmo intraoperatório",31,"pressão de via aérea elevada após indução","sibilos, expiração prolongada e curva capnográfica em barbatana","Capnografia=Inclinação expiratória em barbatana de tubarão","Ventilador=Pico de pressão elevado com platô preservado","intermediario"],
  ["anestesiologia","laringoespasmo","Laringoespasmo pós-extubação",6,"esforço inspiratório sem entrada de ar ao despertar","estridor, movimento torácico paradoxal e capnografia ausente","Capnografia=Ausência de CO2 apesar de esforço respiratório","Oximetria=Queda progressiva da saturação","intermediario"],
  ["anestesiologia","pneumotorax","Pneumotórax hipertensivo intraoperatório",44,"hipotensão e dessaturação durante ventilação mecânica","pressão de via aérea alta, ausência unilateral de murmúrio e desvio traqueal","Ultrassom pulmonar=Ausência de deslizamento e ponto pulmonar","Gasometria=Hipoxemia aguda","dificil"],
  ["anestesiologia","bloqueio-alto","Bloqueio espinhal alto",68,"fraqueza nos braços e falta de ar após raquianestesia","hipotensão, bradicardia e bloqueio sensitivo ascendente","Teste sensitivo=Ausência de sensibilidade até C4","Monitorização=Bradicardia e hipotensão graves","dificil"],
  ["anestesiologia","cefaleia-pos-puncao","Cefaleia pós-punção dural",28,"dor de cabeça que piora sentada após anestesia peridural","cefaleia postural com melhora ao deitar e punção dural reconhecida","Avaliação neurológica=Sem déficit focal ou sinais meníngeos","Ressonância de crânio=Realce paquimeníngeo difuso","facil"],
  ["anestesiologia","delirium","Delirium pós-operatório",79,"confusão flutuante após cirurgia","desatenção aguda, pensamento desorganizado e alteração do nível de consciência","CAM=Positivo para delirium","Eletrólitos e glicemia=Sem causa metabólica importante","intermediario"],
  ["anestesiologia","curarizacao-residual","Bloqueio neuromuscular residual",62,"fraqueza e ventilação inadequada na recuperação","uso de rocurônio e incapacidade de sustentar a cabeça","Monitor neuromuscular=Razão train-of-four de 0,6","Gasometria=Hipercapnia respiratória","intermediario"],
  ["anestesiologia","aspiracao","Pneumonite por aspiração perioperatória",51,"hipoxemia após regurgitação na indução","conteúdo gástrico visível, broncoespasmo e infiltrado pulmonar dependente","Radiografia de tórax=Infiltrado em lobo inferior direito","Gasometria=Hipoxemia com gradiente aumentado","intermediario"],
  ["anestesiologia","embolia-gasosa","Embolia venosa gasosa",48,"queda súbita do CO2 durante cirurgia sentada","hipotensão, dessaturação e ruído em roda de moinho","Ecocardiograma transesofágico=Bolhas no átrio direito","Capnografia=Queda abrupta do ETCO2","dificil"],
  ["anestesiologia","isquemia-miocardica","Isquemia miocárdica perioperatória",72,"hipotensão com alteração nova no monitor cardíaco","depressão persistente do ST e elevação dinâmica de troponina","ECG=Infradesnivelamento de ST em derivações laterais","Troponina=Elevação com curva ascendente","dificil"],
  ["anestesiologia","hipoventilacao-opioide","Depressão respiratória induzida por opioide",55,"sonolência e respiração lenta na recuperação","miose, frequência respiratória de seis e resposta à naloxona","Gasometria=Acidose respiratória hipercápnica","Oximetria=Hipoxemia progressiva sem oxigênio suplementar","facil"],

  // Ortopedia
  ["ortopedia","compartimental","Síndrome compartimental aguda",27,"dor crescente na perna após fratura","dor desproporcional, piora com extensão passiva e compartimento tenso","Pressão compartimental=Delta de pressão menor que 30 mmHg","Radiografia=Fratura diafisária de tíbia","dificil"],
  ["ortopedia","colo-femur","Fratura do colo do fêmur",78,"dor no quadril após queda da própria altura","membro encurtado e rodado externamente, incapacidade de apoiar","Radiografia da pelve=Fratura subcapital desviada","Tomografia do quadril=Confirma desvio e cominuição","facil"],
  ["ortopedia","luxacao-quadril","Luxação posterior do quadril",34,"dor intensa após colisão automobilística","quadril flexionado, aduzido e rodado internamente","Radiografia da pelve=Cabeça femoral deslocada posterossuperiormente","Tomografia pós-redução=Sem fragmento intra-articular","intermediario"],
  ["ortopedia","lca","Ruptura do ligamento cruzado anterior",23,"estalo e inchaço no joelho durante futebol","hemartrose rápida e testes de Lachman e pivot shift positivos","Ressonância do joelho=Descontinuidade completa do LCA","Radiografia do joelho=Sem fratura","facil"],
  ["ortopedia","menisco","Lesão aguda do menisco medial",31,"dor e travamento do joelho após torção","dor na interlinha medial, derrame tardio e McMurray positivo","Ressonância do joelho=Ruptura em alça de balde do menisco medial","Radiografia com carga=Espaço articular preservado","intermediario"],
  ["ortopedia","manguito","Ruptura do manguito rotador",57,"dor e fraqueza para elevar o braço após queda","teste da queda do braço positivo e fraqueza em rotação externa","Ressonância do ombro=Ruptura transfixante do supraespinal","Ultrassom do ombro=Descontinuidade tendínea e retração","intermediario"],
  ["ortopedia","tunel-carpo","Síndrome do túnel do carpo",49,"formigamento noturno na mão","parestesia em polegar, indicador e médio, Tinel e Phalen positivos","Eletroneuromiografia=Latência distal aumentada do nervo mediano","Ultrassom do punho=Aumento da área do nervo mediano","facil"],
  ["ortopedia","osteomielite","Osteomielite hematogênica",10,"febre e dor localizada na tíbia","dor óssea focal, incapacidade de apoiar e marcadores inflamatórios elevados","Ressonância da perna=Edema medular e coleção subperiosteal","Hemocultura=Staphylococcus aureus","intermediario"],
  ["ortopedia","artrite-septica","Artrite séptica do joelho",65,"joelho quente, inchado e febre","monoartrite aguda com intensa limitação passiva","Líquido sinovial=85 mil leucócitos com 92% neutrófilos","Cultura sinovial=Staphylococcus aureus","dificil"],
  ["ortopedia","epifisiolise","Epifisiólise proximal do fêmur",13,"dor no quadril e joelho com dificuldade para andar","adolescente obeso, rotação externa obrigatória na flexão","Radiografia da pelve=Deslizamento epifisário e linha de Klein anormal","Ressonância do quadril=Edema fisário","intermediario"],
  ["ortopedia","perthes","Doença de Legg-Calvé-Perthes",7,"mancar sem trauma há dois meses","limitação de abdução e rotação interna do quadril","Radiografia da pelve=Esclerose e achatamento da cabeça femoral","Ressonância do quadril=Necrose avascular da epífise","intermediario"],
  ["ortopedia","colles","Fratura distal do rádio tipo Colles",66,"dor e deformidade no punho após queda","deformidade em dorso de garfo e desvio dorsal do fragmento","Radiografia do punho=Fratura distal do rádio com angulação dorsal","Tomografia do punho=Sem extensão intra-articular","facil"],
  ["ortopedia","escafoide","Fratura do escafoide",25,"dor no punho após queda com mão estendida","dor na tabaqueira anatômica apesar de radiografia inicial normal","Ressonância do punho=Fratura oculta da cintura do escafoide","Radiografia tardia=Linha de fratura na cintura do escafoide","intermediario"],
  ["ortopedia","cauda-equina","Síndrome da cauda equina",48,"dor lombar, fraqueza nas pernas e dificuldade para urinar","anestesia em sela, retenção urinária e redução do tônus anal","Ressonância lombar=Grande hérnia L4-L5 comprimindo a cauda equina","Ultrassom vesical=Resíduo pós-miccional de 650 mL","dificil"],
  ["ortopedia","osteossarcoma","Osteossarcoma convencional",16,"dor e aumento de volume perto do joelho","massa metafisária dolorosa com reação periosteal agressiva","Radiografia do fêmur=Lesão mista com triângulo de Codman e raios de sol","Biópsia óssea=Osteoide maligno produzido por células tumorais","dificil"],

  // Radiologia
  ["radiologia","hemorragia-subaracnoidea","Hemorragia subaracnoidea",52,"cefaleia súbita máxima no início","sangue hiperdenso nas cisternas basais e fissuras silvianas","TC de crânio sem contraste=Hiperdensidade cisternal difusa","Angio-TC cerebral=Aneurisma sacular de comunicante anterior","facil"],
  ["radiologia","avc-acm","AVC isquêmico de artéria cerebral média",69,"fraqueza direita e afasia súbitas","sinal da ACM hiperdensa e perda da diferenciação insular","TC de crânio=Sinal da artéria cerebral média hiperdensa","Angio-TC=Oclusão proximal de M1 esquerda","facil"],
  ["radiologia","hematoma-subdural","Hematoma subdural agudo",74,"sonolência após queda","coleção extra-axial crescente que cruza suturas","TC de crânio=Coleção hiperdensa em crescente com efeito de massa","Reconstrução óssea=Sem fratura craniana","facil"],
  ["radiologia","hematoma-epidural","Hematoma epidural",19,"perda breve de consciência seguida de piora","intervalo lúcido e coleção biconvexa limitada por suturas","TC de crânio=Coleção hiperdensa lentiforme temporal","Angio-TC=Extravasamento da artéria meníngea média","facil"],
  ["radiologia","tep","Tromboembolismo pulmonar agudo",43,"dispneia e dor pleurítica súbitas","defeito de enchimento central em artéria pulmonar","Angio-TC de tórax=Defeito de enchimento em artéria lobar direita","TC de tórax=Opacidade periférica triangular compatível com infarto","facil"],
  ["radiologia","disseccao-aorta","Dissecção aórtica Stanford A",63,"dor torácica lancinante irradiada para dorso","flap intimal envolvendo a aorta ascendente","Angio-TC de aorta=Duplo lúmen da raiz ao arco aórtico","Radiografia de tórax=Mediastino alargado","intermediario"],
  ["radiologia","apendicite","Apendicite aguda",26,"dor migratória para fossa ilíaca direita","apêndice não compressível com inflamação da gordura adjacente","Ultrassom abdominal=Apêndice de 9 mm não compressível","TC de abdome=Espessamento apendicular e apendicolito","facil"],
  ["radiologia","colecistite","Colecistite aguda calculosa",47,"dor no hipocôndrio direito e febre","cálculo impactado, parede espessada e líquido perivesicular","Ultrassom abdominal=Cálculo no colo e Murphy ultrassonográfico","TC de abdome=Inflamação perivesicular","facil"],
  ["radiologia","pancreatite","Pancreatite aguda necrosante",51,"dor epigástrica intensa irradiada para dorso","áreas pancreáticas sem realce e coleções agudas","TC contrastada=Necrose de 40% e coleção peripancreática","Ressonância abdominal=Debris necróticos sem parede definida","dificil"],
  ["radiologia","pneumotorax","Pneumotórax hipertensivo",36,"dispneia súbita e hipotensão após trauma","hemitórax hiperlúcido, pulmão colabado e desvio mediastinal","Radiografia de tórax=Grande pneumotórax direito com desvio à esquerda","Ultrassom pulmonar=Ausência de deslizamento e ponto pulmonar","facil"],
  ["radiologia","pneumonia-lobar","Pneumonia lobar",60,"febre, tosse produtiva e dor pleurítica","consolidação com broncograma aéreo respeitando limites lobares","Radiografia de tórax=Consolidação do lobo inferior esquerdo","TC de tórax=Broncogramas aéreos dentro da consolidação","facil"],
  ["radiologia","esclerose-multipla","Esclerose múltipla",29,"visão borrada e dormência recorrente","lesões periventriculares ovoides disseminadas no tempo","Ressonância cerebral=Lesões em dedos de Dawson, algumas com realce","Ressonância cervical=Placa desmielinizante em C3","intermediario"],
  ["radiologia","glioblastoma","Glioblastoma",58,"cefaleia progressiva e crise convulsiva","massa infiltrativa cruzando o corpo caloso com necrose central","Ressonância cerebral=Lesão em borboleta com realce irregular e necrose","Perfusão por RM=Aumento do volume sanguíneo tumoral","dificil"],
  ["radiologia","carcinoma-hepatocelular","Carcinoma hepatocelular",64,"perda de peso em paciente com cirrose","lesão hepática com hiperrealce arterial e washout portal","Ressonância hepática=Lesão LI-RADS 5 com cápsula","TC trifásica=Hiperrealce arterial e lavagem tardia","dificil"],
  ["radiologia","obstrucao-intestinal","Obstrução de intestino delgado",55,"distensão, vômitos e parada de gases","alças delgadas dilatadas com ponto de transição","TC de abdome=Alças de 4 cm e ponto de transição por aderência","Radiografia abdominal=Níveis hidroaéreos em escada","intermediario"],

  // Oncologia
  ["oncologia","mama","Carcinoma ductal invasivo de mama",52,"nódulo mamário endurecido","massa irregular espiculada e linfonodo axilar suspeito","Mamografia=Massa espiculada BI-RADS 5","Biópsia=Carcinoma ductal invasivo ER positivo","facil"],
  ["oncologia","pulmao","Adenocarcinoma de pulmão",61,"tosse persistente e perda de peso","nódulo pulmonar espiculado periférico e adenopatia mediastinal","TC de tórax=Massa periférica de 3,8 cm espiculada","Biópsia=TTF-1 positivo compatível com adenocarcinoma","facil"],
  ["oncologia","microcitico","Carcinoma pulmonar de pequenas células",65,"tosse, emagrecimento e fraqueza","massa hilar volumosa, adenopatia e hiponatremia por SIADH","TC de tórax=Massa hilar infiltrativa com adenopatias","Biópsia=Neoplasia neuroendócrina de pequenas células","intermediario"],
  ["oncologia","colorretal","Adenocarcinoma colorretal",58,"sangue nas fezes e mudança do hábito intestinal","anemia ferropriva e lesão estenosante no cólon","Colonoscopia=Lesão vegetante friável em cólon ascendente","Biópsia=Adenocarcinoma moderadamente diferenciado","facil"],
  ["oncologia","prostata","Adenocarcinoma de próstata",68,"jato urinário fraco e PSA elevado","nódulo endurecido ao toque e lesão periférica na ressonância","Ressonância de próstata=Lesão PI-RADS 5 periférica","Biópsia=Adenocarcinoma Gleason 4 mais 4","facil"],
  ["oncologia","pancreas","Adenocarcinoma de pâncreas",70,"icterícia indolor e perda de peso","vesícula palpável e massa na cabeça pancreática","TC de abdome=Massa hipovascular na cabeça com dilatação biliar","CA 19-9=Elevado","intermediario"],
  ["oncologia","ovario","Carcinoma seroso de alto grau do ovário",59,"distensão abdominal e saciedade precoce","massa anexial complexa, ascite e implantes peritoneais","Ultrassom transvaginal=Massa sólido-cística com papilas","CA-125 e TC=CA-125 elevado e carcinomatose peritoneal","intermediario"],
  ["oncologia","colo-utero","Carcinoma epidermoide do colo uterino",46,"sangramento após relação sexual","colo friável com lesão vegetante e HPV de alto risco","Colposcopia=Lesão invasiva acetobranca irregular","Biópsia=Carcinoma epidermoide invasivo","facil"],
  ["oncologia","linfoma-hodgkin","Linfoma de Hodgkin clássico",27,"íngua cervical indolor e suor noturno","adenopatia mediastinal, prurido e sintomas B","TC de tórax=Adenopatia mediastinal volumosa","Biópsia linfonodal=Células de Reed-Sternberg CD30 positivas","intermediario"],
  ["oncologia","linfoma-difuso","Linfoma difuso de grandes células B",63,"massa cervical crescendo rapidamente","adenopatia volumosa, LDH alto e sintomas B","PET-CT=Múltiplos linfonodos hipermetabólicos","Biópsia=Linfoma B agressivo CD20 positivo","dificil"],
  ["oncologia","mieloma","Mieloma múltiplo",69,"dor lombar, cansaço e infecções","anemia, insuficiência renal, hipercalcemia e lesões líticas","Eletroforese=Pico monoclonal IgG","Medula óssea=Plasmócitos clonais em 35%","intermediario"],
  ["oncologia","lma","Leucemia mieloide aguda",54,"cansaço, febre e sangramentos","pancitopenia com blastos e bastonetes de Auer","Hemograma=Anemia, plaquetopenia e 45% de blastos","Medula óssea=Mieloblastos MPO positivos","intermediario"],
  ["oncologia","testiculo","Tumor germinativo não seminomatoso de testículo",24,"aumento indolor do testículo","massa intratesticular sólida com AFP elevada","Ultrassom testicular=Massa heterogênea intratesticular","Marcadores=AFP e beta-hCG elevados","facil"],
  ["oncologia","rim","Carcinoma renal de células claras",62,"sangue na urina e dor no flanco","massa renal sólida hipervascular e policitemia","TC de abdome=Massa cortical renal com realce intenso","Hemograma=Hematócrito elevado","intermediario"],
  ["oncologia","melanoma","Melanoma cutâneo",45,"pinta que mudou de formato e cor","lesão assimétrica, bordas irregulares, várias cores e crescimento","Dermatoscopia=Rede pigmentar atípica e véu azul-esbranquiçado","Biópsia excisional=Melanoma invasivo com Breslow de 1,8 mm","facil"],

  // Dermatologia
  ["dermatologia","melanoma","Melanoma cutâneo",47,"pinta escura que cresceu e sangrou","assimetria, bordas irregulares, policromia e evolução","Dermatoscopia=Rede atípica e estruturas azul-esbranquiçadas","Biópsia excisional=Melanoma invasivo","facil"],
  ["dermatologia","basocelular","Carcinoma basocelular",67,"ferida perolada no nariz que não cicatriza","pápula translúcida com telangiectasias e borda elevada","Dermatoscopia=Vasos arboriformes e ninhos azul-acinzentados","Biópsia=Ninhos basaloides com paliçada periférica","facil"],
  ["dermatologia","espinocelular","Carcinoma espinocelular cutâneo",72,"ferida crostosa no lábio que cresce","placa hiperqueratótica ulcerada em área fotoexposta","Dermatoscopia=Vasos glomerulares e queratina central","Biópsia=Carcinoma escamoso invasivo queratinizante","facil"],
  ["dermatologia","dermatite-atopica","Dermatite atópica",8,"coceira intensa e pele ressecada","eczema crônico flexural, xerose e história de atopia","Avaliação dermatológica=Placas eczematosas em fossas cubitais","IgE total=Elevada, achado de apoio não diagnóstico","facil"],
  ["dermatologia","psoriase","Psoríase em placas",36,"placas descamativas nos cotovelos","placas eritematoescamosas bem delimitadas, simétricas e sinal de Auspitz","Dermatoscopia=Pontos vermelhos regulares sobre fundo claro","Biópsia=Hiperplasia psoriasiforme com microabscessos de Munro","facil"],
  ["dermatologia","penfigo","Pênfigo vulgar",49,"bolhas frágeis e feridas dolorosas na boca","bolhas flácidas, erosões mucosas e Nikolsky positivo","Biópsia=Acantólise suprabasal","Imunofluorescência=IgG intercelular em rede","dificil"],
  ["dermatologia","penfigoide","Penfigoide bolhoso",76,"bolhas tensas com muita coceira","bolhas subepidérmicas tensas sem acometimento oral importante","Biópsia=Bolha subepidérmica com eosinófilos","Imunofluorescência=IgG e C3 lineares na membrana basal","intermediario"],
  ["dermatologia","dermatite-herpetiforme","Dermatite herpetiforme",31,"bolhinhas muito pruriginosas nos cotovelos","vesículas agrupadas em superfícies extensoras associadas a sintomas intestinais","Imunofluorescência=Depósitos granulares de IgA nas papilas dérmicas","Anti-transglutaminase=Reagente","dificil"],
  ["dermatologia","liquen-plano","Líquen plano",44,"lesões roxas que coçam nos punhos","pápulas violáceas poligonais planas com estrias de Wickham","Dermatoscopia=Estrias brancas reticulares","Biópsia=Infiltrado liquenoide em faixa","intermediario"],
  ["dermatologia","pitiriase-rosea","Pitiríase rósea",23,"manchas no tronco após uma lesão maior inicial","placa-mãe seguida de erupção em árvore de Natal","Exame micológico direto=Negativo","Avaliação dermatológica=Colarete descamativo orientado às linhas de clivagem","facil"],
  ["dermatologia","tinea-corporis","Tínea do corpo",28,"placa circular que coça e aumenta","borda eritematosa descamativa ativa com clareamento central","Exame micológico direto=Hifas septadas","Cultura fúngica=Trichophyton rubrum","facil"],
  ["dermatologia","escabiose","Escabiose",34,"coceira intensa à noite em toda a família","túneis nos espaços interdigitais e prurido domiciliar","Dermatoscopia=Sinal do delta e trilha do ácaro","Raspado cutâneo=Ácaros e ovos de Sarcoptes scabiei","facil"],
  ["dermatologia","hidradenite","Hidradenite supurativa",29,"caroços dolorosos recorrentes nas axilas","nódulos, abscessos, túneis e cicatrizes em áreas intertriginosas","Ultrassom cutâneo=Trajetos fistulosos dérmicos comunicantes","Cultura da secreção=Flora mista sem patógeno dominante","intermediario"],
  ["dermatologia","eritema-multiforme","Eritema multiforme",26,"lesões em alvo após herpes labial","pápulas acralmente distribuídas com três zonas concêntricas","Avaliação dermatológica=Lesões-alvo típicas simétricas","PCR de vesícula prévia=HSV-1 detectado","intermediario"],
  ["dermatologia","stevens-johnson","Síndrome de Stevens-Johnson",41,"febre, dor na pele e feridas em boca e olhos após remédio novo","descolamento epidérmico menor que 10%, máculas-alvo atípicas e mucosite intensa","Biópsia de pele=Necrose epidérmica de espessura total","Avaliação corporal=Descolamento em 7% da superfície","dificil"],
];

const names = ["Ana","Bruno","Carla","Diego","Elisa","Felipe","Gabriela","Hugo","Isabela","João","Larissa","Marcos","Nádia","Otávio","Paula"];
const genericPartial = {
  pediatria: "doença pediátrica,infecção pediátrica",
  "ginecologia-obstetricia": "emergência ginecológica,complicação obstétrica",
  anestesiologia: "complicação anestésica,evento perioperatório",
  ortopedia: "lesão musculoesquelética,trauma ortopédico",
  radiologia: "achado radiológico,alteração de imagem",
  oncologia: "neoplasia,câncer,tumor maligno",
  dermatologia: "dermatose,doença de pele",
};

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const clinicalCasesPro = rows.map(([specialty, slug, diagnosis, age, complaint, clues, exam1, exam2, difficulty], index) => {
  const name = names[index % names.length];
  const parseExam = (value) => {
    const separator = value.indexOf("=");
    return { name: value.slice(0, separator), result: value.slice(separator + 1), kind: "relevant" };
  };
  return {
    id: `pro-${specialty}-${slug}`,
    schemaVersion: 1,
    catalogVersion: "pro-1",
    catalogManaged: true,
    plan: "pro",
    status: "published",
    specialty,
    difficulty,
    title: `${name}, ${age} anos · ${complaint}`,
    setting: difficulty === "dificil" ? "Emergência" : "Ambulatório especializado",
    summary: `${clues.charAt(0).toUpperCase()}${clues.slice(1)}.`,
    patient: { name, age, avatar: index % 2 ? "👨" : "👩" },
    initialMessages: [{ who: "patient", text: `Doutor(a), estou com ${complaint}.` }],
    fallbackReply: `Além disso, percebi ${clues}.`,
    exams: [
      { ...parseExam(exam1), highlighted: false },
      { ...parseExam(exam2), highlighted: false },
      { name: "Glicemia capilar", result: "Dentro da faixa de referência", kind: "neutral" },
      { name: "Função renal", result: "Sem alterações relevantes", kind: "neutral" },
      { name: "Proteína C reativa", result: "Discretamente elevada, achado inespecífico", kind: "distractor" },
    ],
    durationSeconds: difficulty === "dificil" ? 600 : 480,
    maxXp: difficulty === "dificil" ? 300 : difficulty === "intermediario" ? 240 : 200,
    diagnosis,
    diagnosisAliases: [normalize(diagnosis), normalize(slug.replaceAll("-", " "))],
    partialDiagnosisAliases: genericPartial[specialty].split(","),
    feedback: `Os achados decisivos foram ${clues}. Em conjunto, eles sustentam o diagnóstico de ${diagnosis}.`,
    sourceRefs: [REF[specialty]],
  };
});

export function validateClinicalCasesPro(cases) {
  const errors = [];
  const specialties = Object.keys(REF);
  if (cases.length !== 105) errors.push(`esperados 105 casos; encontrados ${cases.length}`);
  specialties.forEach((specialty) => {
    const count = cases.filter((item) => item.specialty === specialty).length;
    if (count !== 15) errors.push(`${specialty}: esperado 15; encontrado ${count}`);
  });
  if (new Set(cases.map((item) => item.id)).size !== cases.length) errors.push("IDs duplicados");
  cases.forEach((item) => {
    if (item.exams.length !== 5) errors.push(`${item.id}: quantidade de exames inválida`);
    const kinds = item.exams.reduce((result, exam) => ({ ...result, [exam.kind]: (result[exam.kind] ?? 0) + 1 }), {});
    if (kinds.relevant !== 2 || kinds.neutral !== 2 || kinds.distractor !== 1) errors.push(`${item.id}: composição de exames inválida`);
    if (!item.sourceRefs.every((source) => /^https:\/\//.test(source))) errors.push(`${item.id}: fonte inválida`);
  });
  if (errors.length) throw new Error(`Catálogo Pro inválido:\n- ${errors.join("\n- ")}`);
}
