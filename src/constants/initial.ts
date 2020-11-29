const defaults = {
  total: 15000,
  age: 2,
  optimisations: [
    {
      type: 'prijevoz',
      amount: 360,
      enabled: true,
    },
    {
      type: 'treci',
      amount: 500,
      enabled: false,
    },
    {
      type: 'nagrada',
      amount: 400,
      enabled: true,
    },
    {
      type: 'stan',
      amount: 400,
      enabled: true,
    },
    {
      type: 'podstanar',
      amount: 0,
      enabled: false,
    },
    {
      type: 'ostalo',
      amount: 0,
      enabled: false,
    },
  ],
  stopa: 1,
  brojDjece: 0,
  brojUzdrzavanih: 0,
  detalji: 1,
  mladaOsoba: false,
};

let fromUrl: any = {};
try {
  fromUrl = JSON.parse(atob(window.location.hash.slice(1)));
} catch {}

export const initial = {
  total: fromUrl.total ?? defaults.total,
  optimisations: fromUrl.optimisations ?? defaults.optimisations,
  stopa: fromUrl.stopa ?? defaults.stopa,
  brojDjece: fromUrl.brojDjece ?? defaults.brojDjece,
  brojUzdrzavanih: fromUrl.brojUzdrzavanih ?? defaults.brojUzdrzavanih,
  detalji: fromUrl.detalji ?? defaults.detalji,
  mladaOsoba: fromUrl.mladaOsoba ?? defaults.mladaOsoba,
  age: fromUrl.age ?? defaults.age,
};
