import { useState } from "react"

const CARDS = [
  {
    title: "Aproximação rápida",
    scene: "O foguete ainda está alto, mas a velocidade vertical de descida está aumentando.",
    prompt: "Qual decisão ajuda a reduzir a velocidade de queda?",
    choices: ["Aplicar impulso curto e observar a velocidade", "Inclinar bastante para um lado", "Ignorar a velocidade e mirar só na plataforma"],
    answer: 0,
    feedback: "Impulso reduz a velocidade vertical nesta simulação. Use pequenos ajustes: impulso demais pode consumir combustível ou fazer o foguete subir.",
  },
  {
    title: "Deriva lateral",
    scene: "A plataforma está abaixo, mas o foguete está se movendo para a direita.",
    prompt: "O que a equipe deve observar antes de corrigir a rota?",
    choices: ["Inclinar um pouco para a esquerda e conferir a deriva", "Manter o foguete inclinado para a direita", "Usar o impulso vertical sem observar a posição"],
    answer: 0,
    feedback: "Uma inclinação contrária pode mudar a velocidade horizontal. Acompanhe a deriva e volte a alinhar o foguete para a descida.",
  },
  {
    title: "Pouco combustível",
    scene: "O indicador de combustível está baixo e o veículo ainda precisa corrigir a velocidade.",
    prompt: "Como equilibrar a correção e o combustível restante?",
    choices: ["Fazer ajustes curtos e priorizar uma descida controlada", "Manter o propulsor ligado continuamente", "Girar sem acompanhar o movimento"],
    answer: 0,
    feedback: "Impulsos curtos permitem observar o efeito antes da próxima decisão. No jogo, combustível é limitado; no voo real há planejamento e sistemas muito mais complexos.",
  },
  {
    title: "Perto da plataforma",
    scene: "O veículo está quase sobre a plataforma e com inclinação visível.",
    prompt: "Qual é a prioridade para uma chegada estável?",
    choices: ["Reduzir a inclinação e controlar as velocidades", "Aumentar a inclinação para chegar mais rápido", "Olhar apenas para o combustível"],
    answer: 0,
    feedback: "A simulação recompensa pouco ângulo e velocidades baixas. A posição e o estado do veículo precisam ser observados em conjunto.",
  },
  {
    title: "Resultado e aprendizado",
    scene: "A tentativa terminou em pouso ou em queda fora da plataforma.",
    prompt: "O que a equipe deve fazer antes de reiniciar?",
    choices: ["Identificar uma decisão, seu efeito e uma mudança para a próxima tentativa", "Reiniciar sem conversar", "Tratar a pontuação como dado de uma missão real"],
    answer: 0,
    feedback: "A conversa sobre causa e efeito é o objetivo educativo. O jogo é simplificado e sua pontuação não mede desempenho real de um foguete.",
  },
]

export default function OfflineMissionCards() {
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const card = CARDS[index]

  const move = (next: number) => {
    setIndex(next)
    setChoice(null)
  }

  return <div className="offline-cards">
    <div className="screen-only border border-white/10 bg-[#080a0d] p-5 md:p-7">
      <div className="flex flex-wrap justify-between gap-3 mb-5">
        <p className="font-display text-xs tracking-[0.16em] uppercase text-[#4a9fff]">Carta {index + 1} de {CARDS.length} · dinâmica sem internet</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/offline-cards.html" className="font-display text-[11px] tracking-[0.12em] uppercase text-[#75b8ff] underline underline-offset-4">Abrir versão offline</a>
          <button type="button" onClick={() => window.print()} className="font-display text-[11px] tracking-[0.12em] uppercase border border-white/30 px-4 py-2 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-white">Imprimir baralho</button>
        </div>
      </div>
      <h4 className="font-display text-2xl md:text-3xl font-700 uppercase mb-2">{card.title}</h4>
      <p className="font-body text-sm text-white/60 leading-relaxed mb-5">{card.scene}</p>
      <p className="font-body text-sm text-white mb-3">{card.prompt}</p>
      <div className="grid md:grid-cols-3 gap-2">
        {card.choices.map((item, i) => <button key={item} type="button" onClick={() => setChoice(i)} aria-pressed={choice === i} className={`min-h-14 text-left p-4 border text-sm leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-white ${choice === i ? i === card.answer ? "border-emerald-300 bg-emerald-300/10 text-white" : "border-amber-300 bg-amber-300/10 text-white" : "border-white/15 text-white/65 hover:border-white/40"}`}>
          <span className="font-display text-[#4a9fff] mr-2">{String.fromCharCode(65 + i)}.</span>{item}
        </button>)}
      </div>
      {choice !== null && <p aria-live="polite" className={`font-body text-sm leading-relaxed mt-5 p-4 border ${choice === card.answer ? "border-emerald-300/40 text-emerald-100 bg-emerald-300/5" : "border-amber-300/40 text-amber-100 bg-amber-300/5"}`}>
        <strong>{choice === card.answer ? "Boa decisão. " : "Vamos pensar de novo. "}</strong>{card.feedback}
      </p>}
      <div className="flex justify-between mt-6">
        <button type="button" onClick={() => move(Math.max(0, index - 1))} disabled={index === 0} className="font-display text-xs uppercase tracking-[0.12em] text-white/55 disabled:opacity-30 px-3 py-2">← Anterior</button>
        {index === CARDS.length - 1 ? <button type="button" onClick={() => move(0)} className="font-display text-xs uppercase tracking-[0.12em] border border-white/30 px-4 py-2 hover:bg-white hover:text-black">Recomeçar cartas</button> : <button type="button" onClick={() => move(index + 1)} className="font-display text-xs uppercase tracking-[0.12em] border border-white/30 px-4 py-2 hover:bg-white hover:text-black">Próxima carta →</button>}
      </div>
    </div>
    <div className="printable-card-sheet" aria-hidden="true">
      <h1>TECH CAMPS · Pouse o foguete — cartas de contingência</h1>
      <p>Simulação simplificada. Em cada situação, conversem sobre controle, velocidade, combustível e limites do modelo.</p>
      <div className="printable-grid">{CARDS.map((item, i) => <article key={item.title}>
        <small>SITUAÇÃO {i + 1}</small><h2>{item.title}</h2><p>{item.scene}</p><strong>{item.prompt}</strong>
        <ol type="A">{item.choices.map((option) => <li key={option}>{option}</li>)}</ol>
        <hr /><small>IDEIA-CHAVE</small><p>{item.feedback}</p>
      </article>)}</div>
      <footer>Material educativo do Tech CAMPS · Projeto independente, sem vínculo oficial com a SpaceX.</footer>
    </div>
  </div>
}
