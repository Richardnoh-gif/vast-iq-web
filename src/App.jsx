import React, { useState } from 'react';
import {
  Target,
  Globe,
  UserPlus,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  Loader2,
  FileText,
  Briefcase,
  Layers,
  ArrowRightCircle,
  AlertCircle,
  MessageSquare,
  Zap,
  Languages,
  X,
  Mail,
  ShieldAlert,
  Calendar
} from 'lucide-react';

const apiKey = import.meta.env.VITE_API_KEY || '';
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

const VAST_SYSTEM_PROMPT = `
You are a Strategic Account Planning Strategist for VAST Data. 
Your goal is to build a comprehensive Strategic Account Capture & Pursuit Plan in KOREAN.
Focus on VAST AI OS — a full-stack data and AI platform.

Context for VAST:
- Core: Scale-out all-flash (file/object/block), exabyte-scale, optimized for AI/HPC.
- Advantages: Operating system for AI, governance, performance, cost efficiency.
- Competitors: Dell PowerScale, Pure FlashBlade, WEKA, NetApp, Snowflake, Databricks.
- Partners: NVIDIA, Cisco, HPE, etc.

Output Structure (MANDATORY IN KOREAN):
1. 고객 개요 (Account Overview): 회사명, 산업, 본사, 추정 수익/성장률.
2. AI 여정 및 성숙도 평가: 모델 학습, 추론(RAG), 클라우드 사용 현황 분석.
3. 전략적 우선순위 및 이니셔티브: 연례 보고서/뉴스 기반의 AI 투자 및 디지털 전환 목표.
4. 영업 플레이 매핑 (Sales Play Mapping): AI 학습, RAG, 분석, HPC, 데이터 보호 등에 대한 VAST의 적합성 분석.
5. 딜 가설 (Deal Hypothesis): VAST가 필요한 이유, 시급성, 성공 비전.
6. 파트너 생태계 전략: NVIDIA, Cisco, GSI 등과의 협업 방안.
7. 권장 다음 단계 (Next Steps): 구체적인 액션 아이템.

Always include placeholders like [Source] or [Assumption] where data is inferred.
`;

