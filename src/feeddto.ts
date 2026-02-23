export class POSTDTO {
  idPost: number | string;
  ppschool?: string | null;
  nameschool?: string | null;
  levelschool?: string | null;
  cituschool?: string | null;
  timeposted?: Date;
  descriptionpost?: string | null;
  message?: string | null;
  type?: string | null;
  containpost: Array<{
    id: number | string;
    url?: string | null;
    type?: string | null;
  }>;
  nbviewpost: number;
  nbcommentpost: number;
  nbsavepost: number;
  nbsharepost: number;
  commentpost: Array<{
    id: number | string;
    message?: string | null;
    ppuser?: string | null;
    nameuser?: string | null;
    datetimecomment?: Date;
  }>;
}

export class PROFILESCHOOL {
  idschool: string;
  coverimageschool: string;
  ppschool: string;
  nameschool: string;
  isuserpinned: boolean;
  nbpostschool: number;
  nbepingle: number;
  nbavis: number;
  datecreationaccount: Date;
  mediaschool: Array<{
    id: string;
    url: string;
  }>;
  descriptionschool: string;
  avisschool: Array<{
    id: string;
    ppuser: string;
    username: string;
    contain: string;
  }>;
}

export interface SchoolGeoDTO {
  // Identifiants
  id: string | number;
  name: string;

  // Coordonnées pour Leaflet (mapview.tsx)
  location: {
    lat: number;
    lng: number;
  };

  // Infos d'affichage court (previewschool.tsx)
  city: string;
  rating: number; // ex: 4.5
  distance?: number; // Calculé par le backend idéalement (en km)
  isTopSchool: boolean; // Badge "Top école"

  // Médias
  coverImageUrl: string; // Pour le background de la carte (ground.jpg actuel)
}
