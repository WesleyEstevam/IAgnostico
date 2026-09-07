const REF = {
  cardio: "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/",
  acs: "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/acute-coronary-syndromes/",
  ms: "https://www.gov.br/saude/pt-br/assuntos/pcdt",
  avc: "https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt-cuidados-avc.pdf",
  arbovirus: "https://www.who.int/publications/i/item/9789240111110",
  meningitis: "https://www.who.int/publications/i/item/9789240108042",
  hiv: "https://www.who.int/teams/global-hiv-hepatitis-and-stis-programmes/guidelines",
  tb: "https://www.who.int/publications/i/item/9789240046764",
  sepsis: "https://www.who.int/health-topics/sepsis",
  pneumonia: "https://www.who.int/health-topics/pneumonia",
  malaria: "https://www.who.int/teams/global-malaria-programme/guidelines-for-malaria",
};

const names = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Felipe", "Gabriela", "Hugo", "Isabela", "João", "Larissa", "Marcos", "Nádia", "Otávio", "Paula", "Rafael", "Sofia"];

// specialty, slug, diagnosis, age, complaint, decisive clues, exams, correct aliases, partial aliases, difficulty, source
const rows = [
  // Cardiologia — 30 cenários distintos
  ["cardiologia","iam-anterior","IAM com supra de ST anterior",58,"dor opressiva retroesternal irradiada para o braço esquerdo há 40 minutos","sudorese, náusea e supra de ST de V1 a V4","ECG=Supradesnivelamento de ST em V1-V4;Troponina=Elevada;Radiografia de tórax=Sem alargamento mediastinal","iam com supra anterior,iamcsst anterior,infarto anterior,stemi anterior","sindrome coronariana aguda,infarto agudo do miocardio", "facil",REF.acs],
  ["cardiologia","iam-inferior-vd","IAM inferior com acometimento do ventrículo direito",64,"dor torácica, náusea e sensação de desmaio","hipotensão, turgência jugular, pulmões limpos e supra em DII, DIII e aVF","ECG=Supra de ST em DII DIII aVF e V4R;Troponina=Elevada;Ecocardiograma=Hipocinesia inferior e do VD","iam inferior com ventrículo direito,infarto inferior com vd,iam de vd","iam inferior,sindrome coronariana aguda", "dificil",REF.acs],
  ["cardiologia","iam-sem-supra","Infarto agudo do miocárdio sem supra de ST",72,"pressão no peito aos esforços mínimos desde a madrugada","infradesnivelamento de ST e elevação dinâmica de troponina","ECG=Infradesnivelamento de ST lateral;Troponina=Elevação com curva ascendente;Creatinina=Normal","iam sem supra,iamssst,nstemi,infarto sem supra","sindrome coronariana aguda,angina instavel", "intermediario",REF.acs],
  ["cardiologia","angina-instavel","Angina instável",55,"dor torácica nova que agora ocorre em repouso","episódios crescentes, alterações transitórias de ST e troponinas seriadas normais","ECG=Infradesnivelamento transitório de ST;Troponinas seriadas=Sem elevação;Radiografia de tórax=Normal","angina instavel","sindrome coronariana aguda,angina", "intermediario",REF.acs],
  ["cardiologia","disseccao-aorta","Dissecção aguda de aorta",67,"dor súbita no peito que atravessa para as costas","dor máxima no início, assimetria de pulsos e mediastino alargado","Angio-TC de aorta=Flap intimal na aorta torácica;Radiografia de tórax=Mediastino alargado;ECG=Sem isquemia territorial","disseccao aguda de aorta,disseccao aortica,disseccao de aorta","sindrome aortica aguda,aneurisma de aorta", "dificil",REF.cardio],
  ["cardiologia","emergencia-hipertensiva","Emergência hipertensiva com encefalopatia",61,"cefaleia intensa, confusão e visão borrada","PA 230/130 mmHg, papiledema e lesão aguda de órgão-alvo","Fundoscopia=Papiledema;Creatinina=Elevada;TC de crânio=Sem hemorragia","emergencia hipertensiva,encefalopatia hipertensiva","crise hipertensiva,hipertensao grave", "intermediario",REF.cardio],
  ["cardiologia","ic-fer-descompensada","Insuficiência cardíaca com fração de ejeção reduzida descompensada",69,"falta de ar progressiva, ortopneia e pernas inchadas","turgência jugular, estertores, BNP elevado e fração de ejeção de 30%","BNP=Muito elevado;Ecocardiograma=FEVE de 30%;Radiografia de tórax=Congestão e cardiomegalia","insuficiencia cardiaca com fracao reduzida descompensada,icfer descompensada","insuficiencia cardiaca,congestao pulmonar", "intermediario",REF.cardio],
  ["cardiologia","ic-fep-descompensada","Insuficiência cardíaca com fração de ejeção preservada",76,"dispneia aos esforços e edema com piora após excesso de sal","hipertensão crônica, congestão e fração de ejeção de 60% com disfunção diastólica","Ecocardiograma=FEVE 60% e disfunção diastólica;BNP=Elevado;Radiografia de tórax=Congestão pulmonar","insuficiencia cardiaca com fracao preservada,icfep","insuficiencia cardiaca,disfuncao diastolica", "dificil",REF.cardio],
  ["cardiologia","edema-agudo-pulmao","Edema agudo de pulmão cardiogênico",73,"falta de ar extrema iniciada durante a noite e tosse com espuma rosada","hipoxemia, estertores difusos, hipertensão e infiltrado alveolar bilateral","Radiografia de tórax=Infiltrado alveolar bilateral em asa de borboleta;BNP=Elevado;Gasometria=Hipoxemia","edema agudo de pulmao cardiogenico,eap cardiogenico","insuficiencia cardiaca descompensada,congestao pulmonar", "intermediario",REF.cardio],
  ["cardiologia","fibrilacao-atrial-rvr","Fibrilação atrial com resposta ventricular rápida",68,"palpitações e cansaço súbitos","pulso irregularmente irregular, ausência de ondas P e frequência de 148 bpm","ECG=Ritmo irregular sem ondas P FC 148;Eletrólitos=Normais;TSH=Normal","fibrilacao atrial com resposta ventricular rapida,fa de alta resposta,fa com rvr","fibrilacao atrial,taquiarritmia", "facil",REF.cardio],
  ["cardiologia","flutter-atrial","Flutter atrial com condução 2:1",59,"palpitações regulares e falta de ar leve","frequência próxima de 150 bpm e ondas F serrilhadas nas derivações inferiores","ECG=Ondas F em serrilha e condução 2 para 1;Eletrólitos=Normais;Troponina=Normal","flutter atrial,flutter com conducao 2 1","taquicardia supraventricular,arritmia atrial", "intermediario",REF.cardio],
  ["cardiologia","taquicardia-avnodal","Taquicardia por reentrada nodal atrioventricular",29,"palpitação regular abrupta sem dor torácica","taquicardia regular de QRS estreito a 190 bpm sem onda P visível","ECG=Taquicardia regular de QRS estreito FC 190;Eletrólitos=Normais;Troponina=Normal","taquicardia por reentrada nodal,avnrt,taquicardia avnodal","taquicardia supraventricular,tsv", "intermediario",REF.cardio],
  ["cardiologia","taquicardia-ventricular","Taquicardia ventricular monomórfica sustentada",66,"palpitação, tontura e pressão baixa após infarto prévio","taquicardia regular de QRS largo com dissociação atrioventricular","ECG=Taquicardia regular QRS largo com captura e fusão;Troponina=Sem curva aguda;Ecocardiograma=Cicatriz e FEVE reduzida","taquicardia ventricular monomorfica,taquicardia ventricular,tv sustentada","taquicardia de qrs largo,arritmia ventricular", "dificil",REF.cardio],
  ["cardiologia","bloqueio-av-total","Bloqueio atrioventricular total",78,"desmaios recorrentes e cansaço","bradicardia de 32 bpm com dissociação completa entre ondas P e QRS","ECG=Dissociação AV completa e escape ventricular;Eletrólitos=Normais;Troponina=Normal","bloqueio atrioventricular total,bloqueio av total,bavt,bloqueio de terceiro grau","bradicardia sintomatica,bloqueio atrioventricular", "intermediario",REF.cardio],
  ["cardiologia","doenca-no-sinusal","Doença do nó sinusal com síndrome bradi-taqui",74,"tontura alternando com crises de palpitação","pausas sinusais prolongadas intercaladas com taquiarritmia atrial","Holter=Pausas sinusais de 4 segundos e episódios de FA;ECG=Bradicardia sinusal;TSH=Normal","doenca do no sinusal,sindrome do no sinusal,sindrome bradi taqui","bradicardia sinusal,disfuncao sinusal", "dificil",REF.cardio],
  ["cardiologia","pericardite-aguda","Pericardite aguda",32,"dor no peito que piora ao inspirar e melhora ao inclinar-se para frente","quadro viral recente, atrito pericárdico e elevação difusa de ST","ECG=Elevação difusa de ST e depressão de PR;Ecocardiograma=Pequeno derrame;Troponina=Normal","pericardite aguda,pericardite","miopericardite,dor toracica inflamatoria", "facil",REF.cardio],
  ["cardiologia","miocardite","Miocardite aguda",27,"dor torácica e falta de ar após infecção viral","troponina elevada, disfunção ventricular global e coronárias sem obstrução","Troponina=Elevada;Ecocardiograma=Hipocinesia global FEVE 38%;Angiografia coronária=Sem obstrução","miocardite aguda,miocardite","miopericardite,sindrome coronariana aguda", "dificil",REF.cardio],
  ["cardiologia","tamponamento","Tamponamento cardíaco",48,"falta de ar, fraqueza e pressão baixa após neoplasia","hipotensão, turgência jugular, bulhas abafadas e colapso de câmaras direitas","Ecocardiograma=Grande derrame com colapso diastólico do VD;ECG=Alternância elétrica;Radiografia de tórax=Silhueta aumentada","tamponamento cardiaco,tamponamento pericardico","derrame pericardico,choque obstrutivo", "dificil",REF.cardio],
  ["cardiologia","estenose-aortica","Estenose aórtica grave sintomática",81,"desmaio aos esforços, dor no peito e falta de ar","sopro sistólico ejetivo irradiado para carótidas e área valvar reduzida","Ecocardiograma=Área valvar aórtica 0,7 cm² e gradiente elevado;ECG=Hipertrofia ventricular esquerda;BNP=Elevado","estenose aortica grave,estenose valvar aortica","valvopatia aortica,sopro aortico", "intermediario",REF.cardio],
  ["cardiologia","insuficiencia-mitral-aguda","Insuficiência mitral aguda por ruptura de músculo papilar",65,"falta de ar e hipotensão três dias após um infarto","edema pulmonar e novo sopro sistólico apical após IAM inferior","Ecocardiograma=Regurgitação mitral grave e flail de folheto;Radiografia de tórax=Edema pulmonar;Troponina=Em queda","insuficiencia mitral aguda por ruptura de musculo papilar,ruptura de musculo papilar","insuficiencia mitral aguda,complicacao mecanica do infarto", "dificil",REF.cardio],
  ["cardiologia","estenose-mitral","Estenose mitral reumática",46,"falta de ar progressiva e palpitações","estalido de abertura, ruflar diastólico e átrio esquerdo aumentado","Ecocardiograma=Área mitral reduzida e átrio esquerdo dilatado;ECG=Fibrilação atrial;Radiografia de tórax=Congestão venosa","estenose mitral reumatica,estenose mitral","valvopatia mitral,febre reumatica cardiaca", "intermediario",REF.cardio],
  ["cardiologia","insuficiencia-aortica","Insuficiência aórtica crônica grave",52,"palpitações fortes e falta de ar progressiva","pressão de pulso ampla, sopro diastólico aspirativo e ventrículo esquerdo dilatado","Ecocardiograma=Regurgitação aórtica grave e VE dilatado;Pressão arterial=160 por 55 mmHg;ECG=Hipertrofia de VE","insuficiencia aortica grave,regurgitacao aortica grave","valvopatia aortica,insuficiencia aortica", "intermediario",REF.cardio],
  ["cardiologia","endocardite-valvar","Endocardite infecciosa de válvula nativa",43,"febre persistente e novo sopro cardíaco","hemoculturas positivas, vegetação valvar e fenômenos embólicos periféricos","Hemoculturas=Staphylococcus aureus em duas amostras;Ecocardiograma=Vegetação mitral móvel;Hemograma=Anemia e leucocitose","endocardite infecciosa,endocardite bacteriana","bacteremia,infeccao valvar", "intermediario",REF.cardio],
  ["cardiologia","cardiomiopatia-hipertrofica","Cardiomiopatia hipertrófica obstrutiva",24,"desmaio durante exercício e histórico familiar de morte súbita","sopro que aumenta com Valsalva e hipertrofia septal assimétrica","Ecocardiograma=Hipertrofia septal assimétrica e gradiente de via de saída;ECG=Hipertrofia e ondas Q profundas;Holter=Extrassístoles ventriculares","cardiomiopatia hipertrofica obstrutiva,miocardiopatia hipertrofica,cmho","estenose dinamica da via de saida,cardiomiopatia", "dificil",REF.cardio],
  ["cardiologia","cardiomiopatia-dilatada","Cardiomiopatia dilatada",39,"cansaço, ortopneia e redução progressiva da capacidade física","dilatação global, disfunção sistólica e ausência de doença coronariana","Ecocardiograma=Quatro câmaras dilatadas e FEVE 25%;Angiografia coronária=Sem obstrução;BNP=Elevado","cardiomiopatia dilatada,miocardiopatia dilatada","insuficiencia cardiaca sistolica,cardiomiopatia", "intermediario",REF.cardio],
  ["cardiologia","takotsubo","Cardiomiopatia de Takotsubo",63,"dor torácica após intenso estresse emocional","alterações isquêmicas, troponina discreta, coronárias normais e balonamento apical","Angiografia coronária=Sem obstruções;Ventriculografia=Balonamento apical;Troponina=Discretamente elevada","cardiomiopatia de takotsubo,sindrome de takotsubo,cardiomiopatia por estresse","sindrome coronariana aguda,miocardite", "dificil",REF.cardio],
  ["cardiologia","pericardite-constritiva","Pericardite constritiva",57,"inchaço abdominal e nas pernas com pouca falta de ar","turgência jugular inspiratória, knock pericárdico e calcificação pericárdica","TC de tórax=Pericárdio espessado e calcificado;Ecocardiograma=Interdependência ventricular;BNP=Discretamente elevado","pericardite constritiva,constricao pericardica","insuficiencia cardiaca direita,doenca pericardica", "dificil",REF.cardio],
  ["cardiologia","sincope-vasovagal","Síncope vasovagal",21,"desmaio após permanecer muito tempo em pé em ambiente quente","náusea, sudorese e visão escura antes da perda breve de consciência, com recuperação completa","ECG=Normal;Glicemia=Normal;Teste ortostático=Sem hipotensão sustentada","sincope vasovagal,sincope neurocardiogenica,desmaio vasovagal","sincope reflexa,lipotimia", "facil",REF.cardio],
  ["cardiologia","hipotensao-ortostatica","Hipotensão ortostática",71,"tontura e quase desmaio ao levantar da cama","queda de 25 mmHg da pressão sistólica ao ficar em pé após início de diurético","Pressão ortostática=Queda de 25 por 12 mmHg em 3 minutos;ECG=Ritmo sinusal;Hemograma=Normal","hipotensao ortostatica,hipotensao postural","sincope ortostatica,efeito de anti hipertensivo", "facil",REF.cardio],
  ["cardiologia","aneurisma-aorta-roto","Aneurisma de aorta abdominal roto",75,"dor abdominal e lombar súbita com sensação de desmaio","hipotensão, massa abdominal pulsátil e líquido retroperitoneal","Ultrassom à beira-leito=Aneurisma de aorta com 8 cm;Angio-TC=Ruptura com hematoma retroperitoneal;Hemoglobina=Reduzida","aneurisma de aorta abdominal roto,ruptura de aneurisma de aorta,aaa roto","aneurisma de aorta,choque hemorragico", "dificil",REF.ms],

  // Clínica Geral — 30 cenários distintos
  ["clinica-geral","tep","Tromboembolismo pulmonar",36,"falta de ar súbita e dor ao respirar após viagem longa","taquicardia, hipoxemia, edema unilateral de perna e falha de enchimento arterial pulmonar","D-dímero=Elevado;Angio-TC de tórax=Falha de enchimento em artéria pulmonar;Ultrassom venoso=TVP poplítea","tromboembolismo pulmonar,embolia pulmonar,tep","tromboembolismo venoso,trombose venosa profunda", "intermediario",REF.ms],
  ["clinica-geral","cetoacidose-diabetica","Cetoacidose diabética",19,"vômitos, dor abdominal, muita sede e respiração profunda","diabetes tipo 1 sem insulina, glicemia alta, cetose e acidose com ânion gap","Glicemia=468 mg/dL;Gasometria=pH 7,12 e bicarbonato 9;Cetonemia=Fortemente positiva","cetoacidose diabetica,cad,diabetic ketoacidosis","diabetes descompensado,hiperglicemia com cetose", "intermediario",REF.ms],
  ["clinica-geral","estado-hiperosmolar","Estado hiperglicêmico hiperosmolar",79,"confusão e desidratação após vários dias de muita sede e urina excessiva","diabetes tipo 2, glicemia extrema, osmolaridade elevada e cetose mínima","Glicemia=920 mg/dL;Osmolaridade=345 mOsm/kg;Cetonemia=Traços","estado hiperglicemico hiperosmolar,estado hiperosmolar,eHH","hiperglicemia grave,diabetes descompensado", "dificil",REF.ms],
  ["clinica-geral","asma-grave","Exacerbação aguda grave de asma",26,"chiado e falta de ar sem melhora com broncodilatador habitual","fala entrecortada, pico de fluxo de 38% e sibilos difusos","Pico de fluxo=38% do melhor pessoal;Oximetria=90% em ar ambiente;Radiografia de tórax=Sem consolidação","exacerbacao aguda grave de asma,crise grave de asma,asma aguda grave","exacerbacao de asma,broncoespasmo", "intermediario",REF.ms],
  ["clinica-geral","dpoc-exacerbada","Exacerbação aguda de DPOC",68,"aumento da falta de ar, tosse e escarro purulento","tabagismo importante, roncos e piora dos três sintomas cardinais","Gasometria=Hipercapnia com acidose respiratória leve;Radiografia de tórax=Hiperinsuflação sem consolidação;Hemograma=Leucocitose discreta","exacerbacao aguda de dpoc,dpoc exacerbada","bronquite cronica exacerbada,infeccao respiratoria", "intermediario",REF.ms],
  ["clinica-geral","avc-isquemico","Acidente vascular cerebral isquêmico agudo",70,"fraqueza súbita no lado direito e fala enrolada há 70 minutos","déficit focal súbito, glicemia normal e TC sem hemorragia","TC de crânio sem contraste=Sem hemorragia;Angio-TC=Oclusão de artéria cerebral média;Glicemia=Normal","acidente vascular cerebral isquemico,avc isquemico,ave isquemico","acidente vascular cerebral,avc,ataque isquemico transitorio", "facil",REF.avc],
  ["clinica-geral","avc-hemorragico","Acidente vascular cerebral hemorrágico",62,"cefaleia súbita intensa, vômitos e fraqueza de um lado","pressão muito elevada, rebaixamento de consciência e sangue intraparenquimatoso na TC","TC de crânio=Hemorragia intraparenquimatosa em núcleos da base;Coagulograma=Normal;Glicemia=Normal","acidente vascular cerebral hemorragico,avc hemorragico,hemorragia intracerebral","acidente vascular cerebral,avc,hemorragia subaracnoidea", "intermediario",REF.avc],
  ["clinica-geral","ait","Ataque isquêmico transitório",67,"fraqueza e dificuldade para falar que duraram 15 minutos","déficit focal totalmente resolvido, TC sem lesão aguda e estenose carotídea","TC de crânio=Sem lesão aguda;Doppler de carótidas=Estenose de 60%;Glicemia=Normal","ataque isquemico transitorio,ait,tia","avc isquemico,isquemia cerebral transitoria", "intermediario",REF.avc],
  ["clinica-geral","hda-ulcera","Hemorragia digestiva alta por úlcera péptica",54,"vômito com sangue e fezes negras após uso frequente de anti-inflamatório","hematêmese, melena, ureia elevada e úlcera duodenal à endoscopia","Hemograma=Hemoglobina 8,4 g/dL;Ureia=Elevada;Endoscopia=Úlcera duodenal com vaso visível","hemorragia digestiva alta por ulcera peptica,ulcera peptica sangrante,hda por ulcera","hemorragia digestiva alta,sangramento gastrointestinal", "intermediario",REF.ms],
  ["clinica-geral","hdb-diverticular","Hemorragia digestiva baixa diverticular",73,"grande quantidade de sangue vivo nas fezes sem dor","hematoquezia indolor, queda de hemoglobina e divertículos colônicos","Colonoscopia=Divertículo com estigma de sangramento;Hemograma=Anemia aguda;Endoscopia alta=Sem sangramento","hemorragia digestiva baixa diverticular,sangramento diverticular","hemorragia digestiva baixa,hematoquezia", "intermediario",REF.ms],
  ["clinica-geral","pancreatite-aguda","Pancreatite aguda biliar",47,"dor forte no alto do abdome irradiada para as costas e vômitos","lipase maior que três vezes o limite e cálculos na vesícula","Lipase=1.450 U/L;Ultrassom=Litíase vesicular;TC de abdome=Edema pancreático","pancreatite aguda biliar,pancreatite aguda","abdome agudo,colecistite", "facil",REF.ms],
  ["clinica-geral","colecistite-aguda","Colecistite aguda calculosa",44,"dor contínua no lado direito superior do abdome após refeição gordurosa","febre, Murphy positivo, cálculos e espessamento da parede da vesícula","Ultrassom=Cálculos parede espessada e Murphy ultrassonográfico;Hemograma=Leucocitose;Bilirrubinas=Normais","colecistite aguda calculosa,colecistite aguda","colica biliar,coledocolitiase", "facil",REF.ms],
  ["clinica-geral","colangite","Colangite aguda",69,"febre, dor no lado direito do abdome e pele amarelada","tríade de Charcot, padrão colestático e dilatação de via biliar","Bilirrubinas=Elevadas com predomínio direto;Ultrassom=Colédoco dilatado com cálculo;Hemograma=Leucocitose","colangite aguda,colangite ascendente","coledocolitiase,colecistite", "intermediario",REF.ms],
  ["clinica-geral","apendicite","Apendicite aguda",23,"dor que começou perto do umbigo e migrou para a direita inferior","anorexia, febre baixa, defesa em fossa ilíaca direita e apêndice espessado","Ultrassom=Apêndice não compressível com 9 mm;Hemograma=Leucocitose;Urina tipo 1=Sem infecção","apendicite aguda,apendicite","abdome agudo inflamatorio,adenite mesenterica", "facil",REF.ms],
  ["clinica-geral","obstrucao-intestinal","Obstrução mecânica do intestino delgado por aderências",58,"dor abdominal em cólicas, vômitos e parada de gases","cirurgia abdominal prévia, distensão e níveis hidroaéreos com ponto de transição","TC de abdome=Alças delgadas dilatadas e ponto de transição;Radiografia de abdome=Níveis hidroaéreos;Lactato=Normal","obstrucao mecanica do intestino delgado por aderencias,obstrucao intestinal por bridas","obstrucao intestinal,ileo paralitico", "intermediario",REF.ms],
  ["clinica-geral","encefalopatia-hepatica","Encefalopatia hepática",60,"confusão e sonolência em pessoa com cirrose","asterixis, amônia elevada e sangramento digestivo como precipitante","Amônia=Elevada;Função hepática=INR alargado e albumina baixa;TC de crânio=Sem alteração aguda","encefalopatia hepatica","descompensacao da cirrose,delirium metabolico", "intermediario",REF.ms],
  ["clinica-geral","pielonefrite","Pielonefrite aguda",34,"febre alta, ardência para urinar e dor forte na região lombar","calafrios, piúria, nitrito positivo e dor à punho-percussão lombar","Urina tipo 1=Piúria e nitrito positivo;Urocultura=Escherichia coli;Hemograma=Leucocitose com neutrofilia","pielonefrite aguda,pielonefrite,infeccao urinaria alta","infeccao urinaria,itu,cistite", "facil",REF.ms],
  ["clinica-geral","ira-pre-renal","Injúria renal aguda pré-renal por hipovolemia",77,"fraqueza e pouca urina após vários dias de diarreia","hipotensão, mucosas secas, ureia desproporcional e sódio urinário baixo","Creatinina=Subiu de 0,9 para 2,1 mg/dL;Ureia=Elevada;Sódio urinário=Baixo","injuria renal aguda pre renal por hipovolemia,ira pre renal","injuria renal aguda,desidratacao", "facil",REF.ms],
  ["clinica-geral","sindrome-nefritica","Síndrome nefrítica aguda pós-estreptocócica",18,"urina escura, inchaço e pressão alta após infecção de garganta","hematúria glomerular, cilindros hemáticos, complemento baixo e ASLO elevada","Urina tipo 1=Hematúria dismórfica e cilindros hemáticos;Complemento C3=Baixo;ASLO=Elevada","sindrome nefritica aguda pos estreptococica,glomerulonefrite pos estreptococica","sindrome nefritica,glomerulonefrite", "intermediario",REF.ms],
  ["clinica-geral","sindrome-nefrotica","Síndrome nefrótica",35,"inchaço generalizado e urina espumosa","proteinúria maciça, hipoalbuminemia, edema e hiperlipidemia","Proteinúria de 24 horas=5,2 g;Albumina=2,1 g/dL;Colesterol total=Elevado","sindrome nefrotica","proteinuria nefrotica,doenca glomerular", "facil",REF.ms],
  ["clinica-geral","hipercalemia","Hipercalemia grave",63,"fraqueza muscular e palpitações em pessoa com doença renal","potássio de 7,1 mEq/L e ondas T apiculadas com alargamento do QRS","Potássio=7,1 mEq/L;ECG=Ondas T apiculadas e QRS alargado;Creatinina=Elevada","hipercalemia grave,hiperpotassemia grave","hipercalemia,disturbio eletrolitico", "facil",REF.ms],
  ["clinica-geral","hiponatremia-siad","Hiponatremia hipotônica por SIADH",51,"confusão e náusea após diagnóstico de câncer pulmonar","sódio baixo, osmolaridade sérica baixa, urina concentrada e euvolemia","Sódio=116 mEq/L;Osmolaridade sérica=Baixa;Osmolaridade urinária=Inadequadamente elevada","hiponatremia hipotonica por siadh,siadh,sindrome da secrecao inapropriada de adh","hiponatremia,disturbio do sodio", "dificil",REF.ms],
  ["clinica-geral","tempestade-tireoidiana","Tempestade tireoidiana",42,"febre alta, agitação, diarreia e coração acelerado","hipertireoidismo conhecido, hipertermia, fibrilação atrial e alteração neurológica","TSH=Suprimido;T4 livre=Muito elevado;ECG=Fibrilação atrial de alta resposta","tempestade tireoidiana,crise tireotoxica","tireotoxicose,hipertireoidismo descompensado", "dificil",REF.ms],
  ["clinica-geral","coma-mixedematoso","Coma mixedematoso",75,"sonolência progressiva, frio e respiração lenta","hipotermia, bradicardia, hiponatremia e T4 livre muito baixo","TSH=Muito elevado;T4 livre=Muito baixo;Sódio=124 mEq/L","coma mixedematoso,mixedema grave","hipotireoidismo grave,encefalopatia metabolica", "dificil",REF.ms],
  ["clinica-geral","crise-adrenal","Crise adrenal",38,"vômitos, dor abdominal, fraqueza e desmaio","hipotensão refratária, hiponatremia, hipercalemia e suspensão de corticoide","Cortisol=Baixo;Sódio=122 mEq/L;Potássio=6,0 mEq/L","crise adrenal,insuficiencia adrenal aguda,crise addisoniana","insuficiencia adrenal,choque distributivo", "dificil",REF.ms],
  ["clinica-geral","anemia-ferropriva","Anemia ferropriva por perda crônica",34,"cansaço, queda de cabelo e vontade de mastigar gelo","microcitose, ferritina baixa e menstruações volumosas","Hemograma=Hemoglobina 8,7 e VCM 68;Ferritina=5 ng/mL;Saturação de transferrina=Baixa","anemia ferropriva,anemia por deficiencia de ferro","anemia microcitica,perda cronica de sangue", "facil",REF.ms],
  ["clinica-geral","anemia-hemolitica-autoimune","Anemia hemolítica autoimune",41,"cansaço, icterícia e urina escura","anemia, reticulocitose, LDH elevada, haptoglobina baixa e Coombs direto positivo","Coombs direto=Positivo;LDH=Elevada;Haptoglobina=Indetectável","anemia hemolitica autoimune,ahia","anemia hemolitica,hemolise", "intermediario",REF.ms],
  ["clinica-geral","purpura-imune","Púrpura trombocitopênica imune",28,"manchas roxas e pequenos pontos vermelhos sem febre","plaquetopenia isolada com hemoglobina e leucócitos normais","Plaquetas=14.000 por mm³;Hemoglobina=Normal;Esfregaço=Plaquetas grandes sem esquizócitos","purpura trombocitopenica imune,pti,trombocitopenia imune","plaquetopenia,doenca hematologica autoimune", "intermediario",REF.ms],
  ["clinica-geral","purpura-trombotica","Púrpura trombocitopênica trombótica",39,"confusão, febre e manchas roxas","anemia hemolítica microangiopática, plaquetopenia, alteração neurológica e esquizócitos","Esfregaço=Numerosos esquizócitos;Plaquetas=18.000 por mm³;LDH=Muito elevada","purpura trombocitopenica trombotica,ptt","microangiopatia trombotica,anemia hemolitica microangiopatica", "dificil",REF.ms],
  ["clinica-geral","crise-falciforme","Crise vaso-oclusiva na doença falciforme",25,"dor intensa em ossos e articulações após desidratação","doença falciforme conhecida, dor típica sem foco infeccioso e reticulocitose","Hemograma=Anemia crônica;Reticulócitos=Elevados;Radiografia de tórax=Sem infiltrado","crise vaso oclusiva falciforme,crise algica falciforme","doenca falciforme,crise de falcizacao", "facil",REF.ms],

  // Infectologia — 25 cenários distintos
  ["infectologia","dengue-alarme","Dengue com sinais de alarme",24,"dor abdominal e vômitos persistentes quando a febre começou a baixar","hemoconcentração, plaquetopenia, sangramento de mucosa e líquido livre","Hemograma=Hematócrito em elevação e plaquetas 58.000;NS1=Reagente;Ultrassom=Pequena ascite","dengue com sinais de alarme,dengue com sinais de alerta","dengue,arbovirose", "intermediario",REF.arbovirus],
  ["infectologia","dengue-grave","Dengue grave com choque",19,"fraqueza extrema, dor abdominal e extremidades frias após febre","pressão de pulso estreita, hipoperfusão e extravasamento plasmático importante","Hemograma=Hematócrito elevado e plaquetas 32.000;Lactato=Elevado;Ultrassom=Ascite e derrame pleural","dengue grave com choque,choque por dengue,sindrome do choque da dengue","dengue com sinais de alarme,dengue", "dificil",REF.arbovirus],
  ["infectologia","chikungunya","Febre chikungunya aguda",33,"febre alta e dor incapacitante em várias articulações","artralgia simétrica intensa, edema articular e exantema após exposição a Aedes","RT-PCR para chikungunya=Detectável;Hemograma=Leucopenia discreta;NS1 dengue=Não reagente","febre chikungunya,chikungunya aguda,chikungunya","arbovirose,dengue", "facil",REF.arbovirus],
  ["infectologia","zika","Infecção aguda pelo vírus Zika",27,"manchas no corpo com coceira e olhos vermelhos, quase sem febre","exantema pruriginoso, conjuntivite não purulenta e artralgia leve","RT-PCR para Zika=Detectável;Hemograma=Sem alterações importantes;NS1 dengue=Não reagente","infeccao aguda pelo virus zika,zika","arbovirose,dengue,chikungunya", "facil",REF.arbovirus],
  ["infectologia","febre-amarela","Febre amarela",36,"febre, dor muscular, icterícia e vômitos após viagem para área de mata","não vacinado, insuficiência hepática, sangramento e dissociação pulso-temperatura","PCR para febre amarela=Detectável;AST e ALT=Muito elevadas;Bilirrubinas=Elevadas","febre amarela","arbovirose,hepatite viral,dengue grave", "dificil",REF.arbovirus],
  ["infectologia","leptospirose","Leptospirose com síndrome de Weil",42,"febre, dor forte nas panturrilhas e olhos avermelhados após enchente","sufusão conjuntival, icterícia, injúria renal e exposição à água contaminada","PCR para Leptospira=Detectável;Creatinina=Elevada;Bilirrubina direta=Muito elevada","leptospirose com sindrome de weil,leptospirose,doenca de weil","sindrome febril ictero hemorragica,arbovirose", "intermediario",REF.ms],
  ["infectologia","meningite-pneumococica","Meningite bacteriana pneumocócica",47,"febre alta, cefaleia, rigidez no pescoço e confusão","síndrome meníngea e líquor com neutrófilos, proteína alta e glicose baixa","Líquor=Neutrofilia proteína elevada e glicose baixa;Gram do líquor=Diplococos gram-positivos;Hemocultura=S. pneumoniae","meningite bacteriana pneumococica,meningite pneumococica","meningite bacteriana,meningite", "intermediario",REF.meningitis],
  ["infectologia","meningite-viral","Meningite viral por enterovírus",22,"cefaleia, fotofobia e rigidez de nuca com estado geral preservado","líquor linfocitário, glicose normal e PCR positiva para enterovírus","Líquor=Predomínio linfocitário proteína discreta e glicose normal;PCR do líquor=Enterovírus detectável;Gram=Negativo","meningite viral por enterovirus,meningite viral","meningite,sindrome meningea", "intermediario",REF.meningitis],
  ["infectologia","tb-pulmonar","Tuberculose pulmonar cavitária",38,"tosse há seis semanas, suor noturno e perda de peso","contato epidemiológico, cavitação apical e teste molecular positivo","Teste molecular rápido para TB=M. tuberculosis detectado;Radiografia de tórax=Cavitação apical;Baciloscopia=BAAR positivo","tuberculose pulmonar cavitaria,tuberculose pulmonar,tb pulmonar","tuberculose,infeccao pulmonar cronica", "facil",REF.tb],
  ["infectologia","tb-miliar","Tuberculose miliar",44,"febre prolongada, emagrecimento e falta de ar progressiva","imunossupressão e micronódulos difusos com padrão miliar","TC de tórax=Micronódulos randômicos difusos;Teste molecular em lavado=M. tuberculosis detectado;Hemograma=Pancitopenia","tuberculose miliar,tb miliar","tuberculose disseminada,tuberculose", "dificil",REF.tb],
  ["infectologia","meningite-tb","Meningite tuberculosa",35,"cefaleia progressiva, febre baixa e sonolência há três semanas","evolução subaguda, paresia craniana e líquor linfocitário com glicose muito baixa","Líquor=Linfócitos proteína muito elevada e glicose baixa;Teste molecular do líquor=M. tuberculosis detectado;TC de crânio=Hidrocefalia basal","meningite tuberculosa,neurotuberculose","tuberculose extrapulmonar,meningite subaguda", "dificil",REF.tb],
  ["infectologia","pneumonia-pneumococica","Pneumonia pneumocócica adquirida na comunidade",67,"febre alta, tosse com catarro ferruginoso e dor ao respirar","início abrupto, consolidação lobar e diplococos gram-positivos no escarro","Radiografia de tórax=Consolidação lobar;Gram do escarro=Diplococos gram-positivos;Hemograma=Neutrofilia","pneumonia pneumococica,pneumonia por pneumococo","pneumonia adquirida na comunidade,pneumonia bacteriana", "facil",REF.pneumonia],
  ["infectologia","pneumonia-atipica","Pneumonia atípica por Mycoplasma pneumoniae",25,"tosse seca persistente, febre baixa e dor de cabeça","quadro arrastado, ausculta pouco expressiva e infiltrado intersticial difuso","Radiografia de tórax=Infiltrado intersticial bilateral;PCR respiratório=Mycoplasma pneumoniae detectável;Hemograma=Sem leucocitose importante","pneumonia atipica por mycoplasma,pneumonia por mycoplasma","pneumonia atipica,pneumonia comunitaria", "intermediario",REF.pneumonia],
  ["infectologia","influenza","Influenza com síndrome respiratória aguda",52,"febre súbita, dores no corpo, tosse seca e prostração","início abrupto em período sazonal e teste molecular positivo","RT-PCR respiratório=Influenza A detectável;Radiografia de tórax=Sem consolidação;Oximetria=95% em ar ambiente","influenza,gripe por influenza","sindrome gripal,infeccao viral respiratoria", "facil",REF.pneumonia],
  ["infectologia","covid-pneumonia","Pneumonia viral por COVID-19",58,"febre, tosse seca e falta de ar progressiva","hipoxemia, opacidades periféricas em vidro fosco e teste viral positivo","RT-PCR para SARS-CoV-2=Detectável;TC de tórax=Vidro fosco periférico bilateral;Oximetria=89% em ar ambiente","pneumonia por covid 19,covid 19,covid","pneumonia viral,sindrome respiratoria aguda grave", "facil",REF.pneumonia],
  ["infectologia","hiv-agudo","Síndrome retroviral aguda pelo HIV",29,"febre, dor de garganta, ínguas e manchas após relação sexual desprotegida","exposição recente, síndrome mononucleose-like, teste de quarta geração e RNA positivos","Teste HIV quarta geração=Reagente;HIV RNA=Detectável em alta carga;Teste para EBV=Negativo","sindrome retroviral aguda pelo hiv,infeccao aguda pelo hiv,hiv agudo","infeccao pelo hiv,sindrome mononucleose", "intermediario",REF.hiv],
  ["infectologia","pneumocistose","Pneumocistose em pessoa com HIV avançado",40,"falta de ar progressiva, tosse seca e febre há duas semanas","CD4 muito baixo, hipoxemia e vidro fosco bilateral difuso","CD4=48 células por mm³;TC de tórax=Vidro fosco bilateral difuso;PCR no lavado=Pneumocystis jirovecii detectável","pneumocistose,pneumonia por pneumocystis jirovecii,pcp","infeccao oportunista,pneumonia em hiv", "intermediario",REF.hiv],
  ["infectologia","toxoplasmose-cerebral","Neurotoxoplasmose",37,"dor de cabeça, confusão e fraqueza de um lado em pessoa com HIV","CD4 baixo e múltiplas lesões cerebrais com realce em anel","TC de crânio=Múltiplas lesões com realce anelar e edema;CD4=32 células por mm³;IgG toxoplasmose=Reagente","neurotoxoplasmose,toxoplasmose cerebral","infeccao oportunista,abscesso cerebral", "dificil",REF.hiv],
  ["infectologia","criptococose-meningea","Meningite criptocócica",41,"cefaleia progressiva e visão borrada em pessoa com HIV","pressão de abertura elevada, líquor linfocitário e antígeno criptocócico positivo","Pressão de abertura=35 cmH2O;Antígeno criptocócico no líquor=Reagente;Tinta da China=Leveduras encapsuladas","meningite criptococica,neurocriptococose,criptococose meningea","meningite fungica,infeccao oportunista", "dificil",REF.hiv],
  ["infectologia","malaria-falciparum","Malária por Plasmodium falciparum",34,"febre com calafrios após retorno de área amazônica","viagem epidemiológica, trombocitopenia e formas de P. falciparum na gota espessa","Gota espessa=Plasmodium falciparum;Teste rápido para malária=Positivo para P. falciparum;Plaquetas=Reduzidas","malaria por plasmodium falciparum,malaria falciparum","malaria,sindrome febril de viajante", "intermediario",REF.malaria],
  ["infectologia","sifilis-secundaria","Sífilis secundária",30,"manchas pelo corpo inclusive nas palmas e plantas, sem coceira","exantema palmoplantar, linfadenopatia difusa e testes treponêmico e não treponêmico reagentes","VDRL=Reagente 1 para 128;Teste treponêmico=Reagente;Teste HIV=Não reagente","sifilis secundaria","sifilis,infeccao sexualmente transmissivel", "facil",REF.hiv],
  ["infectologia","doenca-inflamatoria-pelvica","Doença inflamatória pélvica por gonococo",26,"dor pélvica, febre e corrimento após nova parceria sexual","dor à mobilização do colo, secreção cervical e teste molecular para gonococo positivo","PCR cervical=Neisseria gonorrhoeae detectável;Ultrassom transvaginal=Sem abscesso;Hemograma=Leucocitose","doenca inflamatoria pelvica por gonococo,dip gonococica","doenca inflamatoria pelvica,cervicite gonococica", "intermediario",REF.hiv],
  ["infectologia","erisipela","Erisipela",61,"febre e placa vermelha dolorosa bem delimitada na perna","lesão elevada com bordas nítidas, porta de entrada interdigital e linfangite","Hemograma=Leucocitose;Ultrassom de partes moles=Sem coleção;Doppler venoso=Sem trombose","erisipela","celulite bacteriana,infeccao de pele", "facil",REF.ms],
  ["infectologia","fasciite-necrosante","Fasciite necrosante",55,"dor intensa na perna muito maior que a alteração visível","progressão rápida, bolhas, crepitação, toxicidade sistêmica e gás fascial","TC de membro=Gás e edema ao longo da fáscia;Lactato=Elevado;Hemoculturas=Streptococcus pyogenes","fasciite necrosante,infeccao necrosante de partes moles","celulite grave,erisipela,sepse de foco cutaneo", "dificil",REF.sepsis],
  ["infectologia","sepse-urinaria","Sepse de foco urinário por pielonefrite",72,"febre, confusão, pressão baixa e dor lombar","infecção urinária alta associada a disfunção orgânica e lactato elevado","Urina tipo 1=Piúria e nitrito positivo;Urocultura=E. coli;Lactato=3,8 mmol/L","sepse de foco urinario,urosepse,sepse por pielonefrite","pielonefrite complicada,sepse", "intermediario",REF.sepsis],
];