const App = () => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [error, setError] = useState(null);

  const [inputs, setInputs] = useState({
    accountName: '',
    websiteUrl: '',
    accountStatus: 'Prospect',
    useCases: '',
    context: ''
  });

  const callGemini = async (prompt, systemPrompt = '') => {
    if (!apiKey) {
      throw new Error('API 키가 필요합니다. .env 파일에 VITE_API_KEY를 설정하세요.');
    }

    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
              tools: [{ google_search: {} }]
            })
          }
        );

        const data = await response.json();
        if (response.ok) {
          return data.candidates?.[0]?.content?.parts?.[0]?.text;
        }
        throw new Error(data.error?.message || 'API request failed');
      } catch (e) {
        retries += 1;
        if (retries >= maxRetries) {
          throw new Error(e.message || '최종 시도까지 모두 실패했습니다.');
        }
        const delay = Math.pow(2, retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('최종 시도까지 모두 실패했습니다.');
  };

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userQuery = `Create a Strategic Account Pursuit Plan for: ${inputs.accountName}, Web: ${inputs.websiteUrl}, Status: ${inputs.accountStatus}, UseCases: ${inputs.useCases}, Context: ${inputs.context}`;
      const result = await callGemini(userQuery, VAST_SYSTEM_PROMPT);
      setReport(result);
      setStep(6);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiFeature = async (type) => {
    setIsAiLoading(true);
    setAiInsight(null);
    let prompt = '';
    let sysPrompt = 'You are a professional VAST Data sales consultant.';

    switch (type) {
      case 'summary':
        prompt = `다음 리포트를 경영진 보고용 핵심 요약(Executive Summary)으로 만들어줘:\n\n${report}`;
        break;
      case 'pitch':
        prompt = `이 고객사의 CXO를 위한 1분 엘리베이터 피치와 강력한 오프닝 멘트 3가지를 제안해줘:\n\n${report}`;
        break;
      case 'email':
        prompt = `미팅 후 고객에게 보낼 수 있는 맞춤형 follow-up 이메일 초안을 작성해줘. VAST AI OS가 그들의 특정 문제(use case)를 어떻게 해결하는지 강조하고, 다음 미팅을 제안하는 내용을 포함해줘:\n\n${report}`;
        break;
      case 'objection':
        prompt = `이 고객사가 제기할 수 있는 예상 반대 의견(예: 가격 저항, 기존 벤더 유지, 클라우드 우선 정책 등) 3가지와 이에 대한 VAST만의 논리적인 대응 시나리오를 작성해줘:\n\n${report}`;
        break;
      case 'workshop':
        prompt = `고객의 기술팀을 대상으로 한 'VAST AI OS 심층 기술 워크숍' 4주 아젠다를 구성해줘. 개념 증명(PoC)으로 이어질 수 있는 실무적인 내용을 포함해줘:\n\n${report}`;
        break;
      case 'english':
        prompt = `Translate this plan into professional business English for VAST HQ:\n\n${report}`;
        break;
      default:
        break;
    }

    try {
      const result = await callGemini(prompt, sysPrompt);
      setAiInsight({ type, content: result });
    } catch (e) {
      setError('AI 분석 생성에 실패했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const steps = [
    { id: 'accountName', title: '고객사 이름', description: '분석할 기업의 정식 명칭을 입력하세요.', placeholder: '예: 삼성전자, 현대자동차, 카카오뱅크', icon: <Target className="w-6 h-6" /> },
    { id: 'websiteUrl', title: '회사 웹사이트', description: '최신 정보를 확인하기 위한 URL을 입력하세요.', placeholder: 'https://www.example.com', icon: <Globe className="w-6 h-6" /> },
    { id: 'accountStatus', title: '계정 상태', description: '현재 VAST Data와의 관계를 선택하세요.', type: 'select', options: ['Prospect (신규)', 'Customer (기존 고객)'], icon: <UserPlus className="w-6 h-6" /> },
    { id: 'useCases', title: '알려진 유즈케이스', description: 'AI 학습, RAG, 데이터 보호 등 관심 분야를 입력하세요.', placeholder: '예: 생성형 AI 모델 학습용 GPU 스토리지 구축', icon: <Layers className="w-6 h-6" /> },
    { id: 'context', title: '상황 및 맥락', description: '소개, 이전 관계, 현재 당면 과제 등 배경 정보를 입력하세요.', placeholder: '예: 기존 레거시 스토리지의 성능 한계로 교체 검토 중', icon: <Lightbulb className="w-6 h-6" /> }
  ];

  const handleInputChange = (field, value) => setInputs({ ...inputs, [field]: value });
  const nextStep = () => step < steps.length - 1 ? setStep(step + 1) : null;
  const prevStep = () => step > 0 ? setStep(step - 1) : null;

  const copyText = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl w-full mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Briefcase size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VAST Data 고객사 전략 플래너</h1>
        </div>
        <p className="text-slate-500 italic">VAST AI OS — 전사적 AI 데이터 인프라를 위한 전략 수립 도구</p>
      </div>

      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {step < steps.length ? (
          <div className="p-6 md:p-10">
            <div className="flex gap-2 mb-8">
              {steps.map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                {steps[step].icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{steps[step].title}</h2>
                <p className="text-slate-500">{steps[step].description}</p>
              </div>
            </div>

            <div className="mt-8">
              {steps[step].type === 'select' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps[step].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleInputChange(steps[step].id, opt)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        inputs[steps[step].id] === opt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-inner'
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full p-4 text-lg border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors min-h-[150px]"
                  placeholder={steps[step].placeholder}
                  value={inputs[steps[step].id]}
                  onChange={(e) => handleInputChange(steps[step].id, e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-between mt-12">
              <button onClick={prevStep} disabled={step === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${step === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>
                <ChevronLeft size={20} /> 이전
              </button>

              {step === steps.length - 1 ? (
                <button
                  onClick={generateReport}
                  disabled={isLoading || !inputs.accountName}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ClipboardCheck size={20} />}
                  전략 리포트 생성하기
                </button>
              ) : (
                <button onClick={nextStep} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg">
                  다음 <ChevronRight size={20} />
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-[85vh] md:flex-row">
            <div className="flex-1 flex flex-col border-r border-slate-200 min-w-0">
              <div className="p-6 border-b bg-white flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0"><FileText size={24} /></div>
                  <h2 className="text-xl font-bold truncate">{inputs.accountName} 분석 리포트</h2>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setStep(0)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm">다시 시작</button>
                  <button onClick={() => copyText(report)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-700 text-sm flex items-center gap-2 shadow-sm">
                    리포트 복사
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm border border-slate-200 prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-800">
                  {report}
                </div>
              </div>
            </div>

            <div className="w-full md:w-96 bg-slate-900 text-white flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex-shrink-0">
                <h3 className="font-bold flex items-center gap-2 text-indigo-400">
                  <Zap size={20} className="fill-indigo-400" /> ✨ AI 세일즈 액션 센터
                </h3>
                <p className="text-xs text-slate-400 mt-1">리포트 데이터를 활용해 실전 무기를 만드세요.</p>
              </div>

              <div className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">전략 및 커뮤니케이션</div>

                <button onClick={() => handleAiFeature('summary')} className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left flex items-start gap-3">
                  <FileText size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">✨ 경영진 요약 생성</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">보고서를 1페이지 요약본으로 변환.</p>
                  </div>
                </button>

                <button onClick={() => handleAiFeature('email')} className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left flex items-start gap-3">
                  <Mail size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">✨ 맞춤형 이메일 초안</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">페인 포인트를 타격하는 후속 메일.</p>
                  </div>
                </button>

                <button onClick={() => handleAiFeature('pitch')} className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left flex items-start gap-3">
                  <MessageSquare size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">✨ 미팅 오프닝 Pitch</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">CXO를 위한 강력한 첫인상 멘트.</p>
                  </div>
                </button>

                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2 pt-4">실전 대응 및 실행</div>

                <button onClick={() => handleAiFeature('objection')} className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left flex items-start gap-3">
                  <ShieldAlert size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">✨ 반대 의견 대응 (Objection)</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">예상되는 질문과 논리적 답변 시나리오.</p>
                  </div>
                </button>

                <button onClick={() => handleAiFeature('workshop')} className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left flex items-start gap-3">
                  <Calendar size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">✨ 기술 워크숍 아젠다</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">PoC로 이어지는 4주 기술 교육 플랜.</p>
                  </div>
                </button>

                <button onClick={() => handleAiFeature('english')} className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left flex items-start gap-3">
                  <Languages size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">✨ 영문 리포트 변환</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">VAST HQ 보고용 전문 번역.</p>
                  </div>
                </button>

                {isAiLoading && (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p className="text-[10px]">VAST AI OS가 분석 중입니다...</p>
                  </div>
                )}

                {aiInsight && !isAiLoading && (
                  <div className="mt-4 p-4 rounded-xl bg-indigo-950 border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">
                        {aiInsight.type.toUpperCase()} RESULT
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => copyText(aiInsight.content)} className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-md hover:bg-indigo-500">복사</button>
                        <button onClick={() => setAiInsight(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1 thin-scrollbar">
                      {aiInsight.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {step < steps.length && (
        <div className="max-w-6xl w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold flex items-center gap-2 text-indigo-600 mb-3"><ArrowRightCircle size={18} /> 미팅 전 숙지사항</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• GPU 클러스터 투자 계획 및 현재 운영 규모 파악</li>
              <li>• 기존 스토리지의 티어링 방식 및 데이터 관리 복잡성</li>
              <li>• 실시간 분석(Vector DB) 및 RAG 시스템 구축 요구사항</li>
              <li>• 현재 데이터 압축률 및 중복 제거 성능 현황</li>
              <li>• 하이브리드/멀티 클라우드 전략과 데이터 이동성 병목 지점</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold flex items-center gap-2 text-indigo-600 mb-3"><ArrowRightCircle size={18} /> VAST AI OS 핵심 강점</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• 파일/오브젝트/데이터베이스의 단일 티어 완전 통합</li>
              <li>• Exabyte 규모의 Zero-Trust 아키텍처 및 데이터 거버넌스</li>
              <li>• 타사 대비 최대 5:1 이상의 독보적인 유사성 압축 기술</li>
              <li>• DASE 아키텍처를 통한 병목 없는 무한한 성능/용량 확장</li>
              <li>• 실시간 데이터 분석 엔진 및 벡터 DB 기능 내재화</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold flex items-center gap-2 text-indigo-600 mb-3"><ArrowRightCircle size={18} /> 영업 성공 팁</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• "단순 스토리지가 아닌 AI 인프라의 통합 OS"임을 강조</li>
              <li>• NVIDIA SuperPOD 및 Cisco 인증 등 강력한 파트너십 활용</li>
              <li>• 10년 수명의 고내구성 플래시를 통한 장기적 경제성 어필</li>
              <li>• TCO 분석을 통해 인프라 단순화와 관리 비용 절감 효과 증명</li>
              <li>• CoreWeave 등 글로벌 대규모 AI 클라우드 도입 사례 공유</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
