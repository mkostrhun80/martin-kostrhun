'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

type CalcMode = 'mortgage' | 'investment';

const mortgagePresets = [
  { label: 'Byt 4,5 mil.', amount: 4_500_000, years: 30, rate: 4.6 },
  { label: 'Dům 7 mil.', amount: 7_000_000, years: 30, rate: 4.5 },
  { label: 'Refinancování 3 mil.', amount: 3_000_000, years: 20, rate: 4.4 },
] as const;

const investmentPresets = [
  { label: 'Start 5 000 Kč', monthly: 5_000, initial: 100_000, years: 20, rate: 7.0 },
  { label: 'Tvorba majetku 10 tis.', monthly: 10_000, initial: 250_000, years: 25, rate: 7.5 },
  { label: 'Renta 15 tis.', monthly: 15_000, initial: 500_000, years: 30, rate: 7.0 },
] as const;

function formatCZK(value: number) {
  return `${Math.round(value).toLocaleString('cs-CZ')} Kč`;
}

export function FinanceCalculator() {
  const [mode, setMode] = useState<CalcMode>('mortgage');

  // Mortgage parameters
  const [loanAmount, setLoanAmount] = useState(4_500_000);
  const [loanYears, setLoanYears] = useState(30);
  const [loanRate, setLoanRate] = useState(4.6);

  // Investment parameters
  const [monthlyDeposit, setMonthlyDeposit] = useState(5_000);
  const [initialDeposit, setInitialDeposit] = useState(100_000);
  const [investYears, setInvestYears] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(7.0);

  const mortgage = useMemo(() => {
    const monthlyRate = loanRate / 100 / 12;
    const months = loanYears * 12;
    const payment =
      monthlyRate === 0
        ? loanAmount / months
        : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
          (Math.pow(1 + monthlyRate, months) - 1);
    const totalPaid = payment * months;
    const totalInterest = Math.max(0, totalPaid - loanAmount);
    const principalPct = totalPaid > 0 ? Math.round((loanAmount / totalPaid) * 100) : 100;
    return { payment, totalPaid, totalInterest, principalPct };
  }, [loanAmount, loanYears, loanRate]);

  const investment = useMemo(() => {
    const monthlyRate = expectedReturn / 100 / 12;
    const months = investYears * 12;
    const growthFactor = Math.pow(1 + monthlyRate, months);
    const futureInitial = initialDeposit * growthFactor;
    const futureSeries = monthlyRate === 0 ? monthlyDeposit * months : monthlyDeposit * ((growthFactor - 1) / monthlyRate);
    const totalValue = futureInitial + futureSeries;
    const totalContributed = initialDeposit + monthlyDeposit * months;
    const totalGain = Math.max(0, totalValue - totalContributed);
    const depositPct = totalValue > 0 ? Math.round((totalContributed / totalValue) * 100) : 100;
    return { totalValue, totalContributed, totalGain, depositPct };
  }, [monthlyDeposit, initialDeposit, investYears, expectedReturn]);

  function handleDiscuss() {
    const topic = mode === 'mortgage' ? 'Hypotéky & bydlení' : 'Investice';
    const note =
      mode === 'mortgage'
        ? `Dobrý den, Martine, zajímá mě orientační propočtení hypotéky: výše úvěru ${formatCZK(loanAmount)}, splatnost ${loanYears} let při sazbě cca ${loanRate.toFixed(1).replace('.', ',')} % (měsíčně zhruba ${formatCZK(mortgage.payment)}).`
        : `Dobrý den, Martine, rád/a bych probral/a investiční plán: pravidelně ${formatCZK(monthlyDeposit)} měsíčně${initialDeposit > 0 ? ` se vstupem ${formatCZK(initialDeposit)}` : ''} na horizont ${investYears} let.`;

    try {
      sessionStorage.setItem('appointment-topic', topic);
    } catch {
      /* Storage may be blocked. */
    }
    window.dispatchEvent(new CustomEvent('appointment', { detail: { topic, note } }));
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div id="kalkulacka" className="calc-panel" data-ui="true" aria-labelledby="calc-heading">
      <div className="calc-topbar">
        <div>
          <h3 id="calc-heading">Orientační kalkulačka</h3>
          <p className="calc-subcopy">Vyzkoušejte si vlastní čísla před úvodní konzultací.</p>
        </div>
        <div className="calc-tabs" role="tablist" aria-label="Typ výpočtu">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'mortgage'}
            onClick={() => setMode('mortgage')}
          >
            Hypotéka
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'investment'}
            onClick={() => setMode('investment')}
          >
            Investice a renta
          </button>
        </div>
      </div>

      <div className="calc-body">
        {mode === 'mortgage' ? (
          <>
            <div className="calc-controls" role="tabpanel" aria-label="Parametry hypotéky">
              <div className="calc-presets" role="group" aria-label="Rychlé scénáře hypotéky">
                {mortgagePresets.map(preset => {
                  const active =
                    loanAmount === preset.amount && loanYears === preset.years && loanRate === preset.rate;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      className="calc-preset-btn"
                      aria-pressed={active}
                      onClick={() => {
                        setLoanAmount(preset.amount);
                        setLoanYears(preset.years);
                        setLoanRate(preset.rate);
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

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
                  max={35}
                  step={1}
                  value={loanYears}
                  onChange={e => setLoanYears(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-head">
                  <label htmlFor="calc-loan-rate">Orientační úroková sazba</label>
                  <span className="calc-slider-value">{loanRate.toFixed(1).replace('.', ',')} % p. a.</span>
                </div>
                <input
                  id="calc-loan-rate"
                  type="range"
                  min={3.0}
                  max={7.0}
                  step={0.1}
                  value={loanRate}
                  onChange={e => setLoanRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="calc-result">
              <div className="calc-primary-figure">
                <span className="calc-primary-label">Orientační měsíční splátka</span>
                <strong className="calc-primary-number">{formatCZK(mortgage.payment)}</strong>
              </div>

              <div className="calc-breakdown">
                <div>
                  <span>Jistina úvěru ({mortgage.principalPct} %)</span>
                  <strong>{formatCZK(loanAmount)}</strong>
                </div>
                <div>
                  <span>Přeplaceno na úrocích</span>
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

              <button type="button" className="site-button site-button-gold calc-cta" onClick={handleDiscuss}>
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
              <div className="calc-presets" role="group" aria-label="Rychlé investiční scénáře">
                {investmentPresets.map(preset => {
                  const active =
                    monthlyDeposit === preset.monthly &&
                    initialDeposit === preset.initial &&
                    investYears === preset.years &&
                    expectedReturn === preset.rate;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      className="calc-preset-btn"
                      aria-pressed={active}
                      onClick={() => {
                        setMonthlyDeposit(preset.monthly);
                        setInitialDeposit(preset.initial);
                        setInvestYears(preset.years);
                        setExpectedReturn(preset.rate);
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

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
                <span className="calc-primary-label">Odhadovaná hodnota po {investYears} letech</span>
                <strong className="calc-primary-number">{formatCZK(investment.totalValue)}</strong>
              </div>

              <div className="calc-breakdown">
                <div>
                  <span>Vložené prostředky celkem ({investment.depositPct} %)</span>
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

              <button type="button" className="site-button site-button-gold calc-cta" onClick={handleDiscuss}>
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
