import Select from 'react-select';
const getInitialState = () => ({
  category: "",
  subCategory: "",
  subCategory2: "",
  subCategory3: "",
  title: "",
  marque: "",
  model: "",
  marca: "",
  modelo: "",
  marcas: "",
  modelos: "",
  subCategory2: "",
  description: "",
  price: "",
  unidaddeprecio: "",
  oferta: "",
  change: "",
  wilaya: "",
  commune: "",
  quartier: "",
  email: "",

  itemsReservations_Visa: "",
  destinacionhadj: "",


  attributes: {
    subCategory2: "",
    title2: "",

    superficie: "",
    etage: "",
    piece: "",
    anne: "",
    color: "",
    motor: "",
    grosdetailOptions: "",
    locatioventevetemenes: "",
    optionduvoiture: "",
    papiers: "",


    adress: "",
    nombredelhotel: "",
    adresshotel: "",
    totalhabitaciones: "",
    tipodehabutaciones: [],
    estrellas: "",
    serviciosdehotel: [],
    language: [],
    tarifnuit: "",
    reservacionenlinea: "",
    politiqueAnnulation: "",
    hotelWebsite: "",
    horariollegada: "",

    horadudepar: "",
    datedepar: "",
    duracionviaje: "",
    transporte: "",
    destinacionvoyage1: "",
    voyage1hotel1: "",
    voyage1nombrehotel1: "",
    destinacionvoyage2: "",
    voyage2hotel2: "",
    voyage1nombrehotel2: "",
    fecharegreso: "",
    serviciosdelhotel: "",
    incluidoenelprecio: "",
    cancelarreserva: "",
  },
});

export default getInitialState;

export function Color({ handleChangeInput, postData }) {
  return (
    <div>
      <div className="form-group">
        <select
          multiple={false}
          name="color"
          value={postData.attributes.color}
          onChange={handleChangeInput}
          className="form-control"
        >
          <option value="">Couleur</option>
          <option value="Blanc">Blanc</option>
          <option value="Noir">Noir</option>
          <option value="Gris">Gris</option>
          <option value="Argent">Argent</option>
          <option value="Bleu">Bleu</option>
          <option value="Bleu clair">Bleu clair</option>
          <option value="Bleu marine">Bleu marine</option>
          <option value="Rouge">Rouge</option>
          <option value="Bordeaux">Bordeaux</option>
          <option value="Vert">Vert</option>
          <option value="Vert foncé">Vert foncé</option>
          <option value="Jaune">Jaune</option>
          <option value="Orange">Orange</option>
          <option value="Marron">Marron</option>
          <option value="Beige">Beige</option>
          <option value="Violet">Violet</option>
          <option value="Rose">Rose</option>
          <option value="Obergine">Obergine</option>
          <option value="Doré">Doré</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>
    </div>
  );
}

export function Annee({ handleChangeInput, postData }) {
  return (

    <div className="form-group">

      <select
        name="anne"
        className="form-control"
        value={postData.attributes.anne}
        onChange={handleChangeInput}
      >
        <option value="">Sélectionner l'année</option>
        {Array.from({ length: 50 }, (_, i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>


  );
}



export function Optionduvoiture({ postData, setPostData }) {
  const optionduvoiture = [
    { label: 'Climatisation', value: 'Climatisation' },
    { label: 'Alarme', value: 'Alarme' },
    { label: 'Jantes alliage', value: 'Jantes alliage' },
    { label: 'Rétroviseurs électriques', value: 'Retroviseurs électriques' },
    { label: 'Vitres électriques', value: 'Vitres électriques' },
    { label: 'ESP', value: 'ESP' },
    { label: 'Phares antibrouillard', value: 'Phares antibrouillard' },
    { label: 'Feux de jour', value: 'Feux de jour' },
    { label: 'Radar de recul', value: 'Radar de recul' },
    { label: 'Direction assistée', value: 'Direction assistée' },
    { label: 'Radio CD', value: 'Radio CD' },
    { label: 'Toit ouvrant', value: 'Toit ouvrant' },
    { label: 'Phares xénon', value: 'Phares xénon' },
    { label: 'Sièges chauffants', value: 'Sieges chauffants' },
    { label: 'Sièges en cuir', value: 'Sieges en cuir' },
    { label: 'Système de navigation (GPS)', value: 'GPS' },
    { label: 'Caméra de recul', value: 'Caméra de recul' },
    { label: 'Capteur de pluie', value: 'Capteur de pluie' },
    { label: 'Capteur de luminosité', value: 'Capteur de luminosité' },
    { label: 'Régulateur de vitesse', value: 'Regulateur de vitesse' },
    { label: 'Limiteur de vitesse', value: 'Limiteur de vitesse' },
    { label: 'Aide au stationnement', value: 'Aide au stationnement' },
    { label: 'Bluetooth', value: 'Bluetooth' },
    { label: 'Commande vocale', value: 'Commande vocale' },
    { label: 'Affichage tête haute', value: 'Affichage tête haute' },
    { label: 'Volant chauffant', value: 'Volant chauffant' },
    { label: 'Démarrage sans clé', value: 'Démarrage sans clé' },
    { label: 'Freinage d’urgence automatique', value: 'Freinage d’urgence automatique' },
    { label: 'Alerte de franchissement de ligne', value: 'Alerte de franchissement de ligne' },
    { label: 'Surveillance des angles morts', value: 'Surveillance des angles morts' },
    { label: 'Suspension adaptative', value: 'Suspension adaptative' },
    { label: 'Toit panoramique', value: 'Toit panoramique' },
    { label: 'Chargeur sans fil', value: 'Chargeur sans fil' },
    { label: 'Éclairage d’ambiance', value: 'Éclairage d’ambiance' },
    { label: 'Assistance au maintien de voie', value: 'Assistance au maintien de voie' }

  ];
  const handleChange = (selectedOptions) => {
    setPostData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        opcionescoche: selectedOptions ? selectedOptions.map(opt => opt.value) : []
      }
    }));
  };

  return (
    <Select
      placeholder="Services de l'hôtel"
      value={optionduvoiture.filter(opt =>
        postData.attributes?.serviceHotel?.includes(opt.value)
      )}
      options={optionduvoiture}
      onChange={handleChange}
      isMulti
      closeMenuOnSelect={false}
    />
  );


}