function parseAliases(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function complementaryExams(specialty, diagnosis, index) {
  if (specialty === "cardiologia") {
    return [
      { name: "Glicemia capilar", result: "102 mg/dL", kind: "neutral" },
      { name: "Lipase", result: "Dentro da faixa de referência", kind: "neutral" },
      { name: "D-dímero", result: index % 2 === 0 ? "Discretamente elevado para a idade" : "No limite superior da referência", kind: "distractor" },
    ];
  }
  if (specialty === "infectologia") {
    return [
      { name: "Glicemia capilar", result: "101 mg/dL", kind: "neutral" },
      { name: "Lipase", result: "Dentro da faixa de referência", kind: "neutral" },
      { name: "D-dímero", result: "Discretamente elevado, achado inespecífico no contexto inflamatório", kind: "distractor" },
    ];
  }
  if (/avc|isqu[eê]mico|neurol|encefal|p[uú]rpura/i.test(diagnosis)) {
    return [
      { name: "Glicemia capilar", result: "98 mg/dL", kind: "neutral" },
      { name: "Função renal", result: "Sem alterações relevantes", kind: "neutral" },
      { name: "Sódio", result: "132 mEq/L, redução discreta sem correlação com o déficit focal", kind: "distractor" },
    ];
  }
  if (/abdom|pancre|colec|colang|apend|intestinal|digestiv/i.test(diagnosis)) {
    return [
      { name: "ECG", result: "Ritmo sinusal, sem sinais de isquemia", kind: "neutral" },
      { name: "Troponina", result: "Dentro da faixa de referência", kind: "neutral" },
      { name: "Urina tipo 1", result: "Traços de leucócitos, sem nitrito", kind: "distractor" },
    ];
  }
  if (/asma|dpoc|pulmonar|respirat/i.test(diagnosis)) {
    return [
      { name: "Glicemia capilar", result: "106 mg/dL", kind: "neutral" },
      { name: "Função hepática", result: "Sem alterações relevantes", kind: "neutral" },
      { name: "BNP", result: "Discretamente elevado, sem padrão de congestão cardíaca", kind: "distractor" },
    ];
  }
  return [
    { name: "Radiografia de tórax", result: "Sem alterações cardiopulmonares agudas", kind: "neutral" },
    { name: "Lipase", result: "Dentro da faixa de referência", kind: "neutral" },
    { name: "Proteína C reativa", result: "Discretamente elevada, achado inespecífico", kind: "distractor" },
  ];
}

export const clinicalCasesV2 = rows.map(([specialty, slug, diagnosis, age, complaint, clues, examText, correctText, partialText, difficulty, source], index) => {
  const name = names[index % names.length];
  const maxXp = difficulty === "dificil" ? 300 : difficulty === "intermediario" ? 240 : 200;
  return {
    id: `${specialty}-${slug}`,
    schemaVersion: 1,
    catalogVersion: "mvp-2",
    catalogManaged: true,
    status: "published",
    specialty,
    difficulty,
    title: `${name}, ${age} anos · ${complaint}`,
    setting: difficulty === "facil" ? "Pronto atendimento" : "Emergência",
    summary: clues.charAt(0).toUpperCase() + clues.slice(1) + ".",
    patient: { name, age, avatar: index % 2 === 0 ? "👩" : "👨" },
    initialMessages: [
      { who: "patient", text: `Doutor(a), estou com ${complaint}.` },
      { who: "you", text: "Conte um pouco mais sobre o início dos sintomas e outros sinais associados." },
      { who: "patient", text: `O que mais percebi foi: ${clues}.` },
    ],
    fallbackReply: "Posso tentar explicar melhor, doutor(a), mas esses são os sintomas que mais estão me preocupando.",
    exams: [
      ...examText.split(";").slice(0, 2).map((exam, examIndex) => {
      const [examName, result] = exam.split("=");
        return { name: examName, result, kind: "relevant", highlighted: examIndex === 0 };
      }),
      ...complementaryExams(specialty, diagnosis, index),
    ],
    durationSeconds: difficulty === "dificil" ? 10 * 60 : 8 * 60,
    maxXp,
    diagnosis,
    diagnosisAliases: parseAliases(correctText),
    partialDiagnosisAliases: parseAliases(partialText),
    feedback: `Os elementos decisivos foram ${clues}. Esse conjunto sustenta ${diagnosis}.`,
    sourceRefs: [source],
  };
});

export function validateClinicalCases(cases) {
  const errors = [];
  if (cases.length !== 85) errors.push(`esperados 85 casos; encontrados ${cases.length}`);
  const expected = { cardiologia: 30, "clinica-geral": 30, infectologia: 25 };
  for (const [specialty, count] of Object.entries(expected)) {
    const actual = cases.filter((item) => item.specialty === specialty).length;
    if (actual !== count) errors.push(`${specialty}: esperado ${count}; encontrado ${actual}`);
  }
  for (const field of ["id", "title"]) {
    const values = cases.map((item) => item[field]);
    if (new Set(values).size !== values.length) errors.push(`${field} duplicado`);
  }
  cases.forEach((item) => {
    if (!item.diagnosisAliases.length) errors.push(`${item.id}: sem aliases corretos`);
    if (!item.partialDiagnosisAliases.length) errors.push(`${item.id}: sem aliases parciais`);
    if (item.exams.length !== 5) errors.push(`${item.id}: deve conter exatamente cinco exames`);
    if (new Set(item.exams.map((exam) => exam.name)).size !== item.exams.length) errors.push(`${item.id}: nomes de exames duplicados`);
    const examKinds = item.exams.reduce((counts, exam) => ({ ...counts, [exam.kind]: (counts[exam.kind] ?? 0) + 1 }), {});
    if (examKinds.relevant !== 2 || examKinds.neutral !== 2 || examKinds.distractor !== 1) errors.push(`${item.id}: composição de exames inválida`);
    if (!item.sourceRefs.every((source) => /^https:\/\//.test(source))) errors.push(`${item.id}: referência inválida`);
    if (item.summary.length < 30 || item.feedback.length < 50) errors.push(`${item.id}: conteúdo insuficiente`);
  });
  if (errors.length) throw new Error(`Catálogo inválido:\n- ${errors.join("\n- ")}`);
}
