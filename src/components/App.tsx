import { Chart } from 'react-google-charts';
import * as React from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import { initial } from '../constants/initial';
import { chart, fields as detailFields } from '../constants/details';
import { fields } from '../constants/fields';
import { Neoporezivi } from './Neoporezivi';

declare var window: Window & {
  stopeprireza2021: Array<any>;
  tipobracuna: number;
  PlacaObracun2021: () => void;
  $: (selector: string) => any;
};

// Remapiranje stopa jer TEB nema unique IDeve
const stope = window.stopeprireza2021.slice().map((item, index) => ({ ...item, id: index }));

function getVal(selector: string): number {
  const targetEl = document.querySelector<HTMLDivElement>(selector);
  return targetEl ? parseFloat(targetEl.innerText.replace(/\./g, '').replace(',', '.')) : 0;
}

const formatterInstance = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'HRK' });

function formatter(ammount: number): string {
  return formatterInstance.format(ammount);
  // return ammount;
}

export default function App() {
  const state: any = useLocalStore(() => ({
    ...initial,
    neto: 10000,
    oporezivo: 0,
    odbitak: 0,
    dohodak: 0,
    _brutoDoprinosi: 0,
    prirez: 0,
    porez: 0,
    age: 2,

    get brutoDoprinosi() {
      return this.mladaOsoba ? 0 : this._brutoDoprinosi;
    },

    get neoporezivo() {
      return this.optimisations.reduce((total: number, curr: any) => total + (curr.enabled ? curr.amount : 0), 0);
    },

    get treciStup() {
      const treci = getOptimization('treci');
      return treci.enabled ? treci.amount || 0 : 0;
    },

    get bruto1() {
      return this.total - this.neoporezivo;
    },

    get doprinosi() {
      return this.bruto1 - this.dohodak;
    },

    get porezi() {
      return parseFloat((this.porez + this.prirez).toFixed(2));
    },

    get odbitakCalc() {
      return Math.min(this.odbitak, this.bruto1 - this.doprinosi);
    },

    get davanja() {
      return state.doprinosi + state.porezi + state.brutoDoprinosi;
    },

    get trosak() {
      return state.total + state.brutoDoprinosi;
    },

    get racun() {
      return state.neto + state.neoporezivo - state.treciStup;
    },

    get keyed() {
      const plain = {
        total: this.total,
        optimisations: this.optimisations,
        stopa: this.stopa,
        brojDjece: this.brojDjece,
        brojUzdrzavanih: this.brojUzdrzavanih,
        detalji: this.detalji,
        mladaOsoba: this.mladaOsoba,
        age: this.age,
      };
      const string = JSON.stringify(plain);
      const zipped = btoa(string);
      return zipped;
    },

    get povrat() {
      const baseValue = this.porez + this.prirez;
      if (this.age === 0) {
        return baseValue;
      } else if (this.age === 1) {
        return baseValue * 0.5;
      }
      return 0;
    },

    get korekcija2021() {
      return (this.p36 - this.p36 / 1.2 + this.p24 - this.p24 / 1.2) * 1.18;
    },

    get racun2021() {
      return this.racun + this.korekcija2021;
    },
  }));

  const getOptimization = (type: string) => {
    return state.optimisations.find((item: any) => item.type === type);
  };

  React.useEffect(() => {
    window.location.replace(`/#${state.keyed}`);
  }, [state.keyed]);

  React.useLayoutEffect(() => {
    if (state.bruto1 > 0) {
      window.tipobracuna = 2;
      window.$('#cboPrirez option:selected').data('meta', stope.find((item) => item.id === state.stopa).stopa);

      window.PlacaObracun2021();

      state.neto = getVal('#labNeto');
      state.porez = getVal('#labPorez');
      state.oporezivo = getVal('#labOporezivo');
      state.odbitak = getVal('#labOsobnaOlaksica');
      state.dohodak = getVal('#labDohodak');
      state._brutoDoprinosi = getVal('#labDopZO');
      state.prirez = getVal('#labPrirez');
    }
  });

  return useObserver(() => (
    <div className="wrapper">
      <div className="container">
        <div className="chart-container">
          <Chart
            width={800}
            height={350}
            chartType="Sankey"
            loader={<div>Loading Chart</div>}
            data={chart[state.detalji](state)}
            options={{
              sankey: {
                link: { color: { fill: '#30384f' } },
                node: {
                  label: { color: '#ffffff' },
                },
              },
            }}
          />
        </div>
        <div>
          <label htmlFor="detalji">
            Detalji prikaza:
            <select id="detalji" onChange={(e) => (state.detalji = parseInt(e.target.value, 10))} value={state.detalji}>
              <option value={0}>Samo mi daj moj neto</option>
              <option value={1}>Znam što su prirezi</option>
              <option value={2}>U slobodno vrijeme se bavim računovodstvom</option>
            </select>
          </label>
          <input className="hidden" type="number" id="cboizracun" name="cboizracun" defaultValue={2} />
          <input type="hidden" id="inputiznos" value={state.bruto1} />
          <input type="checkbox" id="chkStup" checked={true} disabled className="hidden" />
          <input type="checkbox" id="radPrvi" checked={true} disabled className="hidden" />
          <input type="checkbox" id="cbOsnovica" checked={true} disabled className="hidden" />
          <div className="hidden" id="labNeto" />
          <div className="hidden" id="labOporezivo" />
          <div className="hidden" id="labOsobnaOlaksica" />
          <div className="hidden" id="labDohodak" />
          <div className="hidden" id="labDopZO" />
          <div className="hidden" id="labPrirez" />
          <div className="hidden" id="labPorez" />
          <div className="hidden" id="labP24" />
          <div className="hidden" id="labP36" />
          <input type="hidden" id="cboOsob" value={state.brojUzdrzavanih} />
          <input type="hidden" id="cboDjeca" value={state.brojDjece} />
          <select className="hidden" id="cboPrirez">
            <option selected value={stope.find((item) => item.id === state.stopa).stopa} />
          </select>
          <fieldset>
            <legend>Iznosi</legend>
            <label htmlFor="total">
              <span>Ukupna plaća:</span>
              <input
                id="total"
                type="number"
                value={state.total}
                step={100}
                onChange={(e) => (state.total = parseFloat(e.target.value))}
              />
              <small />
            </label>
            {fields
              .filter((field) => detailFields[state.detalji].indexOf(field.property) !== -1)
              .filter((field) => state[field.property])
              .map((field) => (
                <div className="field" key={field.property}>
                  <span>{field.title}:</span>
                  <span className={field.highlighted ? 'highlighted' : undefined}>
                    {formatter(state[field.property])}
                  </span>
                  <small dangerouslySetInnerHTML={{ __html: field.description || '' }} />
                </div>
              ))}
          </fieldset>
          <br />
          <fieldset className="dodaci">
            <legend>Neoporezivi dodaci</legend>
            <small>
              <a
                href="https://www.isplate.info/nagrade-za-radne-rezultate-i-drugi-oblici-dodatnog-nagradivanja-radnika.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                Detalji
              </a>
            </small>
            <Neoporezivi
              disabled={!getOptimization('prijevoz').enabled}
              amount={getOptimization('prijevoz').amount}
              title="Prijevoz"
              description="Mora biti puni iznos sa potvrde/karte"
              onToggle={(e: boolean) => (getOptimization('prijevoz').enabled = e)}
              onChange={(e: number) => (getOptimization('prijevoz').amount = e)}
            />
            <Neoporezivi
              disabled={!getOptimization('nagrada').enabled}
              amount={getOptimization('nagrada').amount}
              title="Nagrada zaposleniku"
              description="Maksimalno 5000kn/god, 400kn/mj"
              onToggle={(e: boolean) => (getOptimization('nagrada').enabled = e)}
              onChange={(e: number) => (getOptimization('nagrada').amount = e)}
            />
            <Neoporezivi
              disabled={!getOptimization('stan').enabled}
              amount={getOptimization('stan').amount}
              title="Naknada za hranu"
              description="Maksimalno 5000kn/god, 400kn/mj"
              onToggle={(e: boolean) => (getOptimization('stan').enabled = e)}
              onChange={(e: number) => (getOptimization('stan').amount = e)}
            />
            <Neoporezivi
              disabled={!getOptimization('podstanar').enabled}
              amount={getOptimization('podstanar').amount}
              title="Plaćanje najma stana"
              description=""
              onToggle={(e: boolean) => (getOptimization('podstanar').enabled = e)}
              onChange={(e: number) => (getOptimization('podstanar').amount = e)}
            />
            <Neoporezivi
              disabled={!getOptimization('treci').enabled}
              amount={getOptimization('treci').amount}
              title="Treći mirovinski stup"
              description="Maksimalno 500kn/mj"
              onToggle={(e: boolean) => (getOptimization('treci').enabled = e)}
              onChange={(e: number) => (getOptimization('treci').amount = e)}
            />
            <Neoporezivi
              disabled={!getOptimization('ostalo').enabled}
              amount={getOptimization('ostalo').amount}
              title="Ostale neoporezive naknade"
              description="Vrtić, itd."
              onToggle={(e: boolean) => (getOptimization('ostalo').enabled = e)}
              onChange={(e: number) => (getOptimization('ostalo').amount = e)}
            />
          </fieldset>
          <br />
          <fieldset>
            <legend>Bruto u neto izračun</legend>
            <small>
              Bazirano na{' '}
              <a
                href="https://www.teb.hr/kalkulatori/kalkulator-place-od-112021/"
                target="_blank"
                rel="noopener noreferrer"
              >
                TEB kalkulatoru
              </a>
            </small>
            <label htmlFor="stopaprireza">
              <span>Stopa prireza</span>
              <select
                onChange={(e) => (state.stopa = parseInt(e.target.value, 10))}
                defaultValue={state.stopa}
                id="stopaprireza"
              >
                {stope.map((stopa) => (
                  <option key={stopa.id} value={stopa.id}>
                    {stopa.naziv} ({stopa.stopa}%)
                  </option>
                ))}
              </select>
              <small />
            </label>
            <label htmlFor="broj-djece">
              <span>Broj djece</span>
              <select
                id="broj-djece"
                onChange={(e) => (state.brojDjece = parseInt(e.target.value, 10))}
                value={state.brojDjece}
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </select>
              <small />
            </label>
            <label htmlFor="broj-uzdrzavanih">
              <span>Broj uzdržavanih članova</span>
              <select
                id="broj-uzdrzavanih"
                onChange={(e) => (state.brojUzdrzavanih = parseInt(e.target.value, 10))}
                value={state.brojUzdrzavanih}
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </select>
              <small />
            </label>
            <label htmlFor="mlada-osoba">
              <input
                id="mlada-osoba"
                type="checkbox"
                value={state.mladaOsoba}
                onChange={(e) => (state.mladaOsoba = e.target.checked)}
              />
              <span>Mlada osoba / olakšica</span>
              <small />
            </label>
            <label>
              <span>Porezna olakšica za mlade</span>
              <div>
                <label htmlFor="young">
                  <input
                    id="young"
                    type="radio"
                    value="0"
                    checked={state.age === 0}
                    onChange={(e) => (state.age = parseInt(e.target.value, 10))}
                  />
                  Mlađi od 25
                </label>
                <label htmlFor="mid">
                  <input
                    id="mid"
                    type="radio"
                    value="1"
                    checked={state.age === 1}
                    onChange={(e) => (state.age = parseInt(e.target.value, 10))}
                  />
                  25-30
                </label>
                <label htmlFor="old">
                  <input
                    id="old"
                    type="radio"
                    value="2"
                    checked={state.age === 2}
                    onChange={(e) => (state.age = parseInt(e.target.value, 10))}
                  />
                  Stariji od 30
                </label>
              </div>
            </label>
          </fieldset>
        </div>
        <p>
          Disclaimer: Ovaj kalkulator bi trebao biti točan, ali moguće da se u svakom trenutku pokvari (zbog promjene
          zakona ili promjena na TEB strani), pa se nemoj oslanjati samo na ovaj izračun.
          <br />
          <a href="https://github.com/DarkoKukovec/bruto-calculator" target="_blank" rel="noopener noreferrer">
            Izvorni kod
          </a>
        </p>
      </div>
    </div>
  ));
}