export function Optionservicehotel({ postData, setPostData }) {
  const optionsServiceHotel = [
    { label: 'Wifi', value: 'Wifi' },
    { label: 'Piscine', value: 'Piscine' },
    { label: 'Petit_déjeuner', value: 'Petit déjeuner' },
    { label: 'Restaurante', value: 'Restaurante' },
    { label: 'Petit_déjeuner', value: 'Petit déjeuner' },
    { label: 'Access pour discapacity', value: 'Access pour discapacity' },
    { label: 'Petit_déjeuner', value: 'Petit déjeuner' },
    { label: 'Animaux de compagniet', value: 'Animaux de compagnie' },
    { label: 'Climatisation', value: 'Climatisation' },
    { label: 'Navette_Aeroport', value: 'Navette aéroport' },
  ];

  const handleChange = (selectedOptions) => {
    setPostData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        serviceHotel: selectedOptions ? selectedOptions.map(opt => opt.value) : []
      }
    }));
  };

  return (
    <Select
      placeholder="Services de l'hôtel"
      value={optionsServiceHotel.filter(opt =>
        postData.attributes?.serviceHotel?.includes(opt.value)
      )}
      options={optionsServiceHotel}
      onChange={handleChange}
      isMulti
      closeMenuOnSelect={false}
    />
  );
}


export function Opciontipodehabitaciones({ postData, setPostData }) {
  const optionsTipoHabitacion = [
    { label: 'Simple', value: 'Simple' },
    { label: 'Double', value: 'Double' },
    { label: 'Suite', value: 'Suite' },
    { label: 'Familiale', value: 'Familiale' },
    { label: 'Deluxe', value: 'Deluxe' },
  ];

  const handleChange = (selectedOptions) => {
    setPostData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        tipoHabitacion: selectedOptions ? selectedOptions.map(opt => opt.value) : []
      }
    }));
  };

  return (
    <Select
      placeholder="Tipo de habitaciones"
      value={optionsTipoHabitacion.filter(opt =>
        postData.attributes?.tipoHabitacion?.includes(opt.value)
      )}
      options={optionsTipoHabitacion}
      onChange={handleChange}
      isMulti
      closeMenuOnSelect={false}
    />
  );
}


export function Opcionlagagehotel({ postData, setPostData }) {
  const optionsLangageHotel = [
    { label: 'Arabe', value: 'Arabe' },
    { label: 'Français', value: 'Français' },
    { label: 'Anglais', value: 'Anglais' },
    { label: 'kabyle', value: 'kabyle' },
    { label: 'Espagnol', value: 'Espagnol' },
    { label: 'Russe', value: 'Russe' },
  ];

  const handleChange = (selectedOptions) => {
    setPostData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        langageHotel: selectedOptions ? selectedOptions.map(opt => opt.value) : []
      }
    }));
  };

  return (
    <Select
      placeholder="Langue parlée dans l'hôtel"
      value={optionsLangageHotel.filter(opt =>
        postData.attributes?.langageHotel?.includes(opt.value)
      )}
      options={optionsLangageHotel}
      onChange={handleChange}
      isMulti
      closeMenuOnSelect={false}
    />
  );
}
