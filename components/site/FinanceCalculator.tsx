'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

type Mode = 'hypoteka' | 'investice';

function formatCZK(value: number) {
  return Math.round(value).toLocaleString('cs-CZ') + ' Kč';
}

export function FinanceCalculator() {
  const [mode, setMode] = useState<Mode>('hypoteka');

  // Mortgage inputs
  const [loanAmount, setLoanAmount] = useState(4_500_000);
  const [loanYears, setLoanYears] = useState(30);
  const [loanRate, setLoanRate] = useState(4.79);

  // Investment inputs
  const [monthlyDeposit, setMonthlyDeposit] = useState(5_000);
  const [initialDeposit, setInitialDeposit] = useState(100_000);
  const [investYears, setInvestYears] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(7.0);

  const mortgage = useMemo(() => {
    const months = loanYears * 12;
    const r = loanRate / 100 / 12;
    const factor = Math.pow(1 + r, months);
    const monthly = r > 0 ? (loanAmount * (r * factor)) / (factor - 1) : loanAmount / months;
    const totalPaid = monthly * months;
    const totalInterest = Math.max(0, totalPaid - loanAmount);
    const principalPct = Math.max(10, Math.min(95, (loanAmount / totalPaid) * 100));
    return { monthly, totalPaid, totalInterest, principalPct };
  }, [loanAmount, loanYears, loanRate]);

  const investment = useMemo(() => {
    const months = investYears * 12;
    const r = expectedReturn / 100 / 12;
    const futureInitial = initialDeposit * Math.pow(1 + r, months);
    const futureMonthly = r > 0 ? monthlyDeposit * ((Math.pow(1 + r, months) - 1) / r) : monthlyDeposit * months;
    const totalValue = futureInitial + futureMonthly;
    const totalContributed = initialDeposit + monthlyDeposit * months;
    const totalGain = Math.max(0, totalValue - totalContributed);
    const depositPct = Math.max(10, Math.min(95, (totalContributed / totalValue) * 100));
    return { totalValue, totalContributed, totalGain, depositPct };
  }, [monthlyDeposit, initialDeposit, investYears, expectedReturn]);

  function handleDiscuss() {
    const topic = mode === 'hypoteka' ? 'Hypotéky & bydlení' : 'Investice';
    const note =
      mode === 'hypoteka'
        ? `Dobrý den, Martine, zajímá mě orientační propočet hypotéky ${formatCZK(loanAmount)} na ${loanYears} let (při sazbě ${loanRate.toFixed(2).replace('.', ',')} % vychází splátka přibližně ${formatCZK(mortgage.monthly)} / měsíc). Rád/a bych s vámi prošel/a reálné možnosti bank.`
        : `Dobrý den, Martine, díval/a jsem se na orientační investiční kalkulaci (vstup ${formatCZK(initialDeposit)}, měsíčně ${formatCZK(monthlyDeposit)} na ${investYears} let při výnosu ${expectedReturn.toFixed(1).replace('.', ',')} %). Rád/a bych probral/a vhodné investiční řešení.`;

    window.dispatchEvent(new CustomEvent('appointment', { detail: { topic, note } }));
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div id="kalkulacka" className="calc-panel" aria-labelledby="calc-heading">
      <div className="calc-topbar">
        <div>
          <h3 id="calc-heading">Orientační kalkulačka</h3>
          <p className="form-note">Rychlá představa v číslech před naší schůzkou.</p>
        </div>
        <div className="calc-tabs" role="tablist" aria-label="Typ výpočtu">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'hypoteka'}
            onClick={() => setMode('hypoteka')}
          >
            Hypotéka
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'investice'}
            onClick={() => setMode('investice')}
          >
            Investice
          </button>
        </div>
      </div>

      <div className="calc-body">
        {mode === 'hypoteka' ? (
          <>
            <div className="calc-controls" role="tabpanel" aria-label="Parametry hypotéky">
              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-loan-amount">Výše úvěru</label>
                  <span className="calc-slider-value">{formatCZK(loanAmount)}</span>
                </div>
                <input
                  id="calc-loan-amount"
                  type="range"
                  min={1_000_000}
                  max={15_000_000}
                  step={100_000}
                  value={loanAmount}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-loan-years">Doba splácení</label>
                  <span className="calc-slider-value">{loanYears} let</span>
                </div>
                <input
                  id="calc-loan-years"
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={loanYears}
                  onChange={e => setLoanYears(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-loan-rate">Orientační úroková sazba</label>
                  <span className="calc-slider-value">{loanRate.toFixed(2).replace('.', ',')} % p. a.</span>
                </div>
                <input
                  id="calc-loan-rate"
                  type="range"
                  min={3.0}
                  max={7.5}
                  step={0.05}
                  value={loanRate}
                  onChange={e => setLoanRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="calc-result">
              <div className="calc-primary-figure">
                <strong className="calc-primary-number">{formatCZK(mortgage.monthly)}</strong>
                <span className="calc-primary-label">Orientační měsíční splátka</span>
              </div>

              <div className="calc-breakdown">
                <div>
                  <span>Jistina úvěru</span>
                  <strong>{formatCZK(loanAmount)}</strong>
                </div>
                <div>
                  <span>Přeplatek na úrocích</span>
                  <strong>{formatCZK(mortgage.totalInterest)}</strong>
                </div>
                <div>
                  <span>Celkem zaplaceno</span>
                  <strong>{formatCZK(mortgage.totalPaid)}</strong>
                </div>
              </div>

              <div className="calc-bar" aria-hidden="true">
                <div className="calc-bar-fill" style={{ width: `${mortgage.principalPct}%` }} />
              </div>

              <button type="button" className="site-button calc-cta" onClick={handleDiscuss}>
                Probrat tento výpočet na schůzce <ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className="calc-disclaimer">
                Výpočet je čistě orientační a nepředstavuje závaznou nabídku ani posouzení úvěruschopnosti.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="calc-controls" role="tabpanel" aria-label="Parametry investice">
              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-monthly-deposit">Měsíční vklad</label>
                  <span className="calc-slider-value">{formatCZK(monthlyDeposit)}</span>
                </div>
                <input
                  id="calc-monthly-deposit"
                  type="range"
                  min={1_000}
                  max={50_000}
                  step={500}
                  value={monthlyDeposit}
                  onChange={e => setMonthlyDeposit(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-initial-deposit">Počáteční vklad</label>
                  <span className="calc-slider-value">{formatCZK(initialDeposit)}</span>
                </div>
                <input
                  id="calc-initial-deposit"
                  type="range"
                  min={0}
                  max={2_000_000}
                  step={50_000}
                  value={initialDeposit}
                  onChange={e => setInitialDeposit(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-invest-years">Investiční horizont</label>
                  <span className="calc-slider-value">{investYears} let</span>
                </div>
                <input
                  id="calc-invest-years"
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={investYears}
                  onChange={e => setInvestYears(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-return-rate">Modelový roční výnos</label>
                  <span className="calc-slider-value">{expectedReturn.toFixed(1).replace('.', ',')} % p. a.</span>
                </div>
                <input
                  id="calc-return-rate"
                  type="range"
                  min={3.0}
                  max={10.0}
                  step={0.5}
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="calc-result">
              <div className="calc-primary-figure">
                <strong className="calc-primary-number">{formatCZK(investment.totalValue)}</strong>
                <span className="calc-primary-label">Odhadovaná hodnota po {investYears} letech</span>
              </div>

              <div className="calc-breakdown">
                <div>
                  <span>Vložené prostředky celkem</span>
                  <strong>{formatCZK(investment.totalContributed)}</strong>
                </div>
                <div>
                  <span>Odhadované zhodnocení</span>
                  <strong>{formatCZK(investment.totalGain)}</strong>
                </div>
              </div>

              <div className="calc-bar" aria-hidden="true">
                <div className="calc-bar-fill" style={{ width: `${investment.depositPct}%` }} />
              </div>

              <button type="button" className="site-button calc-cta" onClick={handleDiscuss}>
                Probrat tento výpočet na schůzce <ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className="calc-disclaimer">
                Výpočet je orientační ilustrace složeného úročení bez zahrnutí poplatků a daní. Minulé výnosy nejsou zárukou budoucích.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
